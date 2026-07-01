// leclub151 — Vérifie l'état d'une session Stripe au retour du paiement
// ---------------------------------------------------------------------------
// Le site appelle cette fonction quand le client revient avec ?session_id=...
// Elle confirme côté serveur que le paiement est bien « payé » AVANT de
// finaliser la commande sur le site (on ne fait jamais confiance à l'URL seule).
//
// Variable d'environnement : STRIPE_SECRET_KEY (la même que create-checkout-session).
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
  const sessionId = (req.query && req.query.session_id) ||
    (req.url && (new URL(req.url, 'http://x')).searchParams.get('session_id'));
  if (!sessionId || !/^cs_[A-Za-z0-9_]{10,250}$/.test(String(sessionId))) {
    return res.status(400).json({ error: 'session_id manquant ou invalide' });
  }

  try {
    const stripe = Stripe(secret);
    const s = await stripe.checkout.sessions.retrieve(String(sessionId));
    const paid = s.payment_status === 'paid';
    return res.status(200).json({
      paid: paid,
      ref: s.payment_intent || s.id,
      amount_total: s.amount_total,           // en centimes
      // Masqué (a***@domaine.fr) : le client se reconnaît, un tiers n'en tire rien.
      email: maskEmail((s.customer_details && s.customer_details.email) || s.customer_email),
      orderRef: (s.metadata && s.metadata.orderRef) || '',
    });
  } catch (err) {
    // Réponse neutre : un id inexistant et une erreur interne sont indistinguables.
    return res.status(404).json({ error: 'Session introuvable' });
  }
};
