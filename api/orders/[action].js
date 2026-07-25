// CLUB 151 — Suivi de commandes (client connecté + suivi invité)
// ---------------------------------------------------------------------------
//   GET  /api/orders/mine                      → commandes du client connecté
//   POST /api/orders/track  { ref, email }     → suivi SANS compte
//
// POURQUOI LE SUIVI INVITÉ : le paiement invité est acté sur ce site. Réserver
// le suivi aux titulaires d'un compte forcerait à en créer un APRÈS coup juste
// pour savoir où en est sa commande — exactement le moment où le client
// s'agace. Le couple (numéro + e-mail) suffit à prouver que la commande est
// bien la sienne.
//
// Les numéros de commande WooCommerce se suivent : le numéro SEUL ne prouve
// rien (il suffirait d'incrémenter pour lire la commande du voisin). D'où
// l'exigence que l'e-mail corresponde AUSSI (lib/wooCustomers.js) et la limite
// de débit ci-dessous.
//
// Variables d'environnement : SESSION_SECRET, WC_STORE_URL, WC_CONSUMER_KEY,
// WC_CONSUMER_SECRET.
// ---------------------------------------------------------------------------

const { applyCors, rateLimit } = require('../../lib/serverCatalog');
const S = require('../../lib/session');
const W = require('../../lib/wooCustomers');

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const REF_RE = /^[A-Za-z0-9_-]{1,40}$/;

function readBody(req) {
  if (typeof req.body === 'string') { try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; } }
  return req.body || {};
}

function fail(res, err, where) {
  if (err && err.code === 'WC_DOWN') {
    console.error('orders/' + where + ': WooCommerce injoignable:', String(err.message || err));
    return res.status(503).json({ ok: false, error: 'Service momentanément indisponible, réessayez dans un instant.' });
  }
  console.error('orders/' + where + ':', String((err && err.message) || err));
  return res.status(500).json({ ok: false, error: 'Une erreur est survenue, réessayez dans un instant.' });
}

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const action = String((req.query && req.query.action) || '');

  if (!W.wooConfigured()) {
    console.error('orders: clés WooCommerce absentes — suivi de commandes indisponible');
    return res.status(503).json({ ok: false, error: 'Le suivi de commandes n’est pas encore activé sur ce site.' });
  }

  // ---- Commandes du client connecté ----
  if (action === 'mine') {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    if (!S.sessionConfigured()) {
      return res.status(503).json({ ok: false, error: 'Les comptes ne sont pas encore activés sur ce site.' });
    }
    const sess = S.readSession(req);
    // 200 + loggedIn:false plutôt que 401 : « pas connecté » est un état normal
    // de la page, pas une erreur à afficher au client.
    if (!sess) return res.status(200).json({ ok: true, loggedIn: false, orders: [] });
    try {
      const orders = await W.listOrders(sess.cid);
      // Jamais de cache partagé : ces données sont nominatives. Un s-maxage ici
      // servirait la commande d'un client à un autre depuis le CDN.
      res.setHeader('Cache-Control', 'private, no-store');
      return res.status(200).json({ ok: true, loggedIn: true, orders: orders });
    } catch (err) { return fail(res, err, 'mine'); }
  }

  // ---- Suivi invité (numéro + e-mail) ----
  if (action === 'track') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    // Anti-énumération : sans limite, on pourrait balayer les numéros de
    // commande en variant l'e-mail jusqu'à tomber juste.
    if (!rateLimit(req, 'orders-track', 10, 10 * 60 * 1000)) {
      return res.status(429).json({ ok: false, error: 'Trop de recherches — réessayez dans quelques minutes.' });
    }
    const body = readBody(req);
    const ref = String(body.ref || '').trim().replace(/^#/, '');
    const email = String(body.email || '').trim().toLowerCase();
    if (!REF_RE.test(ref)) return res.status(400).json({ ok: false, error: 'Numéro de commande invalide.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Adresse e-mail invalide.' });

    try {
      const order = await W.findOrderForTracking(ref, email);
      res.setHeader('Cache-Control', 'private, no-store');
      if (!order) {
        // Réponse VOLONTAIREMENT identique pour « ce numéro n'existe pas » et
        // « il existe mais l'e-mail ne correspond pas ». Les distinguer
        // confirmerait l'existence d'une commande à qui n'y a pas droit.
        return res.status(404).json({ ok: false, error: 'Aucune commande ne correspond à ce numéro et cet e-mail.' });
      }
      return res.status(200).json({ ok: true, order: order });
    } catch (err) { return fail(res, err, 'track'); }
  }

  return res.status(404).json({ ok: false, error: 'Action inconnue' });
};
