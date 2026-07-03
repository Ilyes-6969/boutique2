/* leclub151 — v2 paiement intégré Stripe (Payment Element) — redeploy
   leclub151 — Couche de paiement (préparation PSP / centralisation Qonto)
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
      // Paiement INTÉGRÉ au site (Payment Element) : la clé publique est servie
      // par /api/stripe-public (variable d'env STRIPE_PUBLISHABLE_KEY), donc
      // aucune clé en dur ici.
      publicEndpoint: '/api/stripe-public',
      piEndpoint: '/api/create-payment-intent',
      checkoutEndpoint: '/api/create-checkout-session', // (ancien mode redirection, conservé)
    },
    // Notification serveur des commandes « retrait en boutique » (pas de Stripe
    // sur ce chemin) — voir notifyPickupOrder() ci-dessous.
    notifyOrderEndpoint: '/api/notify-order',
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

    /* ====== Stripe (paiement INTÉGRÉ au site, Payment Element) ======
       Le formulaire de carte est affiché DANS la fenêtre de paiement du site
       (pas de redirection vers checkout.stripe.com). Le montage du formulaire
       et la confirmation sont gérés par Checkout.jsx via les helpers
       LCPay.ensureStripe() et LCPay.createPaymentIntent() ci-dessous.
       Ici, on ne gère que le cas « retrait en boutique » (rien à débiter). */
    async stripe(order, card) {
      if (card && card.method === 'pickup') {
        return { paid: false, ref: null, provider: 'pickup' };
      }
      // Le paiement carte passe par le Payment Element (voir Checkout.jsx) — on
      // ne devrait pas arriver ici pour une carte.
      throw new Error('Le paiement carte est géré par le formulaire intégré.');
    },

    /* ====== À IMPLÉMENTER plus tard — Lien de paiement Qonto ======
       Génère/ouvre un lien de paiement Qonto (Mollie). Encaissement direct
       sur Qonto avec réconciliation automatique. */
    qonto() { throw new Error('Lien de paiement Qonto non encore configuré — voir README_AMELIORATIONS.md'); },

    /* ====== À IMPLÉMENTER plus tard — SumUp ====== */
    sumup() { throw new Error('SumUp non encore configuré — voir README_AMELIORATIONS.md'); },
  };

  // Charge Stripe.js (une seule fois) avec la clé publique servie par /api.
  function ensureStripe() {
    if (window.__lcStripePromise) return window.__lcStripePromise;
    window.__lcStripePromise = (async function () {
      const r = await fetch(cfg.stripe.publicEndpoint);
      const j = await r.json().catch(function () { return {}; });
      const pk = j && j.publishableKey;
      if (!pk) throw new Error('Clé publique Stripe manquante (STRIPE_PUBLISHABLE_KEY non définie dans Vercel).');
      if (!window.Stripe) {
        await new Promise(function (res, rej) {
          const s = document.createElement('script');
          s.src = 'https://js.stripe.com/v3/';
          s.onload = res;
          s.onerror = function () { rej(new Error('Chargement de Stripe.js impossible.')); };
          document.head.appendChild(s);
        });
      }
      if (!window.Stripe) throw new Error('Stripe.js indisponible.');
      return window.Stripe(pk);
    })();
    return window.__lcStripePromise;
  }

  // Crée un PaymentIntent côté serveur et renvoie { clientSecret, amount }.
  // On n'envoie QUE { id, qty } + le mode de livraison : le serveur fixe les
  // prix et les frais de port (le prix n'est jamais transmis par le navigateur).
  // Le champ facultatif order.customer {name,email,addr,zip,city,phone} sert au
  // reçu Stripe et à l'adresse de livraison — jamais au calcul du montant.
  function createPaymentIntent(order) {
    return fetch(cfg.stripe.piEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: (order.items || []).map(function (l) { return { id: l.id, qty: l.qty }; }),
        method: order.method || 'standard',
        email: order.email || undefined,
        orderRef: order.ref || '',
        customer: order.customer || undefined,
      }),
    }).then(async function (r) {
      const j = await r.json().catch(function () { return {}; });
      if (!r.ok || !j.clientSecret) throw new Error((j && j.error) || 'Création du paiement impossible.');
      return j;
    });
  }

  // Prévient le propriétaire d'une commande « retrait en boutique » via le
  // serveur (fiable, contrairement à la clé localStorage du navigateur).
  // BEST-EFFORT : ne lève jamais, ne bloque jamais la confirmation — un échec
  // est seulement consigné en console. Renvoie une Promise<bool>.
  function notifyPickupOrder(order) {
    try {
      return fetch(cfg.notifyOrderEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'pickup',
          orderRef: order.ref || '',
          customer: order.customer || {},
          items: (order.items || []).map(function (l) { return { id: l.id, qty: l.qty }; }),
        }),
      }).then(function (r) {
        if (!r.ok) console.warn('notify-order: HTTP ' + r.status);
        return r.ok;
      }).catch(function (e) {
        console.warn('notify-order:', (e && e.message) || e);
        return false;
      });
    } catch (e) {
      console.warn('notify-order:', (e && e.message) || e);
      return Promise.resolve(false);
    }
  }

  window.LCPay = {
    config: cfg,
    luhn: luhn,
    isLive: function () { return cfg.provider !== 'simulation'; },
    ensureStripe: ensureStripe,
    createPaymentIntent: createPaymentIntent,
    notifyPickupOrder: notifyPickupOrder,
    // Renvoie une Promise → { paid, ref, provider }
    process: function (order, card) {
      const fn = providers[cfg.provider] || providers.simulation;
      try { return Promise.resolve(fn(order, card)); }
      catch (e) { return Promise.reject(e); }
    },
  };
})();
