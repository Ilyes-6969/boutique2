/* leclub151 — storefront data + cart + editable Store
   Catalogue is EMPTY by default. Real products are managed in WordPress /
   WooCommerce; nothing is hard-coded here. The owner can also add products
   from the back-office (admin.html), which persist to localStorage. */
(function () {
  // ---- Catalogue ----
  // Demo products across every category for testing. Replace with your real
  // catalogue via WordPress / WooCommerce (admin.html) — these disappear once
  // a WooCommerce site is connected and returns products.
  // Images de cartes via le CDN pokemontcg.io (le même que les logos de sets
  // ci-dessous) — une seule source d'images, fiable, pour tout le catalogue.
  const img = (set, n) => `https://images.pokemontcg.io/${set}/${n}.png`;
  const DEFAULTS = [
    // ----- Cartes à l'unité -----
    { id: 'd1', name: 'Dracaufeu — Set de Base', set: 'Set de Base · 1999', num: '4/102', type: 'single',
      cat: "Carte à l'unité", price: 1890, image: img('base1', 4), rarity: 'Rare Holo', inStock: true, unique: true,
      desc: "Dracaufeu holographique du Set de Base, édition 1999. État Near Mint, centrage excellent." },
    { id: 'd2', name: 'Tortank Holo', set: 'Set de Base · 1999', num: '2/102', type: 'single',
      cat: "Carte à l'unité", price: 329.9, image: img('base1', 2), rarity: 'Rare Holo', inStock: true, unique: true,
      desc: "Tortank holographique, Set de Base. Near Mint." },
    { id: 'd3', name: 'Pikachu — Joues Rouges', set: 'Set de Base · 1999', num: '58/102', type: 'single',
      cat: "Carte à l'unité", price: 54.9, image: img('base1', 58), rarity: 'Common', inStock: true, unique: true,
      badge: { tone: 'new', label: 'Nouveau' }, desc: "Pikachu « joues rouges », variante recherchée du Set de Base." },
    // ----- Cartes gradées -----
    { id: 'd4', name: 'Dracaufeu — Gradée PSA 10', set: 'Set de Base · 1999', num: '4/102', type: 'graded',
      cat: 'Carte gradée', price: 8900, image: img('base1', 4), rarity: 'Gem Mint', inStock: true, unique: true,
      badge: { tone: 'graded', label: 'PSA 10' }, desc: "Dracaufeu Set de Base certifié PSA 10 Gem Mint. Sous coque, scellé." },
    { id: 'd5', name: 'Mewtwo Holo — Gradée PSA 9', set: 'Set de Base · 1999', num: '10/102', type: 'graded',
      cat: 'Carte gradée', price: 460, image: img('base1', 10), rarity: 'Mint', inStock: true, unique: true,
      badge: { tone: 'graded', label: 'PSA 9' }, desc: "Mewtwo holographique certifié PSA 9 Mint." },
    // ----- Scellé : ETB, display, coffret, booster -----
    { id: 'd6', name: "ETB — Pokémon 151", set: 'Écarlate & Violet · 151', num: 'sv3.5', type: 'sealed',
      cat: "Coffret Dresseur d'Élite", price: 64.9, image: 'https://images.pokemontcg.io/sv3pt5/logo.png', glyph: 'ETB', inStock: true,
      badge: { tone: 'new', label: 'Nouveau' }, desc: "Coffret Dresseur d'Élite Pokémon 151. Scellé, version française. 9 boosters + accessoires." },
    { id: 'd7', name: "Display — Étincelles Déferlantes", set: 'EV8 · Scellé FR', num: '36 boosters', type: 'sealed',
      cat: 'Boîte de boosters', price: 209.9, image: 'https://images.pokemontcg.io/sv8/logo.png', glyph: 'DISPLAY', inStock: true,
      desc: "Display scellé Étincelles Déferlantes (EV8), 36 boosters, version française." },
    { id: 'd8', name: "Coffret — Évolutions Prismatiques", set: 'EV8.5 · FR', num: 'Collection', type: 'sealed',
      cat: 'Coffret', price: 39.9, image: 'https://images.pokemontcg.io/sv8pt5/logo.png', glyph: 'COFFRET', inStock: true,
      desc: "Coffret Collection Évolutions Prismatiques, scellé, version française." },
    { id: 'd9', name: "Booster — Flammes Obsidiennes", set: 'EV3 · FR', num: 'x1', type: 'sealed',
      cat: 'Booster', price: 5.5, image: 'https://images.pokemontcg.io/sv3/logo.png', glyph: 'BOOSTER', inStock: false,
      desc: "Booster scellé Flammes Obsidiennes (EV3), 10 cartes, version française." },
    // ----- Accessoires -----
    { id: 'd10', name: 'Sleeves Ultra Pro — Pack 100', set: 'Ultra Pro · Matte', num: 'x100', type: 'accessory',
      cat: 'Protège-cartes', price: 9.9, image: 'assets/acc-sleeves.svg', glyph: 'SLEEVES', inStock: true,
      desc: "100 protège-cartes Ultra Pro finition matte, format standard." },
    { id: 'd11', name: 'Classeur 360 cartes', set: 'Ultimate Guard', num: '360', type: 'accessory',
      cat: 'Classeur', price: 24.9, image: 'assets/acc-binder.svg', glyph: 'CLASSEUR', inStock: true,
      desc: "Classeur 360 cartes à fermeture zip, pochettes Side-Loading." },
    // ----- Précommandes -----
    { id: 'd12', name: "Display — Couronne Stellaire", set: 'Sortie 10-10-2026 · FR', num: '36 boosters', type: 'sealed',
      cat: 'Boîte de boosters', price: 219.9, image: 'https://images.pokemontcg.io/sv7/logo.png', glyph: 'DISPLAY', inStock: true, preorder: true,
      badge: { tone: 'sale', label: 'Précommande' }, desc: "Display scellé Couronne Stellaire. Précommande — expédié à la sortie le 10/10/2026." },
    { id: 'd13', name: "ETB — Mascarade Crépusculaire", set: 'Sortie 28-08-2026 · FR', num: 'Dresseur d’Élite', type: 'sealed',
      cat: "Coffret Dresseur d'Élite", price: 54.9, image: 'https://images.pokemontcg.io/sv6/logo.png', glyph: 'ETB', inStock: true, preorder: true,
      badge: { tone: 'sale', label: 'Précommande' }, desc: "Coffret Dresseur d'Élite Mascarade Crépusculaire. Précommande." },
    // ===== Cartes à l'unité (suite) =====
    { id: 'd14', name: 'Venusaur Holo — Set de Base', set: 'Set de Base · 1999', num: '15/102', type: 'single',
      cat: "Carte à l'unité", price: 279.9, image: img('base1', 15), rarity: 'Rare Holo', inStock: true, unique: true,
      desc: "Florizarre holographique du Set de Base. Near Mint." },
    { id: 'd15', name: 'Alakazam Holo — Set de Base', set: 'Set de Base · 1999', num: '1/102', type: 'single',
      cat: "Carte à l'unité", price: 119.9, image: img('base1', 1), rarity: 'Rare Holo', inStock: true, unique: true,
      desc: "Alakazam holographique, première carte du Set de Base." },
    { id: 'd16', name: 'Zapdos Holo — Set de Base', set: 'Set de Base · 1999', num: '16/102', type: 'single',
      cat: "Carte à l'unité", price: 99.9, image: img('base1', 16), rarity: 'Rare Holo', inStock: true, unique: true,
      desc: "Électhor holographique du Set de Base. Légendaire électrik." },
    { id: 'd17', name: 'Machamp Holo — Set de Base', set: 'Set de Base · 1999', num: '8/102', type: 'single',
      cat: "Carte à l'unité", price: 44.9, oldPrice: 59.9, image: img('base1', 8), rarity: 'Rare Holo', inStock: true, unique: true,
      badge: { tone: 'sale', label: 'Promo' }, desc: "Mackogneur holographique, édition 1er Set de Base." },
    { id: 'd18', name: 'Raichu Holo — Set de Base', set: 'Set de Base · 1999', num: '14/102', type: 'single',
      cat: "Carte à l'unité", price: 69.9, image: img('base1', 14), rarity: 'Rare Holo', inStock: true, unique: true,
      desc: "Raichu holographique du Set de Base. Near Mint." },
    { id: 'd19', name: 'Gyarados Holo — Set de Base', set: 'Set de Base · 1999', num: '6/102', type: 'single',
      cat: "Carte à l'unité", price: 74.9, image: img('base1', 6), rarity: 'Rare Holo', inStock: true, unique: true,
      desc: "Léviator holographique, Set de Base 1999." },
    // ===== Cartes gradées (suite) =====
    { id: 'd20', name: 'Venusaur — Gradée PSA 8', set: 'Set de Base · 1999', num: '15/102', type: 'graded',
      cat: 'Carte gradée', price: 690, image: img('base1', 15), rarity: 'NM-MT', inStock: true, unique: true,
      badge: { tone: 'graded', label: 'PSA 8' }, desc: "Florizarre Set de Base certifié PSA 8. Sous coque." },
    { id: 'd21', name: 'Blastoise — Gradée PSA 9', set: 'Set de Base · 1999', num: '2/102', type: 'graded',
      cat: 'Carte gradée', price: 1290, image: img('base1', 2), rarity: 'Mint', inStock: true, unique: true,
      badge: { tone: 'graded', label: 'PSA 9' }, desc: "Tortank Set de Base certifié PSA 9 Mint." },
    { id: 'd22', name: 'Zapdos — Gradée PSA 9', set: 'Set de Base · 1999', num: '16/102', type: 'graded',
      cat: 'Carte gradée', price: 540, image: img('base1', 16), rarity: 'Mint', inStock: false, unique: true,
      badge: { tone: 'graded', label: 'PSA 9' }, desc: "Électhor Set de Base certifié PSA 9 Mint." },
    // ===== Scellé (suite) =====
    { id: 'd23', name: "ETB — Couronne Stellaire", set: 'EV7 · Scellé FR', num: "Dresseur d'Élite", type: 'sealed',
      cat: "Coffret Dresseur d'Élite", price: 49.9, image: 'https://images.pokemontcg.io/sv7/logo.png', glyph: 'ETB', inStock: true,
      desc: "Coffret Dresseur d'Élite Couronne Stellaire, scellé FR." },
    { id: 'd24', name: "Display — Forces Temporelles", set: 'EV5 · Scellé FR', num: '36 boosters', type: 'sealed',
      cat: 'Boîte de boosters', price: 199.9, image: 'https://images.pokemontcg.io/sv5/logo.png', glyph: 'DISPLAY', inStock: true,
      desc: "Display scellé Forces Temporelles (EV5), 36 boosters, FR." },
    { id: 'd25', name: "Coffret — Destinées de Paldea", set: 'EV4.5 · FR', num: 'Collection', type: 'sealed',
      cat: 'Coffret', price: 34.9, oldPrice: 44.9, image: 'https://images.pokemontcg.io/sv4pt5/logo.png', glyph: 'COFFRET', inStock: true,
      badge: { tone: 'sale', label: 'Promo' }, desc: "Coffret Collection Destinées de Paldea, scellé FR." },
    // ===== Accessoires (suite) =====
    { id: 'd26', name: 'Toploaders — Pack 25', set: 'Ultra Pro · Rigide', num: 'x25', type: 'accessory',
      cat: 'Protection rigide', price: 6.9, image: 'assets/acc-toploader.svg', glyph: 'TOPLOADER', inStock: true,
      desc: "25 toploaders rigides Ultra Pro, format standard." },
    { id: 'd27', name: 'Tapis de jeu — Pokéball', set: 'Playmat · Néoprène', num: '60×35 cm', type: 'accessory',
      cat: 'Tapis de jeu', price: 19.9, image: 'assets/acc-playmat.svg', glyph: 'TAPIS', inStock: true,
      desc: "Tapis de jeu néoprène anti-dérapant, motif Pokéball." },
  ];

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

  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  // ---- WordPress / WooCommerce ----
  // Reads the public WooCommerce Store API (no key needed):
  //   GET {site}/wp-json/wc/store/v1/products
  // Set the site URL in the back-office (admin.html) → « Connexion WordPress ».
  let wpUrl = '';
  try { wpUrl = localStorage.getItem(K_WP) || ''; } catch (e) {}
  let wpProducts = [];
  let wpStatus = { state: wpUrl ? 'loading' : 'off', count: 0, error: '' }; // off|loading|ok|error

  function typeFromCategories(cats) {
    const s = (cats || []).map((c) => (c.name || '').toLowerCase()).join(' ');
    if (/grad|psa|bgs|cgc/.test(s)) return 'graded';
    if (/scell|display|booster|coffret|etb|box|boîte/.test(s)) return 'sealed';
    if (/accessoir|sleeve|protège|classeur|toploader|tapis|deck box/.test(s)) return 'accessory';
    return 'single';
  }

  function mapWoo(p) {
    const minor = (p.prices && p.prices.currency_minor_unit != null) ? p.prices.currency_minor_unit : 2;
    const div = Math.pow(10, minor);
    const price = p.prices && p.prices.price != null ? Number(p.prices.price) / div : 0;
    const regular = p.prices && p.prices.regular_price != null ? Number(p.prices.regular_price) / div : price;
    const onSale = !!p.on_sale && regular > price;
    const cat = (p.categories && p.categories[0] && p.categories[0].name) || 'Carte';
    const img = (p.images && p.images[0] && p.images[0].src) || null;
    const strip = (html) => (html || '').replace(/<[^>]*>/g, '').trim();
    return {
      id: 'wp' + p.id,
      name: p.name,
      cat: cat,
      set: cat,
      num: p.sku || '—',
      type: typeFromCategories(p.categories),
      price: Math.round(price * 100) / 100,
      oldPrice: onSale ? Math.round(regular * 100) / 100 : undefined,
      image: img,
      inStock: p.is_in_stock !== false,
      badge: p.on_sale ? { tone: 'sale', label: 'Promo' } : undefined,
      rarity: '—',
      desc: strip(p.short_description) || strip(p.description),
      wp: true,
    };
  }

  function refreshFromWp() {
    if (!wpUrl) { wpProducts = []; wpStatus = { state: 'off', count: 0, error: '' }; rebuild(); emitStore(); return; }
    wpStatus = { state: 'loading', count: 0, error: '' };
    rebuild();            // drop demo data immediately → show loading, never demo cards
    emitStore();
    const base = wpUrl.replace(/\/+$/, '');
    fetch(base + '/wp-json/wc/store/v1/products?per_page=100')
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((list) => {
        wpProducts = (Array.isArray(list) ? list : []).map(mapWoo);
        wpStatus = { state: 'ok', count: wpProducts.length, error: '' };
        rebuild(); emitStore();
      })
      .catch((err) => {
        wpProducts = [];
        wpStatus = { state: 'error', count: 0, error: String(err.message || err) };
        rebuild(); emitStore();
      });
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
    const base = wpUrl ? wpProducts : DEFAULTS;
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
  rebuild();
  if (wpUrl) refreshFromWp();

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

  // A single card or a graded card is a one-of-one: only ONE edition exists.
  function isUnique(p) { return !!p && (p.unique === true || p.type === 'single' || p.type === 'graded'); }

  // ---- Cart store ----
  const cartListeners = new Set();
  const K_CART = 'lc151_cart';
  let cart = load(K_CART, []);
  function emitCart() { save(K_CART, cart); cartListeners.forEach((fn) => fn()); }
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
      } else if (line) { line.qty += qty; } else { cart.push({ id, qty }); }
      emitCart();
    },
    setQty(id, qty) {
      const p = Store.get(id);
      const line = cart.find((l) => l.id === id);
      if (line) { line.qty = isUnique(p) ? 1 : Math.max(1, qty); emitCart(); }
    },
    remove(id) { cart = cart.filter((l) => l.id !== id); emitCart(); },
    clear() { cart = []; emitCart(); },
    // Keep the cart consistent with the live catalogue (single source of truth):
    // drop lines whose product vanished, clamp unique lines to qty 1. Returns the
    // removed lines so the UI can notify the shopper.
    reconcile() {
      let changed = false; const removed = [];
      cart = cart.filter((l) => {
        if (!Store.get(l.id)) { removed.push(l); changed = true; return false; }
        return true;
      });
      cart.forEach((l) => { if (isUnique(Store.get(l.id)) && l.qty !== 1) { l.qty = 1; changed = true; } });
      if (changed) emitCart();
      return removed;
    },
    subscribe(fn) { cartListeners.add(fn); return () => cartListeners.delete(fn); },
  };

  // Cart self-heals whenever the catalogue changes (admin edit, WooCommerce
  // refresh, cross-tab delete) — a stale line can never reach render and crash.
  Store.subscribe(function () { Cart.reconcile(); });

  const FREE_SHIP = 100;

  // ---- Auth (compte client) ----
  const K_USER = 'lc151_user';
  const K_ALERTS = 'lc151_alerts';
  let user = load(K_USER, null);
  const authListeners = new Set();
  const Auth = {
    user: () => user,
    isLoggedIn: () => !!user,
    login(email, name) {
      user = { email: email, name: name || (email ? email.split('@')[0] : 'Client') };
      save(K_USER, user); authListeners.forEach((fn) => fn());
    },
    logout() {
      user = null;
      try { localStorage.removeItem(K_USER); } catch (e) {}
      authListeners.forEach((fn) => fn());
    },
    setAddress(addr) {
      if (!user) return;
      user = { ...user, address: addr };
      save(K_USER, user); authListeners.forEach((fn) => fn());
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
  let alerts = load(K_ALERTS, { topics: [], keywords: [] });
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
  function postWebhook(jsonPayload, web3Fields) {
    const dest = (orderHook || '').trim();
    if (!dest) return false;
    try {
      if (/^https?:\/\//i.test(dest)) {
        fetch(dest, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonPayload) }).catch(function () {});
      } else {
        fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.assign({ access_key: dest }, web3Fields)) }).catch(function () {});
      }
      return true;
    } catch (e) { return false; }
  }
  function notifyOrderWebhook(order) {
    const lines = (order.items || []).map(function (i) { return '- ' + i.name + ' ×' + i.qty + ' : ' + i.price + ' €'; }).join('\n');
    postWebhook(
      { source: 'leclub151', type: 'new_order', order: order },
      {
        subject: 'Nouvelle commande ' + order.number + ' — leclub151',
        from_name: 'Boutique leclub151',
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
      Object.assign({ source: 'leclub151', type: 'form', subject: subject }, f),
      Object.assign({ subject: subject + ' — leclub151', from_name: 'Site leclub151' }, f)
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
    forUser(email) { return orders.filter((o) => o.email === email); },
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
    const p = Store.get(id);
    if (p && /^d\d+$/.test(String(id))) return '/produits/' + lcSlugify(p.name) + '-' + id + '.html';
    return '/produit.html?id=' + encodeURIComponent(id);
  }

  window.LC151 = {
    PRODUCTS, FILTERS, Cart, Store, Auth, Alerts, Orders, FREE_SHIP,
    get: (id) => Store.get(id),
    productUrl,
    fmt: (n) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €',
    notify: notifyForm,   // formulaires contact / newsletter → même réception que les commandes
  };
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
        '<a href="confidentialite.html" style="color:var(--accent,#ee1515);font-weight:600">En savoir plus</a>.' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-shrink:0">' +
        '<button data-lc-cookie="refuse" style="height:38px;padding:0 14px;border-radius:8px;border:1.5px solid var(--line-strong,#ccc);background:transparent;color:var(--ink,#1a1a1a);font-weight:600;font-size:13.5px;cursor:pointer">Refuser</button>' +
        '<button data-lc-cookie="accept" style="height:38px;padding:0 16px;border-radius:8px;border:none;background:var(--accent,#ee1515);color:var(--on-accent,#fff);font-weight:600;font-size:13.5px;cursor:pointer">Accepter</button>' +
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
