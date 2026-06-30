// leclub151 — Fonction serverless Vercel : crée une session Stripe Checkout
// ---------------------------------------------------------------------------
// Reçoit le panier depuis le site, crée une session de paiement Stripe, et
// renvoie l'URL vers laquelle rediriger le client. La clé SECRÈTE Stripe ne
// vit QUE ici (variable d'environnement Vercel) — jamais dans le site public.
//
// Variables d'environnement à définir dans Vercel (Settings → Environment Variables) :
//   STRIPE_SECRET_KEY   = sk_live_...   (ou sk_test_... pour les essais)
//   SITE_URL            = https://leclub151.fr   (l'URL publique du site)
//
// L'argent encaissé par Stripe est reversé automatiquement (payout) vers
// l'IBAN Qonto que tu renseignes dans le tableau de bord Stripe.
// ---------------------------------------------------------------------------

const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  // CORS / méthode
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY manquante (variable d\'environnement Vercel non configurée)' });
  }

  const stripe = Stripe(secret);
  // On déduit le domaine DIRECTEMENT depuis la requête (toujours le bon, même
  // sur un domaine personnalisé). SITE_URL n'est utilisé qu'en dernier recours.
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const fromReq = host ? (proto + '://' + host) : '';
  const siteUrl = (fromReq || process.env.SITE_URL || '').replace(/\/+$/, '');

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const items = Array.isArray(body.items) ? body.items : [];
    const email = typeof body.email === 'string' ? body.email : undefined;
    const shipping = Number(body.shipping) || 0;       // frais de port en euros
    const orderRef = typeof body.orderRef === 'string' ? body.orderRef : '';

    if (!items.length) {
      return res.status(400).json({ error: 'Panier vide' });
    }

    // Construit les lignes Stripe. Les montants sont en CENTIMES (entiers).
    const line_items = items.map(function (i) {
      const name = String(i.name || 'Article').slice(0, 250);
      const qty = Math.max(1, Math.min(999, parseInt(i.qty, 10) || 1));
      const cents = Math.round(Number(i.price) * 100);
      if (!Number.isFinite(cents) || cents < 0) {
        throw new Error('Montant invalide pour « ' + name + ' »');
      }
      return {
        quantity: qty,
        price_data: {
          currency: 'eur',
          unit_amount: cents,
          product_data: { name: name },
        },
      };
    });

    // Frais de livraison ajoutés comme option d'expédition Stripe (propre sur le reçu).
    const shipping_options = shipping > 0 ? [{
      shipping_rate_data: {
        type: 'fixed_amount',
        display_name: 'Livraison',
        fixed_amount: { amount: Math.round(shipping * 100), currency: 'eur' },
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
      metadata: { orderRef: orderRef, source: 'leclub151' },
      success_url: siteUrl + '/merci.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: siteUrl + '/panier.html?stripe=cancel',
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    return res.status(500).json({ error: String((err && err.message) || err) });
  }
};
