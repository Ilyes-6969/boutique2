// CLUB 151 — Comptes client (connexion par lien magique, sans mot de passe)
// ---------------------------------------------------------------------------
// Une seule fonction pour tout le flux d'authentification, via route dynamique
// Vercel (/api/account/<action>). Le reste du dossier api/ est à plat, un
// fichier par endpoint ; ici les quatre actions partagent la même validation,
// le même contrat d'erreur et le même modèle de session — les séparer aurait
// éparpillé un flux unique sur quatre fichiers quasi identiques.
//
//   POST /api/account/register  { email, password } → crée le compte + session
//   POST /api/account/login     { email, password } → ouvre la session
//   POST /api/account/forgot    { email }           → e-mail de réinitialisation
//   GET  /api/account/me                            → client connecté + adresse
//   POST /api/account/address   { … }               → met à jour l'adresse
//   POST /api/account/logout                        → efface la session
//
// LE MOT DE PASSE N'EST JAMAIS STOCKÉ ICI. À l'inscription il part vers
// WooCommerce, qui le hache. À la connexion il part vers le pont
// wordpress/lc151-auth.php, qui répond seulement « oui » ou « non ». Aucun
// journal, aucune base intermédiaire de notre côté.
//
// Variables d'environnement : SESSION_SECRET, WP_AUTH_SECRET, WC_STORE_URL,
// WC_CONSUMER_KEY, WC_CONSUMER_SECRET.
// ---------------------------------------------------------------------------

const { applyCors, rateLimit } = require('../../lib/serverCatalog');
const S = require('../../lib/session');
const W = require('../../lib/wooCustomers');

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const LIMITS = { name: 120, addr: 300, zip: 12, city: 120, phone: 40 };

function cleanText(v, max) {
  // Caractères de contrôle neutralisés : ces champs partent dans WooCommerce et
  // dans des e-mails (anti-injection de lignes).
  return typeof v === 'string' ? v.replace(/[\x00-\x1f\x7f]+/g, ' ').trim().slice(0, max) : '';
}

function readBody(req) {
  if (typeof req.body === 'string') { try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; } }
  return req.body || {};
}

// Contrat d'erreur commun : WooCommerce injoignable → 503 générique, jamais le
// message brut (il peut porter des détails d'infrastructure).
function fail(res, err, where) {
  if (err && err.code === 'WC_DOWN') {
    console.error('account/' + where + ': WooCommerce injoignable:', String(err.message || err));
    return res.status(503).json({ ok: false, error: 'Service momentanément indisponible, réessayez dans un instant.' });
  }
  console.error('account/' + where + ':', String((err && err.message) || err));
  return res.status(500).json({ ok: false, error: 'Une erreur est survenue, réessayez dans un instant.' });
}

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const action = String((req.query && req.query.action) || '');

  // Prérequis communs. On distingue « pas configuré » d'« en panne » : sans ça,
  // une variable d'environnement oubliée ressemblerait à un bug et se
  // chercherait pendant des heures.
  if (!S.sessionConfigured()) {
    console.error('account: SESSION_SECRET absente ou trop courte — authentification désactivée');
    return res.status(503).json({ ok: false, error: 'Les comptes ne sont pas encore activés sur ce site.' });
  }

  // ---- Déconnexion : ne dépend ni de WooCommerce ni de l'e-mail ----
  if (action === 'logout') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    S.clearSessionCookie(res);
    return res.status(200).json({ ok: true });
  }

  if (!W.wooConfigured()) {
    console.error('account: WC_STORE_URL / clés WooCommerce absentes — comptes indisponibles');
    return res.status(503).json({ ok: false, error: 'Les comptes ne sont pas encore activés sur ce site.' });
  }

  // ---- 1) Inscription ----
  if (action === 'register') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    // Sans limite, ce endpoint sert à créer des comptes en masse dans ta
    // boutique WooCommerce.
    if (!rateLimit(req, 'account-register', 5, 15 * 60 * 1000)) {
      return res.status(429).json({ ok: false, error: 'Trop de tentatives — réessayez dans quelques minutes.' });
    }
    const body = readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!EMAIL_RE.test(email) || email.length > 160) {
      return res.status(400).json({ ok: false, error: 'Adresse e-mail invalide.' });
    }
    // 8 caractères minimum : plus court, un mot de passe se casse hors ligne en
    // quelques secondes. On refuse plutôt que d'offrir une fausse sécurité.
    if (password.length < 8 || password.length > 200) {
      return res.status(400).json({ ok: false, error: 'Le mot de passe doit faire au moins 8 caractères.' });
    }

    try {
      const existing = await W.findCustomerByEmail(email);
      if (existing) {
        // On le dit franchement. Masquer l'existence du compte protégerait un
        // peu la vie privée, mais laisserait le client bloqué sans comprendre
        // pourquoi son inscription échoue — sur une boutique, ce coût dépasse
        // le bénéfice.
        return res.status(409).json({ ok: false, error: 'Un compte existe déjà avec cette adresse — connectez-vous.' });
      }
      const customer = await W.createCustomer(email, password);
      if (!customer || !customer.id) throw new Error('création client sans identifiant');
      S.setSessionCookie(res, S.signSession(customer.id, email));
      return res.status(200).json({ ok: true });
    } catch (err) { return fail(res, err, 'register'); }
  }

  // ---- 2) Connexion ----
  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    // Limite SERRÉE : c'est la porte d'entrée des attaques par force brute.
    // 10 tentatives / 10 min / IP laissent de quoi se tromper deux fois, mais
    // rendent tout balayage automatisé inutile.
    if (!rateLimit(req, 'account-login', 10, 10 * 60 * 1000)) {
      return res.status(429).json({ ok: false, error: 'Trop de tentatives — réessayez dans quelques minutes.' });
    }
    if (!W.authConfigured()) {
      console.error('account/login: WP_AUTH_SECRET absente — pont d\'authentification WordPress non configuré');
      return res.status(503).json({ ok: false, error: 'La connexion n’est pas encore activée sur ce site.' });
    }
    const body = readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!EMAIL_RE.test(email) || !password) {
      return res.status(400).json({ ok: false, error: 'E-mail ou mot de passe invalide.' });
    }

    try {
      const customerId = await W.verifyPassword(email, password);
      if (!customerId) {
        // Message IDENTIQUE pour « compte inconnu » et « mot de passe faux » :
        // les distinguer révélerait qui est client de la boutique.
        return res.status(401).json({ ok: false, error: 'E-mail ou mot de passe incorrect.' });
      }
      S.setSessionCookie(res, S.signSession(customerId, email));
      return res.status(200).json({ ok: true });
    } catch (err) { return fail(res, err, 'login'); }
  }

  // ---- 3) Mot de passe oublié ----
  if (action === 'forgot') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    if (!rateLimit(req, 'account-forgot', 5, 15 * 60 * 1000)) {
      return res.status(429).json({ ok: false, error: 'Trop de demandes — réessayez dans quelques minutes.' });
    }
    if (!W.authConfigured()) {
      return res.status(503).json({ ok: false, error: 'La réinitialisation n’est pas encore activée sur ce site.' });
    }
    const email = String(readBody(req).email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Adresse e-mail invalide.' });

    try {
      await W.requestPasswordReset(email);
      // Réponse IDENTIQUE que l'adresse existe ou non : sinon ce formulaire
      // devient un moyen de savoir qui a un compte.
      return res.status(200).json({ ok: true });
    } catch (err) { return fail(res, err, 'forgot'); }
  }

  // ---- 3) Client connecté ----
  if (action === 'me') {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    const sess = S.readSession(req);
    if (!sess) return res.status(200).json({ ok: true, loggedIn: false });
    try {
      const c = await W.getCustomer(sess.cid);
      const b = (c && c.billing) || {};
      return res.status(200).json({
        ok: true,
        loggedIn: true,
        // Jamais l'objet client Woo brut : il porte le rôle, les métas internes
        // et des traces de connexion.
        customer: {
          email: c.email,
          firstName: b.first_name || c.first_name || '',
          lastName: b.last_name || c.last_name || '',
          addr: b.address_1 || '',
          zip: b.postcode || '',
          city: b.city || '',
          phone: b.phone || '',
        },
      });
    } catch (err) {
      // Client supprimé côté WordPress alors que le cookie survit : on nettoie
      // plutôt que de laisser une session fantôme rejouer indéfiniment.
      if (err && err.code === 'WC_NOT_FOUND') {
        S.clearSessionCookie(res);
        return res.status(200).json({ ok: true, loggedIn: false });
      }
      return fail(res, err, 'me');
    }
  }

  // ---- 4) Mise à jour de l'adresse ----
  if (action === 'address') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    const sess = S.readSession(req);
    if (!sess) return res.status(401).json({ ok: false, error: 'Connectez-vous pour modifier votre adresse.' });
    const body = readBody(req);
    const full = cleanText(body.name, LIMITS.name);
    const sp = full.indexOf(' ');
    const addr = {
      firstName: sp > 0 ? full.slice(0, sp) : full,
      lastName: sp > 0 ? full.slice(sp + 1) : '',
      addr: cleanText(body.addr, LIMITS.addr),
      zip: cleanText(body.zip, LIMITS.zip),
      city: cleanText(body.city, LIMITS.city),
      phone: cleanText(body.phone, LIMITS.phone),
    };
    if (addr.zip && !/^\d{4,5}$/.test(addr.zip)) {
      return res.status(400).json({ ok: false, error: 'Code postal invalide : 4 ou 5 chiffres.' });
    }
    try {
      await W.updateCustomerAddress(sess.cid, addr);
      return res.status(200).json({ ok: true });
    } catch (err) { return fail(res, err, 'address'); }
  }

  return res.status(404).json({ ok: false, error: 'Action inconnue' });
};
