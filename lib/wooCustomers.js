// CLUB 151 — Clients et commandes WooCommerce (source de vérité côté serveur)
// ---------------------------------------------------------------------------
// WooCommerce est LA source de vérité : stock, clients, commandes, retraits.
// Le site n'est qu'une façade. On ne duplique donc jamais un client ni une
// commande dans une base parallèle — sinon la boutique et le site divergent et
// plus personne ne sait qui a raison.
//
// Ce module complète lib/serverCatalog.js, qui ne parle qu'à la Store API
// PUBLIQUE des produits (lecture seule, sans clé). Ici on utilise l'API REST
// v3 AUTHENTIFIÉE (ck_/cs_) : côté serveur uniquement, jamais exposée au
// navigateur.
//
// CONTRAT D'ERREUR (identique à serverCatalog) : WooCommerce injoignable lève
// une erreur avec err.code = 'WC_DOWN' ; les handlers api/ la traduisent en
// HTTP 503 avec un message générique en français.
//
// Variables d'environnement Vercel :
//   WC_STORE_URL       = https://ton-wordpress.tld   (HTTPS obligatoire)
//   WC_CONSUMER_KEY    = ck_...   (WooCommerce → Réglages → Avancé → API REST)
//   WC_CONSUMER_SECRET = cs_...
// Sans ces trois valeurs, wooConfigured() renvoie false et les handlers
// répondent « service non configuré » au lieu de planter.
// ---------------------------------------------------------------------------

const NONCE_META_KEY = '_lc151_login_nonce';
const FULFILMENT_META_KEY = '_lc151_fulfilment';   // 'pickup' | 'shipping'
const WC_TIMEOUT_MS = 8000;
const MAX_ORDERS = 50;

function wooConfigured() {
  return !!(process.env.WC_STORE_URL && process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET);
}

function wcDown(detail) {
  const err = new Error('WooCommerce injoignable' + (detail ? ' : ' + detail : ''));
  err.code = 'WC_DOWN';
  return err;
}

// Appel authentifié à l'API REST WooCommerce v3.
// L'auth Basic transporte la clé EN CLAIR dans l'en-tête → HTTPS non
// négociable : on refuse net plutôt que d'envoyer les identifiants en clair.
async function wc(path, options) {
  const opts = options || {};
  const base = String(process.env.WC_STORE_URL || '').replace(/\/+$/, '');
  const ck = process.env.WC_CONSUMER_KEY || '';
  const cs = process.env.WC_CONSUMER_SECRET || '';
  if (!base || !ck || !cs) throw wcDown('configuration absente');
  // HTTPS obligatoire — SAUF localhost. L'auth Basic transporte la clé en clair :
  // sur le réseau c'est inacceptable, mais sur la boucle locale rien ne quitte la
  // machine. Cette exception est ce qui rend le backend testable avant que
  // WordPress n'existe (voir test-backend.mjs et son simulateur WooCommerce).
  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(base);
  if (!/^https:\/\//i.test(base) && !isLocal) {
    throw new Error('WC_STORE_URL doit être en HTTPS (auth Basic WooCommerce)');
  }

  const qs = opts.query
    ? '?' + Object.keys(opts.query)
      .filter(function (k) { return opts.query[k] != null && opts.query[k] !== ''; })
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(opts.query[k]); })
      .join('&')
    : '';

  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, WC_TIMEOUT_MS);
  let resp, text;
  try {
    resp = await fetch(base + '/wp-json/wc/v3' + path + qs, {
      method: opts.method || 'GET',
      headers: Object.assign(
        { Authorization: 'Basic ' + Buffer.from(ck + ':' + cs).toString('base64') },
        opts.body ? { 'Content-Type': 'application/json' } : {}
      ),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: ctrl.signal,
    });
    text = await resp.text();
  } catch (err) {
    throw wcDown(String((err && err.message) || err));   // réseau / timeout
  } finally {
    clearTimeout(timer);
  }

  // 404 sur une ressource unique = « n'existe pas », pas une panne : l'appelant
  // le distingue par ce marqueur plutôt qu'en analysant un message.
  if (resp.status === 404) {
    const e = new Error('Ressource WooCommerce introuvable');
    e.code = 'WC_NOT_FOUND';
    throw e;
  }
  if (!resp.ok) {
    // Le corps d'erreur Woo peut contenir des détails d'infrastructure : loggué
    // côté serveur, jamais renvoyé tel quel au navigateur.
    console.error('wooCustomers: HTTP ' + resp.status + ' sur ' + path + ' — ' + String(text || '').slice(0, 300));
    throw wcDown('HTTP ' + resp.status);
  }
  try { return JSON.parse(text); } catch (e) { throw wcDown('réponse illisible'); }
}

const normEmail = (v) => String(v || '').trim().toLowerCase();

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

// WooCommerce impose l'unicité de l'e-mail client : au plus un résultat.
async function findCustomerByEmail(email) {
  const mail = normEmail(email);
  if (!mail) return null;
  const list = await wc('/customers', { query: { email: mail, per_page: 1, role: 'all' } });
  if (!Array.isArray(list) || !list.length) return null;
  // Woo filtre déjà sur l'e-mail, mais on re-vérifie : une correspondance
  // approximative renverrait le compte d'UN AUTRE client, et le lien magique
  // partirait à la mauvaise personne.
  const hit = list.find(function (c) { return normEmail(c && c.email) === mail; });
  return hit || null;
}

async function createCustomer(email, nonce) {
  return wc('/customers', {
    method: 'POST',
    body: {
      email: normEmail(email),
      // Aucun nom demandé à l'inscription : le client le renseignera à sa
      // première commande. Un compte doit coûter un seul champ.
      meta_data: [{ key: NONCE_META_KEY, value: String(nonce) }],
    },
  });
}

function readNonce(customer) {
  const meta = (customer && customer.meta_data) || [];
  const hit = meta.find(function (m) { return m && m.key === NONCE_META_KEY; });
  return hit ? String(hit.value || '') : '';
}

// Écrit le nouveau nonce → tous les liens magiques précédents deviennent
// invalides (usage unique). Voir lib/session.js.
async function rotateNonce(customerId, nonce) {
  await wc('/customers/' + Number(customerId), {
    method: 'PUT',
    body: { meta_data: [{ key: NONCE_META_KEY, value: String(nonce) }] },
  });
  return nonce;
}

async function getCustomer(customerId) {
  return wc('/customers/' + Number(customerId));
}

// Adresse — champs bornés, jamais l'objet client brut : sinon le navigateur
// pourrait écrire `role`, `email` ou n'importe quel méta interne.
async function updateCustomerAddress(customerId, addr) {
  const a = addr || {};
  const billing = {
    first_name: a.firstName || '',
    last_name: a.lastName || '',
    address_1: a.addr || '',
    postcode: a.zip || '',
    city: a.city || '',
    country: 'FR',
    phone: a.phone || '',
  };
  const shipping = {
    first_name: billing.first_name,
    last_name: billing.last_name,
    address_1: billing.address_1,
    postcode: billing.postcode,
    city: billing.city,
    country: 'FR',
  };
  return wc('/customers/' + Number(customerId), {
    method: 'PUT',
    body: { billing: billing, shipping: shipping },
  });
}

// ---------------------------------------------------------------------------
// Commandes
// ---------------------------------------------------------------------------

// CORRESPONDANCE DES STATUTS — volontairement SANS extension WordPress : on
// n'utilise que les statuts natifs, ceux que le propriétaire a déjà sous forme
// de boutons dans l'admin WooCommerce. Le sens de 'on-hold' et 'completed'
// dépend du mode de traitement (retrait ou expédition), d'où le paramètre.
const STATUS_FR = {
  pending: 'En attente de paiement',
  processing: 'En préparation',
  'on-hold': 'En attente',
  completed: 'Terminée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
  failed: 'Paiement échoué',
  trash: 'Supprimée',
};
const STATUS_FR_PICKUP = {
  'on-hold': 'Prête — à retirer en boutique',
  completed: 'Retirée',
};
const STATUS_FR_SHIPPING = {
  completed: 'Expédiée',
};

function statusLabel(status, isPickup) {
  const s = String(status || '');
  const specific = isPickup ? STATUS_FR_PICKUP[s] : STATUS_FR_SHIPPING[s];
  return specific || STATUS_FR[s] || s;
}

function isPickupOrder(order) {
  const meta = (order && order.meta_data) || [];
  const flag = meta.find(function (m) { return m && m.key === FULFILMENT_META_KEY; });
  if (flag) return String(flag.value) === 'pickup';
  // Repli pour les commandes créées avant l'introduction de ce méta : on relit
  // le libellé du mode de livraison écrit par api/stripe-webhook.js.
  const lines = (order && order.shipping_lines) || [];
  return lines.some(function (l) { return /retrait/i.test(String((l && l.method_title) || '')); });
}

// Woo expose `date_created` SANS fuseau (« 2026-07-25T14:33:02 ») : l'utiliser
// tel quel le ferait interpréter dans le fuseau du navigateur, donc décalé. On
// prend la variante GMT et on la marque explicitement comme UTC.
function isoDate(order) {
  const gmt = order && order.date_created_gmt;
  if (gmt) return String(gmt).replace(/Z?$/, 'Z');
  return (order && order.date_created) || null;
}

// CONTRAT COMMANDE exposé au navigateur — jamais l'objet Woo brut, qui porte
// des données internes (notes privées, clés de paiement, IP du client).
function mapOrder(order) {
  const pickup = isPickupOrder(order);
  return {
    number: String(order.number || order.id),
    date: isoDate(order),
    status: String(order.status || ''),
    statusLabel: statusLabel(order.status, pickup),
    pickup: pickup,
    total: Number(order.total) || 0,
    currency: order.currency || 'EUR',
    method: ((order.shipping_lines || [])[0] || {}).method_title || (pickup ? 'Retrait en boutique' : 'Livraison'),
    items: (order.line_items || []).map(function (l) {
      return { name: l.name, qty: Number(l.quantity) || 0, total: Number(l.total) || 0 };
    }),
  };
}

// Crée la commande WooCommerce d'un RETRAIT EN BOUTIQUE.
//
// POURQUOI 'pending' ET SURTOUT PAS 'processing' : WooCommerce ne décrémente le
// stock qu'à partir de 'processing'/'completed' (ou au paiement). Une commande
// 'pending' n'en retire donc AUCUN. C'est ce qui permet enfin de créer de
// vraies commandes de retrait depuis un endpoint non authentifié — le refus
// historique (voir l'en-tête de api/notify-order.js) venait précisément du
// risque qu'un inconnu vide le stock en boucle. Le propriétaire fait passer la
// commande en « En préparation » quand il la prépare vraiment : c'est à CE
// moment que le stock bouge, et c'est lui qui décide.
//
// Aucun paiement n'est enregistré (set_paid absent) : le retrait se règle au
// comptoir. Renvoie la commande au CONTRAT COMMANDE (mapOrder).
async function createPickupOrder(input) {
  const o = input || {};
  const full = String(o.name || '').trim();
  const sp = full.indexOf(' ');
  const billing = {
    first_name: sp > 0 ? full.slice(0, sp) : full,
    last_name: sp > 0 ? full.slice(sp + 1) : '',
    email: normEmail(o.email),
    phone: String(o.phone || ''),
    country: 'FR',
  };
  const body = {
    status: 'pending',                       // ← ne touche PAS au stock (cf. ci-dessus)
    billing: billing,
    line_items: (o.lines || []).map(function (l) {
      return { product_id: Number(String(l.id).replace(/^wp/, '')), quantity: Number(l.qty) || 1 };
    }),
    shipping_lines: [{ method_id: 'local_pickup', method_title: 'Retrait en boutique (Vienne)', total: '0.00' }],
    customer_note: 'Commande site CLUB 151 — retrait en boutique, à régler sur place.',
    meta_data: [{ key: FULFILMENT_META_KEY, value: 'pickup' }],
  };
  // Rattache la commande au compte quand le client est connecté : elle apparaît
  // alors dans « Mes commandes » sans qu'il ait à saisir quoi que ce soit.
  if (o.customerId) body.customer_id = Number(o.customerId);

  // Les produits de démonstration (« d… ») n'existent pas dans WooCommerce :
  // les envoyer ferait rejeter toute la commande. On ne crée donc rien plutôt
  // que d'échouer bruyamment sur un panier de démonstration.
  if (!body.line_items.length || body.line_items.some(function (l) { return !Number.isFinite(l.product_id) || l.product_id <= 0; })) {
    return null;
  }

  const order = await wc('/orders', { method: 'POST', body: body });
  return order && order.id ? mapOrder(order) : null;
}

async function listOrders(customerId) {
  const list = await wc('/orders', {
    query: { customer: Number(customerId), per_page: MAX_ORDERS, orderby: 'date', order: 'desc' },
  });
  return Array.isArray(list) ? list.map(mapOrder) : [];
}

// Suivi INVITÉ : numéro de commande + e-mail. Les DEUX doivent correspondre —
// les numéros de commande se suivent, donc le numéro seul ne prouve rien et
// laisserait lire la commande du voisin en incrémentant. Comparaison d'e-mail
// normalisée (casse/espaces) : « Jean@X.FR » et « jean@x.fr » sont le même.
async function findOrderForTracking(numberOrId, email) {
  const mail = normEmail(email);
  const ref = String(numberOrId || '').trim().replace(/^#/, '');
  if (!mail || !ref) return null;
  const list = await wc('/orders', { query: { search: ref, per_page: 20 } });
  if (!Array.isArray(list)) return null;
  const hit = list.find(function (o) {
    const sameRef = String(o.number) === ref || String(o.id) === ref;
    const sameMail = normEmail(o.billing && o.billing.email) === mail;
    return sameRef && sameMail;
  });
  return hit ? mapOrder(hit) : null;
}

module.exports = {
  wooConfigured, wc,
  findCustomerByEmail, createCustomer, getCustomer, readNonce, rotateNonce, updateCustomerAddress,
  createPickupOrder, listOrders, findOrderForTracking, mapOrder, statusLabel, isPickupOrder,
  NONCE_META_KEY, FULFILMENT_META_KEY,
};
