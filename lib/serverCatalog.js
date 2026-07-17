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
//     grade, unique, preorder, inStock, stockLeft, maxQty }
// `grade` = note de gradation (ex. « PSA 10 ») lue depuis le nom des cartes
// gradées (type 'graded'), sinon null. Sert au rendu « slab ». Jamais inventé :
// null si aucune note reconnue dans le nom. Transmis tel quel par /api/catalog.
// Phase de démo/test : on retombe sur l'instantané lib/catalog-demo.json, mais
// UNIQUEMENT en mode test Stripe (sk_test_) ou si ALLOW_DEMO_CHECKOUT=1 — ainsi
// les cartes de démonstration ne sont jamais facturables en réel.
//
// Panne WooCommerce : si un catalogue périmé existe en mémoire, il est servi
// (stale-while-revalidate). Sinon on lève une erreur avec err.code='WC_DOWN' —
// les handlers api/ doivent la traduire en HTTP 503 avec un message générique.
//
// Variables d'environnement Vercel :
//   WC_STORE_URL        = https://ton-wordpress.tld   (optionnel, recommandé en réel)
//   ALLOW_DEMO_CHECKOUT = 1                            (optionnel : force la démo)
//   ALLOWED_ORIGINS     = https://leclub151.fr,https://www.leclub151.fr
// ---------------------------------------------------------------------------

const crypto = require('crypto');

// Plafond absolu de quantité par ligne (garde-fou, même si Woo annonce plus).
const MAX_QTY_CAP = 999;

// Plafond de lignes distinctes par panier (double sécurité avec la garde
// MAX_ITEMS de api/notify-order.js) : au-delà, priceItems refuse le panier.
const MAX_LINES = 100;

let _demo = null;
function demoCatalog() {
  if (_demo) return _demo;
  let raw = {};
  try { raw = require('./catalog-demo.json'); } catch (e) { raw = {}; }
  // Complète les entrées démo avec les défauts du contrat étendu (sans muter
  // le JSON requis) : maxQty 999 (1 si pièce unique), stockLeft inconnu.
  const normalized = {};
  Object.keys(raw).forEach(function (id) {
    const entry = raw[id] || {};
    normalized[id] = Object.assign({}, entry, {
      unique: entry.unique === true,
      inStock: entry.inStock !== false,
      // Galerie (contrat inter-agents) : toujours un tableau, vide par défaut —
      // le client retombe alors sur [image].
      images: Array.isArray(entry.images) ? entry.images : [],
      maxQty: (entry.maxQty != null && Number.isFinite(Number(entry.maxQty)))
        ? Number(entry.maxQty)
        : (entry.unique === true ? 1 : MAX_QTY_CAP),
      stockLeft: (entry.stockLeft != null && Number.isFinite(Number(entry.stockLeft)))
        ? Number(entry.stockLeft)
        : null,
    });
  });
  _demo = normalized;
  return _demo;
}

function demoAllowed() {
  if (process.env.ALLOW_DEMO_CHECKOUT === '1') return true;
  return /^sk_test_/.test(process.env.STRIPE_SECRET_KEY || ''); // mode test → démo achetable
}

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
  if (/scell|display|booster|coffret|etb|box|boîte/.test(s)) return 'sealed';
  if (/accessoir|sleeve|protège|classeur|toploader|tapis|deck box/.test(s)) return 'accessory';
  return 'single';
}

// Précommande : une catégorie OU un tag contenant « précommande »/« preorder ».
function isPreorder(p) {
  const terms = [].concat(p.categories || [], p.tags || [])
    .map(function (t) { return ((t && t.name) || '') + ' ' + ((t && t.slug) || ''); })
    .join(' ').toLowerCase();
  return /pr[ée]commande|preorder/.test(terms);
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

  const cat = (p.categories && p.categories[0] && p.categories[0].name) || 'Carte';
  const img = (p.images && p.images[0]) || null;

  // Quantités : quantity_limits.maximum fait foi quand la Store API l'expose
  // (« Vendu individuellement » ou stock=1 → maximum=1). Fallback : la regex
  // catégories historique pour les vieilles versions de Woo sans quantity_limits.
  const ql = (p.quantity_limits && p.quantity_limits.maximum != null)
    ? Number(p.quantity_limits.maximum) : null;
  let maxQty = MAX_QTY_CAP;
  if (ql != null && Number.isFinite(ql)) maxQty = Math.max(1, Math.min(MAX_QTY_CAP, ql));

  let unique;
  if (ql != null && Number.isFinite(ql)) {
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
    name: p.name,
    price: Math.round(price * 100) / 100,
    oldPrice: onSale ? Math.round(regular * 100) / 100 : null,
    image: (img && img.src) || null,
    thumb: (img && img.thumbnail) || null,
    // GALERIE (contrat inter-agents) : « images » = [{ src, thumb }] (max 6),
    // en COMPLÉMENT de image/thumb (compat descendante : si absent ou vide, la
    // fiche produit retombe sur [image]). Transmis tel quel par /api/catalog.
    images: (p.images || []).slice(0, 6).map(function (i) {
      return { src: (i && i.src) || null, thumb: (i && (i.thumbnail || i.src)) || null };
    }).filter(function (i) { return i.src; }), // même filtrage que data.js mapWoo (contrat identique)
    desc: stripHtml(p.short_description) || stripHtml(p.description),
    cat: cat,
    set: cat,
    num: p.sku || '—',
    type: type,
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
    const list = raw.map(mapWooProduct);
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
  if (demoAllowed()) return demoCatalog();
  return {};                                 // réel sans WooCommerce → rien d'achetable
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

// Frais de port — mêmes règles que le site (data.js : SHIPPING + FREE_SHIP).
const SHIPPING = { standard: 4.9, relais: 3.9, pickup: 0 };
const FREE_SHIP = 100;
function shippingCost(method, subtotalEuros) {
  const m = SHIPPING[method] != null ? method : 'standard';
  if (m === 'pickup') return 0;
  if (subtotalEuros >= FREE_SHIP) return 0;
  return SHIPPING[m];
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
function applyCors(req, res) {
  const origin = (req.headers && req.headers.origin) || '';
  const allow = (process.env.ALLOWED_ORIGINS || 'https://leclub151.fr,https://www.leclub151.fr')
    .split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  const ok = origin && (
    allow.indexOf(origin) !== -1 ||
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
    /\.vercel\.app$/.test(origin)
  );
  if (ok) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
function rateLimit(req, name, max, windowMs) {
  const ip = String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '?')
    .split(',')[0].trim();
  const key = name + ':' + ip;
  const now = Date.now();
  const hits = (_buckets.get(key) || []).filter(function (t) { return now - t < windowMs; });
  if (hits.length >= max) { _buckets.set(key, hits); return false; }
  hits.push(now);
  _buckets.set(key, hits);
  if (_buckets.size > 5000) _buckets.clear(); // garde-fou mémoire
  return true;
}

// a***@domaine.fr — le client se reconnaît, un tiers n'en tire rien.
function maskEmail(email) {
  const s = String(email || '');
  const at = s.indexOf('@');
  if (at <= 0) return '';
  return s[0] + '***' + s.slice(at);
}

module.exports = { priceItems, shippingCost, applyCors, idemKey, errorStatus, getCatalog, listProducts, FREE_SHIP, rateLimit, maskEmail };
