// leclub151 — Webhook Stripe (notification fiable du propriétaire)
// ---------------------------------------------------------------------------
// Stripe appelle cette fonction à CHAQUE paiement réussi, même si le client
// ferme l'onglet avant de revenir sur le site. Elle prévient le propriétaire
// par e-mail (Web3Forms) de façon fiable. Le reçu CLIENT, lui, est envoyé
// automatiquement par Stripe (receipt_email).
//
// Variables d'environnement Vercel :
//   STRIPE_SECRET_KEY      = sk_live_...
//   STRIPE_WEBHOOK_SECRET  = whsec_...   (donné par Stripe quand tu crées le webhook)
//   WEB3FORMS_KEY          = (facultatif) ta clé Web3Forms, pour l'e-mail au propriétaire
//   OWNER_EMAIL            = (facultatif) ton e-mail, à titre indicatif dans le message
//
// IMPORTANT : ce endpoint a besoin du corps BRUT de la requête pour vérifier la
// signature → on désactive le body parser de Vercel ci-dessous.
// ---------------------------------------------------------------------------

const Stripe = require('stripe');

function readRawBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    req.on('data', function (c) { chunks.push(c); });
    req.on('end', function () { resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
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

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    try {
      await notifyOwner(s);
    } catch (e) { /* ne bloque jamais l'accusé de réception Stripe */ }
  }

  // Paiement INTÉGRÉ (Payment Element) : c'est CET événement qui se déclenche
  // (pas checkout.session.completed). Le total vient de Stripe — il ne peut
  // pas être falsifié par le navigateur, contrairement à l'e-mail envoyé par
  // le site. ⚠️ Pense à cocher « payment_intent.succeeded » dans la config du
  // webhook (Stripe → Développeurs → Webhooks), sinon rien n'arrive ici.
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    try {
      await notifyOwnerIntent(pi);
    } catch (e) { /* ne bloque jamais l'accusé de réception Stripe */ }
  }

  return res.status(200).json({ received: true });
};

// Body brut requis pour vérifier la signature Stripe → on désactive le parser.
module.exports.config = { api: { bodyParser: false } };

// Envoie un e-mail au propriétaire via Web3Forms (si la clé est configurée).
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

  await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
}

// Idem pour un PaymentIntent (paiement intégré au site). Le « Total encaissé »
// est le montant RÉELLEMENT débité chez Stripe — à comparer avec l'e-mail de
// commande envoyé par le site en cas de doute.
async function notifyOwnerIntent(pi) {
  const key = process.env.WEB3FORMS_KEY;
  if (!key) return;
  const total = ((pi.amount_received || pi.amount || 0) / 100).toFixed(2) + ' €';
  const meta = pi.metadata || {};

  const payload = {
    access_key: key,
    subject: 'Paiement reçu ' + (meta.orderRef || pi.id) + ' — leclub151',
    from_name: 'Boutique leclub151',
    Commande: meta.orderRef || '—',
    Client: pi.receipt_email || '—',
    'Total encaissé (Stripe)': total,
    Articles: meta.items || '—',
    Paiement: 'Payé en ligne (Stripe, intégré au site)',
    Reference: pi.id,
  };

  await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
}
