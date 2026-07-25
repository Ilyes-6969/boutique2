// CLUB 151 — Comptes client (connexion par lien magique, sans mot de passe)
// ---------------------------------------------------------------------------
// Une seule fonction pour tout le flux d'authentification, via route dynamique
// Vercel (/api/account/<action>). Le reste du dossier api/ est à plat, un
// fichier par endpoint ; ici les quatre actions partagent la même validation,
// le même contrat d'erreur et le même modèle de session — les séparer aurait
// éparpillé un flux unique sur quatre fichiers quasi identiques.
//
//   POST /api/account/request-link   { email }      → envoie le lien de connexion
//   GET  /api/account/verify?token=…                → pose le cookie, redirige
//   GET  /api/account/me                            → client connecté + adresse
//   POST /api/account/address        { … }          → met à jour l'adresse
//   POST /api/account/logout                        → efface la session
//
// ANTI-ÉNUMÉRATION : /request-link répond STRICTEMENT la même chose que le
// compte existe ou non. Une réponse différenciée transformerait ce endpoint en
// outil pour savoir qui est client de la boutique.
//
// Variables d'environnement : SESSION_SECRET, RESEND_API_KEY, MAIL_FROM,
// WC_STORE_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET, SITE_URL.
// ---------------------------------------------------------------------------

const { applyCors, rateLimit } = require('../../lib/serverCatalog');
const S = require('../../lib/session');
const W = require('../../lib/wooCustomers');
const M = require('../../lib/mailer');

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

// Domaine de confiance pour le lien de connexion. Même raisonnement que
// api/create-checkout-session.js : les en-têtes Host / X-Forwarded-Host sont
// manipulables, et bâtir le lien dessus permettrait d'envoyer au client un lien
// de connexion pointant vers un domaine pirate — qui capterait son jeton.
// SITE_URL fait autorité ; la déduction depuis la requête n'est qu'un repli
// pour les préversions et le développement local.
function siteUrl(req) {
  if (process.env.SITE_URL) return String(process.env.SITE_URL).replace(/\/+$/, '');
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  return host ? proto + '://' + host : '';
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

  // ---- 1) Demande de lien de connexion ----
  if (action === 'request-link') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    // Strict : 5 demandes / 15 min / IP. Ce endpoint déclenche l'envoi d'un
    // e-mail à une adresse choisie par l'appelant — sans limite, il devient un
    // outil de harcèlement par mail et brûle le quota d'envoi.
    if (!rateLimit(req, 'account-link', 5, 15 * 60 * 1000)) {
      return res.status(429).json({ ok: false, error: 'Trop de demandes — réessayez dans quelques minutes.' });
    }
    const email = String(readBody(req).email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 160) {
      return res.status(400).json({ ok: false, error: 'Adresse e-mail invalide.' });
    }
    if (!M.mailerConfigured()) {
      // Échec honnête : sans fournisseur d'envoi, aucun lien ne partira jamais.
      // Répondre « c'est envoyé » laisserait le client attendre pour rien.
      console.error('account/request-link: RESEND_API_KEY / MAIL_FROM absentes — aucun lien ne peut partir');
      return res.status(503).json({ ok: false, error: 'L’envoi d’e-mails n’est pas encore configuré — contactez la boutique.' });
    }

    try {
      let customer = await W.findCustomerByEmail(email);
      const nonce = S.newNonce();
      if (!customer) {
        // Premier passage : le compte est créé à la volée. Pas de formulaire
        // d'inscription séparé — l'e-mail vérifié EST l'inscription.
        customer = await W.createCustomer(email, nonce);
      } else {
        await W.rotateNonce(customer.id, nonce);
      }

      const base = siteUrl(req);
      const token = S.signMagic(email, nonce);
      const sent = await M.sendMagicLink(email, base + '/api/account/verify?token=' + encodeURIComponent(token));
      if (!sent.ok) {
        return res.status(502).json({ ok: false, error: 'L’e-mail n’a pas pu être envoyé — réessayez dans un instant.' });
      }
      // Réponse IDENTIQUE que le compte ait existé ou non (anti-énumération).
      return res.status(200).json({ ok: true });
    } catch (err) { return fail(res, err, 'request-link'); }
  }

  // ---- 2) Vérification du lien → session ----
  if (action === 'verify') {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
    const base = siteUrl(req);
    const token = (req.query && req.query.token) || '';
    const payload = S.verifyMagic(token);
    // Lien expiré ou déjà utilisé : on redirige avec un motif unique, sans dire
    // lequel des deux — inutile au client, utile à un attaquant.
    if (!payload || !payload.em) {
      res.writeHead(302, { Location: base + '/?connexion=expire' });
      return res.end();
    }
    try {
      const customer = await W.findCustomerByEmail(payload.em);
      if (!customer) {
        res.writeHead(302, { Location: base + '/?connexion=expire' });
        return res.end();
      }
      // USAGE UNIQUE : le nonce du lien doit être celui encore en vigueur. Une
      // seconde utilisation du même lien échoue ici, puisque la connexion
      // précédente l'a fait tourner.
      if (!payload.n || payload.n !== W.readNonce(customer)) {
        res.writeHead(302, { Location: base + '/?connexion=expire' });
        return res.end();
      }
      await W.rotateNonce(customer.id, S.newNonce());   // brûle le lien

      S.setSessionCookie(res, S.signSession(customer.id, payload.em));
      res.writeHead(302, { Location: base + '/?connexion=ok' });
      return res.end();
    } catch (err) {
      console.error('account/verify:', String((err && err.message) || err));
      res.writeHead(302, { Location: base + '/?connexion=erreur' });
      return res.end();
    }
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
