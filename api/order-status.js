// leclub151 — Vérifie l'état d'une session Stripe au retour du paiement
// ---------------------------------------------------------------------------
// Le site appelle cette fonction quand le client revient avec ?session_id=...
// Elle confirme côté serveur que le paiement est bien « payé » AVANT de
// finaliser la commande sur le site (on ne fait jamais confiance à l'URL seule).
//
// Variable d'environnement : STRIPE_SECRET_KEY (la même que create-checkout-session).
// ---------------------------------------------------------------------------

const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: 'STRIPE_SECRET_KEY manquante' });

  const sessionId = (req.query && req.query.session_id) ||
    (req.url && (new URL(req.url, 'http://x')).searchParams.get('session_id'));
  if (!sessionId) return res.status(400).json({ error: 'session_id manquant' });

  try {
    const stripe = Stripe(secret);
    const s = await stripe.checkout.sessions.retrieve(String(sessionId));
    const paid = s.payment_status === 'paid';
    return res.status(200).json({
      paid: paid,
      ref: s.payment_intent || s.id,
      amount_total: s.amount_total,           // en centimes
      email: (s.customer_details && s.customer_details.email) || s.customer_email || null,
      orderRef: (s.metadata && s.metadata.orderRef) || '',
    });
  } catch (err) {
    return res.status(500).json({ error: String((err && err.message) || err) });
  }
};
