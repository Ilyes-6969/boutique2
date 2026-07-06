// leclub151 — Vérifie l'état d'un PaymentIntent (paiement intégré / Payment Element)
// ---------------------------------------------------------------------------
// La page merci.html appelle cette fonction avec ?payment_intent=pi_... pour
// CONFIRMER CÔTÉ SERVEUR qu'un paiement a réellement réussi, avant d'afficher la
// commande comme « payée ». On ne se fie jamais au paramètre d'URL redirect_status
// ni au localStorage seuls (sinon n'importe qui pouvait simuler une commande payée).
//
// Variable d'environnement : STRIPE_SECRET_KEY.
// ---------------------------------------------------------------------------

const Stripe = require('stripe');
const { applyCors, rateLimit, maskEmail } = require('../lib/serverCatalog');

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: 'STRIPE_SECRET_KEY manquante' });

  // Anti-énumération : limite par IP + format strict de l'identifiant.
  if (!rateLimit(req, 'status', 20, 5 * 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de requêtes — réessayez dans quelques minutes.' });
  }
  const pi = (req.query && req.query.payment_intent) ||
    (req.url && (new URL(req.url, 'http://x')).searchParams.get('payment_intent'));
  if (!pi || !/^pi_[A-Za-z0-9]{8,250}$/.test(String(pi))) {
    return res.status(400).json({ error: 'payment_intent manquant ou invalide' });
  }

  try {
    const stripe = Stripe(secret);
    const intent = await stripe.paymentIntents.retrieve(String(pi));
    return res.status(200).json({
      paid: intent.status === 'succeeded',
      status: intent.status,                 // succeeded | processing | requires_payment_method | ...
      amount: intent.amount,                 // CENTIMES, fixés par le serveur à la création
      ref: intent.id,
      // Masqué (a***@domaine.fr) : le client se reconnaît, un tiers n'en tire rien.
      email: maskEmail(intent.receipt_email),
      orderRef: (intent.metadata && intent.metadata.orderRef) || '',
    });
  } catch (err) {
    // Réponse neutre : un id inexistant et une erreur interne sont indistinguables.
    console.error('payment-status:', String((err && err.message) || err));
    return res.status(404).json({ error: 'Paiement introuvable' });
  }
};
