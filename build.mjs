// CLUB 151 — Build de production
// ---------------------------------------------------------------------------
// Lancé par `npm run build` (localement OU automatiquement par Vercel à chaque
// push). Il produit le dossier `dist/` qui est ce que les visiteurs reçoivent :
//
//  1. Transpile les .jsx en .js une fois pour toutes → plus de Babel dans le
//     navigateur (~400 Ko et ~1 s de compilation économisés à CHAQUE visite).
//  2. Génère une page HTML statique par produit (produits/<slug>.html) avec
//     titre, description, Open Graph et données structurées JSON-LD → chaque
//     fiche produit devient indexable par Google et partageable proprement.
//  3. Génère sitemap.xml et robots.txt avec le vrai domaine.
//  4. Écrit api/_catalog.json : le catalogue de référence CÔTÉ SERVEUR utilisé
//     par les fonctions de paiement pour refuser les prix manipulés.
//
// Domaine : variable d'env SITE_URL (recommandé, ex. https://leclub151.fr),
// sinon le domaine de production Vercel, sinon https://leclub151.fr.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const SITE = (process.env.SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : '')
  || 'https://leclub151.fr').replace(/\/+$/, '');

// Les pages /produits/ ne sont générées QUE là où le catalogue est visible :
// - vrai catalogue WooCommerce si WC_STORE_URL est configurée (recommandé) ;
// - sinon produits de démo, mais PAS sur le domaine de production (même règle
//   que data.js : pas de fausses cartes indexées par Google sur le vrai site).
const PROD_HOSTS = ['leclub151.fr', 'www.leclub151.fr'];
// L'hôte de production est le SEUL critère : ALLOW_DEMO_CHECKOUT n'a rien à
// faire ici. Cette variable autorise l'ACHAT des produits de démo (cf.
// AUDIT-CORRECTIFS.md) ; la combiner en `||` faisait qu'activer l'achat de démo
// suffisait à faire générer — donc indexer par Google — de fausses cartes sur le
// vrai domaine, exactement ce que le commentaire ci-dessus interdit.
const demoOnSite = PROD_HOSTS.indexOf(new URL(SITE).hostname.toLowerCase()) === -1;

// Vrai catalogue WooCommerce (Store API publique) au moment du build.
// Pagination : ?page=N&per_page=100, arrêt dès qu'une page renvoie moins de
// 100 produits (garde-fou 30 pages, timeout 10 s par page) — même logique que
// lib/serverCatalog.js et data.js. Au-delà de 100 produits, l'ancien fetch
// unique tronquait silencieusement le catalogue (pages produit manquantes).
const WOO_PER_PAGE = 100;
const WOO_MAX_PAGES = 30;
const WOO_PAGE_TIMEOUT_MS = 10000;

async function fetchWooPage(base, page) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), WOO_PAGE_TIMEOUT_MS);
  try {
    const r = await fetch(base + '/wp-json/wc/store/v1/products?page=' + page + '&per_page=' + WOO_PER_PAGE, { signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const list = await r.json();
    return Array.isArray(list) ? list : [];
  } finally {
    clearTimeout(timer);
  }
}

async function wooProducts() {
  const base = String(process.env.WC_STORE_URL || '').replace(/\/+$/, '');
  if (!base) return null; // pas de WooCommerce configuré → mode démo inchangé
  const raw = [];
  try {
    for (let page = 1; page <= WOO_MAX_PAGES; page += 1) {
      const list = await fetchWooPage(base, page);
      raw.push(...list);
      if (list.length < WOO_PER_PAGE) break; // dernière page atteinte
    }
  } catch (e) {
    // WC_STORE_URL est configurée : sortir un site sans pages produit
    // effacerait silencieusement tout le SEO. On échoue FRANCHEMENT →
    // Vercel conserve le déploiement précédent, rien n'est cassé en ligne.
    console.error('✖ Build interrompu : WooCommerce injoignable (' + e.message + ').');
    console.error('  WC_STORE_URL = ' + base + ' — on refuse de publier un site sans pages produit.');
    console.error('  Vérifie que le WordPress répond, puis relance le déploiement.');
    process.exit(1);
  }
  const strip = (h) => String(h || '').replace(/<[^>]*>/g, '').trim();
  return raw.map((p) => {
    const minor = (p.prices && p.prices.currency_minor_unit != null) ? Number(p.prices.currency_minor_unit) : 2;
    const price = (Number(p.prices && p.prices.price) || 0) / Math.pow(10, minor);
    return {
      id: 'wp' + p.id,
      name: p.name,
      price: Math.round(price * 100) / 100,
      desc: strip(p.short_description) || strip(p.description),
      image: (p.images && p.images[0] && p.images[0].src) || null,
      inStock: p.is_in_stock !== false,
    };
  });
}

// _ds_bundle.js (248 Ko) contient : 6 composants du design system (Button,
// Badge, Tag, PriceTag, QtyStepper, ProductCard) + une VIEILLE COPIE de tout
// le code du site (redondante avec les .jsx, écrasée à l'exécution). Au build
// on extrait uniquement les composants → ds-components.js (~20 Ko).
// Mettre à false pour re-servir le bundle complet en cas de souci.
const SLIM_DS_BUNDLE = true;

function extractDsComponents() {
  const src = readFileSync(join(ROOT, '_ds_bundle.js'), 'utf8');
  const cut = src.indexOf('// ui_kits/');
  if (cut === -1) return null; // structure inattendue → on gardera le bundle complet
  const head = src.slice(0, cut);
  const expose = ['QtyStepper', 'Badge', 'Button', 'Tag', 'PriceTag', 'ProductCard']
    .map((c) => '__ds_ns.' + c + ' = __ds_scope.' + c + ';').join('\n');
  return head + '\n' + expose + '\n\n})();\n';
}

// ---------------------------------------------------------------------------
// 1. Catalogue : on exécute data.js dans un bac à sable Node pour récupérer
//    les produits par défaut (même source de vérité que le site).
// ---------------------------------------------------------------------------
function extractCatalog() {
  const code = readFileSync(join(ROOT, 'data.js'), 'utf8');
  const noop = () => {};
  const ls = { getItem: () => null, setItem: noop, removeItem: noop };
  const w = { addEventListener: noop, scrollY: 0 };
  const doc = {
    readyState: 'loading', // les blocs cookies/scroll attendent DOMContentLoaded → jamais en build
    addEventListener: noop,
    getElementById: () => null,
    createElement: () => ({ style: {}, setAttribute: noop, addEventListener: noop, remove: noop }),
    head: { appendChild: noop },
    documentElement: { appendChild: noop, setAttribute: noop },
  };
  // location.hostname = localhost → demoEnabled() est vrai dans data.js, on
  // extrait donc bien les produits par défaut (le masquage en production est
  // géré à l'exécution côté site, et côté paiement par serverCatalog).
  const sandbox = { window: w, localStorage: ls, document: doc, location: { hostname: 'localhost' }, fetch: () => new Promise(noop), Intl, console, Date, Math, JSON };
  vm.runInNewContext(code, sandbox, { filename: 'data.js' });
  const products = w.LC151.Store.all();
  if (!products || !products.length) throw new Error('Catalogue vide — data.js a changé ?');
  assertShopContactUsable(w.LC151.SHOP);
  return products;
}

// Garde anti-données bouche-trou. Les coordonnées vivent dans data.js (LC151.SHOP)
// et sont VIDES par défaut — vide = bloc masqué, donc rien de faux ne s'affiche.
// Le risque restant est qu'un placeholder soit saisi puis oublié : un numéro en
// « 00 00 00 » ou un lien social pointant sur l'accueil d'une plateforme est le
// signal « site template » le plus net qui soit. Sur le DOMAINE DE PRODUCTION on
// refuse alors de publier ; ailleurs (preview, localhost) on se contente d'alerter.
function assertShopContactUsable(shop) {
  const bad = [];
  const digits = String((shop && shop.phone) || '').replace(/\D/g, '');
  if (digits && /0{6,}/.test(digits)) bad.push('téléphone bouche-trou : « ' + shop.phone + ' »');
  ((shop && shop.socials) || []).forEach(([label, url]) => {
    try {
      const u = new URL(url);
      if (u.pathname.replace(/\/+$/, '') === '') {
        bad.push('lien social sans compte (accueil de plateforme) : ' + label + ' → ' + url);
      }
    } catch (e) {
      bad.push('lien social invalide : ' + label + ' → ' + url);
    }
  });
  if (!bad.length) return;
  const onProd = !demoOnSite;
  const head = (onProd ? '✖ Build interrompu' : '⚠ Attention') + ' : coordonnées bouche-trou dans data.js (LC151.SHOP)';
  (onProd ? console.error : console.warn)(head);
  bad.forEach((b) => (onProd ? console.error : console.warn)('  - ' + b));
  if (onProd) {
    console.error('  Renseigne de vraies valeurs, ou laisse le champ VIDE (le bloc sera masqué).');
    process.exit(1);
  }
}

function slugify(name) {
  return String(name || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}
const productPath = (p) => 'produits/' + slugify(p.name) + '-' + p.id + '.html';

// ---------------------------------------------------------------------------
// 2. Transpilation JSX → JS (chaque fichier isolé dans une IIFE, comme le
//    faisait Babel standalone : seuls les exports window.* sont partagés).
// ---------------------------------------------------------------------------
function transpile(source, filename) {
  const out = transformSync(source, { loader: 'jsx', target: 'es2018', jsx: 'transform', sourcefile: filename });
  return '(function () {\n' + out.code + '\n})();\n';
}

// ---------------------------------------------------------------------------
// 3. Transformation d'une page HTML
// ---------------------------------------------------------------------------
function transformHtml(html, pageName) {
  let out = html;

  // Babel standalone : plus besoin.
  out = out.replace(/[ \t]*<script[^>]*@babel\/standalone[^>]*><\/script>\s*\n?/g, '');

  // React / ReactDOM (unpkg) : defer — dans les pages construites, tous les
  // scripts qui utilisent React sont externes et déjà en defer (l'ordre du
  // document est préservé : react → react-dom → ds-components → bundles de page).
  out = out.replace(/<script src="(https:\/\/unpkg\.com\/react[^"]*)"([^>]*)><\/script>/g,
    '<script defer src="$1"$2></script>');

  // Bundle du design studio → version allégée (composants uniquement), en defer
  // (n'utilise React qu'au rendu, consommé uniquement par les bundles defer).
  // Tolère les variantes de chemin : _ds_bundle.js, /_ds_bundle.js, ../../_ds_bundle.js
  if (SLIM_DS_BUNDLE && dsComponents) {
    out = out.replace(/<script src="(?:\/|(?:\.\.\/)*)_ds_bundle\.js"><\/script>/g,
      '<script defer src="ds-components.js"></script>');
  }

  // Chemins hérités du design studio.
  out = out.replace(/(?:\.\.\/)+styles\.css/g, 'styles.css');
  out = out.replace(/(?:\.\.\/)+_ds_bundle\.js/g, '_ds_bundle.js');

  // <script type="text/babel" src="X.jsx"> → <script defer src="X.js">
  out = out.replace(/<script type="text\/babel" src="([^"]+)\.jsx"><\/script>/g,
    '<script defer src="$1.js"></script>');

  // Blocs JSX inline → fichiers page-<nom>.js transpilés.
  let n = 0;
  out = out.replace(/<script type="text\/babel">([\s\S]*?)<\/script>/g, (m, code) => {
    n += 1;
    const file = 'page-' + pageName + (n > 1 ? '-' + n : '') + '.js';
    writeFileSync(join(DIST, file), transpile(code, pageName + '.inline.jsx'));
    return '<script defer src="' + file + '"></script>';
  });

  return out;
}

// ---------------------------------------------------------------------------
// 4. Pages produits statiques (SEO)
// ---------------------------------------------------------------------------
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const absImage = (img) => /^https?:\/\//.test(String(img || '')) ? img : (img ? SITE + '/' + img : '');

function productPage(template, p) {
  const url = SITE + '/' + productPath(p);
  const title = p.name + ' — CLUB 151';
  const desc = (p.desc ? p.desc + ' ' : '') + 'En vente sur CLUB 151, boutique de cartes à Vienne — expédition sous 48 h ou retrait en boutique.';
  const image = absImage(p.image);

  let out = template;
  // Les URL relatives (styles, scripts, liens) doivent se résoudre depuis la
  // racine, pas depuis /produits/.
  out = out.replace(/<meta charset="UTF-8">/, '<meta charset="UTF-8">\n<base href="/">');
  out = out.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(title) + '</title>');
  out = out.replace(/(<meta name="description" content=")[^"]*(")/, '$1' + esc(desc) + '$2');
  out = out.replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + esc(title) + '$2');
  out = out.replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + esc(desc) + '$2');
  out = out.replace(/(<meta name="twitter:title" content=")[^"]*(")/, '$1' + esc(title) + '$2');
  out = out.replace(/(<meta name="twitter:description" content=")[^"]*(")/, '$1' + esc(desc) + '$2');

  const headExtra = [
    '<link rel="canonical" href="' + esc(url) + '">',
    '<meta property="og:url" content="' + esc(url) + '">',
    image ? '<meta property="og:image" content="' + esc(image) + '">' : '',
    '<script type="application/ld+json">' + JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.desc || undefined,
      image: image || undefined,
      sku: p.id,
      brand: { '@type': 'Brand', name: 'Pokémon' },
      offers: {
        '@type': 'Offer',
        url: url,
        priceCurrency: 'EUR',
        price: Number(p.price).toFixed(2),
        availability: 'https://schema.org/' + (p.inStock === false ? 'OutOfStock' : (p.preorder ? 'PreOrder' : 'InStock')),
        seller: { '@type': 'Organization', name: 'CLUB 151' },
      },
    }) + '</script>',
    '<script>window.__LC_PRODUCT_ID=' + JSON.stringify(p.id) + ';</script>',
  ].filter(Boolean).join('\n');
  out = out.replace('</head>', headExtra + '\n</head>');

  const noscript = '<noscript>\n<div style="max-width:720px;margin:40px auto;padding:0 20px;font-family:system-ui,sans-serif;line-height:1.6">'
    + '<h1>' + esc(p.name) + '</h1>'
    + '<p><strong>' + Number(p.price).toFixed(2).replace('.', ',') + ' €</strong>'
    + (p.inStock === false ? ' — épuisé' : '') + '</p>'
    + '<p>' + esc(p.desc || '') + '</p>'
    + '<p><a href="boutique.html">Voir toute la boutique CLUB 151</a> — cartes Pokémon à Vienne, expédition sous 48 h.</p>'
    + '</div>\n</noscript>';
  out = out.replace('<div id="root"></div>', '<div id="root"></div>\n' + noscript);

  return out;
}

// ---------------------------------------------------------------------------
// 5. sitemap.xml + robots.txt
// ---------------------------------------------------------------------------
function sitemap(productPaths) {
  const row = (loc, freq, prio) => '  <url><loc>' + SITE + '/' + loc + '</loc><changefreq>' + freq + '</changefreq><priority>' + prio + '</priority></url>';
  const base = [
    row('index.html', 'daily', '1.0'),
    row('boutique.html', 'daily', '0.9'),
    row('lorcana.html', 'weekly', '0.5'),
    row('one-piece.html', 'weekly', '0.5'),
    row('magic.html', 'weekly', '0.5'),
    row('yugioh.html', 'weekly', '0.5'),
    row('apropos.html', 'monthly', '0.6'),
    row('faq.html', 'monthly', '0.6'),
    row('cgv.html', 'yearly', '0.3'),
    row('mentions-legales.html', 'yearly', '0.3'),
    row('confidentialite.html', 'yearly', '0.3'),
  ];
  const prods = productPaths.map((p) => row(p, 'weekly', '0.7'));
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + base.concat(prods).join('\n') + '\n</urlset>\n';
}

const robots = () => '# CLUB 151 — robots.txt (généré par build.mjs)\nUser-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /panier.html\nDisallow: /merci.html\n\nSitemap: ' + SITE + '/sitemap.xml\n';

// ---------------------------------------------------------------------------
// GO
// ---------------------------------------------------------------------------
console.log('Build CLUB 151 → ' + SITE);
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'produits'), { recursive: true });

// Catalogue → lib/catalog-demo.json : la table de prix CÔTÉ SERVEUR utilisée
// par lib/serverCatalog.js (paiements). Régénérée ici pour rester alignée sur
// data.js. Format : { id: { name, price (euros), unique, inStock } }.
const products = extractCatalog();
const catalog = {};
for (const p of products) {
  catalog[p.id] = {
    name: p.name,
    price: Math.round(Number(p.price) * 100) / 100,
    unique: !!(p.unique === true || p.type === 'single' || p.type === 'graded'),
    inStock: p.inStock !== false,
  };
}
writeFileSync(join(ROOT, 'lib', 'catalog-demo.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log('lib/catalog-demo.json : ' + products.length + ' produits');

// Design system allégé (ou bundle complet en secours)
const dsComponents = SLIM_DS_BUNDLE ? extractDsComponents() : null;
if (dsComponents) {
  writeFileSync(join(DIST, 'ds-components.js'), dsComponents);
  console.log('ds-components.js : ' + Math.round(dsComponents.length / 1024) + ' Ko (au lieu de 243 Ko)');
}

// Statique : css, js « plats », tokens, assets
for (const f of readdirSync(ROOT)) {
  if (/\.(css|js)$/.test(f) && f !== 'build.mjs' && !(dsComponents && f === '_ds_bundle.js')) {
    cpSync(join(ROOT, f), join(DIST, f));
  }
}
for (const dir of ['tokens', 'assets']) {
  if (existsSync(join(ROOT, dir))) cpSync(join(ROOT, dir), join(DIST, dir), {
    recursive: true,
    // hero-cards.png (1,86 Mo) n'est référencé par aucun fichier servi (le site
    // utilise hero-cards.webp) — on ne l'expédie plus dans dist.
    filter: (src) => !src.endsWith('hero-cards.png'),
  });
}

// JSX → JS
for (const f of readdirSync(ROOT)) {
  if (f.endsWith('.jsx')) {
    writeFileSync(join(DIST, f.replace(/\.jsx$/, '.js')), transpile(readFileSync(join(ROOT, f), 'utf8'), f));
  }
}

// Pages HTML
let produitTemplate = '';
for (const f of readdirSync(ROOT)) {
  if (!f.endsWith('.html')) continue;
  const name = f.replace(/\.html$/, '');
  const out = transformHtml(readFileSync(join(ROOT, f), 'utf8'), name);
  writeFileSync(join(DIST, f), out);
  if (f === 'produit.html') produitTemplate = out;
}

// Pages produits statiques : WooCommerce si configuré, sinon démo (jamais de
// démo sur le domaine de production — cohérent avec data.js).
const woo = await wooProducts();
let staticProducts;
if (woo !== null) {
  staticProducts = woo.filter((p) => p.inStock !== false);
  console.log('Pages produits : ' + staticProducts.length + ' (catalogue WooCommerce)');
} else if (demoOnSite) {
  staticProducts = products.filter((p) => /^d\d+$/.test(p.id));
  console.log('Pages produits : ' + staticProducts.length + ' (démo — hôte hors production)');
} else {
  staticProducts = [];
  console.log('Pages produits : 0 — domaine de production sans WooCommerce (WC_STORE_URL), la démo n\'est pas indexée.');
}
for (const p of staticProducts) {
  writeFileSync(join(DIST, productPath(p)), productPage(produitTemplate, p));
}

writeFileSync(join(DIST, 'sitemap.xml'), sitemap(staticProducts.map(productPath)));
writeFileSync(join(DIST, 'robots.txt'), robots());

console.log('Build OK → dist/');
