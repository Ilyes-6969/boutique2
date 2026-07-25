// CLUB 151 — Jetons signés et sessions client (connexion sans mot de passe)
// ---------------------------------------------------------------------------
// POURQUOI SANS MOT DE PASSE : un mot de passe, c'est un secret de plus à
// hacher, à stocker, à faire fuiter, plus un formulaire « mot de passe oublié »
// à sécuriser — le vecteur de prise de compte le plus courant. Pour une
// boutique de cartes, le lien magique par e-mail apporte la même preuve
// d'identité (« je contrôle cette boîte mail ») sans rien de tout ça.
//
// DEUX TYPES DE JETONS, jamais interchangeables — le « purpose » entre dans la
// signature elle-même :
//   'magic'   → lien envoyé par e-mail, courte durée, à usage unique
//   'session' → cookie HttpOnly posé après vérification du lien
// Sans cette séparation, un lien magique intercepté pourrait être présenté tel
// quel comme cookie de session (et réciproquement).
//
// USAGE UNIQUE DU LIEN : un jeton signé, seul, reste rejouable jusqu'à son
// expiration. On y embarque donc un `n` (nonce) que l'appelant compare au nonce
// courant du client stocké côté WooCommerce ; la connexion fait tourner ce
// nonce, ce qui invalide instantanément tous les liens précédents.
// Voir lib/wooCustomers.js (rotateNonce).
//
// Variable d'environnement Vercel :
//   SESSION_SECRET = chaîne aléatoire longue (32 caractères minimum)
//     à générer avec :
//       node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
//     Sans elle, AUCUN jeton n'est émis ni accepté (échec franc). Pas de valeur
//     par défaut : un secret en dur laisserait n'importe qui forger une session
//     au nom de n'importe quel client.
// ---------------------------------------------------------------------------

const crypto = require('crypto');

const COOKIE_NAME = 'lc151_session';
const SESSION_TTL_MS = 30 * 24 * 3600 * 1000;   // 30 jours (rien de sensible en session)
const MAGIC_TTL_MS = 20 * 60 * 1000;            // 20 min : le temps d'ouvrir sa boîte mail

// Le secret est-il configuré ? Permet aux handlers de répondre 503 proprement
// plutôt que de laisser remonter une trace technique au client.
function sessionConfigured() {
  return (process.env.SESSION_SECRET || '').length >= 32;
}

function secret() {
  const s = process.env.SESSION_SECRET || '';
  // 32 caractères minimum : en dessous, la clé HMAC devient attaquable par
  // force brute hors ligne et tout le modèle de sécurité s'effondre.
  if (s.length < 32) {
    const err = new Error('SESSION_SECRET manquante ou trop courte (32 caractères minimum)');
    err.code = 'NO_SECRET';
    throw err;
  }
  return s;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(str) {
  const s = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
  const pad = (s.length % 4 === 0) ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s + pad, 'base64');
}

// charge + expiration → "<payload b64url>.<signature b64url>"
function sign(purpose, payload, ttlMs) {
  const body = Object.assign({}, payload, { exp: Date.now() + ttlMs });
  const data = b64url(JSON.stringify(body));
  const sig = crypto.createHmac('sha256', secret()).update(purpose + '.' + data).digest();
  return data + '.' + b64url(sig);
}

// Renvoie la charge, ou null si le jeton est illisible, mal signé, forgé pour
// un autre usage, ou expiré. JAMAIS d'exception vers l'appelant : un jeton
// invalide est un cas NORMAL (lien périmé, cookie ancien), pas une panne.
function verify(purpose, token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  let expected;
  try {
    expected = crypto.createHmac('sha256', secret()).update(purpose + '.' + parts[0]).digest();
  } catch (e) {
    return null;                                   // secret absent → rien n'est valide
  }
  const given = unb64url(parts[1]);
  // Longueurs comparées AVANT timingSafeEqual, qui lève si elles diffèrent.
  if (given.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(given, expected)) return null;

  let body;
  try { body = JSON.parse(unb64url(parts[0]).toString('utf8')); } catch (e) { return null; }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (!Number.isFinite(body.exp) || body.exp < Date.now()) return null;
  return body;
}

// ---- Lien magique (e-mail) ----
// `nonce` : valeur courante côté WooCommerce au moment de l'envoi. La connexion
// la fait tourner → le lien ne sert qu'une fois.
function signMagic(email, nonce) {
  return sign('magic', { em: String(email || '').toLowerCase(), n: String(nonce || '') }, MAGIC_TTL_MS);
}
function verifyMagic(token) { return verify('magic', token); }

// ---- Session (cookie) ----
function signSession(customerId, email) {
  return sign('session', { cid: Number(customerId) || 0, em: String(email || '').toLowerCase() }, SESSION_TTL_MS);
}
function verifySession(token) { return verify('session', token); }

// ---- Cookies ----
function parseCookies(req) {
  const raw = (req && req.headers && req.headers.cookie) || '';
  const out = {};
  String(raw).split(';').forEach(function (part) {
    const i = part.indexOf('=');
    if (i <= 0) return;
    const k = part.slice(0, i).trim();
    if (!k) return;
    const v = part.slice(i + 1).trim();
    try { out[k] = decodeURIComponent(v); } catch (e) { out[k] = v; }
  });
  return out;
}

// HttpOnly : le cookie est invisible au JavaScript de la page — un XSS ne peut
// donc pas voler la session (c'est précisément pourquoi on ne met JAMAIS un
// jeton de session en localStorage).
// SameSite=Lax : le lien magique arrive depuis un client mail, donc en
// navigation de premier niveau. « Strict » casserait ce retour.
// Secure : imposé en production ; omis en local, sinon le navigateur refuse le
// cookie sur http://localhost et la connexion devient intestable.
function cookieAttrs(maxAgeSec) {
  const secure = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
  return 'Path=/; HttpOnly; SameSite=Lax; Max-Age=' + maxAgeSec + (secure ? '; Secure' : '');
}

function readSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  return verifySession(token);
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', COOKIE_NAME + '=' + encodeURIComponent(token) + '; ' +
    cookieAttrs(Math.floor(SESSION_TTL_MS / 1000)));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', COOKIE_NAME + '=; ' + cookieAttrs(0));
}

// Nonce anti-rejeu stocké côté client WooCommerce (voir lib/wooCustomers.js).
function newNonce() { return crypto.randomBytes(9).toString('hex'); }

module.exports = {
  COOKIE_NAME, SESSION_TTL_MS, MAGIC_TTL_MS,
  sessionConfigured, signMagic, verifyMagic, signSession, verifySession,
  parseCookies, readSession, setSessionCookie, clearSessionCookie, newNonce,
};
