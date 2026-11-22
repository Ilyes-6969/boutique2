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
const { priceItems, shippingCost, discountCents, applyCors, idemKey, errorStatus, rateLimit, sameSiteRequest, noStore, isEmail, cleanName, cleanPhone, cardPaymentsClosed, CARD_CLOSED_MSG } = require('../lib/serverCatalog');
const { readSession } = require('../lib/session');

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
  // Nom et téléphone : caractères d'un nom / d'un numéro uniquement (pas d'adresse de site).
  out.name = cleanName(out.name, CUSTOMER_LIMITS.name);
  out.phone = cleanPhone(out.phone);
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
  noStore(res);
  // Appel venu d'un autre site → refusé (non strict : voir sameSiteRequest).
  if (!sameSiteRequest(req, false)) return res.status(403).json({ error: 'Requête refusée.' });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(500).json({ error: 'STRIPE_SECRET_KEY manquante' });
  // Clés de test sur le site public → aucun paiement « pour de faux ».
  if (cardPaymentsClosed()) return res.status(503).json({ error: CARD_CLOSED_MSG, closed: true });

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
    // Référence affichée au client (« LC151-… ») : format strict, sinon vide. Elle
    // part dans les métadonnées Stripe puis sur la commande WooCommerce, pour que
    // la boutique retrouve la commande quand le client donne son numéro.
    const orderRef = /^[A-Za-z0-9_-]{1,40}$/.test(String(body.orderRef || '')) ? String(body.orderRef) : '';
    const customer = cleanCustomer(body.customer);

    // PAS DE COMMANDE SANS E-MAIL. C'est l'adresse du reçu Stripe et de la
    // confirmation WooCommerce : sans elle le client paierait sans rien recevoir,
    // et la boutique ne pourrait pas le joindre. Refus AVANT toute création de
    // paiement — rien n'est débité.
    const receiptEmail = ((customer && isEmail(customer.email)) ? customer.email : (isEmail(email) ? email : '')).trim();
    if (!receiptEmail) {
      return res.status(400).json({ error: 'Indiquez une adresse e-mail valide : la confirmation de commande y est envoyée.' });
    }

    // Prix fixés par le serveur (le prix éventuellement envoyé par le client est ignoré).
    const { lines, subtotalCents } = await priceItems(body.items);
    // Panier démesuré → métadonnées Stripe tronquées → articles perdus dans la
    // commande Woo. On refuse AVANT de créer le PaymentIntent (rien n'est débité).
    if (lines.length > MAX_CART_LINES) {
      return res.status(400).json({ error: 'Panier trop volumineux, contactez-nous.' });
    }
    // Remise 10 % dès 250 € d'articles, puis frais de port (jamais offerts).
    const discCents = discountCents(subtotalCents);
    const shipCents = Math.round(shippingCost(method) * 100);
    const amount = subtotalCents - discCents + shipCents;
    if (amount <= 0) return res.status(400).json({ error: 'Montant total invalide' });

    const itemsMeta = lines.map(function (l) { return l.id + 'x' + l.qty; }).join(',');
    const key = idemKey('pi', {
      // r : la référence change à chaque nouvelle commande. Sans elle, deux achats
      // identiques du même client dans la journée partageaient la même clé : Stripe
      // renvoyait le premier paiement, déjà encaissé, et le second était impossible.
      a: amount, m: method, e: receiptEmail, c: customer || 0, r: orderRef,
      l: lines.map(function (l) { return [l.id, l.qty]; }),
    });

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

    // Client connecté : on transporte son identifiant WooCommerce jusqu'au
    // webhook, qui rattachera la commande à son compte. Sans ça, une commande
    // payée par carte entre dans WooCommerce comme commande INVITÉ et
    // n'apparaît jamais dans « Mes commandes ». La session vient du cookie
    // signé — le navigateur ne peut pas la fabriquer, donc pas de risque qu'un
    // visiteur s'attribue le compte d'un autre.
    const sess = readSession(req);
    const cid = sess && sess.cid ? String(sess.cid) : '';

    const intent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      receipt_email: receiptEmail,
      shipping: shipping,
      automatic_payment_methods: { enabled: true },
      metadata: Object.assign(
        { orderRef: orderRef, source: 'club151', shipping: String(shipCents), discount: String(discCents), method: method },
        cid ? { cid: cid } : {},
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
