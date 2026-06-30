// leclub151 — Crée un PaymentIntent Stripe (paiement intégré sur le site)
// ---------------------------------------------------------------------------
// Utilisé par le Payment Element (formulaire de carte affiché DANS la page).
// Le montant est calculé ICI, côté serveur, à partir du panier reçu.
// Clé secrète via variable d'environnement Vercel : STRIPE_SECRET_KEY.
// ---------------------------------------------------------------------------

const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: 'STRIPE_SECRET_KEY manquante' });

  try {
    const stripe = Stripe(secret);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const items = Array.isArray(body.items) ? body.items : [];
    const email = typeof body.email === 'string' ? body.email : undefined;
    const shipping = Number(body.shipping) || 0;
    const orderRef = typeof body.orderRef === 'string' ? body.orderRef : '';

    if (!items.length) return res.status(400).json({ error: 'Panier vide' });

    let cents = 0;
    items.forEach(function (i) {
      const qty = Math.max(1, Math.min(999, parseInt(i.qty, 10) || 1));
      const c = Math.round(Number(i.price) * 100);
      if (!Number.isFinite(c) || c < 0) throw new Error('Montant invalide');
      cents += c * qty;
    });
    cents += Math.round(shipping * 100);
    if (cents <= 0) return res.status(400).json({ error: 'Montant total invalide' });

    const intent = await stripe.paymentIntents.create({
      amount: cents,
      currency: 'eur',
      receipt_email: email,                 // reçu automatique au client (si activé dans Stripe)
      automatic_payment_methods: { enabled: true },
      metadata: { orderRef: orderRef, source: 'leclub151' },
    });

    return res.status(200).json({ clientSecret: intent.client_secret, amount: cents });
  } catch (err) {
    return res.status(500).json({ error: String((err && err.message) || err) });
  }
};
