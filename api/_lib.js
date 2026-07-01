// leclub151 — Outils partagés des fonctions serverless (fichier NON exposé :
// les fichiers commençant par « _ » dans /api ne sont pas des routes Vercel).
// ---------------------------------------------------------------------------
// 1. CATALOGUE SERVEUR : api/_catalog.json est généré par `npm run build`
//    à partir de data.js. Les prix facturés viennent d'ICI, jamais du client.
// 2. validateItems()  : refuse tout article inconnu ou au mauvais prix.
// 3. rateLimit()      : limite basique par IP (mémoire de l'instance — best
//    effort sur serverless, suffisant pour décourager les abus).
// 4. maskEmail()      : évite de renvoyer une adresse complète au navigateur.
// ---------------------------------------------------------------------------

let CATALOG = {};
try { CATALOG = require('./_catalog.json'); } catch (e) { CATALOG = {}; }

// Frais de port autorisés (doit refléter data.js → SHIPPING / FREE_SHIP).
const SHIPPING_CENTS = [0, 390, 490];
const FREE_SHIP_CENTS = 10000; // livraison offerte dès 100 €

function err(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

// Valide le panier reçu du navigateur contre le catalogue SERVEUR.
// Renvoie { lines: [{id, name, qty, cents}], itemsCents }.
// - id connu  → prix et nom pris côté serveur (le prix client est ignoré,
//   mais s'il diffère on refuse : panier affiché ≠ panier facturé).
// - id 'wp…'  → vérifié contre WooCommerce si WOO_URL est configurée (Vercel).
// - id inconnu → refus (les produits ajoutés via admin.html ne vivent que dans
//   le navigateur du propriétaire : un client ne peut pas les commander).
async function validateItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw err(400, 'Panier vide');
  if (rawItems.length > 100) throw err(400, 'Panier trop grand');

  const lines = [];
  let itemsCents = 0;

  for (const raw of rawItems) {
    const id = String((raw && raw.id) || '');
    const qty = Math.max(1, Math.min(999, parseInt(raw && raw.qty, 10) || 1));
    const clientCents = Math.round(Number(raw && raw.price) * 100);

    let name, cents;
    if (Object.prototype.hasOwnProperty.call(CATALOG, id)) {
      name = CATALOG[id].n;
      cents = CATALOG[id].c;
    } else if (/^wp\d+$/.test(id) && process.env.WOO_URL) {
      const p = await fetchWooProduct(id.slice(2));
      name = p.name;
      cents = p.cents;
    } else {
      throw err(400, 'Article indisponible — rechargez la page et réessayez.');
    }

    // Le prix affiché au client doit être EXACTEMENT le prix serveur.
    if (!Number.isFinite(clientCents) || clientCents !== cents) {
      throw err(400, 'Le prix de « ' + name + ' » a changé — rechargez la page.');
    }

    lines.push({ id, name: String(name).slice(0, 250), qty, cents });
    itemsCents += cents * qty;
  }
  return { lines, itemsCents };
}

// Valide les frais de port envoyés par le client (en euros) → centimes.
function validateShipping(shippingEuros, itemsCents) {
  const cents = Math.round(Number(shippingEuros) * 100) || 0;
  if (SHIPPING_CENTS.indexOf(cents) === -1) throw err(400, 'Frais de livraison invalides');
  if (itemsCents >= FREE_SHIP_CENTS && cents !== 0) throw err(400, 'La livraison est offerte dès 100 €');
  return cents;
}

// Prix réel d'un produit WooCommerce via la Store API publique (côté serveur).
async function fetchWooProduct(wpId) {
  const base = String(process.env.WOO_URL || '').replace(/\/+$/, '');
  const r = await fetch(base + '/wp-json/wc/store/v1/products/' + encodeURIComponent(wpId));
  if (!r.ok) throw err(400, 'Article introuvable dans la boutique');
  const p = await r.json();
  // La Store API renvoie le prix en unités mineures (ex. "6490" pour 64,90 €).
  const minor = (p.prices && p.prices.currency_minor_unit != null) ? Number(p.prices.currency_minor_unit) : 2;
  const cents = Math.round((Number(p.prices && p.prices.price) || 0) * Math.pow(10, 2 - minor));
  if (!Number.isFinite(cents) || cents <= 0) throw err(400, 'Prix indisponible pour cet article');
  return { name: p.name || 'Article', cents };
}

// Résumé compact du panier pour les métadonnées Stripe (max ~450 caractères).
function itemsSummary(lines) {
  const s = lines.map((l) => l.id + '×' + l.qty).join(', ');
  return s.length > 450 ? s.slice(0, 447) + '…' : s;
}

// ---- Rate limit par IP (mémoire d'instance, best effort) ----
const buckets = new Map();
function rateLimit(req, name, max, windowMs) {
  const ip = String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '?')
    .split(',')[0].trim();
  const key = name + ':' + ip;
  const now = Date.now();
  let hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) { buckets.set(key, hits); return false; }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear(); // garde-fou mémoire
  return true;
}

// a***@domaine.fr — assez pour que le client se reconnaisse, inutile à un tiers.
function maskEmail(email) {
  const s = String(email || '');
  const at = s.indexOf('@');
  if (at <= 0) return '';
  return s[0] + '***' + s.slice(at);
}

function parseBody(req) {
  try { return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); }
  catch (e) { return {}; }
}

module.exports = { validateItems, validateShipping, itemsSummary, rateLimit, maskEmail, parseBody, err };
