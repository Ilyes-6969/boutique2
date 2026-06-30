/* leclub151 — Couche de paiement (préparation PSP / centralisation Qonto)
   ----------------------------------------------------------------------
   AUJOURD'HUI : mode 'simulation' (démo). Aucun argent réel n'est débité ;
   on valide seulement le format de la carte, exactement comme avant.

   DEMAIN (quand on branchera un vrai paiement) : il suffit de passer
   LCPay.config.provider à 'stripe' | 'qonto' | 'sumup' et d'implémenter la
   fonction correspondante ci-dessous. C'est le SEUL fichier à toucher côté
   site — le tunnel de commande (Checkout.jsx) appelle déjà LCPay.process().

   Objectif final : un seul moyen de paiement pour le site ET la boutique,
   tout l'argent reversé sur le compte pro Qonto.
   IMPORTANT : ne jamais mettre de clé SECRÈTE ici (ce fichier est public).
   Seules les clés "publishable"/publiques vont côté client ; les secrets
   restent dans une fonction serveur (ex. /api sur Vercel). */
(function () {
  const cfg = {
    // Passe à 'stripe' une fois les variables d'env Vercel en place (voir
    // DEPLOIEMENT-PAIEMENT.md). 'simulation' = démo, aucun débit réel.
    provider: 'stripe',                // 'simulation' | 'stripe' | 'qonto' | 'sumup'
    currency: 'eur',
    stripe: {
      // La clé publique n'est PLUS nécessaire ici : on redirige vers Stripe
      // Checkout via la fonction serveur (qui détient la clé secrète).
      publishableKey: '',              // clé "pk_live_..." (publique, OK ici) — facultatif
      checkoutEndpoint: '/api/create-checkout-session',
    },
    qonto: {
      // Lien de paiement Qonto (propulsé par Mollie) — réconcilié auto sur Qonto.
      paymentLinkBase: '',
    },
    sumup: {
      merchantCode: '',
    },
  };

  // Algorithme de Luhn (validation du numéro de carte) — repris de Checkout.
  function luhn(num) {
    const s = (num || '').replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(s)) return false;
    let sum = 0, alt = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let d = parseInt(s[i], 10);
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d; alt = !alt;
    }
    return sum % 10 === 0;
  }

  const providers = {
    /* DÉMO — valide le format puis "réussit" sans débit réel.
       Retrait en boutique : rien à débiter maintenant. */
    simulation(order, card) {
      return new Promise(function (resolve, reject) {
        if (!card || card.method === 'pickup') { resolve({ paid: false, ref: null, provider: 'pickup' }); return; }
        if (!luhn(card.card)) { reject(new Error('card')); return; }
        setTimeout(function () { resolve({ paid: true, ref: 'SIM-' + Date.now().toString(36).toUpperCase(), provider: 'simulation' }); }, 350);
      });
    },

    /* ====== Stripe Checkout (rail de paiement → reversé sur Qonto) ======
       Flux : on POST le panier vers la fonction serveur /api/create-checkout-session
       (qui détient la clé SECRÈTE), puis on REDIRIGE le client vers la page de
       paiement sécurisée Stripe. Au retour (merci.html?session_id=...), le
       site vérifie le paiement via /api/order-status et finalise la commande.
       - Retrait en boutique : aucun paiement en ligne (réglé sur place).
       - Le virement Stripe (payout) est réglé vers l'IBAN Qonto dans le
         tableau de bord Stripe. */
    async stripe(order, card) {
      if (card && card.method === 'pickup') {
        return { paid: false, ref: null, provider: 'pickup' };
      }
      // Mémorise la commande en attente : on la finalisera au retour de Stripe.
      try {
        localStorage.setItem('lc151_pending_order', JSON.stringify({
          ts: Date.now(), order: order, ship: (card && card.ship) || null,
        }));
      } catch (e) {}

      const r = await fetch(cfg.stripe.checkoutEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: order.items,
          shipping: order.shipping || 0,
          email: (card && card.ship && card.ship.email) || order.email || undefined,
          orderRef: order.ref || '',
          currency: cfg.currency,
        }),
      });
      if (!r.ok) {
        let msg = 'stripe-session';
        try { const j = await r.json(); if (j && j.error) msg = j.error; } catch (e) {}
        throw new Error(msg);
      }
      const data = await r.json();
      if (!data.url) throw new Error('stripe-session');
      window.location.href = data.url;          // → page de paiement Stripe
      return new Promise(function () {});         // la page part en redirection
    },

    /* ====== À IMPLÉMENTER plus tard — Lien de paiement Qonto ======
       Génère/ouvre un lien de paiement Qonto (Mollie). Encaissement direct
       sur Qonto avec réconciliation automatique. */
    qonto() { throw new Error('Lien de paiement Qonto non encore configuré — voir README_AMELIORATIONS.md'); },

    /* ====== À IMPLÉMENTER plus tard — SumUp ====== */
    sumup() { throw new Error('SumUp non encore configuré — voir README_AMELIORATIONS.md'); },
  };

  window.LCPay = {
    config: cfg,
    luhn: luhn,
    isLive: function () { return cfg.provider !== 'simulation'; },
    // Renvoie une Promise → { paid, ref, provider }
    process: function (order, card) {
      const fn = providers[cfg.provider] || providers.simulation;
      try { return Promise.resolve(fn(order, card)); }
      catch (e) { return Promise.reject(e); }
    },
  };
})();
