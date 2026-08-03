/* CLUB 151 — storefront data + cart + editable Store
   Catalogue is EMPTY by default. Real products are managed in WordPress /
   WooCommerce; nothing is hard-coded here. The owner can also add products
   from the back-office (admin.html), which persist to localStorage. */
(function () {
  // ---- Catalogue ----
  // AUCUN produit en dur. Le catalogue vient exclusivement de WooCommerce
  // (via /api/catalog), plus les produits ajoutés depuis le back-office.
  // Les cartes de démonstration ont été retirées : sur un domaine public, de
  // faux produits sont au mieux embarrassants, au pire pris pour du vrai
  // stock par un client.

  const FILTERS = [
    { key: 'all', label: 'Tout' },
    { key: 'single', label: "Cartes à l'unité" },
    { key: 'graded', label: 'Gradées PSA' },
    { key: 'sealed', label: 'Scellé' },
    { key: 'accessory', label: 'Accessoires' },
  ];

  const K_OVR = 'lc151_overrides';   // { id: {price, oldPrice, inStock, badge} }
  const K_CUSTOM = 'lc151_custom';   // [ product, ... ]
  const K_WP = 'lc151_wp_url';       // WordPress / WooCommerce site URL
  const EDITABLE = ['price', 'oldPrice', 'inStock', 'badge'];

  // ---- Coordonnées de la boutique — SOURCE UNIQUE ----
  // Lues par Home.jsx (bloc « Retrouvez-nous à Vienne ») et Chrome.jsx (footer).
  // Une valeur VIDE masque proprement le bloc concerné : on préfère ne rien
  // afficher plutôt qu'un faux numéro ou un lien social retombant sur l'accueil
  // de la plateforme — c'est la signature d'un site « template », et ça coûte
  // plus de crédibilité que ça n'en apporte.
  // build.mjs REFUSE de publier sur le domaine de production si une valeur
  // bouche-trou réapparaît ici (numéro en 00 00 00, lien social sans compte).
  const SHOP = {
    // Le vrai numéro, ex. '04 74 12 34 56'. Vide tant que la ligne n'existe pas.
    phone: '',
    // UNIQUEMENT de vrais comptes, ex. :
    //   [['Instagram', 'https://instagram.com/club151'], ['Facebook', 'https://facebook.com/club151']]
    // Une URL sans chemin (= accueil de plateforme) est rejetée au build.
    socials: [],
  };

  // Un JSON VALIDE mais du mauvais TYPE (ex. lc151_cart = {"a":1} au lieu d'un
  // tableau) traversait ce try/catch sans bruit — JSON.parse ne lève pas — puis
  // faisait planter toute la boutique au premier cart.filter(...), sans error
  // boundary pour rattraper. Les gestionnaires cross-onglet vérifiaient déjà
  // Array.isArray ; le chargement initial, non. On aligne les deux : une valeur
  // dont la forme ne correspond pas au fallback est traitée comme corrompue.
  function load(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (!v) return fallback;
      const parsed = JSON.parse(v);
      const wantArray = Array.isArray(fallback);
      const wantObject = !wantArray && fallback !== null && typeof fallback === 'object';
      if (wantArray && !Array.isArray(parsed)) return fallback;
      if (wantObject && (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))) return fallback;
      return parsed;
    } catch (e) { return fallback; }
  }
  // Renvoie false si l'écriture a échoué (quota dépassé, navigation privée,
  // stockage bloqué). Avant, l'échec était avalé : l'état mémoire était à jour et
  // l'UI affichait le panier comme enregistré alors que rien n'était persisté —
  // au rechargement, tout avait disparu sans que personne n'ait rien vu.
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) {
      console.warn('[lc151] écriture localStorage impossible (' + key + ') — état NON persisté :', e && e.message);
      return false;
    }
  }

  // ---- WordPress / WooCommerce ----
  // Deux chemins de chargement du catalogue :
  //  1. lc151_wp_url (localStorage, admin.html → « Connexion WordPress ») :
  //     lecture DIRECTE de la Store API publique du WordPress (mode test
  //     admin), avec pagination (per_page=100, page=N) et timeout 10 s.
  //  2. Sinon (chemin normal des visiteurs) : GET /api/catalog — proxy même
  //     origine (pas de CORS), produits DÉJÀ au format du site (CONTRAT
  //     PRODUIT partagé avec lib/serverCatalog.js).
  // Panne : le dernier catalogue réussi est conservé 24 h dans localStorage
  // (lc151_wc_cache) et réutilisé — le site ne se vide pas pour une panne
  // transitoire, et le panier n'est jamais purgé sur un catalogue absent.
  let wpUrl = '';
  try { wpUrl = localStorage.getItem(K_WP) || ''; } catch (e) {}
  let wpProducts = [];
  let wpStatus = { state: 'loading', count: 0, error: '' }; // off|loading|ok|error
  let wpFetchSeq = 0;   // jeton de requête : les réponses obsolètes sont ignorées

  function typeFromCategories(cats) {
    const s = (cats || []).map((c) => (c.name || '').toLowerCase()).join(' ');
    if (/grad|psa|bgs|cgc/.test(s)) return 'graded';
    if (/scell|display|booster|coffret|etb|box|boîte/.test(s)) return 'sealed';
    if (/accessoir|sleeve|protège|classeur|toploader|tapis|deck box/.test(s)) return 'accessory';
    return 'single';
  }

  // Précommande : une catégorie OU un tag contenant « précommande »/« preorder »
  // (mêmes règles que lib/serverCatalog.js — à garder synchronisées).
  function isPreorderWoo(p) {
    const terms = [].concat(p.categories || [], p.tags || [])
      .map((t) => (((t && t.name) || '') + ' ' + ((t && t.slug) || '')))
      .join(' ').toLowerCase();
    return /pr[ée]commande|preorder/.test(terms);
  }

  // Mappe un produit BRUT de la Store API vers le CONTRAT PRODUIT du site —
  // mêmes champs que lib/serverCatalog.js (mapWooProduct), pour que le chemin
  // direct WP (mode test admin) et /api/catalog produisent des objets identiques :
  // { id:'wp<ID>', name, price, oldPrice, image, thumb, desc, cat, set, num,
  //   type, unique, preorder, inStock, stockLeft, maxQty }
  function mapWoo(p) {
    const minor = (p.prices && p.prices.currency_minor_unit != null) ? p.prices.currency_minor_unit : 2;
    const div = Math.pow(10, minor);
    // MÊME RÈGLE que lib/serverCatalog.js (mapWooProduct) : un prix absent ou
    // illisible ne devient pas 0 en silence. À 0 la fiche paraissait GRATUITE en
    // vitrine, puis le paiement la refusait avec un « Prix invalide » que le
    // client ne pouvait pas comprendre. On marque le produit non vendable, comme
    // le fait le serveur — sinon les deux chemins (WP direct en mode test admin
    // et /api/catalog) ne produisent PAS les objets identiques promis plus haut.
    const rawPrice = (p.prices && p.prices.price != null) ? Number(p.prices.price) / div : NaN;
    const hasValidPrice = Number.isFinite(rawPrice) && rawPrice > 0;
    const price = hasValidPrice ? rawPrice : 0;
    const regular = p.prices && p.prices.regular_price != null ? Number(p.prices.regular_price) / div : price;
    const onSale = !!p.on_sale && regular > price;
    const cat = (p.categories && p.categories[0] && p.categories[0].name) || 'Carte';
    const img = (p.images && p.images[0]) || null;
    const strip = (html) => (html || '').replace(/<[^>]*>/g, '').trim();
    // quantity_limits.maximum fait foi (« Vendu individuellement » ou stock=1
    // → maximum=1). Fallback pour les vieux Woo sans quantity_limits :
    // « sold_individually », puis l'heuristique catégories historique.
    const ql = (p.quantity_limits && p.quantity_limits.maximum != null) ? Number(p.quantity_limits.maximum) : null;
    let maxQty = 999;
    if (ql != null && isFinite(ql)) maxQty = Math.max(1, Math.min(999, ql));
    let unique;
    if (ql != null && isFinite(ql)) {
      unique = ql === 1;
    } else if (p.sold_individually === true) {
      unique = true;
    } else {
      const catNames = (p.categories || []).map((c) => (c.name || '').toLowerCase()).join(' ');
      unique = /grad|psa|bgs|cgc|unit|single/.test(catNames);
    }
    if (unique) maxQty = 1;
    const stockLeft = (p.low_stock_remaining != null && isFinite(Number(p.low_stock_remaining)))
      ? Number(p.low_stock_remaining) : null;
    const preorder = isPreorderWoo(p);
    return {
      id: 'wp' + p.id,
      name: p.name,
      cat: cat,
      set: cat,
      num: p.sku || '—',
      type: typeFromCategories(p.categories),
      price: Math.round(price * 100) / 100,
      oldPrice: onSale ? Math.round(regular * 100) / 100 : null,
      image: (img && img.src) || null,
      thumb: (img && img.thumbnail) || null,
      // CONTRAT IMAGES : galerie [{ src, thumb }] (max 6), en COMPLÉMENT de
      // image/thumb — même champ que lib/serverCatalog.js pour que le chemin
      // direct WP (mode test admin) et /api/catalog restent identiques.
      images: (p.images || []).slice(0, 6)
        .map((im) => ({ src: (im && im.src) || null, thumb: (im && (im.thumbnail || im.src)) || null }))
        .filter((im) => im.src),
      // Sans prix exploitable, l'article n'est pas vendable : on le sort du
      // circuit d'achat au lieu de l'afficher à 0 € (cf. hasValidPrice ci-dessus).
      inStock: hasValidPrice && p.is_in_stock !== false,
      stockLeft: stockLeft,
      maxQty: maxQty,
      unique: unique,
      preorder: preorder,
      badge: onSale ? { tone: 'sale', label: 'Promo' } : (preorder ? { tone: 'sale', label: 'Précommande' } : undefined),
      rarity: '—',
      desc: strip(p.short_description) || strip(p.description),
      wp: true,
    };
  }

  // ---- Cache du dernier catalogue réussi (robustesse aux pannes) ----
  const K_WC_CACHE = 'lc151_wc_cache';            // { ts, products }
  const WC_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;   // 24 h
  function saveCatalogCache(products) {
    try { localStorage.setItem(K_WC_CACHE, JSON.stringify({ ts: Date.now(), products: products })); } catch (e) {}
  }
  function loadCatalogCache() {
    try {
      const raw = localStorage.getItem(K_WC_CACHE);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (!c || typeof c.ts !== 'number' || !Array.isArray(c.products) || !c.products.length) return null;
      if (Date.now() - c.ts > WC_CACHE_MAX_AGE) return null;
      return c.products;
    } catch (e) { return null; }
  }

  // fetch avec délai maximal — retombe sur fetch nu quand l'environnement
  // n'offre pas AbortController/setTimeout (bac à sable Node de build.mjs).
  const WC_FETCH_TIMEOUT_MS = 10000;
  function fetchWithTimeout(url) {
    if (typeof AbortController === 'undefined' || typeof setTimeout === 'undefined') return fetch(url);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), WC_FETCH_TIMEOUT_MS);
    return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
  }

  // Toutes les pages de la Store API (mode test admin) : ?page=N&per_page=100
  // jusqu'à une réponse incomplète, garde-fou 30 pages (3 000 produits).
  function fetchAllWooPages(base) {
    const PER_PAGE = 100, MAX_PAGES = 30;
    const all = [];
    const fetchPage = (page) =>
      fetchWithTimeout(base + '/wp-json/wc/store/v1/products?per_page=' + PER_PAGE + '&page=' + page)
        .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then((list) => {
          const arr = Array.isArray(list) ? list : [];
          arr.forEach((p) => all.push(p));
          if (arr.length < PER_PAGE || page >= MAX_PAGES) return all;
          return fetchPage(page + 1);
        });
    return fetchPage(1);
  }

  function applyCatalog(products, seq) {
    if (seq !== wpFetchSeq) return;               // réponse obsolète
    wpProducts = products;
    wpStatus = { state: 'ok', count: products.length, error: '' };
    saveCatalogCache(products);
    rebuild(); emitStore();
  }
  function applyCatalogFailure(err, seq) {
    if (seq !== wpFetchSeq) return;
    const cached = loadCatalogCache();
    if (cached) {
      // Panne transitoire → dernier catalogue connu (< 24 h), site utilisable.
      wpProducts = cached;
      wpStatus = { state: 'ok', count: cached.length, error: '' };
    } else {
      wpProducts = [];
      wpStatus = { state: 'error', count: 0, error: String((err && err.message) || err) };
    }
    rebuild(); emitStore();
  }
  function applyNoCatalog(seq) {   // pas d'API ou catalogue vide → logique démo/vide
    if (seq !== wpFetchSeq) return;
    wpProducts = [];
    wpStatus = { state: 'off', count: 0, error: '' };
    rebuild(); emitStore();
  }

  function refreshFromWp() {
    const seq = ++wpFetchSeq;
    wpStatus = { state: 'loading', count: 0, error: '' };
    rebuild();            // mode admin : drop demo data immediately → loading, never demo cards
    emitStore();
    if (typeof fetch === 'undefined') { applyNoCatalog(seq); return; }
    if (wpUrl) {
      // 1. Mode test admin : lecture directe du WordPress renseigné dans admin.html.
      fetchAllWooPages(wpUrl.replace(/\/+$/, ''))
        .then((list) => applyCatalog(list.map(mapWoo), seq))
        .catch((err) => applyCatalogFailure(err, seq));
      return;
    }
    // 2. Chemin normal : proxy même origine — produits déjà au CONTRAT PRODUIT.
    fetch('/api/catalog')
      .then((r) => {
        if (r.status === 404) return null;        // pas d'API (hébergement statique) → démo/vide
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((data) => {
        if (data === null) { applyNoCatalog(seq); return; }
        if (!data || data.ok !== true || !Array.isArray(data.products)) throw new Error('Réponse catalogue invalide');
        const products = data.products.filter((p) => p && typeof p.id === 'string' && p.name && typeof p.price === 'number');
        if (!products.length) { applyNoCatalog(seq); return; }
        applyCatalog(products, seq);
      })
      .catch((err) => applyCatalogFailure(err, seq));
  }

  // ---- Build live PRODUCTS = defaults (+overrides) ++ custom ----
  let overrides = load(K_OVR, {});
  let custom = load(K_CUSTOM, []);
  let PRODUCTS = [];

  function rebuild() {
    overrides = load(K_OVR, {});
    custom = load(K_CUSTOM, []);
    // ROOT-CAUSE FIX: demo seed data must appear ONLY when no real shop is
    // connected. Once a WooCommerce URL is configured, the catalogue is the
    // real products (+ owner-added) — demo cards never leak into production.
    // Base du catalogue :
    //  - mode test admin (wpUrl) : uniquement ce que renvoie le WordPress ;
    //  - catalogue réel chargé (/api/catalog ou cache de panne) : les produits réels ;
    //  - sinon : la démo (jamais sur le domaine de production).
    const base = wpProducts;
    const combined = base.concat(custom);
    const merged = combined.map((p) => {
      const o = overrides[p.id] || {};
      const m = { ...p };
      EDITABLE.forEach((f) => { if (f in o) m[f] = o[f]; });
      return m;
    });
    // mutate in place so existing references stay valid
    PRODUCTS.length = 0;
    merged.forEach((p) => PRODUCTS.push(p));
  }
  // (Amorçage — rebuild() + refreshFromWp() — déplacé tout en FIN d'IIFE :
  // l'appeler ici exécutait emitStore() AVANT la déclaration de storeListeners
  // → ReferenceError (TDZ), window.LC151 jamais défini, site blanc.)

  // ---- product-change emitter ----
  const storeListeners = new Set();
  function emitStore() { storeListeners.forEach((fn) => fn()); }

  const Store = {
    all: () => PRODUCTS,
    get: (id) => PRODUCTS.find((p) => p.id === id),
    subscribe(fn) { storeListeners.add(fn); return () => storeListeners.delete(fn); },
    update(id, field, value) {
      if (!EDITABLE.includes(field)) return;
      const isCustom = custom.some((c) => c.id === id);
      if (isCustom) {
        const c = custom.find((x) => x.id === id); if (c) c[field] = value;
        save(K_CUSTOM, custom);
      } else {
        overrides[id] = overrides[id] || {};
        overrides[id][field] = value;
        save(K_OVR, overrides);
      }
      rebuild(); emitStore();
    },
    add(product) {
      const p = { id: 'c' + Date.now(), inStock: true, image: null, glyph: 'NOUVEAU',
        set: '—', num: '—', rarity: '—', desc: '', ...product };
      custom.push(p); save(K_CUSTOM, custom); rebuild(); emitStore();
      return p.id;
    },
    remove(id) {
      custom = custom.filter((c) => c.id !== id); save(K_CUSTOM, custom);
      if (overrides[id]) { delete overrides[id]; save(K_OVR, overrides); }
      rebuild(); emitStore();
    },
    resetAll() {
      overrides = {}; custom = [];
      try { localStorage.removeItem(K_OVR); localStorage.removeItem(K_CUSTOM); } catch (e) {}
      rebuild(); emitStore();
    },
    isCustom: (id) => custom.some((c) => c.id === id),
    isModified: (id) => !!overrides[id],
    isUnique: (id) => isUnique(Store.get(id)),
    // ---- WordPress / WooCommerce ----
    getWpUrl: () => wpUrl,
    setWpUrl(url) {
      wpUrl = (url || '').trim();
      try { if (wpUrl) localStorage.setItem(K_WP, wpUrl); else localStorage.removeItem(K_WP); } catch (e) {}
      refreshFromWp();
    },
    refreshFromWp,
    wpStatus: () => wpStatus,
  };

  // cross-tab / cross-page sync: admin edits → shop updates live
  window.addEventListener('storage', (e) => {
    if (e.key === K_OVR || e.key === K_CUSTOM) { rebuild(); emitStore(); }
  });

  // Pièce unique : le champ `unique` du CONTRAT PRODUIT (WooCommerce —
  // quantity_limits.maximum === 1) fait foi quand il est renseigné.
  // L'heuristique historique « single/graded = pièce unique » ne s'applique
  // QU'AUX produits (démo) qui ne renseignent pas ce champ.
  function isUnique(p) {
    if (!p) return false;
    if (typeof p.unique === 'boolean') return p.unique;
    return p.type === 'single' || p.type === 'graded';
  }

  // Plafond de quantité par ligne : limites WooCommerce (maxQty) et stock
  // restant connu (stockLeft). Le serveur re-clampe de toute façon au paiement
  // (lib/serverCatalog.js) — ici on évite juste de promettre plus que le stock.
  function qtyCap(p) {
    if (!p) return 1;
    if (isUnique(p)) return 1;
    let cap = 999;
    if (typeof p.maxQty === 'number' && isFinite(p.maxQty) && p.maxQty > 0) cap = Math.min(cap, p.maxQty);
    if (typeof p.stockLeft === 'number' && isFinite(p.stockLeft) && p.stockLeft > 0) cap = Math.min(cap, p.stockLeft);
    return Math.max(1, cap);
  }

  // ---- Cart store ----
  const cartListeners = new Set();
  const K_CART = 'lc151_cart';
  let cart = load(K_CART, []);
  function emitCart() { save(K_CART, cart); cartListeners.forEach((fn) => fn()); }
  // Clamp NON destructif des quantités : borne chaque ligne dont le produit
  // existe encore à son plafond (pièce unique → 1, sinon stock/maxQty connus).
  // Ne SUPPRIME jamais de ligne — un produit introuvable est laissé intact
  // (anti-vidage-de-panier sur panne transitoire). Sûr même pendant le
  // chargement du catalogue : le montant affiché colle au montant réellement
  // débité au paiement (le serveur re-clampe de toute façon). Mute `cart` en
  // place et renvoie `true` si au moins une quantité a été réduite ; n'émet pas
  // (l'appelant décide).
  function clampCartLines() {
    let changed = false;
    cart.forEach((l) => {
      const p = Store.get(l.id);
      if (!p) return;                            // produit absent → on ne touche pas
      const cap = qtyCap(p);                     // pièce unique → 1, stock/maxQty sinon
      if (l.qty > cap) { l.qty = cap; changed = true; }
    });
    return changed;
  }
  const Cart = {
    items: () => cart,
    count: () => cart.reduce((s, l) => s + l.qty, 0),
    subtotal: () => cart.reduce((s, l) => {
      const p = Store.get(l.id); return s + (p ? p.price * l.qty : 0);
    }, 0),
    isUnique: (id) => isUnique(Store.get(id)),
    add(id, qty = 1) {
      const p = Store.get(id);
      if (!p) return;                       // never add an unknown / stale product
      const line = cart.find((l) => l.id === id);
      if (isUnique(p)) {
        // unique edition — never more than 1 in the cart
        if (!line) cart.push({ id, qty: 1 });
      } else if (line) {
        line.qty = Math.min(line.qty + qty, qtyCap(p));
      } else {
        cart.push({ id, qty: Math.max(1, Math.min(qty, qtyCap(p))) });
      }
      emitCart();
    },
    setQty(id, qty) {
      const p = Store.get(id);
      const line = cart.find((l) => l.id === id);
      if (!line) return;
      line.qty = Math.max(1, Math.min(qty, qtyCap(p)));   // pièce unique → cap 1
      emitCart();
    },
    // Plafond de quantité d'un produit (stepper / clamps UI).
    qtyCap: (id) => qtyCap(Store.get(id)),
    remove(id) { cart = cart.filter((l) => l.id !== id); emitCart(); },
    clear() { cart = []; emitCart(); },
    // Keep the cart consistent with the live catalogue (single source of truth):
    // drop lines whose product vanished (PURGE destructif), then clamp surviving
    // lines to their cap. Returns the removed lines so the UI can notify the
    // shopper. À N'APPELER que catalogue confirmé chargé (la purge ne doit pas
    // s'exécuter pendant un chargement / sur un catalogue absent).
    reconcile() {
      let changed = false; const removed = [];
      cart = cart.filter((l) => {
        if (!Store.get(l.id)) { removed.push(l); changed = true; return false; }
        return true;
      });
      if (clampCartLines()) changed = true;        // pièce unique → 1, stock/maxQty sinon
      if (changed) emitCart();
      return removed;
    },
    // Clamp SEUL (non destructif) — sans purge des lignes disparues. Utilisé
    // pendant le chargement du catalogue pour borner les quantités (montant
    // affiché = montant débité) sans vider le panier sur une panne transitoire.
    clampQuantities() {
      const changed = clampCartLines();
      if (changed) emitCart();
      return changed;
    },
    subscribe(fn) { cartListeners.add(fn); return () => cartListeners.delete(fn); },
  };

  // Cart self-heals whenever the catalogue changes (admin edit, WooCommerce
  // refresh, cross-tab delete) — a stale line can never reach render and crash.
  Store.subscribe(function () {
    // Catalogue vide (première charge, aucun produit connu) : rien à faire.
    if (PRODUCTS.length === 0) return;
    // Chargement en cours : clamp NON destructif uniquement. On borne les
    // quantités (pièce unique / stock) pour que le montant affiché colle au
    // montant réellement débité, MAIS on ne purge pas les lignes d'un produit
    // momentanément absent — une panne transitoire (Woo injoignable) ne doit
    // jamais vider le panier du client. La purge attend la confirmation du
    // catalogue.
    if (wpStatus.state === 'loading') { Cart.clampQuantities(); return; }
    Cart.reconcile();
  });

  // CONTRAT inter-agents : window.LC151.cartSavings(items) — total économisé
  // sur les lignes en promo, somme des (oldPrice - price) * qty. Même logique
  // que cartSavings() de Cart.jsx : ne compte que les lignes dont le produit
  // existe encore et dont oldPrice dépasse STRICTEMENT le prix courant. Gardes
  // Number.isFinite (oldPrice / price / qty : oldPrice peut être null, absent,
  // ou repassé sous le prix après une mise à jour catalogue). Arrondi au centime.
  // Checkout.jsx et Cart.jsx la CONSOMMENT (fallback défensif) au lieu de recalculer.
  function cartSavings(items) {
    if (!Array.isArray(items)) return 0;
    let total = 0;
    items.forEach((line) => {
      if (!line) return;
      const p = Store.get(line.id);
      if (!p) return;
      const old = Number(p.oldPrice);
      const now = Number(p.price);
      const qty = Number(line.qty);
      if (Number.isFinite(old) && Number.isFinite(now) && Number.isFinite(qty) && old > now) {
        total += (old - now) * qty;
      }
    });
    return Math.round(total * 100) / 100;
  }

  // ---- Favoris (cœur sur cartes / fiches produit) ----
  // Même modèle que les autres stores : localStorage + Set de listeners + emit.
  // Ids inconnus TOLÉRÉS (produit disparu du catalogue) : ils sont filtrés à
  // l'affichage par les consommateurs, jamais ici.
  const K_FAVS = 'lc151_favs';
  const toIdArray = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
  let favs = toIdArray(load(K_FAVS, []));
  const favListeners = new Set();
  function emitFavs() { save(K_FAVS, favs); favListeners.forEach((fn) => fn()); }
  const Favorites = {
    all: () => favs.slice(),
    has: (id) => favs.indexOf(id) !== -1,
    toggle(id) {
      if (!id) return;
      if (favs.indexOf(id) !== -1) favs = favs.filter((f) => f !== id);
      else favs = favs.concat([id]);
      emitFavs();
    },
    subscribe(fn) { favListeners.add(fn); return () => favListeners.delete(fn); },
  };

  // ---- Vu récemment (fiches produit consultées, max 8) ----
  const K_RECENT = 'lc151_recent';
  const RECENT_MAX = 8;
  let recent = toIdArray(load(K_RECENT, [])).slice(0, RECENT_MAX);
  const recentListeners = new Set();
  function emitRecent() { save(K_RECENT, recent); recentListeners.forEach((fn) => fn()); }
  const Recent = {
    all: () => recent.slice(),   // du plus récent au plus ancien
    add(id) {
      if (!id) return;
      recent = [id].concat(recent.filter((r) => r !== id)).slice(0, RECENT_MAX);
      emitRecent();
    },
    subscribe(fn) { recentListeners.add(fn); return () => recentListeners.delete(fn); },
  };

  // Sync inter-onglets — même mécanique que la synchro admin → boutique plus haut.
  // L'event `storage` ne se déclenche que dans les AUTRES onglets → pas de boucle.
  window.addEventListener('storage', (e) => {
    // Panier : sans ça, l'onglet A ajoute un article, l'onglet B (panier mémoire
    // périmé) sauvegarde par-dessus et écrase l'article de A (last-writer-wins,
    // perte d'article). On recharge le panier, on notifie, puis on réconcilie
    // « si pertinent » : mêmes gardes que Store.subscribe — clamp seul pendant un
    // chargement, reconcile complet une fois le catalogue prêt, jamais de purge
    // sur catalogue absent (anti-vidage de panier préservé).
    if (e.key === K_CART) {
      const next = load(K_CART, []);
      cart = Array.isArray(next) ? next : [];
      cartListeners.forEach((fn) => fn());
      if (PRODUCTS.length > 0) {
        if (wpStatus.state === 'loading') Cart.clampQuantities(); else Cart.reconcile();
      }
    }
    if (e.key === K_FAVS) { favs = toIdArray(load(K_FAVS, [])); favListeners.forEach((fn) => fn()); }
    if (e.key === K_RECENT) { recent = toIdArray(load(K_RECENT, [])).slice(0, RECENT_MAX); recentListeners.forEach((fn) => fn()); }
  });

  const FREE_SHIP = 100;

  // ---- Auth (compte client) ----
  const K_USER = 'lc151_user';
  const K_ALERTS = 'lc151_alerts';
  let user = load(K_USER, null);
  const authListeners = new Set();
  function emitAuth() { authListeners.forEach((fn) => fn()); }

  // Appel commun aux actions de compte. Renvoie TOUJOURS { ok, error } : une
  // erreur réseau et un refus serveur se traitent de la même façon côté écran,
  // et l'appelant ne peut pas oublier de gérer l'échec.
  async function postAccount(action, body) {
    try {
      const r = await fetch('/api/account/' + action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body || {}),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) return { ok: false, error: (j && j.error) || 'Opération impossible pour le moment.' };
      return { ok: true, error: null };
    } catch (e) {
      return { ok: false, error: 'Erreur réseau — vérifiez votre connexion.' };
    }
  }

  // Le compte vit désormais CÔTÉ SERVEUR (cookie de session signé + clients
  // WooCommerce). localStorage n'est plus qu'un cache d'affichage : il évite un
  // clignotement « déconnecté » au chargement, mais il ne fait plus autorité.
  // Auparavant, Auth.login(email) suffisait à se déclarer connecté — sans mot de
  // passe et sans la moindre vérification.
  const Auth = {
    user: () => user,
    isLoggedIn: () => !!user,

    // Inscription : crée le compte ET ouvre la session dans la foulée — le
    // client n'a pas à se reconnecter juste après s'être inscrit.
    async register(email, password) {
      const r = await postAccount('register', { email: email, password: password });
      if (r.ok) await Auth.hydrate();
      return r;
    },

    // Connexion. Renvoie { ok, error } — l'appelant DOIT afficher l'échec.
    async login(email, password) {
      const r = await postAccount('login', { email: email, password: password });
      if (r.ok) await Auth.hydrate();
      return r;
    },

    // Mot de passe oublié : WordPress envoie son e-mail de réinitialisation.
    // Réponse volontairement identique que l'adresse existe ou non.
    async forgot(email) {
      return postAccount('forgot', { email: email });
    },

    // Relit la session auprès du serveur : au chargement de chaque page et au
    // retour du lien magique.
    async hydrate() {
      try {
        const r = await fetch('/api/account/me', { credentials: 'same-origin' });
        if (!r.ok) return;                       // 503 (non configuré) → on garde l'état courant
        const j = await r.json().catch(() => null);
        if (!j || j.ok !== true) return;
        if (j.loggedIn && j.customer) {
          const c = j.customer;
          const full = ((c.firstName || '') + ' ' + (c.lastName || '')).trim();
          user = {
            email: c.email,
            name: full || String(c.email || '').split('@')[0],
            address: { name: full, addr: c.addr, zip: c.zip, city: c.city, phone: c.phone },
            server: true,
          };
          save(K_USER, user);
        } else if (user) {
          // Le serveur dit « personne » : session expirée ou compte supprimé. On
          // purge le cache local plutôt que d'afficher un compte fantôme dont
          // plus aucune action ne fonctionnerait.
          user = null;
          try { localStorage.removeItem(K_USER); } catch (e) {}
        }
        emitAuth();
      } catch (e) { /* hors ligne : on conserve l'affichage courant */ }
    },

    async logout() {
      // L'affichage est vidé tout de suite (le clic doit répondre), puis on
      // ferme la session serveur — c'est elle qui fait foi.
      user = null;
      try { localStorage.removeItem(K_USER); } catch (e) {}
      emitAuth();
      try {
        await fetch('/api/account/logout', { method: 'POST', credentials: 'same-origin' });
      } catch (e) { console.warn('[lc151] déconnexion serveur injoignable'); }
    },
    // Écrit l'adresse dans la fiche client WooCommerce. Renvoie { ok, error } —
    // l'affichage local est mis à jour tout de suite, mais un échec serveur doit
    // remonter : sinon le client croirait son adresse enregistrée alors qu'elle
    // aurait disparu au prochain appareil.
    async setAddress(addr) {
      if (!user) return { ok: false, error: 'Connectez-vous pour enregistrer votre adresse.' };
      user = { ...user, address: addr };
      save(K_USER, user); emitAuth();
      try {
        const r = await fetch('/api/account/address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(addr || {}),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.ok) return { ok: false, error: (j && j.error) || 'Adresse non enregistrée côté boutique.' };
        return { ok: true, error: null };
      } catch (e) {
        return { ok: false, error: 'Erreur réseau — adresse non enregistrée.' };
      }
    },
    subscribe(fn) { authListeners.add(fn); return () => authListeners.delete(fn); },
  };

  // ---- Alerts (notifications produit — réservé aux comptes) ----
  // Curated product themes a client can watch (ETB, display, etc.) + free keywords.
  const ALERT_TOPICS = [
    { key: 'etb', label: "ETB — Coffret Dresseur d'Élite" },
    { key: 'display', label: 'Display / Boîte de boosters' },
    { key: 'coffret', label: 'Coffrets & Pokébox' },
    { key: 'booster', label: 'Boosters à l\u2019unité' },
    { key: 'graded', label: 'Cartes gradées PSA' },
    { key: 'single', label: "Cartes à l'unité" },
    { key: 'preorder', label: 'Précommandes & sorties' },
    { key: 'accessory', label: 'Accessoires' },
  ];
  // Forme validée EN PROFONDEUR, comme les favoris et « vu récemment ». load()
  // ne garantit que « c'est bien un objet » : un JSON valide mais du mauvais type
  // à l'intérieur (ex. { "topics": 5 }) passait sans bruit, puis faisait planter
  // le panneau alertes au premier alerts.topics.indexOf(...). Même garde
  // toIdArray que les autres listes d'identifiants.
  const rawAlerts = load(K_ALERTS, { topics: [], keywords: [] });
  let alerts = { topics: toIdArray(rawAlerts.topics), keywords: toIdArray(rawAlerts.keywords) };
  const alertListeners = new Set();
  function emitAlerts() { save(K_ALERTS, alerts); alertListeners.forEach((fn) => fn()); }
  const Alerts = {
    topics: () => ALERT_TOPICS,
    all: () => alerts,
    hasTopic: (key) => alerts.topics.indexOf(key) !== -1,
    toggleTopic(key) {
      const i = alerts.topics.indexOf(key);
      if (i === -1) alerts.topics.push(key); else alerts.topics.splice(i, 1);
      emitAlerts();
    },
    addKeyword(kw) {
      kw = (kw || '').trim();
      if (kw && alerts.keywords.indexOf(kw) === -1) { alerts.keywords.push(kw); emitAlerts(); }
    },
    removeKeyword(kw) {
      alerts.keywords = alerts.keywords.filter((k) => k !== kw); emitAlerts();
    },
    count: () => alerts.topics.length + alerts.keywords.length,
    subscribe(fn) { alertListeners.add(fn); return () => alertListeners.delete(fn); },
  };

  // ---- Orders (commandes passées) ----
  const K_ORDERS = 'lc151_orders';
  const K_HOOK = 'lc151_order_webhook';   // clé Web3Forms OU URL webhook (Make/Zapier/n8n…)
  let orders = load(K_ORDERS, []);
  let orderHook = '';
  try { orderHook = localStorage.getItem(K_HOOK) || ''; } catch (e) {}
  const orderListeners = new Set();

  // Envoie la commande au propriétaire dès qu'elle est passée.
  // - Si on saisit une URL (http…)  → POST JSON brut (webhook Make / Zapier / n8n / serveur).
  // - Sinon on considère que c'est une CLÉ Web3Forms (gratuit) → e-mail formaté.
  // Sans rien de configuré : ne fait rien (comportement d'avant, commande en local).
  // Envoi générique vers le webhook / la clé Web3Forms configuré(e).
  // Sert aux commandes ET aux formulaires (contact, newsletter).
  // Renvoie une PROMESSE d'envoi RÉELLEMENT abouti — pas un « j'ai lancé un
  // fetch ». L'ancienne version renvoyait true dès le fetch lancé (sans attendre
  // ni regarder le statut) : contact et newsletter annonçaient donc « message
  // envoyé » alors que rien n'était parti. Ne rejette jamais : les erreurs sont
  // converties en `false` pour que l'appelant les traite explicitement.
  async function postWebhook(jsonPayload, web3Fields) {
    const dest = (orderHook || '').trim();
    if (!dest) return false;   // aucune réception configurée → le message n'irait nulle part
    try {
      const r = /^https?:\/\//i.test(dest)
        ? await fetch(dest, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonPayload) })
        : await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.assign({ access_key: dest }, web3Fields)) });
      if (!r.ok) { console.warn('[lc151] webhook non délivré: HTTP ' + r.status); return false; }
      return true;
    } catch (err) {
      console.warn('[lc151] webhook non délivré:', err && err.message);
      return false;
    }
  }
  function notifyOrderWebhook(order) {
    const lines = (order.items || []).map(function (i) { return '- ' + i.name + ' ×' + i.qty + ' : ' + i.price + ' €'; }).join('\n');
    postWebhook(
      { source: 'club151', type: 'new_order', order: order },
      {
        subject: 'Nouvelle commande ' + order.number + ' — CLUB 151',
        from_name: 'Boutique CLUB 151',
        Commande: order.number,
        Client: (order.name || '') + ' <' + (order.email || '') + '>',
        Total: order.total + ' €',
        Livraison: order.method,
        Adresse: order.address || '—',
        Articles: '\n' + lines,
        Paiement: order.paid ? 'Payé en ligne' : 'À régler au retrait',
      }
    );
  }
  // Contact / newsletter — réutilise la même configuration de réception.
  function notifyForm(subject, fields) {
    const f = fields || {};
    return postWebhook(
      Object.assign({ source: 'club151', type: 'form', subject: subject }, f),
      Object.assign({ subject: subject + ' — CLUB 151', from_name: 'Site CLUB 151' }, f)
    );
  }
  const SHIPPING = {
    standard: { key: 'standard', label: 'Livraison standard', eta: '2–4 jours ouvrés', price: 4.9 },
    relais: { key: 'relais', label: 'Point relais', eta: '3–5 jours ouvrés', price: 3.9 },
    pickup: { key: 'pickup', label: 'Retrait en boutique (Vienne)', eta: 'Sous 24 h', price: 0 },
  };
  const Orders = {
    methods: () => SHIPPING,
    shippingCost(methodKey, subtotal) {
      const m = SHIPPING[methodKey] || SHIPPING.standard;
      if (m.key === 'pickup') return 0;
      if (subtotal >= FREE_SHIP) return 0; // livraison offerte dès 100 € (tous modes sauf retrait déjà gratuit)
      return m.price;
    },
    all: () => orders,
    // Comparaison NORMALISÉE (casse + espaces). En strict, une commande passée
    // avec « Jean@Exemple.FR » n'apparaissait pas pour le compte « jean@exemple.fr » :
    // le client lisait « aucune commande » juste après en avoir passé une. Un
    // e-mail vide ne doit rien remonter (sinon il capturerait les commandes sans e-mail).
    forUser(email) {
      const norm = (s) => String(s || '').trim().toLowerCase();
      const target = norm(email);
      if (!target) return [];
      return orders.filter((o) => norm(o.email) === target);
    },
    add(order) {
      const num = 'LC151-' + Date.now().toString(36).toUpperCase().slice(-6);
      const full = { number: num, date: new Date().toISOString(), status: 'Confirmée', ...order };
      orders.unshift(full);
      save(K_ORDERS, orders);
      orderListeners.forEach((fn) => fn());
      notifyOrderWebhook(full);   // → prévient le propriétaire (e-mail / webhook) si configuré
      return full;
    },
    // Réception des commandes (clé Web3Forms ou URL webhook), réglée dans l'admin.
    getWebhook: () => orderHook,
    setWebhook(v) {
      orderHook = (v || '').trim();
      try { if (orderHook) localStorage.setItem(K_HOOK, orderHook); else localStorage.removeItem(K_HOOK); } catch (e) {}
      orderListeners.forEach((fn) => fn());
    },
    subscribe(fn) { orderListeners.add(fn); return () => orderListeners.delete(fn); },
  };

  // Sync inter-onglets du compte client et des commandes — même mécanique que le
  // panier / les favoris. L'event `storage` ne se déclenche que dans les AUTRES
  // onglets → pas de boucle. Un onglet qui se connecte, se déconnecte, met à jour
  // son adresse (K_USER) ou passe commande (K_ORDERS) est reflété dans les onglets
  // déjà ouverts, sans écrasement last-writer-wins.
  window.addEventListener('storage', (e) => {
    if (e.key === K_USER) { user = load(K_USER, null); authListeners.forEach((fn) => fn()); }
    if (e.key === K_ORDERS) { const o = load(K_ORDERS, []); orders = Array.isArray(o) ? o : []; orderListeners.forEach((fn) => fn()); }
  });

  // URL de la fiche produit. Les produits du catalogue par défaut (« d… »)
  // ont une page statique générée au build (référencée par Google) ; les
  // autres passent par la fiche dynamique. Doit rester synchrone avec la
  // fonction slugify() de build.mjs.
  function lcSlugify(name) {
    return String(name || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }
  function productUrl(id) {
    return '/produit.html?id=' + encodeURIComponent(id);
  }

  window.LC151 = {
    PRODUCTS, FILTERS, Cart, Store, Auth, Alerts, Orders, Favorites, Recent, FREE_SHIP,
    get: (id) => Store.get(id),
    productUrl,
    fmt: (n) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €',
    notify: notifyForm,   // formulaires contact / newsletter → même réception que les commandes
    SHOP,                 // coordonnées boutique (téléphone, réseaux) — source unique, cf. plus haut
  };
  // CONTRAT inter-agents : exposé en Object.assign (consommé par Checkout.jsx /
  // Cart.jsx via fallback défensif, au lieu de recalculer les économies).
  Object.assign(window.LC151, { cartSavings: cartSavings });

  // ---- Amorçage — impérativement APRÈS toutes les déclarations ci-dessus.
  // refreshFromWp() émet sur storeListeners : l'appeler plus haut (avant la
  // déclaration de storeListeners) plantait toute l'IIFE (ReferenceError TDZ)
  // et laissait le site blanc, window.LC151 restant indéfini.
  rebuild();
  refreshFromWp();

  // Session serveur : le cookie fait autorité, pas le localStorage. On relit à
  // chaque chargement — ainsi une session expirée ou fermée depuis un autre
  // appareil cesse d'afficher un compte connecté.
  if (typeof fetch !== 'undefined' && typeof location !== 'undefined' && /^https?:/.test(location.protocol)) {
    Auth.hydrate();
    // Retour du lien magique (/api/account/verify redirige avec ce paramètre).
    // Le motif est retiré de l'URL après lecture : sans ça, un rafraîchissement
    // ou un partage du lien réafficherait indéfiniment le même message.
    try {
      const state = new URLSearchParams(location.search).get('connexion');
      if (state) {
        window.LC151_CONNEXION = state;         // lu par Chrome.jsx à l'affichage
        const clean = new URL(location.href);
        clean.searchParams.delete('connexion');
        history.replaceState(null, '', clean.pathname + clean.search + clean.hash);
      }
    } catch (e) {}
  }
})();

/* ---- Bandeau cookies (RGPD) — léger, sans dépendance ----
   S'affiche tant que le visiteur n'a pas choisi. Le choix est mémorisé.
   Ne s'affiche pas dans le back-office (admin.html). */
(function () {
  var K = 'lc151_cookie_consent';
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    try {
      if (document.getElementById('admin-root')) return;       // pas dans l'admin
      if (localStorage.getItem(K)) return;                     // choix déjà fait
    } catch (e) {}
    var bar = document.createElement('div');
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Gestion des cookies');
    bar.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:9999;width:min(680px,calc(100% - 24px));background:var(--card,#fff);color:var(--ink,#1a1a1a);border:1.5px solid var(--line-strong,#ddd);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.18);padding:16px 18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;font-family:system-ui,sans-serif';
    bar.innerHTML =
      '<div style="flex:1;min-width:220px;font-size:13.5px;line-height:1.5">' +
        'Nous utilisons des cookies pour le bon fonctionnement du site (panier, session), ainsi qu’une mesure d’audience anonyme et sans cookie. ' +
        '<a href="confidentialite.html" style="color:var(--accent,#3363A9);font-weight:600">En savoir plus</a>.' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-shrink:0">' +
        '<button data-lc-cookie="refuse" style="height:38px;padding:0 14px;border-radius:8px;border:1.5px solid var(--line-strong,#ccc);background:transparent;color:var(--ink,#1a1a1a);font-weight:600;font-size:13.5px;cursor:pointer">Refuser</button>' +
        '<button data-lc-cookie="accept" style="height:38px;padding:0 16px;border-radius:8px;border:none;background:var(--accent,#3363A9);color:var(--on-accent,#fff);font-weight:600;font-size:13.5px;cursor:pointer">Accepter</button>' +
      '</div>';
    function choose(v) { try { localStorage.setItem(K, v); } catch (e) {} bar.remove(); }
    bar.addEventListener('click', function (e) {
      var t = e.target.getAttribute && e.target.getAttribute('data-lc-cookie');
      if (t) choose(t);
    });
    document.body.appendChild(bar);
  });
})();

/* ---- Mesure d'audience Vercel (anonyme, sans cookie) ----
   Activez « Web Analytics » dans votre projet Vercel (gratuit) pour voir les
   visites. Si ce n'est pas activé, le script est simplement ignoré. */
(function () {
  try {
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    var s = document.createElement('script');
    s.defer = true;
    s.src = '/_vercel/insights/script.js';
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();

/* ---- En-tête : légère ombre quand on défile (voir storefront2.css) ---- */
(function () {
  function onScroll() {
    if (window.scrollY > 8) document.body.classList.add('lc-scrolled');
    else document.body.classList.remove('lc-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (document.readyState !== 'loading') onScroll();
  else document.addEventListener('DOMContentLoaded', onScroll);
})();
