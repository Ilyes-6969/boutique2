// leclub151 — Fonction serverless Vercel : crée une session Stripe Checkout
// ---------------------------------------------------------------------------
// Mode redirection (page de paiement hébergée par Stripe), conservé en secours.
// SÉCURITÉ : le navigateur n'envoie QUE { id, qty }. Les prix proviennent du
// serveur (lib/serverCatalog) — jamais du client. La clé SECRÈTE Stripe ne vit
// QUE ici (variable d'environnement Vercel).
//
// Variables d'environnement Vercel :
//   STRIPE_SECRET_KEY   = sk_live_...   (ou sk_test_... pour les essais)
//   SITE_URL            = https://leclub151.fr   (secours si l'hôte est absent)
// ---------------------------------------------------------------------------

const Stripe = require('stripe');
const { priceItems, shippingCost, applyCors, idemKey, errorStatus, rateLimit } = require('../lib/serverCatalog');

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!rateLimit(req, 'checkout', 15, 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de tentatives — réessayez dans une minute.' });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY manquante (variable d\'environnement Vercel non configurée)' });
  }

  const stripe = Stripe(secret);
  // Domaine déduit de la requête (toujours correct, même sur domaine personnalisé).
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const fromReq = host ? (proto + '://' + host) : '';
  const siteUrl = (fromReq || process.env.SITE_URL || '').replace(/\/+$/, '');

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = typeof body.email === 'string' ? body.email : undefined;
    const method = typeof body.method === 'string' ? body.method : 'standard';
    const orderRef = typeof body.orderRef === 'string' ? body.orderRef : '';

    // Prix fixés par le serveur à partir des seuls { id, qty }.
    const { lines, subtotalCents } = await priceItems(body.items);
    const line_items = lines.map(function (l) {
      return {
        quantity: l.qty,
        price_data: { currency: 'eur', unit_amount: l.unitAmount, product_data: { name: l.name } },
      };
    });

    const shipCents = Math.round(shippingCost(method, subtotalCents / 100) * 100);
    const shipping_options = shipCents > 0 ? [{
      shipping_rate_data: {
        type: 'fixed_amount',
        display_name: 'Livraison',
        fixed_amount: { amount: shipCents, currency: 'eur' },
      },
    }] : undefined;

    const key = idemKey('cs', { l: lines.map(function (l) { return [l.id, l.qty]; }), s: shipCents, e: email || '' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: line_items,
      shipping_options: shipping_options,
      customer_email: email,
      payment_intent_data: { receipt_email: email },
      locale: 'fr',
      metadata: { orderRef: orderRef, source: 'leclub151' },
      success_url: siteUrl + '/merci.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: siteUrl + '/panier.html?stripe=cancel',
    }, { idempotencyKey: key });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    const msg = String((err && err.message) || err);
    return res.status(errorStatus(msg)).json({ error: msg });
  }
};
