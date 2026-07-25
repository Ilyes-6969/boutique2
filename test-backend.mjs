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

  // L'auth Basic doit être présente — c'est aussi ce qu'on veut vérifier.
  if (!String(req.headers.authorization || '').startsWith('Basic ')) return send(401, { message: 'no auth' });

  if (p === '/customers' && req.method === 'GET') {
    const mail = (url.searchParams.get('email') || '').toLowerCase();
    return send(200, customers.filter((c) => c.email.toLowerCase() === mail));
  }
  if (p === '/customers' && req.method === 'POST') {
    const body = await readJson(req);
    const c = { id: nextCustomerId++, email: body.email, first_name: '', last_name: '',
      billing: {}, meta_data: body.meta_data || [] };
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
  if (p === '/orders' && req.method === 'POST') {
    const body = await readJson(req);
    const id = 2000 + orders.length;
    const o = Object.assign({ id: id, number: String(id), currency: 'EUR', total: '0.00',
      date_created_gmt: '2026-07-25T10:00:00' }, body);
    orders.push(o);
    return send(201, o);
  }
  if (p === '/orders' && req.method === 'GET') {
    const cust = url.searchParams.get('customer');
    const search = url.searchParams.get('search');
    let list = orders;
    if (cust) list = list.filter((o) => String(o.customer_id) === String(cust));
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
check('client : nonce lu', W.readNonce(found) === 'nonce-initial');
check('client : inconnu → null', (await W.findCustomerByEmail('personne@exemple.fr')) === null);

const created = await W.createCustomer('nouveau@exemple.fr', 'n1');
check('client : création', created && created.email === 'nouveau@exemple.fr');
check('client : nonce posé à la création', W.readNonce(created) === 'n1');

// Usage unique du lien : la rotation du nonce invalide le lien précédent.
await W.rotateNonce(42, 'nonce-2');
const afterRotate = await W.findCustomerByEmail('client@exemple.fr');
const oldMagic = S.verifyMagic(magicTok);
check('lien magique : usage unique (le nonce du 1er lien ne vaut plus)',
  oldMagic && oldMagic.n !== W.readNonce(afterRotate),
  'nonce courant = ' + W.readNonce(afterRotate));

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
// LE point critique : 'pending' est ce qui empêche un inconnu de vider le stock
// en boucle depuis un endpoint non authentifié.
check('retrait : statut « pending » → WooCommerce ne retire AUCUN stock',
  rawPk && rawPk.status === 'pending', rawPk && rawPk.status);
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
console.log('\n' + passed + ' réussis, ' + failed + ' échoués');
// process.exit() pendant la fermeture du serveur déclenche une assertion libuv
// sous Windows (UV_HANDLE_CLOSING) : un test vert se terminait sur ce qui
// ressemblait à un plantage. On pose le code de sortie et on laisse la boucle
// d'événements se vider d'elle-même.
if (typeof woo.closeAllConnections === 'function') woo.closeAllConnections();
woo.close();
process.exitCode = failed === 0 ? 0 : 1;
