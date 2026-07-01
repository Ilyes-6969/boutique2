// leclub151 — Crée un PaymentIntent Stripe (paiement intégré sur le site)
// ---------------------------------------------------------------------------
// Utilisé par le Payment Element (formulaire de carte affiché DANS la page).
// SÉCURITÉ : le montant est recalculé ici à partir du CATALOGUE SERVEUR
// (api/_catalog.json) — les prix envoyés par le navigateur ne sont jamais
// facturés tels quels ; s'ils diffèrent, la demande est refusée.
// Clé secrète via variable d'environnement Vercel : STRIPE_SECRET_KEY.
// ---------------------------------------------------------------------------

const Stripe = require('stripe');
const lib = require('./_lib.js');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: 'STRIPE_SECRET_KEY manquante' });

  if (!lib.rateLimit(req, 'pi', 15, 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de tentatives — réessayez dans une minute.' });
  }

  try {
    const stripe = Stripe(secret);
    const body = lib.parseBody(req);
    const email = typeof body.email === 'string' ? body.email.slice(0, 200) : undefined;
    const orderRef = typeof body.orderRef === 'string' ? body.orderRef.slice(0, 60) : '';

    // Montant calculé côté serveur (catalogue + frais de port autorisés).
    const { lines, itemsCents } = await lib.validateItems(body.items);
    const shippingCents = lib.validateShipping(body.shipping, itemsCents);
    const cents = itemsCents + shippingCents;
    if (cents <= 0) return res.status(400).json({ error: 'Montant total invalide' });

    const intent = await stripe.paymentIntents.create({
      amount: cents,
      currency: 'eur',
      receipt_email: email,                 // reçu automatique au client (si activé dans Stripe)
      automatic_payment_methods: { enabled: true },
      description: 'Commande leclub151' + (orderRef ? ' ' + orderRef : ''),
      metadata: {
        orderRef: orderRef,
        source: 'leclub151',
        items: lib.itemsSummary(lines),
        shipping_cents: String(shippingCents),
      },
    });

    return res.status(200).json({ clientSecret: intent.client_secret, amount: cents });
  } catch (err) {
    const status = (err && err.status) || 500;
    return res.status(status).json({ error: String((err && err.message) || err) });
  }
};
