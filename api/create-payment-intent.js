// leclub151 — Crée un PaymentIntent Stripe (paiement intégré sur le site)
// ---------------------------------------------------------------------------
// Utilisé par le Payment Element (formulaire de carte affiché DANS la page).
// SÉCURITÉ : le navigateur n'envoie QUE { id, qty }. Le montant est calculé ici
// à partir des PRIX SERVEUR (lib/serverCatalog) — jamais d'un prix client.
// Clé secrète via variable d'environnement Vercel : STRIPE_SECRET_KEY.
// ---------------------------------------------------------------------------

const Stripe = require('stripe');
const { priceItems, shippingCost, applyCors, idemKey, errorStatus, rateLimit } = require('../lib/serverCatalog');

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: 'STRIPE_SECRET_KEY manquante' });

  if (!rateLimit(req, 'pi', 15, 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de tentatives — réessayez dans une minute.' });
  }

  try {
    const stripe = Stripe(secret);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = typeof body.email === 'string' ? body.email : undefined;
    const method = typeof body.method === 'string' ? body.method : 'standard';
    const orderRef = typeof body.orderRef === 'string' ? body.orderRef : '';

    // Prix fixés par le serveur (le prix éventuellement envoyé par le client est ignoré).
    const { lines, subtotalCents } = await priceItems(body.items);
    const shipCents = Math.round(shippingCost(method, subtotalCents / 100) * 100);
    const amount = subtotalCents + shipCents;
    if (amount <= 0) return res.status(400).json({ error: 'Montant total invalide' });

    const itemsMeta = lines.map(function (l) { return l.id + 'x' + l.qty; }).join(',').slice(0, 480);
    const key = idemKey('pi', { a: amount, m: method, e: email || '', l: lines.map(function (l) { return [l.id, l.qty]; }) });

    const intent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: { orderRef: orderRef, source: 'leclub151', items: itemsMeta, shipping: String(shipCents) },
    }, { idempotencyKey: key });

    return res.status(200).json({ clientSecret: intent.client_secret, amount: amount });
  } catch (err) {
    const msg = String((err && err.message) || err);
    return res.status(errorStatus(msg)).json({ error: msg });
  }
};
