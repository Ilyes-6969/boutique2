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

const FULFILMENT_META_KEY = '_lc151_fulfilment';   // 'pickup' | 'shipping'
const WC_TIMEOUT_MS = 8000;
const MAX_ORDERS = 50;

// Pont d'authentification (wordpress/lc151-auth.php). WooCommerce sait CRÉER un
// client avec un mot de passe mais pas le VÉRIFIER : ce pont comble ce manque.
// Le secret partagé est ce qui empêche d'en faire un testeur de mots de passe.
function authConfigured() {
  return !!(process.env.WP_AUTH_SECRET && String(process.env.WP_AUTH_SECRET).length >= 32);
}

async function wpAuth(path, body) {
  const base = String(process.env.WC_STORE_URL || '').replace(/\/+$/, '');
  if (!base || !authConfigured()) throw wcDown('pont d\'authentification non configuré');
  // MÊME GARDE que wc() : le secret partagé ET le mot de passe du client
  // voyagent dans cette requête. En HTTP, n'importe qui sur le réseau les lit.
  // Cette garde manquait ici alors qu'elle existait pour l'API WooCommerce —
  // un appel a donc pu partir en clair avant cette correction.
  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(base);
  if (!/^https:\/\//i.test(base) && !isLocal) {
    throw new Error('WC_STORE_URL doit être en HTTPS (le mot de passe et le secret y transitent)');
  }

  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, WC_TIMEOUT_MS);
  try {
    const r = await fetch(base + '/wp-json/lc151/v1' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lc151-secret': String(process.env.WP_AUTH_SECRET),
      },
      body: JSON.stringify(body || {}),
      signal: ctrl.signal,
    });
    // 401 = identifiants refusés. Ce n'est PAS une panne, c'est une réponse.
    if (r.status === 401) return { ok: false, status: 401 };
    if (r.status === 403 || r.status === 404) {
      // 403 : secret absent ou différent côté WordPress. 404 : fichier non déposé.
      console.error('wooCustomers: pont d\'authentification injoignable (HTTP ' + r.status +
        ') — vérifier wp-content/mu-plugins/lc151-auth.php et LC151_AUTH_SECRET');
      throw wcDown('pont d\'authentification HTTP ' + r.status);
    }
    if (!r.ok) throw wcDown('pont d\'authentification HTTP ' + r.status);
    const j = await r.json().catch(function () { return null; });
    return j || { ok: false, status: r.status };
  } catch (err) {
    if (err && err.code === 'WC_DOWN') throw err;
    throw wcDown(String((err && err.message) || err));
  } finally {
    clearTimeout(timer);
  }
}

// Vérifie un couple e-mail / mot de passe. Renvoie l'id client, ou null si les
// identifiants sont refusés. Le mot de passe ne fait que transiter : il n'est
// ni stocké ni journalisé de ce côté.
async function verifyPassword(email, password) {
  const res = await wpAuth('/verify', { email: normEmail(email), password: String(password || '') });
  return (res && res.ok === true && res.customer_id) ? Number(res.customer_id) : null;
}

// Demande à WordPress d'envoyer son e-mail « mot de passe oublié ».
// Ne révèle jamais si l'adresse existe (anti-énumération) — le pont non plus.
async function requestPasswordReset(email) {
  await wpAuth('/reset', { email: normEmail(email) });
  return true;
}

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

// Inscription. C'est WooCommerce qui reçoit le mot de passe et le hache : nous
// ne le stockons jamais, et il ne repasse plus jamais par ici ensuite.
// Aucun nom n'est demandé — le client le renseignera à sa première commande.
// Un compte doit coûter deux champs, pas huit.
async function createCustomer(email, password, fullName) {
  // Nom saisi à l'inscription : sans lui, la fiche client WooCommerce ne portait
  // qu'une adresse e-mail (prénom et nom vides jusqu'à la première commande).
  const full = String(fullName || '').replace(/[\x00-\x1f\x7f<>]+/g, ' ').trim().slice(0, 80);
  const sp = full.indexOf(' ');
  const first = sp > 0 ? full.slice(0, sp) : full;
  const last = sp > 0 ? full.slice(sp + 1).trim() : '';
  const body = {
    email: normEmail(email),
    username: normEmail(email),
    password: String(password || ''),
  };
  if (first) {
    body.first_name = first;
    body.last_name = last;
    body.billing = { first_name: first, last_name: last, country: 'FR' };
  }
  return wc('/customers', { method: 'POST', body: body });
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
  // Réglage lib/vitrine.json → retraitReserveLeStock. Par défaut 'pending' (aucun
  // stock retiré). À true : 'on-hold', WooCommerce retire l'article du stock et
  // envoie lui-même son e-mail « commande bien reçue » au client.
  const reserve = pickupReservesStock();
  const body = {
    status: reserve ? 'on-hold' : 'pending',
    billing: billing,
    line_items: (o.lines || []).map(function (l) {
      return { product_id: Number(String(l.id).replace(/^wp/, '')), quantity: Number(l.qty) || 1 };
    }),
    shipping_lines: [{ method_id: 'local_pickup', method_title: 'Retrait en boutique (Vienne)', total: '0.00' }],
    // Remise 10 % dès 250 € d'articles (montant calculé par api/notify-order.js) :
    // ligne de frais négative, pour que le total à régler en boutique soit le bon.
    fee_lines: Number(o.discountCents) > 0
      ? [{ name: String(o.discountLabel || 'Remise'), total: (-Number(o.discountCents) / 100).toFixed(2), tax_status: 'none' }]
      : [],
    // La référence « LC151-… » est celle que le client voit à l'écran et présente
    // au comptoir : elle doit figurer sur la commande pour qu'on la retrouve.
    customer_note: 'Commande site CLUB 151' + (o.ref ? ' (réf. client ' + o.ref + ')' : '') + ' — retrait en boutique, à régler sur place.',
    meta_data: [{ key: FULFILMENT_META_KEY, value: 'pickup' }].concat(o.ref ? [{ key: '_lc151_ref', value: String(o.ref) }] : []),
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
  // id : usage interne (note au client ci-dessous), jamais renvoyé au navigateur.
  return order && order.id ? Object.assign(mapOrder(order), { id: order.id, reserved: reserve }) : null;
}

// BOÎTE DE RÉCEPTION DU SITE (formulaire de contact, inscriptions aux arrivages).
// Quand aucune clé d'envoi n'est configurée côté site (WEB3FORMS_KEY absente),
// les messages des visiteurs ne partaient nulle part. On passe alors par
// WooCommerce : une commande technique à 0 €, au nom « MESSAGES DU SITE », dont
// l'adresse e-mail est celle de la boutique ; chaque message y est ajouté comme
// « note au client », que WooCommerce envoie par e-mail — donc à la boutique.
// Les messages restent aussi archivés dans cette commande. Si elle est mise à
// la corbeille, elle est recréée au message suivant.
const INBOX_TAG = 'LC151-BOITE';
let _inbox = { id: 0, at: 0 };
function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });
}
async function shopInboxOrderId() {
  if (_inbox.id && (Date.now() - _inbox.at) < 10 * 60 * 1000) return _inbox.id;
  const found = await wc('/orders', { query: { search: INBOX_TAG, per_page: 5, status: 'any' } });
  let order = (Array.isArray(found) ? found : []).filter(function (o) {
    return o && o.id && o.billing && String(o.billing.last_name || '').indexOf(INBOX_TAG) === 0;
  })[0];
  if (!order) {
    const setting = await wc('/settings/email/woocommerce_email_from_address');
    const mail = normEmail(setting && setting.value);
    if (!mail || mail.indexOf('@') < 1) return 0;
    order = await wc('/orders', { method: 'POST', body: {
      status: 'pending',
      billing: { first_name: 'MESSAGES DU SITE', last_name: INBOX_TAG + ' (ne pas supprimer)', email: mail, country: 'FR' },
      customer_note: 'Commande technique à 0 € : elle reçoit les messages du formulaire de contact et les inscriptions aux arrivages du site. Ne pas la supprimer ni la facturer.',
    } });
  }
  if (!order || !order.id) return 0;
  _inbox = { id: order.id, at: Date.now() };
  return order.id;
}
// Envoie un message à la boutique. `fields` = { libellé: valeur }. Renvoie true
// si WooCommerce a accepté la note (donc mis l'e-mail en file).
async function sendShopMessage(subject, fields) {
  const id = await shopInboxOrderId();
  if (!id) return false;
  const f = fields || {};
  const body = Object.keys(f).map(function (k) { return escHtml(k) + ' : ' + escHtml(f[k]); }).join('\n');
  const res = await wc('/orders/' + Number(id) + '/notes', {
    method: 'POST', body: { note: escHtml(subject) + '\n\n' + body, customer_note: true },
  });
  return !!(res && res.id);
}

function pickupReservesStock() {
  try { return require('./vitrine.json').retraitReserveLeStock === true; } catch (e) { return false; }
}

// E-mail de confirmation au CLIENT d'un retrait en boutique.
// WooCommerce n'écrit pas au client pour une commande « en attente de paiement ».
// On lui ajoute donc une « note au client » : c'est WooCommerce qui envoie alors
// l'e-mail (modèle « Note client »), avec ce texte suivi du détail de la commande.
// Aucun service d'envoi supplémentaire : le courrier part du WordPress de la boutique.
// Renvoie true si WooCommerce a accepté la note (donc mis l'e-mail en file).
const SHOP_PICKUP_ADDRESS = 'CLUB 151, 28 rue Juiverie, 38200 Vienne';
async function sendPickupConfirmation(order, ref) {
  if (!order || !order.id) return false;
  const note = 'Merci pour votre commande. Elle est bien enregistrée sous le n° ' + order.number +
    (ref ? ' (référence ' + ref + ')' : '') +
    '. Elle est à retirer et à régler au magasin : ' + SHOP_PICKUP_ADDRESS +
    '. Présentez ce numéro au comptoir.';
  const res = await wc('/orders/' + Number(order.id) + '/notes', {
    method: 'POST', body: { note: note, customer_note: true },
  });
  return !!(res && res.id);
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
  wooConfigured, wc, authConfigured, verifyPassword, requestPasswordReset,
  findCustomerByEmail, createCustomer, getCustomer, updateCustomerAddress,
  createPickupOrder, sendPickupConfirmation, pickupReservesStock, sendShopMessage, listOrders, findOrderForTracking, mapOrder, statusLabel, isPickupOrder,
  FULFILMENT_META_KEY,
};
