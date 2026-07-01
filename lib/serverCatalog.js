// leclub151 — SOURCE DE VÉRITÉ DES PRIX (côté serveur)
// ---------------------------------------------------------------------------
// Le navigateur n'envoie QUE { id, qty }. Le prix est fixé ICI, jamais par le
// client. Sans cela, n'importe qui pouvait payer un article au prix qu'il veut
// (ex. un Dracaufeu à 1 centime). Les frais de port sont aussi recalculés ici.
//
// Production : si WC_STORE_URL est défini, on lit le VRAI catalogue WooCommerce
// (Store API publique, sans clé) et on construit une table id->prix avec les
// mêmes identifiants « wp<ID> » que le site (voir data.js mapWoo).
// Phase de démo/test : on retombe sur l'instantané lib/catalog-demo.json, mais
// UNIQUEMENT en mode test Stripe (sk_test_) ou si ALLOW_DEMO_CHECKOUT=1 — ainsi
// les cartes de démonstration ne sont jamais facturables en réel.
//
// Variables d'environnement Vercel :
//   WC_STORE_URL        = https://ton-wordpress.tld   (optionnel, recommandé en réel)
//   ALLOW_DEMO_CHECKOUT = 1                            (optionnel : force la démo)
//   ALLOWED_ORIGINS     = https://leclub151.fr,https://www.leclub151.fr
// ---------------------------------------------------------------------------

const crypto = require('crypto');

let _demo = null;
function demoCatalog() {
  if (_demo) return _demo;
  try { _demo = require('./catalog-demo.json'); } catch (e) { _demo = {}; }
  return _demo;
}

function demoAllowed() {
  if (process.env.ALLOW_DEMO_CHECKOUT === '1') return true;
  return /^sk_test_/.test(process.env.STRIPE_SECRET_KEY || ''); // mode test → démo achetable
}

// Cache mémoire court : le conteneur serverless est réutilisé entre requêtes.
let _wcCache = { at: 0, map: null };
const WC_TTL = 60 * 1000;

async function wooCatalog() {
  const base = (process.env.WC_STORE_URL || '').replace(/\/+$/, '');
  if (!base) return null;
  const now = Date.now();
  if (_wcCache.map && (now - _wcCache.at) < WC_TTL) return _wcCache.map;
  const r = await fetch(base + '/wp-json/wc/store/v1/products?per_page=100');
  if (!r.ok) throw new Error('Catalogue WooCommerce indisponible (HTTP ' + r.status + ')');
  const list = await r.json();
  const map = {};
  (Array.isArray(list) ? list : []).forEach(function (p) {
    const minor = (p.prices && p.prices.currency_minor_unit != null) ? p.prices.currency_minor_unit : 2;
    const div = Math.pow(10, minor);
    const price = p.prices && p.prices.price != null ? Number(p.prices.price) / div : 0;
    const cats = (p.categories || []).map(function (c) { return (c.name || '').toLowerCase(); }).join(' ');
    const unique = /grad|psa|bgs|cgc|unit|single/.test(cats);
    map['wp' + p.id] = {
      name: p.name,
      price: Math.round(price * 100) / 100,
      unique: unique,
      inStock: p.is_in_stock !== false,
    };
  });
  _wcCache = { at: now, map: map };
  return map;
}

// Table de prix faisant autorité pour cette requête.
async function getCatalog() {
  const woo = await wooCatalog();            // null si WC_STORE_URL absent
  if (woo) return woo;
  if (demoAllowed()) return demoCatalog();
  return {};                                 // réel sans WooCommerce → rien d'achetable
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
  const catalog = await getCatalog();
  const lines = [];
  let subtotalCents = 0;
  for (const raw of items) {
    const id = String((raw && raw.id) || '');
    const entry = catalog[id];
    if (!entry) throw new Error('Article indisponible ou inconnu : ' + (id || '?'));
    if (entry.inStock === false) throw new Error('Article en rupture : ' + entry.name);
    let qty = parseInt(raw && raw.qty, 10) || 1;
    qty = Math.max(1, Math.min(999, qty));
    if (entry.unique) qty = 1;               // pièce unique → 1 exemplaire maximum
    const unit = Math.round(Number(entry.price) * 100);
    if (!Number.isFinite(unit) || unit < 0) throw new Error('Prix invalide pour ' + entry.name);
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
function errorStatus(msg) {
  return /vide|inconnu|indisponible|rupture|invalide/i.test(String(msg)) ? 400 : 500;
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

module.exports = { priceItems, shippingCost, applyCors, idemKey, errorStatus, getCatalog, FREE_SHIP, rateLimit, maskEmail };
