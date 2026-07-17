// CLUB 151 — Notification de commande « retrait en boutique » (sans Stripe)
// ---------------------------------------------------------------------------
// Le retrait en boutique ne passe pas par Stripe : sans ce endpoint, le
// propriétaire n'était prévenu que via une clé localStorage de SON navigateur
// (aucune fiabilité). Ici : le client n'envoie QUE { id, qty } + coordonnées ;
// les articles et le total sont recalculés via lib/serverCatalog (JAMAIS de
// prix client), puis un e-mail part au propriétaire via Web3Forms.
//
// Décision actée : PAS de création de commande WooCommerce ici — endpoint non
// authentifié = vecteur d'épuisement de stock. Le stock des retraits est
// décrémenté manuellement à la préparation.
//
// Variables d'environnement Vercel :
//   WEB3FORMS_KEY = clé Web3Forms (sans elle : aucune notification, ok:false)
// ---------------------------------------------------------------------------

const { priceItems, applyCors, errorStatus, rateLimit } = require('../lib/serverCatalog');

const MAX_ITEMS = 30;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ID_RE = /^[A-Za-z0-9_-]{1,32}$/;
const REF_RE = /^[A-Za-z0-9_-]{1,40}$/;

function cleanText(v, max) {
  // Retours à la ligne et caractères de contrôle neutralisés : ces champs
  // partent dans un e-mail (anti-injection de fausses lignes de commande).
  return typeof v === 'string' ? v.replace(/[\x00-\x1f\x7f]+/g, ' ').trim().slice(0, max) : '';
}

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Bucket dédié, volontairement strict : 5 requêtes / 15 min / IP.
  if (!rateLimit(req, 'notify-order', 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de tentatives — réessayez plus tard.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // --- Validation stricte (endpoint public → aucune confiance) ---
    if (body.method !== 'pickup') return res.status(400).json({ error: 'Méthode invalide' });
    const c = (body.customer && typeof body.customer === 'object') ? body.customer : {};
    const name = cleanText(c.name, 120);
    const email = cleanText(c.email, 160);
    const phone = cleanText(c.phone, 40);
    const orderRef = REF_RE.test(String(body.orderRef || '')) ? String(body.orderRef) : '';
    if (!name) return res.status(400).json({ error: 'Nom invalide' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'E-mail invalide' });
    if (!Array.isArray(body.items) || !body.items.length || body.items.length > MAX_ITEMS) {
      return res.status(400).json({ error: 'Panier invalide (1 à ' + MAX_ITEMS + ' lignes)' });
    }
    const items = [];
    for (const raw of body.items) {
      const id = String((raw && raw.id) || '');
      if (!ID_RE.test(id)) return res.status(400).json({ error: 'Article invalide' });
      const qty = parseInt(raw && raw.qty, 10);
      if (!Number.isFinite(qty) || qty < 1 || qty > 999) return res.status(400).json({ error: 'Quantité invalide' });
      items.push({ id: id, qty: qty });
    }

    // Prix et noms d'articles fixés par le SERVEUR (jamais ceux du client).
    const { lines, subtotalCents } = await priceItems(items);
    const total = (subtotalCents / 100).toFixed(2) + ' €'; // retrait → pas de port

    const key = process.env.WEB3FORMS_KEY;
    if (!key) return res.status(200).json({ ok: false }); // non configuré → best-effort silencieux

    const articles = lines.map(function (l) {
      return '- ' + l.name + ' ×' + l.qty + ' : ' + ((l.unitAmount * l.qty) / 100).toFixed(2) + ' €';
    }).join('\n');

    const payload = {
      access_key: key,
      subject: 'Commande retrait en boutique ' + (orderRef || '') + ' — CLUB 151',
      from_name: 'Boutique CLUB 151',
      Commande: orderRef || '—',
      Client: name,
      'E-mail': email,
      'Téléphone': phone || '—',
      Articles: '\n' + articles,
      Total: total,
      Paiement: 'À régler au retrait en boutique (aucun paiement en ligne)',
    };

    const r = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error('notify-order: Web3Forms HTTP ' + r.status);
      return res.status(502).json({ error: 'Notification impossible pour le moment.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    const msg = String((err && err.message) || err);
    // WooCommerce injoignable (contrat WC_DOWN) → 503, message générique.
    if (err && err.code === 'WC_DOWN') {
      console.error('notify-order: WooCommerce injoignable:', msg);
      return res.status(503).json({ error: 'Boutique momentanément indisponible, réessayez dans un instant.' });
    }
    // Erreur métier attendue (panier vide, article inconnu, rupture...).
    if (errorStatus(msg) === 400) return res.status(400).json({ error: msg });
    console.error('notify-order:', msg);
    return res.status(500).json({ error: 'Notification impossible pour le moment.' });
  }
};
