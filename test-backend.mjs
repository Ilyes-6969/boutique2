// CLUB 151 — Tests du backend (sessions, clients, commandes, retraits)
// ---------------------------------------------------------------------------
// WordPress n'est pas encore installé : ces tests tournent contre un SIMULATEUR
// WooCommerce local qui reproduit les routes de l'API REST v3 réellement
// utilisées. Le jour où WC_STORE_URL pointera sur le vrai WordPress, le même
// code s'exécutera sans modification — c'est ce qui rend ce backend vérifiable
// dès aujourd'hui au lieu d'être écrit à l'aveugle.
//
// Usage :  node test-backend.mjs
// ---------------------------------------------------------------------------

import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Simulateur WooCommerce — données SYNTHÉTIQUES, en mémoire.
// ---------------------------------------------------------------------------
const NONCE_KEY = '_lc151_login_nonce';

// Secret attendu par le simulateur, FIGÉ ici. Le lire depuis process.env
// rendrait le test inutile : en changeant la variable pour simuler un mauvais
// secret, on changerait aussi ce que le simulateur attend, et les deux
// continueraient de correspondre.
const AUTH_SECRET = 'z'.repeat(64);

const customers = [
  { id: 42, email: 'client@exemple.fr', first_name: 'Marie', last_name: 'Durand',
    billing: { first_name: 'Marie', last_name: 'Durand', address_1: '3 rue des Lilas', postcode: '38200', city: 'Vienne', phone: '0400000000' },
    meta_data: [{ key: NONCE_KEY, value: 'nonce-initial' }] },
];
let nextCustomerId = 43;

const orders = [
  { id: 1001, number: '1001', status: 'processing', total: '64.90', currency: 'EUR',
    // Format WooCommerce authentique : PAS de suffixe de fuseau.
    date_created_gmt: '2026-07-20T09:15:00', date_created: '2026-07-20T11:15:00',
    customer_id: 42, billing: { email: 'client@exemple.fr' },
    line_items: [{ name: 'ETB — Pokémon 151', quantity: 1, total: '64.90' }],
    shipping_lines: [{ method_title: 'Livraison standard' }], meta_data: [] },
  { id: 1002, number: '1002', status: 'on-hold', total: '19.90', currency: 'EUR',
    date_created_gmt: '2026-07-22T16:40:00', date_created: '2026-07-22T18:40:00',
    customer_id: 42, billing: { email: 'client@exemple.fr' },
    line_items: [{ name: 'Tapis de jeu — Pokéball', quantity: 1, total: '19.90' }],
    shipping_lines: [{ method_title: 'Retrait en boutique (Vienne)' }],
    meta_data: [{ key: '_lc151_fulfilment', value: 'pickup' }] },
  { id: 1003, number: '1003', status: 'completed', total: '9.90', currency: 'EUR',
    date_created_gmt: '2026-07-23T08:00:00', date_created: '2026-07-23T10:00:00',
    customer_id: 0, billing: { email: 'AUTRE@Exemple.FR' },
    line_items: [{ name: 'Sleeves Ultra Pro', quantity: 1, total: '9.90' }],
    shipping_lines: [{ method_title: 'Point relais' }], meta_data: [] },
];

const orderNotes = [];

function readJson(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch (e) { resolve({}); } });
  });
}

const woo = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname.replace('/wp-json/wc/v3', '');
  const send = (code, body) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  // Pont d'authentification (wordpress/lc151-auth.php). Protégé par le secret
  // partagé et non par l'auth Basic — donc traité AVANT le contrôle ci-dessous.
  if (p === '/wp-json/lc151/v1/verify' && req.method === 'POST') {
    if (req.headers['x-lc151-secret'] !== AUTH_SECRET) return send(403, { message: 'bad secret' });
    const body = await readJson(req);
    const u = customers.find((c) => c.email.toLowerCase() === String(body.email || '').toLowerCase());
    if (!u || !u.password || u.password !== body.password) return send(401, { ok: false });
    return send(200, { ok: true, customer_id: u.id });
  }
  if (p === '/wp-json/lc151/v1/reset' && req.method === 'POST') {
    if (req.headers['x-lc151-secret'] !== AUTH_SECRET) return send(403, { message: 'bad secret' });
    return send(200, { ok: true });   // réponse identique, compte connu ou non
  }

  // Catalogue public (Store API) — lu sans authentification par lib/serverCatalog.
  if (url.pathname === '/wp-json/wc/store/v1/products') {
    return send(200, [{ id: 7, name: 'ETB de test', sku: '0000000000024', is_in_stock: true,
      prices: { price: '2999', regular_price: '2999', currency_minor_unit: 2 },
      categories: [{ name: 'Scellé — ETB' }], add_to_cart: { maximum: 3 } },
    { id: 8, name: 'Display de test', sku: '0000000000031', is_in_stock: true,
      prices: { price: '18000', regular_price: '18000', currency_minor_unit: 2 },
      categories: [{ name: 'Scellé — Displays' }], add_to_cart: { maximum: 2 } }]);
  }

  // L'auth Basic doit être présente — c'est aussi ce qu'on veut vérifier.
  if (!String(req.headers.authorization || '').startsWith('Basic ')) return send(401, { message: 'no auth' });

  if (p === '/customers' && req.method === 'GET') {
    const mail = (url.searchParams.get('email') || '').toLowerCase();
    return send(200, customers.filter((c) => c.email.toLowerCase() === mail));
  }
  if (p === '/customers' && req.method === 'POST') {
    const body = await readJson(req);
    // WooCommerce reçoit et hache le mot de passe. Le simulateur le conserve en
    // clair — c'est acceptable ici, ce sont des données synthétiques en mémoire.
    const c = { id: nextCustomerId++, email: body.email, first_name: '', last_name: '',
      password: body.password || '', billing: {}, meta_data: body.meta_data || [] };
    customers.push(c);
    return send(201, c);
  }
  const cMatch = p.match(/^\/customers\/(\d+)$/);
  if (cMatch) {
    const c = customers.find((x) => x.id === Number(cMatch[1]));
    if (!c) return send(404, { message: 'not found' });
    if (req.method === 'PUT') {
      const body = await readJson(req);
      if (body.meta_data) {
        body.meta_data.forEach((m) => {
          const ex = c.meta_data.find((x) => x.key === m.key);
          if (ex) ex.value = m.value; else c.meta_data.push({ key: m.key, value: m.value });
        });
      }
      if (body.billing) c.billing = Object.assign({}, c.billing, body.billing);
      return send(200, c);
    }
    return send(200, c);
  }
  // Réglage WooCommerce lu pour connaître l'adresse e-mail de la boutique.
  if (p === '/settings/email/woocommerce_email_from_address' && req.method === 'GET') {
    return send(200, { id: 'woocommerce_email_from_address', value: 'boutique@exemple.fr' });
  }
  if (p === '/orders' && req.method === 'POST') {
    const body = await readJson(req);
    const id = 2000 + orders.length;
    const o = Object.assign({ id: id, number: String(id), currency: 'EUR', total: '0.00',
      date_created_gmt: '2026-07-25T10:00:00' }, body);
    orders.push(o);
    return send(201, o);
  }
  // Note sur une commande ; customer_note:true = WooCommerce l'envoie par e-mail au client.
  const nMatch = p.match(/^\/orders\/(\d+)\/notes$/);
  if (nMatch && req.method === 'POST') {
    const body = await readJson(req);
    const n = { id: 9000 + orderNotes.length, order: Number(nMatch[1]), note: body.note, customer_note: body.customer_note === true };
    orderNotes.push(n);
    return send(201, n);
  }
  if (p === '/orders' && req.method === 'GET') {
    const cust = url.searchParams.get('customer');
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    let list = orders;
    if (cust) list = list.filter((o) => String(o.customer_id) === String(cust));
    if (status && status !== 'any') list = list.filter((o) => o.status === status);
    // Le vrai ?search de Woo est flou : on l'imite en LARGE, ce qui garantit que
    // le filtrage strict (numéro + e-mail) est bien fait côté lib, pas ici.
    if (search) list = list.filter((o) => JSON.stringify(o).includes(search));
    return send(200, list);
  }
  return send(404, { message: 'unknown route' });
});

await new Promise((r) => woo.listen(5199, r));

// ---------------------------------------------------------------------------
// Environnement : le backend croit parler à un vrai WooCommerce.
// ---------------------------------------------------------------------------
process.env.WC_STORE_URL = 'http://localhost:5199';
process.env.WC_CONSUMER_KEY = 'ck_test';
process.env.WC_CONSUMER_SECRET = 'cs_test';
process.env.SESSION_SECRET = 'x'.repeat(64);
process.env.WP_AUTH_SECRET = AUTH_SECRET;

const S = require('./lib/session.js');
const W = require('./lib/wooCustomers.js');

// ---------------------------------------------------------------------------
let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log('OK    ' + name); }
  else { failed++; console.log('ÉCHEC ' + name + (detail ? '  → ' + detail : '')); }
}

// ---- Sessions et jetons ----
const sessTok = S.signSession(42, 'client@exemple.fr');
const sessOut = S.verifySession(sessTok);
check('session : aller-retour signature', sessOut && sessOut.cid === 42 && sessOut.em === 'client@exemple.fr');

check('session : charge modifiée rejetée',
  S.verifySession(sessTok.slice(0, 5) + 'X' + sessTok.slice(6)) === null);

check('session : signature tronquée rejetée', S.verifySession(sessTok.split('.')[0]) === null);

// Séparation des usages : le point le plus important du modèle.
const magicTok = S.signMagic('client@exemple.fr', 'nonce-initial');
check('jetons : un lien magique NE PEUT PAS servir de session',
  S.verifySession(magicTok) === null);
check('jetons : un cookie de session NE PEUT PAS servir de lien magique',
  S.verifyMagic(sessTok) === null);
check('magic : aller-retour', (S.verifyMagic(magicTok) || {}).n === 'nonce-initial');

// Expiration — jeton forgé avec la même recette, mais déjà périmé.
function expiredToken(purpose) {
  const body = Buffer.from(JSON.stringify({ em: 'a@b.fr', exp: Date.now() - 1000 })).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const sig = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(purpose + '.' + body).digest()
    .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return body + '.' + sig;
}
check('session : jeton expiré rejeté', S.verifySession(expiredToken('session')) === null);

// Cookies
const fakeReq = { headers: { cookie: 'autre=1; ' + S.COOKIE_NAME + '=' + encodeURIComponent(sessTok) + '; x=2' } };
check('cookie : session relue parmi d\'autres cookies', (S.readSession(fakeReq) || {}).cid === 42);
check('cookie : absence de cookie → pas de session', S.readSession({ headers: {} }) === null);

// Attributs de sécurité du cookie
const captured = {};
S.setSessionCookie({ setHeader: (k, v) => { captured[k] = v; } }, sessTok);
const cookieHeader = captured['Set-Cookie'] || '';
check('cookie : HttpOnly (invisible au JavaScript, donc involable par XSS)', /HttpOnly/.test(cookieHeader));
check('cookie : SameSite=Lax (le retour depuis l\'e-mail fonctionne)', /SameSite=Lax/.test(cookieHeader));

// Secret absent → plus rien n'est accepté (aucun secret par défaut).
const realSecret = process.env.SESSION_SECRET;
process.env.SESSION_SECRET = '';
check('secret absent : sessionConfigured() est faux', S.sessionConfigured() === false);
check('secret absent : aucun jeton n\'est accepté', S.verifySession(sessTok) === null);
process.env.SESSION_SECRET = 'court';
check('secret trop court : refusé', S.sessionConfigured() === false);
process.env.SESSION_SECRET = realSecret;

// ---- Clients WooCommerce ----
const found = await W.findCustomerByEmail('CLIENT@Exemple.FR');   // casse différente à dessein
check('client : trouvé malgré la casse', found && found.id === 42);
check('client : inconnu → null', (await W.findCustomerByEmail('personne@exemple.fr')) === null);

const created = await W.createCustomer('nouveau@exemple.fr', 'motdepasse123');
check('inscription : compte créé', created && created.email === 'nouveau@exemple.fr');

// ---- Mot de passe (pont WordPress) ----
check('connexion : bon mot de passe → id client',
  (await W.verifyPassword('nouveau@exemple.fr', 'motdepasse123')) === created.id);
check('connexion : mauvais mot de passe refusé',
  (await W.verifyPassword('nouveau@exemple.fr', 'pasbon')) === null);
check('connexion : compte inconnu refusé (même réponse)',
  (await W.verifyPassword('personne@exemple.fr', 'motdepasse123')) === null);
check('connexion : casse de l\'e-mail sans importance',
  (await W.verifyPassword('NOUVEAU@Exemple.FR', 'motdepasse123')) === created.id);
check('mot de passe oublié : répond toujours ok (anti-énumération)',
  (await W.requestPasswordReset('personne@exemple.fr')) === true);

// Le secret partagé est ce qui empêche d'en faire un testeur de mots de passe.
const goodSecret = process.env.WP_AUTH_SECRET;
process.env.WP_AUTH_SECRET = 'y'.repeat(64);      // mauvais secret
let secretErr = null;
try { await W.verifyPassword('nouveau@exemple.fr', 'motdepasse123'); } catch (e) { secretErr = e.code; }
check('pont : mauvais secret partagé → refusé', secretErr === 'WC_DOWN', String(secretErr));
process.env.WP_AUTH_SECRET = '';
check('pont : secret absent → authConfigured() faux', W.authConfigured() === false);
process.env.WP_AUTH_SECRET = goodSecret;

await W.updateCustomerAddress(42, { firstName: 'Marie', lastName: 'Durand', addr: '8 quai Riondet', zip: '38200', city: 'Vienne', phone: '0411223344' });
const updated = await W.findCustomerByEmail('client@exemple.fr');
check('client : adresse mise à jour', updated.billing.address_1 === '8 quai Riondet');
check('client : pays forcé à FR', updated.billing.country === 'FR');

// ---- Commandes ----
const mine = await W.listOrders(42);
check('commandes : seules celles du client', mine.length === 2, 'reçues = ' + mine.length);
check('commandes : contrat de sortie respecté',
  mine[0].number && mine[0].statusLabel && Array.isArray(mine[0].items));

// La date GMT de Woo n'a pas de fuseau — sans le « Z », elle serait décalée.
const dated = mine.find((o) => o.number === '1001');
check('commandes : date normalisée en UTC', dated.date === '2026-07-20T09:15:00Z', dated.date);
check('commandes : date relue sans décalage',
  new Date(dated.date).toISOString() === '2026-07-20T09:15:00.000Z');

check('commandes : statut traduit', dated.statusLabel === 'En préparation', dated.statusLabel);

// Retrait : « on-hold » ne veut PAS dire la même chose selon le mode.
const pickup = mine.find((o) => o.number === '1002');
check('retrait : détecté via le méta', pickup.pickup === true);
check('retrait : « on-hold » devient « prête à retirer »',
  pickup.statusLabel === 'Prête — à retirer en boutique', pickup.statusLabel);
check('livraison : « on-hold » reste « En attente »',
  W.statusLabel('on-hold', false) === 'En attente');
check('retrait : « completed » = « Retirée », pas « Expédiée »',
  W.statusLabel('completed', true) === 'Retirée' && W.statusLabel('completed', false) === 'Expédiée');

check('commandes : aucune donnée interne Woo exposée',
  !('meta_data' in pickup) && !('customer_id' in pickup) && !('billing' in pickup));

// ---- Suivi invité ----
const tracked = await W.findOrderForTracking('1001', 'CLIENT@exemple.fr');
check('suivi invité : numéro + e-mail correspondants', tracked && tracked.number === '1001');
check('suivi invité : « # » toléré devant le numéro',
  (await W.findOrderForTracking('#1001', 'client@exemple.fr')) !== null);
check('suivi invité : bon numéro + MAUVAIS e-mail → refusé',
  (await W.findOrderForTracking('1001', 'pirate@exemple.fr')) === null);
check('suivi invité : l\'e-mail d\'un autre client ne donne pas cette commande',
  (await W.findOrderForTracking('1001', 'autre@exemple.fr')) === null);
check('suivi invité : casse de l\'e-mail enregistré sans importance',
  (await W.findOrderForTracking('1003', 'autre@exemple.fr')) !== null);
check('suivi invité : numéro inexistant → null',
  (await W.findOrderForTracking('9999', 'client@exemple.fr')) === null);

// ---- Retrait en boutique : création d'une VRAIE commande ----
const pk = await W.createPickupOrder({
  email: 'client@exemple.fr', name: 'Marie Durand', phone: '0411223344',
  lines: [{ id: 'wp77', qty: 2 }], customerId: 42,
});
check('retrait : commande créée', pk && !!pk.number, JSON.stringify(pk));
const rawPk = orders.find((o) => String(o.number) === String(pk && pk.number));
// Réglage lib/vitrine.json (retraitReserveLeStock = true depuis le 22/11/2026) :
// « En attente » réserve le stock et fait écrire WooCommerce à la boutique et au
// client. Les abus sont freinés en amont (origine de la requête, limites par IP
// et par adresse e-mail dans api/notify-order.js).
check('retrait : statut « on-hold » (réservé) quand le réglage le demande, « pending » sinon',
  rawPk && rawPk.status === (W.pickupReservesStock() ? 'on-hold' : 'pending'), rawPk && rawPk.status);
check('retrait : aucun paiement enregistré (réglé au comptoir)',
  rawPk && rawPk.set_paid === undefined);
check('retrait : marqué comme retrait via le méta',
  rawPk.meta_data.some((m) => m.key === '_lc151_fulfilment' && m.value === 'pickup'));
check('retrait : rattaché au compte du client connecté', rawPk.customer_id === 42);
check('retrait : identifiant « wp77 » converti en product_id 77',
  rawPk.line_items[0].product_id === 77 && rawPk.line_items[0].quantity === 2);
check('retrait : le client retrouve sa commande dans « Mes commandes »',
  (await W.listOrders(42)).some((o) => o.number === pk.number));

// Les produits de démonstration n'existent pas dans WooCommerce : mieux vaut ne
// rien créer que d'envoyer une commande que Woo rejettera en bloc.
check('retrait : panier de démonstration → aucune commande créée',
  (await W.createPickupOrder({ email: 'a@b.fr', name: 'X', lines: [{ id: 'd1', qty: 1 }] })) === null);
check('retrait : panier vide → aucune commande créée',
  (await W.createPickupOrder({ email: 'a@b.fr', name: 'X', lines: [] })) === null);

// ---- Panne WooCommerce ----
const goodUrl = process.env.WC_STORE_URL;
process.env.WC_STORE_URL = 'http://localhost:5198';         // personne n'écoute
let downCode = null;
try { await W.findCustomerByEmail('client@exemple.fr'); } catch (e) { downCode = e.code; }
check('panne : contrat d\'erreur WC_DOWN respecté', downCode === 'WC_DOWN', String(downCode));

// HTTPS imposé hors localhost (l'auth Basic voyage en clair).
process.env.WC_STORE_URL = 'http://boutique-exemple.fr';
let httpErr = '';
try { await W.findCustomerByEmail('client@exemple.fr'); } catch (e) { httpErr = String(e.message || ''); }
check('sécurité : HTTP refusé hors localhost', /HTTPS/.test(httpErr), httpErr);
process.env.WC_STORE_URL = goodUrl;

// Configuration absente → wooConfigured() faux, pas de plantage.
const savedKey = process.env.WC_CONSUMER_KEY;
process.env.WC_CONSUMER_KEY = '';
check('config absente : wooConfigured() est faux', W.wooConfigured() === false);
process.env.WC_CONSUMER_KEY = savedKey;

// ---------------------------------------------------------------------------
// E-mail obligatoire, origine des requêtes, confirmation au client.
const SecLib = require('./lib/serverCatalog.js');
check('e-mail : adresses valides acceptées', ['a@b.fr', 'jean.dupont+test@gmail.com', 'x@sous.domaine.co.uk'].every(SecLib.isEmail));
check('e-mail : saisies fausses refusées', ['', 'a@b', 'a b@c.fr', 'a@@b.fr', 'a@b..fr', '@b.fr', 'a@b.f', null, undefined, 12].every((v) => !SecLib.isEmail(v)));
const hdrReq = (h) => ({ headers: h });
check('origine : une page du site est acceptée', SecLib.sameSiteRequest(hdrReq({ host: 'club151.fr', origin: 'https://club151.fr' })));
check('origine : un autre site est refusé, même en *.vercel.app',
  !SecLib.sameSiteRequest(hdrReq({ host: 'club151.fr', origin: 'https://pirate.vercel.app' })) && !SecLib.originAllowed('https://pirate.vercel.app'));
check('origine : un aperçu appelle sa propre API', SecLib.sameSiteRequest(hdrReq({ host: 'boutique2-abc.vercel.app', origin: 'https://boutique2-abc.vercel.app' })));
check('origine : sans Origin ni Referer → refus (strict), toléré pour le paiement',
  !SecLib.sameSiteRequest(hdrReq({ host: 'club151.fr' })) && SecLib.sameSiteRequest(hdrReq({ host: 'club151.fr' }), false));
check('origine : Origin étranger refusé même en mode toléré', !SecLib.sameSiteRequest(hdrReq({ host: 'club151.fr', origin: 'https://pirate.fr' }), false));

const notifyHandler = require('./api/notify-order.js');
const stubRes = () => ({ code: 200, headers: {}, body: null,
  setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; },
  json(b) { this.body = b; return this; }, end() { return this; }, send(b) { this.body = b; return this; } });
const sendPickup = async (headers, body) => {
  const res = stubRes();
  await notifyHandler({ method: 'POST', headers: Object.assign({ host: 'club151.fr' }, headers), body: body }, res);
  return res;
};
const fromSite = (ip) => ({ origin: 'https://club151.fr', 'x-forwarded-for': ip });
const pickupPayload = (email) => ({ method: 'pickup', orderRef: 'LC151-TEST1', customer: { name: 'Marie Durand', email: email, phone: '' }, items: [{ id: 'wp7', qty: 2 }] });
const keptW3F = process.env.WEB3FORMS_KEY; delete process.env.WEB3FORMS_KEY;

// AUCUNE réservation sur le site (décision du 22/11/2026) : le serveur refuse,
// même si quelqu'un appelle directement l'adresse de l'ancien retrait sans paiement.
const vitRes = require('./lib/vitrine.json');
const ordersBeforeClosed = orders.length;
const rClosed = await sendPickup(fromSite('10.0.3.1'), pickupPayload('marie@exemple.fr'));
check('réservation : fermée par défaut — aucune commande sans paiement n\'est créée',
  vitRes.reservationSansPaiement === false && rClosed.code === 403 && /réservation/i.test(rClosed.body.error) && orders.length === ordersBeforeClosed, JSON.stringify([rClosed.code, rClosed.body]));
check('réservation : le réglage est lu côté serveur', W.reservationsOpen() === false);
// Les contrôles ci-dessous portent sur le mode « réservation ouverte », conservé
// dans le code au cas où la boutique le rouvrirait.
vitRes.reservationSansPaiement = true;

const r403 = await sendPickup({ 'x-forwarded-for': '10.0.0.1' }, pickupPayload('marie@exemple.fr'));
check('commande : refusée si elle ne vient pas du site', r403.code === 403, String(r403.code));
const rNoMail = await sendPickup(fromSite('10.0.0.2'), pickupPayload(''));
check('commande : refusée sans e-mail', rNoMail.code === 400 && /e-mail/i.test(rNoMail.body.error), JSON.stringify(rNoMail.body));
const rBadMail = await sendPickup(fromSite('10.0.0.3'), pickupPayload('marie@exemple'));
check('commande : refusée avec un e-mail invalide', rBadMail.code === 400);
const notesBefore = orderNotes.length;
const rOk = await sendPickup(fromSite('10.0.0.4'), pickupPayload('marie@exemple.fr'));
const pickupMade = orders[orders.length - 1];
check('commande : acceptée avec un e-mail valide, enregistrée dans WooCommerce',
  rOk.code === 200 && rOk.body.ok === true && rOk.body.orderNumber === pickupMade.number && pickupMade.billing.email === 'marie@exemple.fr',
  JSON.stringify(rOk.body));
check('commande : statut « En attente » (WooCommerce réserve le stock et écrit lui-même à la boutique et au client)', pickupMade.status === 'on-hold');
check('confirmation : annoncée au site, sans note en double (l\'e-mail « En attente » de WooCommerce suffit)',
  rOk.body.emailed === true && orderNotes.length === notesBefore);
// Le mode « sans réservation » reste disponible : la note au client y fait office d'e-mail.
await W.sendPickupConfirmation({ id: pickupMade.id, number: pickupMade.number }, 'LC151-TEST1');
const lastNote = orderNotes[orderNotes.length - 1] || {};
check('confirmation (mode sans réservation) : la note porte le numéro, la référence et l\'adresse du magasin',
  lastNote.customer_note === true && lastNote.order === pickupMade.id && String(lastNote.note).includes(pickupMade.number) && /LC151-TEST1/.test(lastNote.note) && /28 rue Juiverie/.test(lastNote.note), String(lastNote.note));
check('réponse : jamais mise en cache', rOk.headers['Cache-Control'] === 'no-store');
await sendPickup(fromSite('10.0.0.5'), pickupPayload('marie@exemple.fr'));
await sendPickup(fromSite('10.0.0.6'), pickupPayload('marie@exemple.fr'));
const rFlood = await sendPickup(fromSite('10.0.0.7'), pickupPayload('MARIE@exemple.fr'));
check('anti-abus : pas plus de 3 commandes par heure vers une même adresse', rFlood.code === 429, String(rFlood.code));

// Formulaires du site sans clé Web3Forms : relais par une commande « boîte de réception » WooCommerce.
const ordersBeforeForm = orders.length, notesBeforeForm = orderNotes.length;
const sendForm = async (ip, fields) => { const res = stubRes(); await notifyHandler({ method: 'POST', headers: Object.assign({ host: 'club151.fr' }, fromSite(ip)), body: { kind: 'form', subject: 'Contact', fields: fields } }, res); return res; };
const rForm = await sendForm('10.0.1.1', { Nom: 'Luc', Message: 'Avez-vous <b>ce</b> coffret ?' });
const inbox = orders[orders.length - 1];
const formNote = orderNotes[orderNotes.length - 1] || {};
check('formulaire : sans clé d\'envoi, le message part par WooCommerce vers l\'adresse de la boutique',
  rForm.code === 200 && rForm.body.ok === true && orders.length === ordersBeforeForm + 1 && inbox.billing.email === 'boutique@exemple.fr' && /LC151-BOITE/.test(inbox.billing.last_name)
  && formNote.customer_note === true && formNote.order === inbox.id && /Luc/.test(formNote.note), JSON.stringify([rForm.body, formNote]));
check('formulaire : le texte du visiteur est neutralisé (pas de balises dans l\'e-mail)', /&lt;b&gt;ce&lt;\/b&gt;/.test(formNote.note) && !/<b>/.test(formNote.note));
const rForm2 = await sendForm('10.0.1.2', { Email: 'luc@exemple.fr' });
check('formulaire : les messages suivants réutilisent la même boîte de réception', rForm2.body.ok === true && orders.length === ordersBeforeForm + 1 && orderNotes.length === notesBeforeForm + 2);

// Plus de livraison offerte ; remise de 10 % dès 250 € d'articles.
check('port : la livraison n\'est jamais offerte, quel que soit le montant',
  SecLib.shippingCost('standard', 500) === 4.9 && SecLib.shippingCost('standard', 99) === 4.9 && SecLib.shippingCost('pickup', 500) === 0);
check('remise : rien sous 250 €, 10 % à partir de 250 € (au centime)',
  SecLib.discountCents(24999) === 0 && SecLib.discountCents(25000) === 2500 && SecLib.discountCents(33333) === 3333 && SecLib.discountCents(0) === 0);
const rBig = await sendPickup(fromSite('10.0.0.8'), { method: 'pickup', orderRef: 'LC151-TEST2', customer: { name: 'Paul Martin', email: 'paul@exemple.fr', phone: '' }, items: [{ id: 'wp8', qty: 2 }] });
const bigOrder = orders[orders.length - 1];
const fee = (bigOrder.fee_lines || [])[0] || {};
check('remise : un retrait de 360 € porte une ligne de remise de 36 € dans WooCommerce',
  rBig.code === 200 && rBig.body.ok === true && fee.total === '-36.00' && /10 %/.test(fee.name || ''), JSON.stringify([rBig.code, bigOrder.fee_lines]));
check('remise : aucune ligne de remise sous 250 €', (pickupMade.fee_lines || []).length === 0);

// ---------------------------------------------------------------------------
// Anti-fraude (contrôle du 22/11/2026).
// 1) Le même article sur plusieurs lignes ne contourne plus le plafond de stock.
const dup = await SecLib.priceItems([{ id: 'wp7', qty: 1 }, { id: 'wp7', qty: 1 }, { id: 'wp7', qty: 5 }]);
check('fraude : un article répété sur 3 lignes est regroupé et plafonné au stock (3)',
  dup.lines.length === 1 && dup.lines[0].qty === 3 && dup.subtotalCents === 8997, JSON.stringify(dup));
let protoErr = '';
try { await SecLib.priceItems([{ id: '__proto__', qty: 1 }]); } catch (e) { protoErr = String(e.message); }
check('fraude : un identifiant piégé (__proto__) est un article inconnu', /inconnu/.test(protoErr), protoErr);
// 2) Un nom ne peut pas transporter l'adresse d'un site dans un e-mail de la boutique.
check('fraude : nom réduit aux caractères d\'un nom',
  SecLib.cleanName('Jean-Pierre  O’Neil d\'Été') === 'Jean-Pierre O’Neil d\'Été'
  && !/[.:/<>@]/.test(SecLib.cleanName('Gagnez un iPhone http://evil.example/x <b>www.spam.com</b> a@b.fr'))
  && SecLib.cleanName('   ') === '' && SecLib.cleanName(null) === '');
check('fraude : téléphone réduit aux caractères d\'un numéro', SecLib.cleanPhone('+33 6 12 34 56 78 voir http://x.y') === '+33 6 12 34 56 78');
const rSpamName = await sendPickup(fromSite('10.0.2.1'), { method: 'pickup', orderRef: 'LC151-TEST3', customer: { name: 'Cadeau http://evil.example/gagne', email: 'cible@exemple.fr', phone: 'tel http://x.y' }, items: [{ id: 'wp7', qty: 1 }] });
const spamOrder = orders[orders.length - 1];
check('fraude : la commande enregistrée ne contient aucun lien dans le nom ni le téléphone',
  rSpamName.code === 200 && !/[.:/]/.test(spamOrder.billing.first_name + spamOrder.billing.last_name) && spamOrder.billing.phone === '', JSON.stringify(spamOrder.billing));
const rNoName = await sendPickup(fromSite('10.0.2.2'), { method: 'pickup', customer: { name: '://..//', email: 'cible2@exemple.fr' }, items: [{ id: 'wp7', qty: 1 }] });
check('fraude : un nom sans aucune lettre est refusé', rNoName.code === 400, String(rNoName.code));
// 3) Réservations sans paiement : garde-fous lus dans WooCommerce.
const vit = require('./lib/vitrine.json');
const keptLimits = [vit.retraitMaxArticles, vit.retraitMaxParHeure];
vit.retraitMaxArticles = 4;
const rTooMany = await sendPickup(fromSite('10.0.2.3'), { method: 'pickup', customer: { name: 'Gros Panier', email: 'gros@exemple.fr' }, items: [{ id: 'wp7', qty: 3 }, { id: 'wp8', qty: 2 }] });
check('réservation : trop d\'articles sans paiement → refus, le client est renvoyé vers la boutique', rTooMany.code === 400 && /contactez la boutique/.test(rTooMany.body.error), JSON.stringify(rTooMany.body));
vit.retraitMaxArticles = keptLimits[0];
const heldOrder = (email, when) => ({ id: 5000 + orders.length, number: String(5000 + orders.length), status: 'on-hold', total: '29.99', currency: 'EUR',
  date_created_gmt: when, billing: { email: email }, line_items: [], shipping_lines: [], meta_data: [{ key: '_lc151_fulfilment', value: 'pickup' }] });
for (let i = 0; i < 3; i++) orders.push(heldOrder('Habitue@Exemple.fr', '2026-07-01T10:00:00'));
const ordersBeforeCap = orders.length;
const rCap = await sendPickup(fromSite('10.0.2.4'), pickupPayload('habitue@exemple.fr'));
check('réservation : pas plus de 3 commandes en attente de retrait pour une même adresse (compté dans WooCommerce)',
  rCap.code === 429 && /en attente de retrait/.test(rCap.body.error) && orders.length === ordersBeforeCap, JSON.stringify(rCap.body));
vit.retraitMaxParHeure = 2;
const nowGmt = new Date().toISOString().slice(0, 19);
orders.push(heldOrder('x1@exemple.fr', nowGmt), heldOrder('x2@exemple.fr', nowGmt));
const notesBeforeRush = orderNotes.length;
const rRush = await sendPickup(fromSite('10.0.2.5'), pickupPayload('nouveau@exemple.fr'));
const rushOrder = orders[orders.length - 1];
const rushNotes = orderNotes.slice(notesBeforeRush);
check('réservation : afflux anormal → la commande est enregistrée et confirmée, SANS retirer le stock',
  rRush.code === 200 && rRush.body.ok === true && rRush.body.emailed === true && rushOrder.status === 'pending' && rushOrder.billing.email === 'nouveau@exemple.fr', JSON.stringify([rRush.body, rushOrder.status]));
check('réservation : afflux anormal → la boutique est prévenue par un message',
  rushNotes.some((n) => n.order === rushOrder.id && n.customer_note === true) && rushNotes.some((n) => n.order !== rushOrder.id && /stock NON réservé/.test(n.note) && n.note.includes(rushOrder.number)), JSON.stringify(rushNotes.map((n) => n.note.slice(0, 60))));
vit.retraitMaxParHeure = keptLimits[1];
// 4) Clés Stripe de test sur le site public : paiement par carte fermé.
const keptEnv = [process.env.VERCEL_ENV, process.env.STRIPE_SECRET_KEY];
const pubHandler = require('./api/stripe-public.js');
const askPub = () => { const res = stubRes(); pubHandler({ method: 'GET', headers: { host: 'club151.fr' } }, res); return res.body; };
process.env.VERCEL_ENV = 'production'; process.env.STRIPE_SECRET_KEY = 'sk_test_exemple';
check('carte : clés de test en production → paiement fermé, le site n\'affiche pas de formulaire', SecLib.cardPaymentsClosed() === true && askPub().cardOpen === false);
process.env.STRIPE_SECRET_KEY = 'sk_live_exemple';
check('carte : clés réelles en production → paiement ouvert', SecLib.cardPaymentsClosed() === false && askPub().cardOpen === true);
process.env.VERCEL_ENV = 'preview'; process.env.STRIPE_SECRET_KEY = 'sk_test_exemple';
check('carte : un aperçu reste testable avec les clés de test', SecLib.cardPaymentsClosed() === false);
if (keptEnv[0] === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = keptEnv[0];
if (keptEnv[1] === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = keptEnv[1];
vitRes.reservationSansPaiement = false;
if (keptW3F) process.env.WEB3FORMS_KEY = keptW3F;

// ---------------------------------------------------------------------------
// Quantité disponible : lue dans add_to_cart.maximum (Store API, produit).
const SC = require('./lib/serverCatalog.js');
const wooProd = (max, extra) => Object.assign({ id: 9, name: 'Booster test', sku: '0000000000017',
  prices: { price: '599', regular_price: '599', currency_minor_unit: 2 }, is_in_stock: true,
  categories: [{ name: 'Scellé — Boosters & blisters' }], add_to_cart: { maximum: max } }, extra || {});
const m3 = SC.mapWooProduct(wooProd(3));
check('stock : 3 en stock → stock=3, plafond panier 3, pas pièce unique', m3.stock === 3 && m3.maxQty === 3 && m3.unique === false, JSON.stringify([m3.stock, m3.maxQty, m3.unique]));
const m1 = SC.mapWooProduct(wooProd(1));
check('stock : 1 en stock → pièce unique, plafond 1', m1.stock === 1 && m1.maxQty === 1 && m1.unique === true);
const mInf = SC.mapWooProduct(wooProd(9999));
check('stock : 9999 (pas de limite Woo) → quantité inconnue, rien d\'affiché', mInf.stock === null && mInf.maxQty === 999);
const mOut = SC.mapWooProduct(wooProd(2, { is_in_stock: false }));
check('stock : rupture → inStock faux et stock 0', mOut.inStock === false && mOut.stock === 0);

// ---------------------------------------------------------------------------
console.log('\n' + passed + ' réussis, ' + failed + ' échoués');
// process.exit() pendant la fermeture du serveur déclenche une assertion libuv
// sous Windows (UV_HANDLE_CLOSING) : un test vert se terminait sur ce qui
// ressemblait à un plantage. On pose le code de sortie et on laisse la boucle
// d'événements se vider d'elle-même.
if (typeof woo.closeAllConnections === 'function') woo.closeAllConnections();
woo.close();
process.exitCode = failed === 0 ? 0 : 1;
