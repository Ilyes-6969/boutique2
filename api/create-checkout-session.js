// leclub151 — Fonction serverless Vercel : crée une session Stripe Checkout
// ---------------------------------------------------------------------------
// (Ancien mode « redirection » — conservé en secours ; le site utilise le
// paiement intégré via create-payment-intent.js.)
// Reçoit le panier depuis le site, crée une session de paiement Stripe, et
// renvoie l'URL vers laquelle rediriger le client.
// SÉCURITÉ : prix et noms pris dans le CATALOGUE SERVEUR (api/_catalog.json),
// jamais dans la requête du navigateur.
//
// Variables d'environnement à définir dans Vercel (Settings → Environment Variables) :
//   STRIPE_SECRET_KEY   = sk_live_...   (ou sk_test_... pour les essais)
//   SITE_URL            = https://leclub151.fr   (l'URL publique du site)
// ---------------------------------------------------------------------------

const Stripe = require('stripe');
const lib = require('./_lib.js');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY manquante (variable d\'environnement Vercel non configurée)' });
  }

  if (!lib.rateLimit(req, 'checkout', 15, 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de tentatives — réessayez dans une minute.' });
  }

  const stripe = Stripe(secret);
  // On déduit le domaine DIRECTEMENT depuis la requête (toujours le bon, même
  // sur un domaine personnalisé). SITE_URL n'est utilisé qu'en dernier recours.
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const fromReq = host ? (proto + '://' + host) : '';
  const siteUrl = (fromReq || process.env.SITE_URL || '').replace(/\/+$/, '');

  try {
    const body = lib.parseBody(req);
    const email = typeof body.email === 'string' ? body.email.slice(0, 200) : undefined;
    const orderRef = typeof body.orderRef === 'string' ? body.orderRef.slice(0, 60) : '';

    // Panier validé contre le catalogue serveur (montants en CENTIMES, entiers).
    const { lines, itemsCents } = await lib.validateItems(body.items);
    const shippingCents = lib.validateShipping(body.shipping, itemsCents);

    const line_items = lines.map(function (l) {
      return {
        quantity: l.qty,
        price_data: {
          currency: 'eur',
          unit_amount: l.cents,
          product_data: { name: l.name },
        },
      };
    });

    // Frais de livraison ajoutés comme option d'expédition Stripe (propre sur le reçu).
    const shipping_options = shippingCents > 0 ? [{
      shipping_rate_data: {
        type: 'fixed_amount',
        display_name: 'Livraison',
        fixed_amount: { amount: shippingCents, currency: 'eur' },
      },
    }] : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: line_items,
      shipping_options: shipping_options,
      customer_email: email,           // Stripe peut envoyer le reçu à cette adresse
      // Reçu automatique au client (à activer aussi dans Stripe → Paramètres → E-mails clients)
      payment_intent_data: { receipt_email: email },
      locale: 'fr',
      metadata: { orderRef: orderRef, source: 'leclub151', items: lib.itemsSummary(lines) },
      success_url: siteUrl + '/merci.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: siteUrl + '/panier.html?stripe=cancel',
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    const status = (err && err.status) || 500;
    return res.status(status).json({ error: String((err && err.message) || err) });
  }
};
