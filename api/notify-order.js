// CLUB 151 — Notification de commande « retrait en boutique » (sans Stripe)
// ---------------------------------------------------------------------------
// Le retrait en boutique ne passe pas par Stripe : sans ce endpoint, le
// propriétaire n'était prévenu que via une clé localStorage de SON navigateur
// (aucune fiabilité). Ici : le client n'envoie QUE { id, qty } + coordonnées ;
// les articles et le total sont recalculés via lib/serverCatalog (JAMAIS de
// prix client), puis un e-mail part au propriétaire via Web3Forms.
//
// La commande est aussi créée dans WooCommerce (statut « en attente de paiement »,
// sans toucher au stock — voir lib/wooCustomers.js), et le CLIENT reçoit sa
// confirmation par e-mail à l'adresse saisie. Sans adresse valide : refus.
//
// Variables d'environnement Vercel :
//   WEB3FORMS_KEY = clé Web3Forms (sans elle : aucune notification, ok:false)
// ---------------------------------------------------------------------------

const { priceItems, discountCents, DISCOUNT, applyCors, errorStatus, rateLimit, rateLimitKey, sameSiteRequest, noStore, isEmail } = require('../lib/serverCatalog');
const { wooConfigured, createPickupOrder, sendPickupConfirmation } = require('../lib/wooCustomers');
const { readSession } = require('../lib/session');

const MAX_ITEMS = 30;
const ID_RE = /^[A-Za-z0-9_-]{1,32}$/;
const REF_RE = /^[A-Za-z0-9_-]{1,40}$/;

function cleanText(v, max) {
  // Retours à la ligne et caractères de contrôle neutralisés : ces champs
  // partent dans un e-mail (anti-injection de fausses lignes de commande).
  return typeof v === 'string' ? v.replace(/[\x00-\x1f\x7f]+/g, ' ').trim().slice(0, max) : '';
}

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  noStore(res);
  // Seules les pages du site peuvent déposer une commande ou un message : ce
  // point d'entrée crée une commande et fait partir des e-mails.
  if (!sameSiteRequest(req)) return res.status(403).json({ error: 'Requête refusée.' });

  // Bucket dédié, volontairement strict : 5 requêtes / 15 min / IP.
  if (!rateLimit(req, 'notify-order', 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de tentatives — réessayez plus tard.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // --- Formulaires du site (contact, inscription aux arrivages) ---
    // Le visiteur n'a aucune clé d'envoi : son message transite par ici et part
    // vers la boîte de la boutique, seul destinataire possible. Champs bornés,
    // retours à la ligne neutralisés (cleanText), même limite de débit que le reste.
    if (body.kind === 'form') {
      const subject = cleanText(body.subject, 80);
      const src = (body.fields && typeof body.fields === 'object' && !Array.isArray(body.fields)) ? body.fields : {};
      const fields = {};
      Object.keys(src).slice(0, 10).forEach(function (k) {
        const key = cleanText(k, 40).replace(/[^\w À-ÿ'’-]/g, '');
        const val = cleanText(String(src[k] == null ? '' : src[k]), 2000);
        if (key && val && key !== 'access_key' && key !== 'subject' && key !== 'from_name') fields[key] = val;
      });
      if (!subject || !Object.keys(fields).length) return res.status(400).json({ error: 'Message vide' });
      const formKey = process.env.WEB3FORMS_KEY;
      if (!formKey) return res.status(200).json({ ok: false });
      const fr = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ access_key: formKey, subject: subject + ' — CLUB 151', from_name: 'Site CLUB 151' }, fields)),
      });
      if (!fr.ok) {
        console.error('notify-order (formulaire): Web3Forms HTTP ' + fr.status);
        return res.status(502).json({ error: 'Envoi impossible pour le moment.' });
      }
      return res.status(200).json({ ok: true });
    }

    // --- Validation stricte (endpoint public → aucune confiance) ---
    if (body.method !== 'pickup') return res.status(400).json({ error: 'Méthode invalide' });
    const c = (body.customer && typeof body.customer === 'object') ? body.customer : {};
    const name = cleanText(c.name, 120);
    const email = cleanText(c.email, 160);
    const phone = cleanText(c.phone, 40);
    const orderRef = REF_RE.test(String(body.orderRef || '')) ? String(body.orderRef) : '';
    if (!name) return res.status(400).json({ error: 'Nom invalide' });
    // Pas de commande sans adresse e-mail valide : c'est là que part la confirmation.
    if (!isEmail(email)) return res.status(400).json({ error: 'Indiquez une adresse e-mail valide : la confirmation de commande y est envoyée.' });
    // Une même adresse ne peut pas recevoir une rafale de confirmations (quelqu'un
    // qui saisirait l'adresse d'un tiers pour l'inonder) : 3 commandes par heure.
    if (!rateLimitKey('pickup-mail:' + email.toLowerCase(), 3, 60 * 60 * 1000)) {
      return res.status(429).json({ error: 'Trop de commandes pour cette adresse — réessayez plus tard ou appelez la boutique.' });
    }
    if (!Array.isArray(body.items) || !body.items.length || body.items.length > MAX_ITEMS) {
      return res.status(400).json({ error: 'Panier invalide (1 à ' + MAX_ITEMS + ' lignes)' });
    }
    const items = [];
    for (const raw of body.items) {
      const id = String((raw && raw.id) || '');
      if (!ID_RE.test(id)) return res.status(400).json({ error: 'Article invalide' });
      const qty = parseInt(raw && raw.qty, 10);
      if (!Number.isFinite(qty) || qty < 1 || qty > 999) return res.status(400).json({ error: 'Quantité invalide' });
      items.push({ id: id, qty: qty });
    }

    // Prix et noms d'articles fixés par le SERVEUR (jamais ceux du client).
    const { lines, subtotalCents } = await priceItems(items);
    // Retrait → pas de port. Remise 10 % dès 250 € d'articles, comme en livraison.
    const discCents = discountCents(subtotalCents);
    const total = ((subtotalCents - discCents) / 100).toFixed(2) + ' €';

    // --- Commande WooCommerce réelle (statut 'pending' : AUCUN stock retiré) ---
    // La décision historique « pas de commande Woo ici » visait le risque qu'un
    // inconnu vide le stock en boucle depuis ce endpoint non authentifié. Le
    // statut 'pending' lève ce risque : WooCommerce ne décrémente qu'à partir de
    // 'processing'. En échange, le retrait devient une VRAIE commande — suivie,
    // numérotée, visible dans « Mes commandes » et dans l'admin de la boutique —
    // au lieu d'un simple e-mail qu'un filtre anti-spam pouvait engloutir.
    let wooOrder = null;
    if (wooConfigured()) {
      try {
        const sess = readSession(req);      // client connecté → commande rattachée à son compte
        wooOrder = await createPickupOrder({
          email: email, name: name, phone: phone, lines: lines, ref: orderRef,
          discountCents: discCents, discountLabel: DISCOUNT.label,
          customerId: sess ? sess.cid : 0,
        });
      } catch (e) {
        // On NE bloque PAS : l'e-mail au propriétaire reste le filet de secours.
        // Mais la trace doit exister, sinon l'échec passerait inaperçu.
        console.error('notify-order: commande de retrait NON créée dans WooCommerce:',
          String((e && e.message) || e));
      }
    }
    const ref = (wooOrder && wooOrder.number) || orderRef;

    // --- Confirmation au CLIENT, à l'adresse qu'il a saisie ---
    // Stock réservé ('on-hold') : WooCommerce envoie lui-même « commande bien
    // reçue ». Sinon ('pending') il n'écrit rien : on ajoute une note au client,
    // que WooCommerce envoie par e-mail avec le détail de la commande.
    // `emailed` dit la vérité au site : il n'annonce un e-mail que s'il est parti.
    let emailed = false;
    if (wooOrder) {
      if (wooOrder.reserved) emailed = true;
      else {
        try { emailed = await sendPickupConfirmation(wooOrder, orderRef); }
        catch (e) { console.error('notify-order: confirmation client NON envoyée (commande ' + wooOrder.number + ') :', String((e && e.message) || e)); }
      }
    }

    const key = process.env.WEB3FORMS_KEY;
    // Web3Forms non configuré : si la commande Woo existe, l'essentiel EST
    // enregistré — on le dit honnêtement plutôt que de renvoyer un ok:false qui
    // laisserait croire à une perte totale.
    if (!key) return res.status(200).json({ ok: !!wooOrder, orderNumber: ref || null, emailed: emailed });

    const articles = lines.map(function (l) {
      return '- ' + l.name + ' ×' + l.qty + ' : ' + ((l.unitAmount * l.qty) / 100).toFixed(2) + ' €';
    }).join('\n');

    const payload = {
      access_key: key,
      subject: 'Commande retrait en boutique ' + (ref || '') + ' — CLUB 151',
      from_name: 'Boutique CLUB 151',
      Commande: ref || '—',
      'Référence donnée au client': orderRef || '—',
      Client: name,
      'E-mail': email,
      'Téléphone': phone || '—',
      Articles: '\n' + articles,
      Remise: discCents > 0 ? '−' + (discCents / 100).toFixed(2) + ' € (10 % dès 250 € d\'achat)' : 'aucune',
      Total: total,
      Paiement: 'À régler au retrait en boutique (aucun paiement en ligne)',
      'Confirmation au client': emailed ? 'E-mail de confirmation envoyé au client par WooCommerce.' : '⚠️ Aucun e-mail de confirmation n\'est parti au client — pensez à le prévenir.',
      // Dit explicitement si la commande est enregistrée dans WooCommerce ou si
      // cet e-mail est la SEULE trace — sans quoi le propriétaire ne saurait pas
      // qu'il doit la saisir à la main.
      WooCommerce: wooOrder
        ? (wooOrder.reserved
          ? 'Commande n° ' + wooOrder.number + ' créée (statut « En attente ») — articles retirés du stock. Annulez-la si le client ne vient pas.'
          : 'Commande n° ' + wooOrder.number + ' créée (statut « En attente de paiement » — le stock ne bougera qu\'au passage en préparation).')
        : (wooConfigured()
          ? '⚠️ Commande NON enregistrée dans WooCommerce — à saisir manuellement.'
          : 'WooCommerce non configuré — cet e-mail est la seule trace.'),
    };

    const r = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error('notify-order: Web3Forms HTTP ' + r.status);
      // La commande existe dans WooCommerce : on ne fait pas croire au client
      // qu'elle est perdue parce que l'e-mail interne à la boutique a échoué.
      if (wooOrder) return res.status(200).json({ ok: true, orderNumber: ref || null, emailed: emailed });
      return res.status(502).json({ error: 'Notification impossible pour le moment.' });
    }
    return res.status(200).json({ ok: true, orderNumber: ref || null, emailed: emailed });
  } catch (err) {
    const msg = String((err && err.message) || err);
    // WooCommerce injoignable (contrat WC_DOWN) → 503, message générique.
    if (err && err.code === 'WC_DOWN') {
      console.error('notify-order: WooCommerce injoignable:', msg);
      return res.status(503).json({ error: 'Boutique momentanément indisponible, réessayez dans un instant.' });
    }
    // Erreur métier attendue (panier vide, article inconnu, rupture...).
    if (errorStatus(msg) === 400) return res.status(400).json({ error: msg });
    console.error('notify-order:', msg);
    return res.status(500).json({ error: 'Notification impossible pour le moment.' });
  }
};
