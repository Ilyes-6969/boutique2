// CLUB 151 — SOURCE DE VÉRITÉ DES PRIX (côté serveur)
// ---------------------------------------------------------------------------
// Le navigateur n'envoie QUE { id, qty }. Le prix est fixé ICI, jamais par le
// client. Sans cela, n'importe qui pouvait payer un article au prix qu'il veut
// (ex. un Dracaufeu à 1 centime). Les frais de port sont aussi recalculés ici.
//
// Production : si WC_STORE_URL est défini, on lit le VRAI catalogue WooCommerce
// (Store API publique, sans clé) avec PAGINATION (per_page=100, page=N) et on
// construit une table id->produit avec les mêmes identifiants « wp<ID> » que le
// site (voir data.js mapWoo). Le mapping suit le CONTRAT PRODUIT partagé :
//   { id, name, price, oldPrice, image, thumb, desc, cat, set, num, type,
//     grade, unique, preorder, inStock, stockLeft, stock, maxQty }
// `grade` = note de gradation (ex. « PSA 10 ») lue depuis le nom des cartes
// gradées (type 'graded'), sinon null. Sert au rendu « slab ». Jamais inventé :
// null si aucune note reconnue dans le nom. Transmis tel quel par /api/catalog.
// Il n'existe AUCUN catalogue de repli : sans WC_STORE_URL, la table de prix est
// vide et plus rien n'est achetable. C'est volontaire — un catalogue de
// démonstration côté serveur permettait de valoriser un panier contenant des
// produits qui n'existent pas dans la vraie boutique.
//
// Panne WooCommerce : si un catalogue périmé existe en mémoire, il est servi
// (stale-while-revalidate). Sinon on lève une erreur avec err.code='WC_DOWN' —
// les handlers api/ doivent la traduire en HTTP 503 avec un message générique.
//
// Variables d'environnement Vercel :
//   WC_STORE_URL        = https://ton-wordpress.tld   (optionnel, recommandé en réel)
//   ALLOW_DEMO_CHECKOUT = 1                            (optionnel : force la démo)
//   ALLOWED_ORIGINS     = https://club151.fr,https://www.club151.fr
// ---------------------------------------------------------------------------

const crypto = require('crypto');

// Photos produits hébergées par le site (assets/produits/<code article>.webp).
// Elles ne servent QUE si le produit n'a aucune image dans WooCommerce. Table
// générée par outils/photos/manifeste.mjs : { "<sku>": "<fichier>?v=<empreinte>" }.
let PHOTOS = {};
try { PHOTOS = require('./photos-produits.json'); } catch (e) { PHOTOS = {}; }
// Vitrine (lib/vitrine.json) : ce que le site montre ET vend, indépendamment de
// ce que contient WooCommerce. Un article écarté n'apparaît ni dans le catalogue,
// ni dans les fiches, ni dans la table de prix du paiement (il n'est donc plus
// achetable par le site), mais il reste intact dans WooCommerce et à la caisse.
let VITRINE = {};
try { VITRINE = require('./vitrine.json'); } catch (e) { VITRINE = {}; }
function isVisible(prod) {
  const sku = String((prod && prod.num) || '');
  const only = VITRINE.seulement || [];
  if (only.length) return only.indexOf(sku) !== -1;
  if ((VITRINE.masquer || []).indexOf(sku) !== -1) return false;
  const min = Number(VITRINE.prixMinCartes) || 0;
  if (min > 0 && (prod.type === 'single' || prod.type === 'graded') && Number(prod.price) < min) return false;
  return true;
}
// WooCommerce renvoie les noms « texturisés » : « D&rsquo;Alola », « Écarlate &#038;
// Violet », « Boosters &amp; blisters ». React affiche le texte tel quel, donc le
// client lisait les codes. On les remet en vrais caractères, une fois, ici.
const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', rsquo: '\u2019', lsquo: '\u2018',
  rdquo: '\u201d', ldquo: '\u201c', ndash: '\u2013', mdash: '\u2014', hellip: '\u2026', laquo: '\u00ab', raquo: '\u00bb',
  prime: '\u2032', Prime: '\u2033', times: '\u00d7', deg: '\u00b0', euro: '\u20ac', trade: '\u2122', reg: '\u00ae', copy: '\u00a9',
  eacute: '\u00e9', egrave: '\u00e8', ecirc: '\u00ea', agrave: '\u00e0', acirc: '\u00e2', ccedil: '\u00e7', ocirc: '\u00f4',
  ucirc: '\u00fb', ugrave: '\u00f9', icirc: '\u00ee', iuml: '\u00ef', Eacute: '\u00c9' };
function decodeEntities(s) {
  return String(s == null ? '' : s).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, function (m, e) {
    if (e[0] === '#') {
      const n = (e[1] === 'x' || e[1] === 'X') ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return (n > 0 && n < 0x110000) ? String.fromCodePoint(n) : m;
    }
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, e) ? NAMED_ENTITIES[e] : m;
  });
}
function localPhoto(sku) {
  const f = sku && PHOTOS[String(sku)];
  return f ? '/assets/produits/' + f : null;
}

// Plafond absolu de quantité par ligne (garde-fou, même si Woo annonce plus).
const MAX_QTY_CAP = 999;

// Plafond de lignes distinctes par panier (double sécurité avec la garde
// MAX_ITEMS de api/notify-order.js) : au-delà, priceItems refuse le panier.
const MAX_LINES = 100;

// ---------------------------------------------------------------------------
// WooCommerce Store API — pagination, timeout, mapping contrat, cache mémoire.
// ---------------------------------------------------------------------------

// Cache mémoire court : le conteneur serverless est réutilisé entre requêtes.
// `map` (id → produit) sert priceItems/getCatalog ; `list` sert /api/catalog.
let _wcCache = { at: 0, map: null, list: null };
let _wcFailAt = 0;                       // dernière panne Woo (évite de retenter à chaque requête)
const WC_TTL = 60 * 1000;
const WC_RETRY_MS = 15 * 1000;           // après une panne, ressert le périmé pendant 15 s
const WC_PAGE_SIZE = 100;
const WC_MAX_PAGES = 30;                 // garde-fou : 30 × 100 = 3000 produits max
const WC_FETCH_TIMEOUT_MS = 6000;

function stripHtml(html) {
  return String(html || '').replace(/<[^>]*>/g, '').trim();
}

// Mêmes regex que data.js (typeFromCategories, data.js:136-142) — à garder
// synchronisées avec le site pour que les types coïncident des deux côtés.
function typeFromCategories(cats) {
  const s = (cats || []).map(function (c) { return (c.name || '').toLowerCase(); }).join(' ');
  if (/grad|psa|bgs|cgc/.test(s)) return 'graded';
  // « deck box » est un ACCESSOIRE : on le retire avant de tester « box », sinon
  // une catégorie « Deck box » partait dans le scellé (le mot-clé « box » gagnait).
  if (/scell|display|booster|coffret|etb|box|boîte/.test(s.replace(/deck\s?box/g, ''))) return 'sealed';
  if (/accessoir|sleeve|protège|classeur|toploader|tapis|deck\s?box/.test(s)) return 'accessory';
  // Mangas, figurines, peluches, goodies : le rayon « Mangas & collection ».
  if (/manga|figurine|peluche|goodies|objet/.test(s)) return 'goodies';
  return 'single';
}

// Jeu (univers) du produit : lu dans les catégories ET les étiquettes Woo.
// null quand rien ne l'indique — on ne DEVINE pas un jeu (un manga ou un
// classeur neutre n'est pas « Pokémon » par défaut). Mêmes règles que
// data.js (gameFromWoo) et build.mjs (gameOf) — à garder synchronisées.
function gameFromWoo(p) {
  const s = [].concat(p.categories || [], p.tags || [])
    .map(function (t) { return ((t && t.name) || '') + ' ' + ((t && t.slug) || ''); })
    .join(' ').toLowerCase();
  if (/lorcana/.test(s)) return 'lorcana';
  if (/one[\s-]?piece/.test(s)) return 'onepiece';
  if (/\bmagic\b|\bmtg\b/.test(s)) return 'magic';   // \b : « Magicarpe » n'est pas Magic
  if (/yu[\s-]?gi[\s-]?oh/.test(s)) return 'yugioh';
  if (/riftbound/.test(s)) return 'riftbound';
  if (/naruto/.test(s)) return 'naruto';
  if (/dragon[\s-]?ball/.test(s)) return 'dragonball';
  if (/kayou/.test(s)) return 'kayou';
  if (/\brise\b/.test(s)) return 'rise';
  if (/pok[ée]mon/.test(s)) return 'pokemon';
  return null;
}

// Précommande : une catégorie OU un tag contenant « précommande »/« preorder ».
function isPreorder(p) {
  const terms = [].concat(p.categories || [], p.tags || [])
    .map(function (t) { return ((t && t.name) || '') + ' ' + ((t && t.slug) || ''); })
    .join(' ').toLowerCase();
  return /pr[ée]commande|preorder/.test(terms);
}

// Stock vendable annoncé par la Store API pour un produit, ou null s'il est
// inconnu / illimité. Même lecture côté navigateur (data.js, mapWoo).
const WOO_NO_LIMIT = 9999;
function stockFromWoo(p) {
  const cands = [p && p.add_to_cart && p.add_to_cart.maximum, p && p.quantity_limits && p.quantity_limits.maximum];
  for (let i = 0; i < cands.length; i += 1) {
    if (cands[i] == null) continue;
    const n = Number(cands[i]);
    if (Number.isFinite(n) && n >= 1 && n < WOO_NO_LIMIT) return Math.floor(n);
  }
  return null;
}

// Mappe un produit Store API brut vers le CONTRAT PRODUIT partagé.
function mapWooProduct(p) {
  const minor = (p.prices && p.prices.currency_minor_unit != null) ? p.prices.currency_minor_unit : 2;
  const div = Math.pow(10, minor);
  // Un prix absent ou illisible ne devient PAS 0 en silence : à 0 la fiche
  // paraîtrait gratuite en vitrine, et priceItems la refuserait au paiement avec
  // un « Prix invalide » incompréhensible pour le client. On marque plutôt le
  // produit non vendable et on le signale dans les logs pour que la fiche Woo
  // soit corrigée à la source.
  const rawPrice = (p.prices && p.prices.price != null) ? Number(p.prices.price) / div : NaN;
  const hasValidPrice = Number.isFinite(rawPrice) && rawPrice > 0;
  const price = hasValidPrice ? rawPrice : 0;
  if (!hasValidPrice) {
    console.warn('serverCatalog: prix Woo absent ou illisible, produit marqué indisponible — id=' +
      p.id + ' « ' + (p.name || '?') + ' »');
  }
  const regular = (p.prices && p.prices.regular_price != null) ? Number(p.prices.regular_price) / div : price;
  const onSale = !!p.on_sale && regular > price;

  const cat = decodeEntities((p.categories && p.categories[0] && p.categories[0].name) || 'Carte');
  const img = (p.images && p.images[0]) || null;
  const local = img ? null : localPhoto(p.sku);   // photo du site, à défaut d'image Woo

  // Quantités. La Store API donne le stock vendable d'un PRODUIT dans
  // add_to_cart.maximum (stock géré, sans commande en réappro) ; 9999 y veut dire
  // « pas de limite connue ». quantity_limits n'existe que sur les lignes de
  // panier : on le lit quand même, au cas où une version de Woo l'exposerait.
  const stock = stockFromWoo(p);
  const ql = stock;
  let maxQty = MAX_QTY_CAP;
  if (ql != null) maxQty = Math.max(1, Math.min(MAX_QTY_CAP, ql));

  let unique;
  if (ql != null) {
    unique = ql === 1;
  } else if (p.sold_individually === true) {
    unique = true;
  } else {
    const catNames = (p.categories || []).map(function (c) { return (c.name || '').toLowerCase(); }).join(' ');
    unique = /grad|psa|bgs|cgc|unit|single/.test(catNames); // fallback historique
  }
  if (unique) maxQty = 1;

  const stockLeft = (p.low_stock_remaining != null && Number.isFinite(Number(p.low_stock_remaining)))
    ? Number(p.low_stock_remaining) : null;

  // SLAB : la note de gradation vit dans le NOM du produit côté Woo (ex.
  // « Dracaufeu — Gradée PSA 10 »). On ne la peuple que pour les cartes gradées
  // et on n'invente jamais de note absente (null si le nom n'en contient pas).
  const type = typeFromCategories(p.categories);
  let grade = null;
  if (type === 'graded') {
    const gm = String(p.name || '').match(/\b(PSA|BGS|CGC|SGC)\s?(10|9\.5|9|8\.5|8|7|6|5)\b/i);
    if (gm) grade = gm[1].toUpperCase() + ' ' + gm[2];
  }

  return {
    id: 'wp' + p.id,
    name: decodeEntities(p.name),
    price: Math.round(price * 100) / 100,
    oldPrice: onSale ? Math.round(regular * 100) / 100 : null,
    image: (img && img.src) || local || null,
    thumb: (img && img.thumbnail) || local || null,
    // GALERIE (contrat inter-agents) : « images » = [{ src, thumb }] (max 6),
    // en COMPLÉMENT de image/thumb (compat descendante : si absent ou vide, la
    // fiche produit retombe sur [image]). Transmis tel quel par /api/catalog.
    images: (p.images || []).slice(0, 6).map(function (i) {
      return { src: (i && i.src) || null, thumb: (i && (i.thumbnail || i.src)) || null };
    }).filter(function (i) { return i.src; })     // même filtrage que data.js mapWoo (contrat identique)
      .concat(local ? [{ src: local, thumb: local }] : []),
    desc: stripHtml(p.short_description) || stripHtml(p.description),
    cat: cat,
    set: cat,
    num: p.sku || '—',
    type: type,
    // Jeu : 'pokemon' | 'lorcana' | 'onepiece' | 'magic' | 'yugioh' | 'riftbound' | 'naruto' | 'dragonball' | 'kayou' | 'rise' | null.
    game: gameFromWoo(p),
    // Note de gradation (« PSA 10 »…) pour le rendu slab ; null hors carte gradée.
    grade: grade,
    unique: unique,
    preorder: isPreorder(p),
    // Pastille visuelle — même dérivation que mapWoo côté client (data.js) pour
    // que le chemin /api/catalog affiche les mêmes badges que le chemin direct.
    badge: onSale ? { tone: 'sale', label: 'Promo' }
      : (isPreorder(p) ? { tone: 'sale', label: 'Précommande' } : undefined),
    // Sans prix exploitable, l'article n'est pas vendable : on le sort du
    // circuit d'achat au lieu de l'afficher à 0 € (cf. hasValidPrice ci-dessus).
    inStock: hasValidPrice && p.is_in_stock !== false,
    stockLeft: stockLeft,
    // Quantité réellement disponible (null = inconnue) — affichée sur le site.
    stock: (hasValidPrice && p.is_in_stock !== false) ? stock : (stock != null ? 0 : null),
    maxQty: maxQty,
  };
}

// Une page de la Store API, avec timeout (AbortController) pour ne jamais
// bloquer une fonction serverless sur un WordPress qui ne répond pas.
async function fetchWooPage(base, page) {
  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, WC_FETCH_TIMEOUT_MS);
  try {
    const url = base + '/wp-json/wc/store/v1/products?per_page=' + WC_PAGE_SIZE + '&page=' + page;
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const list = await r.json();
    const totalPages = parseInt(r.headers.get('x-wp-totalpages'), 10) || 0;
    return { list: Array.isArray(list) ? list : [], totalPages: totalPages };
  } finally {
    clearTimeout(timer);
  }
}

// Toutes les pages : arrêt FAISANT AUTORITÉ sur une page incomplète (< 100 =
// dernière page), même logique que data.js (fetchAllWooPages) et build.mjs.
// On NE se fie JAMAIS à X-WP-TotalPages pour arrêter : absent (proxy/CDN) il
// vaut 0, et même présent il peut sous-estimer — s'en servir comme condition
// d'arrêt tronquerait le catalogue à 100 dès que la page 1 est pleine. L'en-tête
// n'est qu'un garde-fou SECONDAIRE, non bloquant (diagnostic ci-dessous).
// WC_MAX_PAGES borne le tout (30 × 100 = 3000 produits max).
async function fetchAllWooProducts(base) {
  const all = [];
  let knownTotalPages = 0;                 // 0 = en-tête absent → simplement ignoré
  let page = 1;
  for (; page <= WC_MAX_PAGES; page += 1) {
    const res = await fetchWooPage(base, page);
    for (const item of res.list) all.push(item);
    if (res.totalPages > 0) knownTotalPages = res.totalPages;
    if (res.list.length < WC_PAGE_SIZE) break;   // page incomplète = dernière (autorité)
  }
  // Garde-fou secondaire, purement diagnostique : si l'en-tête annonce plus de
  // pages que le plafond dur, le catalogue a pu être plafonné par WC_MAX_PAGES.
  if (knownTotalPages > WC_MAX_PAGES) {
    console.warn('serverCatalog: X-WP-TotalPages=' + knownTotalPages +
      ' > WC_MAX_PAGES=' + WC_MAX_PAGES + ' — catalogue possiblement plafonné.');
  }
  return all;
}

async function wooCatalog() {
  const base = (process.env.WC_STORE_URL || '').replace(/\/+$/, '');
  if (!base) return null;
  const now = Date.now();
  if (_wcCache.map && (now - _wcCache.at) < WC_TTL) return _wcCache.map;
  // Panne récente + cache périmé disponible → on ressert le périmé sans retenter
  // à chaque requête (évite de payer le timeout de 6 s pendant toute la panne).
  if (_wcCache.map && _wcFailAt && (now - _wcFailAt) < WC_RETRY_MS) return _wcCache.map;
  try {
    const raw = await fetchAllWooProducts(base);
    const list = raw.map(mapWooProduct).filter(isVisible);   // vitrine : voir lib/vitrine.json
    const map = {};
    list.forEach(function (prod) { map[prod.id] = prod; });
    _wcCache = { at: now, map: map, list: list };
    _wcFailAt = 0;
    return map;
  } catch (err) {
    _wcFailAt = now;
    if (_wcCache.map) {
      // Stale-while-revalidate : mieux vaut un catalogue périmé qu'un site mort.
      console.warn('serverCatalog: WooCommerce injoignable, catalogue périmé servi —',
        String((err && err.message) || err));
      return _wcCache.map;
    }
    const down = new Error('Catalogue WooCommerce injoignable');
    down.code = 'WC_DOWN';
    throw down;
  }
}

// Table de prix faisant autorité pour cette requête (map id → produit).
async function getCatalog() {
  const woo = await wooCatalog();            // null si WC_STORE_URL absent
  if (woo) return woo;
  // Sans WooCommerce configuré, RIEN n'est achetable. Il n'existe plus de
  // catalogue de démonstration de repli : un panier ne peut donc jamais être
  // valorisé à partir d'un produit qui n'existe pas dans la vraie boutique.
  return {};
}

// Tableau complet des produits mappés (CONTRAT PRODUIT) pour /api/catalog.
// Renvoie null si WC_STORE_URL n'est pas configurée (le site garde sa démo).
// Peut lever err.code='WC_DOWN' si Woo est injoignable sans cache périmé.
async function listProducts() {
  const base = (process.env.WC_STORE_URL || '').replace(/\/+$/, '');
  if (!base) return null;
  await wooCatalog();                        // remplit/rafraîchit _wcCache (ou throw)
  return _wcCache.list || [];
}

// Frais de port — mêmes règles que le site (data.js : SHIPPING).
// PLUS AUCUNE LIVRAISON OFFERTE (décision de la boutique, 22/11/2026) : toute
// livraison est facturée, quel que soit le montant. Seul le retrait en boutique
// est gratuit. Le 2e argument est ignoré — conservé pour les anciens appels.
const SHIPPING = { standard: 4.9, relais: 3.9, pickup: 0 };
function shippingCost(method) {
  const m = SHIPPING[method] != null ? method : 'standard';
  return SHIPPING[m];
}

// Remise automatique : 10 % sur le montant des ARTICLES dès 250 € d'articles
// (frais de port exclus du calcul et non remisés). Calcul en centimes, arrondi
// au centime — même formule côté site (data.js, discountFor) pour que le total
// affiché soit exactement celui encaissé. Vaut pour la carte comme pour le retrait.
const DISCOUNT = { thresholdCents: 25000, rate: 0.10, label: 'Remise 10 % (dès 250 € d\'achat)' };
function discountCents(subtotalCents) {
  const c = Math.round(Number(subtotalCents) || 0);
  return c >= DISCOUNT.thresholdCents ? Math.round(c * DISCOUNT.rate) : 0;
}

// À partir d'items { id, qty } du client : calcule les lignes + sous-total en
// CENTIMES, en n'utilisant QUE les prix serveur. Lève une erreur sur id inconnu.
async function priceItems(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('Panier vide');
  // Plafond de lignes (double sécurité avec MAX_ITEMS de notify-order.js) :
  // errorStatus() reconnaît « volumineux » comme une erreur métier (HTTP 400).
  if (items.length > MAX_LINES) throw new Error('Panier trop volumineux');
  const catalog = await getCatalog();
  const lines = [];
  let subtotalCents = 0;
  for (const raw of items) {
    const id = String((raw && raw.id) || '');
    const entry = catalog[id];
    if (!entry) throw new Error('Article indisponible ou inconnu : ' + (id || '?'));
    if (entry.inStock === false) throw new Error('Article en rupture : ' + entry.name);
    let qty = parseInt(raw && raw.qty, 10) || 1;
    // Clampe au maximum autorisé par Woo (quantity_limits) — 999 reste le
    // plafond absolu même si le stock annoncé est supérieur.
    const maxQty = (entry.maxQty != null && Number.isFinite(Number(entry.maxQty)))
      ? Math.max(1, Math.min(MAX_QTY_CAP, Number(entry.maxQty)))
      : MAX_QTY_CAP;
    qty = Math.max(1, Math.min(maxQty, qty));
    if (entry.unique) qty = 1;               // pièce unique → 1 exemplaire maximum
    // Stock restant connu (low_stock_remaining) → jamais vendre plus que le stock.
    if (entry.stockLeft != null && Number.isFinite(Number(entry.stockLeft)) && qty > Number(entry.stockLeft)) {
      throw new Error('Stock insuffisant pour “' + entry.name + '” (reste ' + Number(entry.stockLeft) + ')');
    }
    // unit <= 0 est REFUSÉ, pas seulement unit < 0 : un article à 0 € n'existe
    // pas ici, et un prix absent/illisible côté Woo arrive justement à 0 (cf.
    // mapWooProduct). Accepter 0 laisserait créer un PaymentIntent gratuit à
    // partir d'une simple fiche produit mal renseignée — c'est le serveur qui
    // fait autorité sur les prix, donc c'est ici que ça doit se fermer.
    const unit = Math.round(Number(entry.price) * 100);
    if (!Number.isFinite(unit) || unit <= 0) throw new Error('Prix invalide pour ' + entry.name);
    subtotalCents += unit * qty;
    lines.push({ id: id, name: entry.name, qty: qty, unitAmount: unit });
  }
  return { lines: lines, subtotalCents: subtotalCents };
}

// Clé d'idempotence : dédoublonne un double-clic / double-envoi identique, mais
// laisse passer tout panier différent (aucun conflit de paramètres Stripe).
function idemKey(prefix, parts) {
  const sig = crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0, 40);
  return prefix + '_' + sig;
}

// CORS restreint au(x) domaine(s) du site (+ localhost / *.vercel.app pour les
// tests). Remplace l'ancien Access-Control-Allow-Origin: '*'.
// Origines autorisées à appeler l'API depuis un navigateur : le site, plus les
// adresses de CE projet chez Vercel (aperçus). Avant, tout site hébergé en
// *.vercel.app était accepté — n'importe qui peut en ouvrir un.
function allowedOrigins() {
  const list = (process.env.ALLOWED_ORIGINS || 'https://club151.fr,https://www.club151.fr')
    .split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  ['VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL'].forEach(function (k) {
    if (process.env[k]) list.push('https://' + String(process.env[k]).replace(/^https?:\/\//, '').replace(/\/+$/, ''));
  });
  return list;
}
function originAllowed(origin) {
  if (!origin) return false;
  if (allowedOrigins().indexOf(origin) !== -1) return true;
  // localhost : développement uniquement, jamais sur le site en production.
  return process.env.VERCEL_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin);
}
function applyCors(req, res) {
  const origin = (req.headers && req.headers.origin) || '';
  if (originAllowed(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// La requête vient-elle bien d'une page du site ? Un navigateur joint toujours
// Origin à un POST : on exige qu'il désigne le site lui-même (même hôte que la
// requête) ou une origine autorisée. Ce n'est pas une authentification — un
// script peut forger l'en-tête — mais cela ferme la porte aux formulaires posés
// sur un autre site et aux robots qui frappent l'API à l'aveugle.
// strict=false : on ne refuse que si l'en-tête est présent ET étranger (paiement :
// on ne perd pas une vente pour un navigateur qui tairait Origin et Referer).
function sameSiteRequest(req, strict) {
  const h = (req && req.headers) || {};
  const host = String(h['x-forwarded-host'] || h.host || '').toLowerCase();
  function fits(u) {
    try {
      const x = new URL(String(u));
      return (!!host && x.host.toLowerCase() === host) || originAllowed(x.origin);
    } catch (e) { return false; }
  }
  if (h.origin) return fits(h.origin);
  if (h.referer) return fits(h.referer);
  return strict === false;
}

// Réponses propres à un client (compte, commande, paiement) : jamais en cache.
function noStore(res) {
  res.setHeader('Cache-Control', 'no-store');
}

// Adresse e-mail plausible : une arobase, un domaine avec un point et une
// extension d'au moins deux lettres, aucun espace, longueur bornée. Le vrai
// test reste la réception — ici on écarte les saisies manifestement fausses.
function isEmail(v) {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s || s.length > 160 || /\.\./.test(s)) return false;
  return /^[^\s@<>()",;:\\]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/.test(s);
}

// Renvoie un code HTTP adapté au message d'erreur (panier/catalogue = 400).
// « insuffisant » couvre le rejet « Stock insuffisant pour … » de priceItems ;
// « volumineux » couvre le rejet « Panier trop volumineux » (plafond MAX_LINES).
function errorStatus(msg) {
  return /vide|inconnu|indisponible|rupture|invalide|insuffisant|volumineux/i.test(String(msg)) ? 400 : 500;
}

// ---- Limite de requêtes par IP (mémoire d'instance serverless — best effort,
// suffisant pour décourager l'énumération et les rafales) ----
const _buckets = new Map();
// Compteur générique : `key` identifie ce qu'on limite (une IP, une adresse…).
function rateLimitKey(key, max, windowMs) {
  const now = Date.now();
  const hits = (_buckets.get(key) || []).filter(function (t) { return now - t < windowMs; });
  if (hits.length >= max) { _buckets.set(key, hits); return false; }
  hits.push(now);
  _buckets.set(key, hits);
  if (_buckets.size > 5000) _buckets.clear(); // garde-fou mémoire
  return true;
}
function rateLimit(req, name, max, windowMs) {
  const ip = String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '?')
    .split(',')[0].trim();
  return rateLimitKey(name + ':' + ip, max, windowMs);
}

// a***@domaine.fr — le client se reconnaît, un tiers n'en tire rien.
function maskEmail(email) {
  const s = String(email || '');
  const at = s.indexOf('@');
  if (at <= 0) return '';
  return s[0] + '***' + s.slice(at);
}

module.exports = { localPhoto, decodeEntities, isVisible, typeFromCategories, mapWooProduct, stockFromWoo, priceItems, shippingCost, discountCents, DISCOUNT, applyCors, originAllowed, sameSiteRequest, noStore, isEmail, rateLimitKey, idemKey, errorStatus, getCatalog, listProducts, rateLimit, maskEmail };
