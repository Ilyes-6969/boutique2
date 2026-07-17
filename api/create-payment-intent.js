// CLUB 151 — Crée un PaymentIntent Stripe (paiement intégré sur le site)
// ---------------------------------------------------------------------------
// Utilisé par le Payment Element (formulaire de carte affiché DANS la page).
// SÉCURITÉ : le navigateur n'envoie QUE { id, qty }. Le montant est calculé ici
// à partir des PRIX SERVEUR (lib/serverCatalog) — jamais d'un prix client.
// Le champ facultatif `customer` (nom, adresse…) ne sert QU'À la livraison et
// au reçu : il n'influence jamais le montant.
// Clé secrète via variable d'environnement Vercel : STRIPE_SECRET_KEY.
// ---------------------------------------------------------------------------

const Stripe = require('stripe');
const { priceItems, shippingCost, applyCors, idemKey, errorStatus, rateLimit } = require('../lib/serverCatalog');

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Coordonnées client : uniquement des chaînes, longueurs bornées. Renvoie null
// si rien d'exploitable (compatibilité descendante : ancien client sans champ
// customer → comportement identique à avant).
const CUSTOMER_LIMITS = { name: 120, email: 160, addr: 300, zip: 12, city: 120, phone: 40 };
function cleanCustomer(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out = {};
  Object.keys(CUSTOMER_LIMITS).forEach(function (k) {
    const v = raw[k];
    // Caractères de contrôle neutralisés : ces champs partent dans pi.shipping,
    // la commande WooCommerce et les e-mails (anti-injection de lignes).
    out[k] = typeof v === 'string' ? v.replace(/[\x00-\x1f\x7f]+/g, ' ').trim().slice(0, CUSTOMER_LIMITS[k]) : '';
  });
  if (!out.name && !out.email && !out.addr) return null;
  return out;
}

// La liste d'articles 'wpIDxQTY,...' peut dépasser 500 caractères (limite
// Stripe PAR CLÉ de metadata) : on la répartit sur items, items2, items3…
// (≤ 490 caractères chacune). Le webhook reconstitue en concaténant dans
// l'ordre. Garde-fou : 10 clés max (~4900 caractères), coupe sur une virgule
// pour ne jamais tronquer un jeton en deux.
const META_CHUNK = 490;
const META_MAX_KEYS = 10;
// Plafond de lignes distinctes par panier. Au-delà, les métadonnées Stripe
// seraient tronquées et la commande WooCommerce OMETTRAIT des articles pourtant
// payés. notify-order.js plafonne à 30 ; on reste large (100) tout en fermant
// cette faille avant de créer le PaymentIntent.
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

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: 'STRIPE_SECRET_KEY manquante' });

  if (!rateLimit(req, 'pi', 15, 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de tentatives — réessayez dans une minute.' });
  }

  try {
    const stripe = Stripe(secret);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = typeof body.email === 'string' ? body.email : undefined;
    // Liste blanche : ce champ part dans les métadonnées Stripe (limite 500 car.)
    // et dans la clé d'idempotence — jamais une chaîne client arbitraire.
    const method = ['standard', 'relais', 'pickup'].indexOf(body.method) >= 0 ? body.method : 'standard';
    const orderRef = (typeof body.orderRef === 'string' ? body.orderRef : '').slice(0, 120);
    const customer = cleanCustomer(body.customer);

    // Prix fixés par le serveur (le prix éventuellement envoyé par le client est ignoré).
    const { lines, subtotalCents } = await priceItems(body.items);
    // Panier démesuré → métadonnées Stripe tronquées → articles perdus dans la
    // commande Woo. On refuse AVANT de créer le PaymentIntent (rien n'est débité).
    if (lines.length > MAX_CART_LINES) {
      return res.status(400).json({ error: 'Panier trop volumineux, contactez-nous.' });
    }
    const shipCents = Math.round(shippingCost(method, subtotalCents / 100) * 100);
    const amount = subtotalCents + shipCents;
    if (amount <= 0) return res.status(400).json({ error: 'Montant total invalide' });

    const itemsMeta = lines.map(function (l) { return l.id + 'x' + l.qty; }).join(',');
    const key = idemKey('pi', {
      a: amount, m: method, e: email || '', c: customer || 0,
      l: lines.map(function (l) { return [l.id, l.qty]; }),
    });

    // Reçu Stripe : e-mail des coordonnées s'il est valide, sinon l'ancien champ.
    const receiptEmail = (customer && EMAIL_RE.test(customer.email)) ? customer.email : email;
    // Adresse de livraison attachée au PaymentIntent → visible dans Stripe et
    // reprise par le webhook pour créer la commande WooCommerce.
    const shipping = (customer && customer.name && customer.addr) ? {
      name: customer.name,
      phone: customer.phone || undefined,
      address: {
        line1: customer.addr,
        postal_code: customer.zip || undefined,
        city: customer.city || undefined,
        country: 'FR',
      },
    } : undefined;

    const intent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      receipt_email: receiptEmail,
      shipping: shipping,
      automatic_payment_methods: { enabled: true },
      metadata: Object.assign(
        { orderRef: orderRef, source: 'leclub151', shipping: String(shipCents), method: method },
        splitItemsMeta(itemsMeta)
      ),
    }, { idempotencyKey: key });

    return res.status(200).json({ clientSecret: intent.client_secret, amount: amount });
  } catch (err) {
    const msg = String((err && err.message) || err);
    // WooCommerce injoignable (contrat WC_DOWN) → 503, message générique.
    if (err && err.code === 'WC_DOWN') {
      console.error('create-payment-intent: WooCommerce injoignable:', msg);
      return res.status(503).json({ error: 'Boutique momentanément indisponible, réessayez dans un instant.' });
    }
    // Erreur métier attendue (panier vide, rupture, article inconnu...) → message français au client.
    if (errorStatus(msg) === 400) return res.status(400).json({ error: msg });
    // Erreur inattendue (Stripe, réseau...) : détail loggé côté serveur, message générique au client.
    console.error('create-payment-intent:', msg);
    return res.status(500).json({ error: 'Le paiement n\'a pas pu être initialisé. Réessayez dans un instant.' });
  }
};
