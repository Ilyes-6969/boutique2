// leclub151 — Webhook Stripe (commande WooCommerce + notification propriétaire)
// ---------------------------------------------------------------------------
// Stripe appelle cette fonction à CHAQUE paiement réussi, même si le client
// ferme l'onglet avant de revenir sur le site. Deux rôles :
//   1. Créer la commande dans WooCommerce (set_paid:true → WooCommerce
//      décrémente lui-même le stock partagé magasin/site) — uniquement si les
//      trois clés WC_* sont configurées ET que le panier contient des articles
//      « wp… » (les articles de démo « d… » ne vont jamais dans WooCommerce).
//   2. Prévenir le propriétaire par e-mail (Web3Forms) de façon fiable.
// Le reçu CLIENT, lui, est envoyé automatiquement par Stripe (receipt_email).
//
// Variables d'environnement Vercel :
//   STRIPE_SECRET_KEY      = sk_live_...
//   STRIPE_WEBHOOK_SECRET  = whsec_...   (donné par Stripe quand tu crées le webhook)
//   WEB3FORMS_KEY          = (facultatif) ta clé Web3Forms, pour l'e-mail au propriétaire
//   OWNER_EMAIL            = (facultatif) ton e-mail, à titre indicatif dans le message
//   WC_STORE_URL           = https://ton-wordpress.tld  (HTTPS obligatoire)
//   WC_CONSUMER_KEY        = ck_...  (WooCommerce → Réglages → Avancé → API REST)
//   WC_CONSUMER_SECRET     = cs_...
// Sans les trois clés WC_* : comportement d'avant, notification seule.
//
// IDEMPOTENCE : après création, le n° de commande WooCommerce est écrit dans
// les métadonnées du PaymentIntent (wc_order_id). Une re-livraison du même
// événement ne recrée donc jamais de commande. En cas d'ÉCHEC de création, on
// répond 500 → Stripe re-livrera l'événement (nouvel essai automatique quand
// WordPress revient).
//
// SURVEILLANCE (pas d'infra dédiée) : si WooCommerce est injoignable, la
// commande payée n'est PAS enregistrée et ce webhook renvoie 500 → Stripe
// re-livrera l'événement pendant ~3 jours (vrai filet). Deux points de contrôle
// humains : (1) les logs Vercel, préfixe « [lc151][ALERTE] » ; (2) l'onglet des
// webhooks « en échec » du dashboard Stripe. La notification e-mail propriétaire
// reste best-effort (Web3Forms) : au-delà de la fenêtre de retry Stripe, une
// commande pourrait être perdue sans alerte. RECOMMANDATION (à ajouter plus
// tard) : un 2e canal d'alerte indépendant (SMS/Slack/webhook de secours)
// déclenché sur cet échec. Ne pas fabriquer de fausse infra ici.
//
// IMPORTANT : ce endpoint a besoin du corps BRUT de la requête pour vérifier la
// signature → on désactive le body parser de Vercel ci-dessous.
// ---------------------------------------------------------------------------

const Stripe = require('stripe');

const WC_TIMEOUT_MS = 8000;
const WC_LOOKUP_PAGES = 3;               // recherche anti-doublon : 3 × 100 = 300 commandes récentes balayées
const METHOD_LABELS = {
  standard: 'Livraison standard',
  relais: 'Point relais',
  pickup: 'Retrait en boutique (Vienne)',
};

function readRawBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    req.on('data', function (c) { chunks.push(c); });
    req.on('end', function () { resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

// Reconstitue la chaîne 'wpIDxQTY,...' répartie sur items, items2, items3…
// (voir splitItemsMeta dans create-payment-intent.js / create-checkout-session.js).
function joinItemsMeta(meta) {
  if (!meta) return '';
  let out = String(meta.items || '');
  for (let i = 2; i <= 25; i++) {
    const part = meta['items' + i];
    if (typeof part !== 'string' || !part) break;
    out += part;
  }
  return out;
}

// 'wp123x2,d4x1' → [{ id:'wp123', qty:2 }, { id:'d4', qty:1 }]. Jetons
// illisibles ignorés (jamais de crash sur une métadonnée inattendue).
function parseItemsMeta(meta) {
  const s = joinItemsMeta(meta);
  if (!s) return [];
  return s.split(',').map(function (tok) {
    const t = tok.trim();
    const ix = t.lastIndexOf('x');
    if (ix <= 0) return null;
    const id = t.slice(0, ix);
    const qty = parseInt(t.slice(ix + 1), 10);
    if (!id || !Number.isFinite(qty) || qty < 1) return null;
    return { id: id, qty: Math.min(999, qty) };
  }).filter(Boolean);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whsec) return res.status(500).send('Stripe non configuré');

  const stripe = Stripe(secret);
  let event;
  try {
    const raw = await readRawBody(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(raw, sig, whsec);
  } catch (err) {
    return res.status(400).send('Signature invalide : ' + String((err && err.message) || err));
  }

  // BRANCHE DORMANTE — mode redirection (page Stripe Checkout hébergée). Elle se
  // contente de PRÉVENIR le propriétaire : elle ne crée AUCUNE commande
  // WooCommerce et ne décrémente donc aucun stock. La création Woo est faite
  // UNIQUEMENT par 'payment_intent.succeeded' ci-dessous, qui se déclenche pour
  // les DEUX modes (intégré ET redirection, via le PaymentIntent sous-jacent qui
  // porte les mêmes métadonnées). ⚠️ Réactiver la redirection comme chemin
  // principal exigerait d'ajouter ICI l'appel à createWooOrder (avec la même
  // idempotence), sans quoi ces paiements ne seraient jamais enregistrés.
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    try {
      await notifyOwner(s);
    } catch (err) {
      // Ne bloque jamais l'accusé de réception Stripe, mais laisse une trace.
      console.error('stripe-webhook: notification (checkout.session) non envoyée:', String((err && err.message) || err));
    }
  }

  // Paiement INTÉGRÉ (Payment Element) : c'est CET événement qui se déclenche
  // (pas checkout.session.completed). Le total vient de Stripe — il ne peut
  // pas être falsifié par le navigateur, contrairement à l'e-mail envoyé par
  // le site. ⚠️ Pense à cocher « payment_intent.succeeded » dans la config du
  // webhook (Stripe → Développeurs → Webhooks), sinon rien n'arrive ici.
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;

    // 1) Commande WooCommerce (stock partagé). Toute erreur est capturée :
    //    la notification propriétaire part quoi qu'il arrive.
    let woo = { attempted: false, ok: false, duplicate: false, orderId: null, error: null };
    try {
      woo = await createWooOrder(stripe, pi);
    } catch (err) {
      const msg = String((err && err.message) || err);
      console.error('stripe-webhook: commande WooCommerce NON créée (' + pi.id + '):', msg);
      woo = { attempted: true, ok: false, duplicate: false, orderId: null, error: msg };
    }

    // Événement re-livré déjà traité (wc_order_id présent) → accusé immédiat,
    // sans recréer de commande ni renvoyer d'e-mail en double.
    if (woo.duplicate) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    // 2) Notification propriétaire (best-effort, ne bloque jamais l'accusé).
    try {
      await notifyOwnerIntent(pi, woo);
    } catch (err) {
      console.error('stripe-webhook: notification (payment_intent) non envoyée:', String((err && err.message) || err));
    }

    // 3) Échec de création alors que WooCommerce est configuré → 500 : Stripe
    //    re-livrera l'événement (l'idempotence ci-dessus protège du doublon).
    //    ALERTE : ce log est le SEUL filet automatique si la notification
    //    propriétaire (best-effort) a elle aussi échoué. Surveillance : logs
    //    Vercel (préfixe ci-dessous) + webhooks « en échec » du dashboard Stripe.
    if (woo.attempted && !woo.ok) {
      const montant = ((pi.amount_received || pi.amount || 0) / 100).toFixed(2);
      console.error('[lc151][ALERTE] commande payée SANS enregistrement Woo — PaymentIntent ' +
        pi.id + ' — ' + montant + ' EUR — ' + (pi.receipt_email || '(e-mail inconnu)') +
        ' — détail : ' + (woo.error || 'inconnu'));
      return res.status(500).json({ received: true, woocommerce: 'echec-nouvel-essai-demande' });
    }
  }

  return res.status(200).json({ received: true });
};

// Body brut requis pour vérifier la signature Stripe → on désactive le parser.
module.exports.config = { api: { bodyParser: false } };

// ---------------------------------------------------------------------------
// Création de la commande WooCommerce à partir du PaymentIntent payé.
// Renvoie { attempted, ok, duplicate, orderId, error } ; lève une erreur en
// cas d'échec réseau/HTTP (transformée en attempted:true par l'appelant).
// ---------------------------------------------------------------------------
async function createWooOrder(stripe, pi) {
  const none = { attempted: false, ok: false, duplicate: false, orderId: null, error: null };
  const base = (process.env.WC_STORE_URL || '').replace(/\/+$/, '');
  const ck = process.env.WC_CONSUMER_KEY || '';
  const cs = process.env.WC_CONSUMER_SECRET || '';
  if (!base || !ck || !cs) return none;              // démo/transition : notification seule

  const meta = pi.metadata || {};
  // Seuls les vrais produits WooCommerce (« wpID ») partent dans la commande.
  const wpItems = parseItemsMeta(meta).filter(function (it) { return /^wp\d+$/.test(it.id); });
  if (!wpItems.length) return none;                  // panier 100 % démo → rien à créer

  // IDEMPOTENCE : on relit le PaymentIntent chez Stripe — un événement
  // re-livré transporte les métadonnées d'ORIGINE, pas celles ajoutées après
  // la première création (wc_order_id). C'est le 1er garde-fou anti-doublon.
  let retrieveFailed = false;
  try {
    const fresh = await stripe.paymentIntents.retrieve(pi.id);
    if (fresh && fresh.metadata && fresh.metadata.wc_order_id) {
      return { attempted: false, ok: true, duplicate: true, orderId: fresh.metadata.wc_order_id, error: null };
    }
  } catch (err) {
    retrieveFailed = true;                           // 1er garde-fou HS (Stripe injoignable)
    console.error('stripe-webhook: relecture du PaymentIntent impossible:', String((err && err.message) || err));
    if (meta.wc_order_id) {
      return { attempted: false, ok: true, duplicate: true, orderId: meta.wc_order_id, error: null };
    }
    // Sinon : le garde-fou Stripe est indisponible. On s'appuie alors sur le
    // 2e garde-fou (findExistingWooOrder) ci-dessous — SAUF s'il est lui aussi
    // injoignable, auquel cas on ne PEUT PAS savoir (voir BUG #6 plus bas).
  }

  // Auth Basic en clair dans l'en-tête → HTTPS non négociable.
  if (!/^https:\/\//i.test(base)) {
    throw new Error('WC_STORE_URL doit être en HTTPS (auth Basic WooCommerce)');
  }

  // Filet anti-doublon (2e garde-fou) : si une tentative précédente a créé la
  // commande mais que la réponse s'est perdue (timeout), wc_order_id n'a jamais
  // été écrit — on balaie les commandes récentes à la recherche de notre
  // transaction_id avant d'en créer une nouvelle. `available` distingue
  // « vérifié, rien trouvé » de « recherche injoignable » (crucial pour BUG #6).
  const existing = await findExistingWooOrder(base, ck, cs, pi.id);
  if (existing.orderId) {
    try {
      await stripe.paymentIntents.update(pi.id, { metadata: { wc_order_id: String(existing.orderId) } });
    } catch (err) {
      console.error('stripe-webhook: wc_order_id non écrit sur ' + pi.id + ' (commande retrouvée n° ' + existing.orderId + '):', String((err && err.message) || err));
    }
    return { attempted: false, ok: true, duplicate: true, orderId: existing.orderId, error: null };
  }

  // BUG #6 — les DEUX garde-fous anti-doublon sont hors service (relecture
  // Stripe en échec ET recherche WooCommerce injoignable) : impossible de savoir
  // si cette commande a déjà été créée. Créer maintenant risquerait un DOUBLON
  // (stock décrémenté deux fois, e-mail sans mention de doublon). On préfère
  // DIFFÉRER : on lève une erreur → l'appelant renvoie 500 → Stripe re-livrera
  // l'événement plus tard, quand au moins un service sera revenu et que
  // l'idempotence refonctionnera. (Choix : ne jamais créer à l'aveugle.)
  if (retrieveFailed && !existing.available) {
    throw new Error('Vérification anti-doublon indisponible (Stripe + WooCommerce injoignables) — création différée, nouvel essai attendu');
  }

  const ship = pi.shipping || {};
  const addr = ship.address || {};
  const fullName = String(ship.name || '').trim();
  const spaceAt = fullName.indexOf(' ');
  const contact = {
    first_name: spaceAt > 0 ? fullName.slice(0, spaceAt) : fullName,
    last_name: spaceAt > 0 ? fullName.slice(spaceAt + 1) : '',
    phone: ship.phone || '',
    address_1: addr.line1 || '',
    postcode: addr.postal_code || '',
    city: addr.city || '',
    country: addr.country || 'FR',
  };
  const orderRef = meta.orderRef || pi.id;
  const shipCents = parseInt(meta.shipping, 10) || 0;

  const orderBody = {
    status: 'processing',
    set_paid: true,                                  // ← décrémente le stock WooCommerce
    transaction_id: pi.id,
    billing: Object.assign({ email: pi.receipt_email || '' }, contact),
    shipping: contact,
    line_items: wpItems.map(function (it) {
      return { product_id: Number(it.id.slice(2)), quantity: it.qty };
    }),
    shipping_lines: [{
      method_id: 'flat_rate',
      method_title: METHOD_LABELS[meta.method] || 'Livraison',
      total: (shipCents / 100).toFixed(2),
    }],
    customer_note: 'Commande site leclub151 — réf ' + orderRef,
    meta_data: [{ key: '_stripe_payment_intent', value: pi.id }],
  };

  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, WC_TIMEOUT_MS);
  let resp, text;
  try {
    resp = await fetch(base + '/wp-json/wc/v3/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(ck + ':' + cs).toString('base64'),
      },
      body: JSON.stringify(orderBody),
      signal: controller.signal,
    });
    text = await resp.text();
  } catch (err) {
    throw new Error('WooCommerce injoignable : ' + String((err && err.message) || err));
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    throw new Error('WooCommerce a refusé la commande (HTTP ' + resp.status + ') : ' + String(text || '').slice(0, 300));
  }
  let order = null;
  try { order = JSON.parse(text); } catch (e) { order = null; }
  if (!order || !order.id) {
    throw new Error('Réponse WooCommerce illisible : ' + String(text || '').slice(0, 200));
  }

  // Marque le PaymentIntent : une re-livraison de l'événement ne recréera rien.
  try {
    await stripe.paymentIntents.update(pi.id, { metadata: { wc_order_id: String(order.id) } });
  } catch (err) {
    // La commande EXISTE : on ne fait pas échouer le webhook pour la marque.
    console.error('stripe-webhook: wc_order_id non écrit sur ' + pi.id + ' (commande Woo n° ' + order.id + '):', String((err && err.message) || err));
  }
  return { attempted: true, ok: true, duplicate: false, orderId: order.id, error: null };
}

// Cherche une commande WooCommerce récente portant ce PaymentIntent en
// transaction_id (cas : commande créée mais réponse perdue → wc_order_id jamais
// écrit sur le PaymentIntent). L'API WC ne filtre pas sur transaction_id
// (?search est flou et peu fiable) → on balaie jusqu'à WC_LOOKUP_PAGES pages
// récentes et on compare le champ EXACT. Un doublon « réponse perdue » est
// toujours très récent, donc en première page ; les pages suivantes ne servent
// qu'à élargir un peu le filet. Renvoie { available, orderId } :
//   - available:false               → 1re page injoignable : on NE SAIT PAS
//   - available:true, orderId:null  → balayé, aucune commande correspondante
//   - available:true, orderId:<id>  → commande existante retrouvée
async function findExistingWooOrder(base, ck, cs, piId) {
  const auth = 'Basic ' + Buffer.from(ck + ':' + cs).toString('base64');
  let reachedAny = false;
  for (let page = 1; page <= WC_LOOKUP_PAGES; page++) {
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, WC_TIMEOUT_MS);
    let orders = null;
    try {
      const resp = await fetch(base + '/wp-json/wc/v3/orders?per_page=100&page=' + page + '&orderby=date&order=desc', {
        headers: { Authorization: auth },
        signal: controller.signal,
      });
      if (!resp.ok) break;                           // page refusée/injoignable → on s'arrête
      orders = await resp.json();
    } catch (err) {
      break;                                         // timeout/réseau → on s'arrête
    } finally {
      clearTimeout(timer);
    }
    if (!Array.isArray(orders)) break;
    reachedAny = true;                               // au moins une page balayée avec succès
    const hit = orders.find(function (o) { return o && o.transaction_id === piId; });
    if (hit) return { available: true, orderId: hit.id };
    if (orders.length < 100) break;                  // dernière page atteinte (rien au-delà)
  }
  return { available: reachedAny, orderId: null };
}

// ---------------------------------------------------------------------------
// E-mails propriétaire via Web3Forms (si la clé est configurée).
// ---------------------------------------------------------------------------

// Session Checkout (mode redirection, conservé en secours).
async function notifyOwner(session) {
  const key = process.env.WEB3FORMS_KEY;
  if (!key) return;
  const total = ((session.amount_total || 0) / 100).toFixed(2) + ' €';
  const email = (session.customer_details && session.customer_details.email) || session.customer_email || '—';
  const ref = (session.metadata && session.metadata.orderRef) || session.id;

  const payload = {
    access_key: key,
    subject: 'Nouvelle commande payée — leclub151',
    from_name: 'Boutique leclub151',
    Commande: ref,
    Client: email,
    Total: total,
    Paiement: 'Payé en ligne (Stripe)',
    Session: session.id,
  };

  const r = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Web3Forms HTTP ' + r.status);
}

// PaymentIntent (paiement intégré au site). Le « Total encaissé » est le
// montant RÉELLEMENT débité chez Stripe. L'e-mail contient désormais le nom,
// l'adresse de livraison complète et le sort de la commande WooCommerce.
async function notifyOwnerIntent(pi, woo) {
  const key = process.env.WEB3FORMS_KEY;
  if (!key) return;
  const total = ((pi.amount_received || pi.amount || 0) / 100).toFixed(2) + ' €';
  const meta = pi.metadata || {};
  const ship = pi.shipping || {};
  const addr = ship.address || {};
  const adresse = [
    addr.line1,
    ((addr.postal_code || '') + ' ' + (addr.city || '')).trim(),
    addr.country || 'FR',
  ].filter(Boolean).join(', ');
  const w = woo || {};

  let statutWoo;
  if (w.ok && w.orderId) {
    statutWoo = 'Commande WooCommerce n° ' + w.orderId + ' créée — stock décrémenté automatiquement.';
  } else if (w.attempted) {
    statutWoo = '⚠️ Commande NON enregistrée dans WooCommerce — stock à décrémenter manuellement. Détail : ' + (w.error || 'erreur inconnue');
  } else {
    statutWoo = 'WooCommerce non configuré — notification seule.';
  }

  const payload = {
    access_key: key,
    subject: 'Paiement reçu ' + (meta.orderRef || pi.id) + ' — leclub151',
    from_name: 'Boutique leclub151',
    Commande: meta.orderRef || '—',
    Client: ship.name || '—',
    'E-mail': pi.receipt_email || '—',
    'Téléphone': ship.phone || '—',
    'Adresse de livraison': adresse || '—',
    Livraison: METHOD_LABELS[meta.method] || meta.method || '—',
    Articles: joinItemsMeta(meta) || '—',
    'Total encaissé (Stripe)': total,
    WooCommerce: statutWoo,
    Paiement: 'Payé en ligne (Stripe, intégré au site)',
    Reference: pi.id,
  };

  const r = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Web3Forms HTTP ' + r.status);
}
