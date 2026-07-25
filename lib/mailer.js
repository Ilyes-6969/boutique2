// CLUB 151 — E-mail transactionnel vers le CLIENT
// ---------------------------------------------------------------------------
// À ne pas confondre avec Web3Forms (api/notify-order.js, api/stripe-webhook.js) :
// Web3Forms poste vers une clé fixe qui aboutit dans la boîte du PROPRIÉTAIRE.
// Il ne peut pas écrire à un client arbitraire — donc il ne peut pas porter un
// lien de connexion. D'où ce module.
//
// Fournisseur : Resend (API REST simple, offre gratuite généreuse). Il exige de
// prouver que le domaine t'appartient (enregistrements DNS SPF/DKIM sur
// leclub151.fr), sans quoi les liens de connexion partiraient en spam — ou pas
// du tout.
//
// ÉCHEC HONNÊTE : si la clé n'est pas configurée, on ne fait PAS semblant. La
// fonction renvoie { ok:false, reason:'not_configured' } et l'appelant doit le
// dire à l'utilisateur. Annoncer « e-mail envoyé » sans envoi laisserait le
// client attendre indéfiniment un lien qui n'existe pas.
//
// Variables d'environnement Vercel :
//   RESEND_API_KEY = re_...                      (https://resend.com → API Keys)
//   MAIL_FROM      = CLUB 151 <bonjour@leclub151.fr>
//                    L'adresse DOIT être sur un domaine vérifié chez Resend.
// ---------------------------------------------------------------------------

const MAIL_TIMEOUT_MS = 8000;

function mailerConfigured() {
  return !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

// Échappement HTML — tout ce qui vient de l'utilisateur (e-mail, n° de commande)
// est interpolé dans le corps du message. Sans ça, une valeur contenant du
// balisage pourrait déformer l'e-mail, voire y glisser un lien pirate.
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// Envoi brut. Ne lève jamais : renvoie { ok, reason } — l'appelant décide quoi
// dire à l'utilisateur.
async function sendMail(to, subject, html, text) {
  if (!mailerConfigured()) return { ok: false, reason: 'not_configured' };

  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, MAIL_TIMEOUT_MS);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [String(to)],
        subject: subject,
        html: html,
        text: text,      // repli texte : clients sans HTML, et meilleur score anti-spam
      }),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      const detail = await r.text().catch(function () { return ''; });
      // Détail loggué côté serveur uniquement (il peut contenir des éléments de
      // configuration du compte d'envoi).
      console.error('mailer: Resend HTTP ' + r.status + ' — ' + String(detail).slice(0, 300));
      return { ok: false, reason: 'send_failed' };
    }
    return { ok: true, reason: null };
  } catch (err) {
    console.error('mailer:', String((err && err.message) || err));
    return { ok: false, reason: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

// Gabarit commun — sobre, lisible, sans image distante : les clients mail les
// bloquent par défaut, et un message troué inspire la méfiance au moment précis
// où l'on demande au client de cliquer sur un lien de connexion.
function layout(title, bodyHtml) {
  return '<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#EEF1F8;' +
    'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#15224F">' +
    '<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #D7DEEC;' +
    'border-radius:14px;padding:32px 28px">' +
    '<div style="font-weight:800;font-size:18px;letter-spacing:-0.02em;margin-bottom:18px">CLUB 151</div>' +
    '<h1 style="font-size:19px;font-weight:700;margin:0 0 14px">' + esc(title) + '</h1>' +
    bodyHtml +
    '</div>' +
    '<p style="max-width:520px;margin:16px auto 0;font-size:11.5px;color:#626A88;text-align:center">' +
    'CLUB 151 — Vienne. Cet e-mail vous a été envoyé automatiquement, merci de ne pas y répondre.</p>' +
    '</body></html>';
}

// Lien de connexion (« lien magique »).
async function sendMagicLink(to, url) {
  const safeUrl = esc(url);
  const html = layout('Votre lien de connexion',
    '<p style="font-size:14.5px;line-height:1.6;margin:0 0 20px">Cliquez sur le bouton ci-dessous pour ' +
    'accéder à votre compte et suivre vos commandes. Ce lien est valable <strong>20 minutes</strong> ' +
    'et ne fonctionne qu\'une seule fois.</p>' +
    '<p style="margin:0 0 22px"><a href="' + safeUrl + '" style="display:inline-block;padding:13px 26px;' +
    'background:#3363A9;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px">' +
    'Me connecter</a></p>' +
    '<p style="font-size:12.5px;line-height:1.6;color:#626A88;margin:0">Si le bouton ne fonctionne pas, ' +
    'copiez cette adresse dans votre navigateur :<br><span style="word-break:break-all">' + safeUrl + '</span></p>' +
    '<p style="font-size:12.5px;line-height:1.6;color:#626A88;margin:18px 0 0">Vous n\'avez rien demandé ? ' +
    'Ignorez ce message : sans ce clic, aucun compte n\'est ouvert et rien ne se passe.</p>');

  const text = 'Votre lien de connexion CLUB 151 (valable 20 minutes, à usage unique) :\n\n' + url +
    '\n\nVous n\'avez rien demandé ? Ignorez ce message, rien ne se passera.';

  return sendMail(to, 'Votre lien de connexion — CLUB 151', html, text);
}

// Commande prête à retirer en boutique.
async function sendPickupReady(to, orderNumber) {
  const num = esc(orderNumber);
  const html = layout('Votre commande est prête',
    '<p style="font-size:14.5px;line-height:1.6;margin:0 0 16px">Bonne nouvelle : votre commande ' +
    '<strong>n° ' + num + '</strong> est prête et vous attend en boutique à Vienne.</p>' +
    '<p style="font-size:14.5px;line-height:1.6;margin:0 0 16px">Présentez simplement ce numéro au ' +
    'comptoir. Le règlement se fait sur place.</p>');
  const text = 'Votre commande CLUB 151 n° ' + orderNumber + ' est prête à être retirée en boutique ' +
    '(Vienne). Présentez ce numéro au comptoir ; le règlement se fait sur place.';
  return sendMail(to, 'Commande n° ' + orderNumber + ' prête à retirer — CLUB 151', html, text);
}

module.exports = { mailerConfigured, sendMail, sendMagicLink, sendPickupReady, esc };
