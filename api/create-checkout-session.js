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

// La liste d'articles 'wpIDxQTY,...' peut dépasser 500 caractères (limite
// Stripe PAR CLÉ de metadata) : on la répartit sur items, items2, items3…
// (≤ 490 caractères chacune). Le webhook reconstitue en concaténant dans
// l'ordre. Garde-fou : 10 clés max (~4900 caractères), coupe sur une virgule
// pour ne jamais tronquer un jeton en deux. (Même logique que
// api/create-payment-intent.js — garder les deux copies synchronisées.)
const META_CHUNK = 490;
const META_MAX_KEYS = 10;
// Plafond de lignes distinctes par panier. Au-delà, les métadonnées Stripe
// seraient tronquées et la commande WooCommerce OMETTRAIT des articles pourtant
// payés. notify-order.js plafonne à 30 ; on reste large (100) tout en fermant
// cette faille avant de créer la session.
const MAX_CART_LINES = 100;
function splitItemsMeta(str) {
  const s = String(str || '');
  // DOUBLE SÉCURITÉ : plutôt que tronquer SILENCIEUSEMENT (articles payés mais
  // absents de la commande Woo), on ÉCHOUE. En pratique le plafond
  // MAX_CART_LINES rejette le panier bien avant d'atteindre cette limite.
  if (s.length > META_CHUNK * META_MAX_KEYS) {
    throw new Error('Métadonnées panier trop volumineuses — troncature évitée');
  }
  const out = { items: s.slice(0, META_CHUNK) };
  for (let i = META_CHUNK, n = 2; i < s.length; i += META_CHUNK, n++) {
    out['items' + n] = s.slice(i, i + META_CHUNK);
  }
  return out;
}

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
    // Liste blanche : ce champ part dans les métadonnées Stripe (limite 500 car.).
    const method = ['standard', 'relais', 'pickup'].indexOf(body.method) >= 0 ? body.method : 'standard';
    const orderRef = typeof body.orderRef === 'string' ? body.orderRef : '';

    // Prix fixés par le serveur à partir des seuls { id, qty }.
    const { lines, subtotalCents } = await priceItems(body.items);
    // Panier démesuré → métadonnées Stripe tronquées → articles perdus dans la
    // commande Woo. On refuse AVANT de créer la session (rien n'est débité).
    if (lines.length > MAX_CART_LINES) {
      return res.status(400).json({ error: 'Panier trop volumineux, contactez-nous.' });
    }
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

    // Métadonnées portées AUSSI par le PaymentIntent sous-jacent : le webhook
    // (payment_intent.succeeded) peut ainsi créer la commande WooCommerce même
    // en mode redirection.
    const itemsMeta = splitItemsMeta(lines.map(function (l) { return l.id + 'x' + l.qty; }).join(','));
    const sharedMeta = Object.assign(
      { orderRef: orderRef.slice(0, 120), source: 'leclub151', shipping: String(shipCents), method: method },
      itemsMeta
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: line_items,
      shipping_options: shipping_options,
      customer_email: email,
      payment_intent_data: { receipt_email: email, metadata: sharedMeta },
      locale: 'fr',
      metadata: sharedMeta,
      success_url: siteUrl + '/merci.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: siteUrl + '/panier.html?stripe=cancel',
    }, { idempotencyKey: key });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    const msg = String((err && err.message) || err);
    // WooCommerce injoignable (contrat WC_DOWN) → 503, message générique.
    if (err && err.code === 'WC_DOWN') {
      console.error('create-checkout-session: WooCommerce injoignable:', msg);
      return res.status(503).json({ error: 'Boutique momentanément indisponible, réessayez dans un instant.' });
    }
    // Erreur métier attendue (panier vide, rupture, article inconnu...) → message français au client.
    if (errorStatus(msg) === 400) return res.status(400).json({ error: msg });
    // Erreur inattendue (Stripe, réseau...) : détail loggé côté serveur, message générique au client.
    console.error('create-checkout-session:', msg);
    return res.status(500).json({ error: 'Le paiement n\'a pas pu être initialisé. Réessayez dans un instant.' });
  }
};
