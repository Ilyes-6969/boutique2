/* CLUB 151 — shared chrome: Logo, Announcement, Header, Footer, ProductStage, useCart */

/* Couleurs du logo selon le thème (clair = doré lisible sur fond blanc ;
   sombre = jaune néon + halo, comme l'enseigne). Injecté une seule fois. */
(function () {
  if (typeof document === 'undefined') return;
  if (document.getElementById('lc-logo-theme')) return;
  var s = document.createElement('style');
  s.id = 'lc-logo-theme';
  s.textContent =
    ':root{--logo-fill:#FFFFFF;--logo-edge:rgba(0,0,0,.32);--logo-btn:#FFFFFF;--logo-glow:none}' +
    '[data-theme="dark"]{--logo-fill:#4F93FF;--logo-edge:#16335C;--logo-btn:#CFE2FF;' +
    '--logo-glow:drop-shadow(0 0 4px rgba(79,147,255,.55))}' +
    '.lc-logo-mark{filter:var(--logo-glow)}';
  (document.head || document.documentElement).appendChild(s);
})();

function useCart() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => window.LC151.Cart.subscribe(force), []);
  return window.LC151.Cart;
}

function useStore() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => window.LC151.Store.subscribe(force), []);
  return window.LC151.Store;
}

/* Favoris persistants (data.js) — même modèle que useCart, mais défensif :
   renvoie null si le store Favorites n'est pas chargé (le cœur est alors masqué). */
function useFavorites() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const F = window.LC151 && window.LC151.Favorites;
    if (!F || typeof F.subscribe !== 'function') return undefined;
    return F.subscribe(force);
  }, []);
  return (window.LC151 && window.LC151.Favorites) || null;
}

function useAuth() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => window.LC151.Auth.subscribe(force), []);
  return window.LC151.Auth;
}

function useAlerts() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => window.LC151.Alerts.subscribe(force), []);
  return window.LC151.Alerts;
}

let _lcAudioCtx = null;
function lcPlayPop() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_lcAudioCtx) _lcAudioCtx = new AC();
    const ctx = _lcAudioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    // two-note bright "blip" — game-pickup feel
    const notes = [[880, 0], [1320, 0.08]];
    notes.forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + delay + 0.06);
      gain.gain.setValueAtTime(0.0001, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.16, t + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t + delay); osc.stop(t + delay + 0.14);
    });
  } catch (e) {}
}

function lcFlyToCart(fromEl) {
  lcPlayPop();
  try {
    // Respecte prefers-reduced-motion, comme lcBump / lc-reveal / theme-fx : on
    // saute la Pokéball volante (grand déplacement à l'écran) pour qui a demandé
    // moins d'animations. L'ajout au panier reste effectif ; seul l'effet tombe.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cartBtn = document.querySelector('[data-cart-btn]');
    if (!cartBtn || !fromEl) return;
    const a = fromEl.getBoundingClientRect();
    const b = cartBtn.getBoundingClientRect();
    const startX = a.left + a.width / 2, startY = a.top + a.height / 2;
    const endX = b.left + b.width / 2, endY = b.top + b.height / 2;
    const ball = document.createElement('div');
    ball.setAttribute('aria-hidden', 'true');
    ball.style.cssText = 'position:fixed;left:' + (startX - 16) + 'px;top:' + (startY - 16) + 'px;width:32px;height:32px;z-index:9998;pointer-events:none;will-change:transform,opacity;transition:transform 0.62s cubic-bezier(0.5,-0.25,0.3,1),opacity 0.62s ease;filter:drop-shadow(0 6px 10px rgba(0,0,0,0.3));';
    ball.innerHTML = '<svg width="32" height="32" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#3363A9"/><circle cx="50" cy="50" r="47" fill="none" stroke="#1E3265" stroke-width="4"/><text x="50" y="50" text-anchor="middle" dominant-baseline="central" fill="#FACA07" style="font-family:var(--font-display);font-weight:800;font-style:italic;font-size:42px;letter-spacing:-1px">151</text></svg>';
    document.body.appendChild(ball);
    requestAnimationFrame(() => {
      ball.style.transform = 'translate(' + (endX - startX) + 'px,' + (endY - startY) + 'px) scale(0.3) rotate(540deg)';
      ball.style.opacity = '0.2';
    });
    setTimeout(() => ball.remove(), 680);
  } catch (e) {}
}

// tone='brand' → coque BLEUE (accent d'interface, aligné sur la DA CLUB 151) ;
// défaut → coque rouge, réservée au grand motif Pokéball de l'accueil. C'est le
// partage décidé pour la DA : on garde le clin d'œil Pokémon en grand format,
// mais les petites Pokéballs qui servent de puces d'interface suivent la marque
// au lieu de rappeler l'ancien rouge #EE1515.
const PB_SHELL = {
  red: ['#ff9d9d', '#ee1515', '#990b0b'],
  brand: ['#7FA8DC', '#3363A9', '#1E3265'],
};
function Pokeball({ size = 16, style, float = false, tone }) {
  const idRef = React.useRef(null);
  if (idRef.current === null) idRef.current = (window.__pbSeq = (window.__pbSeq || 0) + 1);
  const u = 'pb' + idRef.current;
  const shell = PB_SHELL[tone === 'brand' ? 'brand' : 'red'];
  return (
    <span className={'lc-pb' + (float ? ' lc-pb-float' : '')} style={{ display: 'inline-flex', flexShrink: 0, lineHeight: 0, ...style }}>
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id={u + 'r'} cx="36%" cy="27%" r="80%">
            <stop offset="0%" stopColor={shell[0]} />
            <stop offset="34%" stopColor={shell[1]} />
            <stop offset="100%" stopColor={shell[2]} />
          </radialGradient>
          <radialGradient id={u + 'w'} cx="36%" cy="80%" r="76%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f0f0f0" />
            <stop offset="100%" stopColor="#b9b9b9" />
          </radialGradient>
          <linearGradient id={u + 'b'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a4a4a" />
            <stop offset="48%" stopColor="#070707" />
            <stop offset="100%" stopColor="#242424" />
          </linearGradient>
          <radialGradient id={u + 'btn'} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="66%" stopColor="#ebebeb" />
            <stop offset="100%" stopColor="#aeaeae" />
          </radialGradient>
          <radialGradient id={u + 's'} cx="36%" cy="30%" r="72%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="56%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.42)" />
          </radialGradient>
          <clipPath id={u + 'c'}><circle cx="50" cy="50" r="47" /></clipPath>
        </defs>
        {float && <ellipse cx="50" cy="96" rx="33" ry="5" fill="rgba(0,0,0,0.20)" />}
        <g clipPath={'url(#' + u + 'c)'}>
          <rect x="0" y="0" width="100" height="53" fill={'url(#' + u + 'r)'} />
          <rect x="0" y="47" width="100" height="53" fill={'url(#' + u + 'w)'} />
          <rect x="0" y="43" width="100" height="14" fill={'url(#' + u + 'b)'} />
          <circle cx="50" cy="50" r="47" fill={'url(#' + u + 's)'} />
          <ellipse cx="33" cy="26" rx="16" ry="9" fill="rgba(255,255,255,0.5)" transform="rotate(-24 33 26)" />
        </g>
        <circle cx="50" cy="50" r="47" fill="none" stroke="#0d0d0d" strokeWidth="4" />
        <circle cx="50" cy="50" r="15.5" fill="#0d0d0d" />
        <circle cx="50" cy="50" r="11.5" fill={'url(#' + u + 'btn)'} stroke="#0d0d0d" strokeWidth="2.5" />
        <circle cx="45.5" cy="45.5" r="3.1" fill="rgba(255,255,255,0.95)" />
      </svg>
    </span>
  );
}

/* Lockup horizontal OFFICIEL CLUB 151 (assets/brand/logo-club151-horizontal.svg) :
   marque ronde bleu vif + wordmark « CLUB » bleu / « 151 » or liseré navy.
   viewBox 1820×640 (~2.844:1). Lisible tel quel sur le header/footer navy — le
   bleu vif (#0AA3EB) tient ~5:1 et l'or ~10:1 sur --header-bg ; le navy ne sert
   que de liseré sous l'or, jamais d'aplat de texte. Dimensionné par la hauteur. */
function Logo({ onClick, size = 22, mark = false }) {
  // mark=true → marque ronde SEULE (logo-club151-mark.svg, carré), sans le
  // wordmark « CLUB 151 » : c'est la partie disque extraite du lockup horizontal,
  // donc mêmes couleurs (bleu vif #0AA3EB + or) que ce qui était affiché avant.
  // Le lockup complet (avec le nom) reste utilisé ailleurs, ex. le footer.
  const src = mark ? 'assets/brand/logo-club151-mark.svg' : 'assets/brand/logo-club151-horizontal.svg';
  const h = mark ? Math.round(size * 1.7) : Math.round(size * 1.9);
  const w = mark ? h : Math.round(h * 2.844);
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }}
      aria-label="CLUB 151 — cartes à collectionner, Vienne"
      style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0, textDecoration: 'none' }}>
      <img src={src} alt="CLUB 151"
        width={w} height={h}
        style={{ display: 'block', height: h, width: 'auto' }} />
    </a>
  );
}

function useLang() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const h = () => force();
    window.addEventListener('lc151:lang', h);
    return () => window.removeEventListener('lc151:lang', h);
  }, []);
  return (window.lcI18n && window.lcI18n.t) || ((k) => k);
}

function Announcement() {
  const t = useLang();
  // Même source unique que le footer (LC151.SHOP.socials) : ces liens pointaient
  // vers l'ACCUEIL des plateformes (https://facebook.com…), pas vers des comptes.
  const socials = ((((window.LC151 || {}).SHOP || {}).socials) || []).filter(([name, url]) => name && url);
  return (
    <div style={{ background: 'var(--header-2)', color: 'rgba(234,239,251,0.9)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="container-wide lc-ann" style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 38, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em' }}>
        <div className="lc-ann-side" style={{ display: 'flex', gap: 14 }}>
          {socials.map(([s, url]) => (
            <a key={s} className="lc-util" href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(234,239,251,0.6)', textTransform: 'uppercase' }}>{s}</a>
          ))}
        </div>
        <div style={{ flex: 1 }}></div>
        <div className="lc-ann-side" style={{ display: 'flex', gap: 16 }}>
          <a href="#" className="lc-util" onClick={(e) => { e.preventDefault(); openModal('contact'); }} style={{ color: 'rgba(234,239,251,0.6)', textTransform: 'uppercase' }}>{t('ann_contact')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); openModal('account'); }} style={{ color: 'var(--yellow)', textTransform: 'uppercase', fontWeight: 600 }}>{t('ann_login')}</a>
        </div>
      </div>
    </div>
  );
}

function playThemeFx(nextTheme, onSwap) {
  // wipe colour: white → light mode, deep brand navy (matches the dark site) → dark mode
  const wipeBg = nextTheme === 'dark'
    ? 'radial-gradient(circle at 50% 42%, #1e306a 0%, #15224F 58%, #0d1633 100%)'
    : '#FFFFFF';
  const fx = document.createElement('div');
  fx.id = 'lc-theme-fx';
  fx.innerHTML =
    '<div class="wipe" style="background:' + wipeBg + '"></div>' +
    '<div class="flash"></div>' +
    '<div class="ball">' +
      '<svg width="96" height="96" viewBox="0 0 100 100" aria-hidden="true">' +
        '<defs><clipPath id="lcb"><circle cx="50" cy="50" r="46"/></clipPath></defs>' +
        '<g clip-path="url(#lcb)">' +
          '<rect x="0" y="0" width="100" height="50" fill="#3363A9"/>' +
          '<rect x="0" y="50" width="100" height="50" fill="#fff"/>' +
          '<rect x="0" y="44" width="100" height="12" fill="#161616"/>' +
        '</g>' +
        '<circle cx="50" cy="50" r="46" fill="none" stroke="#161616" stroke-width="4"/>' +
        '<circle cx="50" cy="50" r="15" fill="#fff" stroke="#161616" stroke-width="4"/>' +
        '<circle cx="50" cy="50" r="6" fill="#161616"/>' +
      '</svg>' +
    '</div>';
  document.body.appendChild(fx);
  // 3D page tilt — desktop only
  const desktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
  const root = document.getElementById('root');
  if (desktop && root) {
    root.classList.remove('lc-3d');
    void root.offsetWidth; // restart animation
    root.classList.add('lc-3d');
    setTimeout(() => root.classList.remove('lc-3d'), 860);
  }
  // swap theme mid-wipe so the reveal shows the new theme
  setTimeout(onSwap, 230);
  setTimeout(() => fx.remove(), 880);
}

function ThemeToggle({ light }) {
  const [dark, setDark] = React.useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    setDark(!dark);
    playThemeFx(next, () => {
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('lc151_theme', next); } catch (e) {}
    });
  };
  return (
    <button onClick={toggle} aria-label="Basculer le thème"
      style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', border: light ? '1px solid rgba(255,255,255,0.25)' : '1px solid var(--line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: light ? '#EAEFFB' : 'var(--ink)', background: 'transparent' }}>
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
}

/* --- Recherche instantanée (C1) ------------------------------------------ */
/* Vignette de secours « 151 » — même visuel que le onError de StoreCard. */
const LC_THUMB_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140'%3E%3Crect width='100' height='140' rx='8' fill='%23efe9da'/%3E%3Ctext x='50' y='80' font-family='sans-serif' font-size='28' font-weight='bold' fill='%23b9ad95' text-anchor='middle'%3E151%3C/text%3E%3C/svg%3E";

/* Insensible à la casse ET aux accents (« evoli » trouve « Évoli »). */
function lcNormalize(s) {
  const str = String(s || '').toLowerCase();
  try { return str.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { return str; }
}

/* Champ de recherche du header + panneau de suggestions (dès 2 caractères,
   debounce 150 ms, 7 correspondances max sur nom / série / numéro). Lecture
   directe de window.LC151.Store.all() à la frappe — pas d'abonnement.
   Clavier : ↑/↓ déplacent la sélection (aria-activedescendant, le focus reste
   dans l'input), Entrée ouvre la fiche, Échap ferme. `compact` = variante mobile. */
function SearchBox({ compact }) {
  const t = useLang();
  const [query, setQuery] = React.useState('');
  const [sugg, setSugg] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [sel, setSel] = React.useState(-1);
  // Focus de l'input : bordure accent sur le conteneur (l'input garde
  // outline:none, la bordure transparente réservée ci-dessous prend le relais).
  const [focused, setFocused] = React.useState(false);
  const boxRef = React.useRef(null);
  const idRef = React.useRef(null);
  if (idRef.current === null) idRef.current = 'lc-sugg-' + (window.__lcSuggSeq = (window.__lcSuggSeq || 0) + 1);
  const idBase = idRef.current;
  const listId = idBase + '-list';
  const fmt = (n) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const urlFor = (id) => (window.LC151 && window.LC151.productUrl) ? window.LC151.productUrl(id) : 'produit.html?id=' + encodeURIComponent(id);
  const runSearch = () => { window.location.href = 'boutique.html?q=' + encodeURIComponent(query.trim()); };
  const close = () => { setOpen(false); setSel(-1); };

  // Suggestions : recherche à la frappe (debounce 150 ms), dès 2 caractères.
  React.useEffect(() => {
    const nq = lcNormalize(query.trim());
    if (nq.length < 2) { setSugg([]); setOpen(false); setSel(-1); return; }
    const timer = setTimeout(() => {
      let list = [];
      try {
        const S = window.LC151 && window.LC151.Store;
        const all = (S && typeof S.all === 'function') ? S.all() : [];
        list = all.filter((p) => lcNormalize(p.name).includes(nq) || lcNormalize(p.set).includes(nq) || lcNormalize(p.num).includes(nq)).slice(0, 7);
      } catch (e) { list = []; }
      setSugg(list);
      setSel(-1);
      setOpen(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Fermeture au clic extérieur — même mécanique que LangSelect.
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) close(); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const total = sugg.length + 1;   // + la ligne « Voir tous les résultats → »
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (open && sel >= 0 && sel < sugg.length) { e.preventDefault(); window.location.href = urlFor(sugg[sel].id); return; }
      runSearch();
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => (s + 1) % total); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => (s - 1 + total) % total); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); e.currentTarget.focus(); }
  };

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <div className="lc-searchbox" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px 0 4px', height: compact ? 42 : 40, borderRadius: 'var(--radius-sm)', border: '1px solid ' + (focused ? '#fff' : 'rgba(255,255,255,0.4)'), background: 'transparent' }}>
        <button type="button" onClick={runSearch} aria-label="Lancer la recherche" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, color: '#fff' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7.5"></circle><path d="M20.5 20.5l-4.2-4.2"></path></svg></button>
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown}
          onFocus={() => { setFocused(true); if (query.trim().length >= 2 && sugg.length) setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder={t('search_ph')} aria-label={t('search_ph')}
          role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" autoComplete="off"
          aria-activedescendant={open && sel >= 0 ? idBase + '-' + sel : undefined}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, color: '#fff', width: '100%' }} />
      </div>
      {open && (
        <div role="listbox" id={listId} aria-label="Suggestions de recherche"
          style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', zIndex: 70 }}>
          {sugg.length === 0 && <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)' }}>Aucune correspondance directe.</div>}
          {sugg.map((p, i) => (
            <a key={p.id} id={idBase + '-' + i} role="option" aria-selected={sel === i} tabIndex={-1}
              href={urlFor(p.id)} onMouseEnter={() => setSel(i)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: sel === i ? 'var(--accent-wash)' : 'transparent', color: 'var(--ink)', borderBottom: '1px solid var(--line)' }}>
              <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 6, background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={p.thumb || p.image || LC_THUMB_FALLBACK} alt="" loading="lazy" decoding="async"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = LC_THUMB_FALLBACK; }}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              <span style={{ flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(p.price)}&nbsp;€</span>
            </a>
          ))}
          <a id={idBase + '-' + sugg.length} role="option" aria-selected={sel === sugg.length} tabIndex={-1}
            href={'boutique.html?q=' + encodeURIComponent(query.trim())}
            onClick={(e) => { e.preventDefault(); runSearch(); }} onMouseEnter={() => setSel(sugg.length)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 12px', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent)', background: sel === sugg.length ? 'var(--accent-wash)' : 'transparent' }}>
            Voir tous les résultats →
          </a>
        </div>
      )}
    </div>
  );
}

function Header({ navigate, active, onCart }) {
  const cart = useCart();
  const auth = useAuth();
  const t = useLang();
  const count = cart.count();
  const loggedIn = auth.isLoggedIn();
  // C3 — drawer panier : si Cart.jsx est chargé (window.CartDrawer défini), le
  // clic panier ouvre le drawer au lieu de naviguer. Sur panier.html on garde
  // la navigation actuelle (on est déjà sur la page panier). Le bouton conserve
  // data-cart-btn : le fly-to-cart continue de viser la même cible DOM.
  const Drawer = window.CartDrawer;
  const onCartPage = /\/panier\.html$/i.test(window.location.pathname);
  const hasDrawer = typeof Drawer === 'function' && !onCartPage;
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleCart = () => { if (hasDrawer) setDrawerOpen(true); else if (onCart) onCart(); };
  React.useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);
  return (
    <React.Fragment>
    <TopBar />
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--header-bg)' }}>
      {/* main row */}
      <div className="container-wide" style={{ display: 'flex', alignItems: 'center', gap: 24, height: 68 }}>
        {/* Logo complet (pastille + nom) sur grand écran ; pastille seule au téléphone
            pour laisser la place à la recherche et au panier (storefront2.css). */}
        <span className="lc-logo-full"><Logo onClick={() => navigate('home')} size={22} /></span>
        <span className="lc-logo-mark"><Logo onClick={() => navigate('home')} size={26} mark /></span>
        <div className="lc-search" style={{ flex: 1, maxWidth: 540, marginLeft: 12 }}>
          <SearchBox />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle light />
          <a href="#" onClick={(e) => { e.preventDefault(); openModal('account'); }} title={loggedIn ? ('Mon compte · ' + auth.user().name) : 'Mon compte'} aria-label="Mon compte"
            style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: loggedIn ? 'var(--on-accent)' : '#EAEFFB', background: loggedIn ? 'var(--accent)' : 'transparent' }}>
            {loggedIn ? (
              <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>{(auth.user().name || 'C')[0]}</span>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
          </a>
          <button onClick={handleCart} aria-label="Panier" data-cart-btn="1" className="lc-press"
            style={{ position: 'relative', height: 40, padding: '0 14px 0 16px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 500 }}>
            {t('h_cart')}
            <span key={count} className={count > 0 ? 'lc-bump' : undefined} style={{ minWidth: 20, height: 20, padding: '0 5px', borderRadius: 'var(--radius-pill)', background: count > 0 ? 'var(--yellow)' : 'rgba(255,255,255,0.16)', color: count > 0 ? 'var(--on-yellow)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
          </button>
        </div>
      </div>
      {/* Recherche mobile (visible uniquement sur petit écran, voir storefront2.css) */}
      <div className="lc-search-mobile" style={{ padding: '0 16px 12px' }}>
        <SearchBox compact />
      </div>
      <MegaNav navigate={navigate} active={active} />
      <SeasonGarland />
      {/* C3 — drawer panier rendu via portal dans <body> : le header sticky
          (zIndex 50) crée un contexte d'empilement qui piégerait le zIndex 100
          du drawer sous la barre mobile .lc-sticky-cta (zIndex 80, contexte
          racine). Rendu en permanence pour conserver la transition. */}
      {hasDrawer && ReactDOM.createPortal(
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} navigate={navigate} />,
        document.body
      )}
    </header>
    </React.Fragment>
  );
}

/* MENU PAR JEU — même logique qu'en magasin : on entre par l'univers
   (Pokémon, One Piece…), puis par le rayon. Les sous-menus ne sont PAS écrits en
   dur : ils listent les rayons (catégories WooCommerce) réellement en ligne pour
   ce jeu, avec leur nombre de produits. Un jeu sans produit affiche « Bientôt en
   ligne » au lieu d'un rayon vide. */
const NAV = [
  { key: 'home', label: 'Accueil', href: '/index.html' },
  { key: 'new', label: 'Nouveautés', href: '/boutique.html?tri=nouveau' },
  { key: 'pokemon', label: 'Pokémon', game: 'pokemon' },
  { key: 'onepiece', label: 'One Piece', game: 'onepiece' },
  { key: 'lorcana', label: 'Lorcana', game: 'lorcana' },
  { key: 'magic', label: 'Magic', game: 'magic' },
  { key: 'yugioh', label: 'Yu-Gi-Oh!', game: 'yugioh' },
  { key: 'others', label: 'Autres TCG', games: ['riftbound', 'naruto', 'dragonball', 'kayou', 'rise'] },
  { key: 'accessory', label: 'Accessoires', href: '/boutique.html?cat=accessory' },
  { key: 'goodies', label: 'Figurines & goodies', href: '/boutique.html?cat=goodies' },
  { key: 'shop', label: 'Le magasin', href: '/index.html#la-boutique' },
];

/* Onglet actif, déduit de l'adresse (les pages ne passent que « home » ou « catalogue »). */
function lcNavCurrent(active) {
  if (active === 'home') return 'home';
  const loc = window.location;
  const sp = new URLSearchParams(loc.search);
  const pageGame = ({ '/lorcana.html': 'lorcana', '/one-piece.html': 'onepiece', '/magic.html': 'magic', '/yugioh.html': 'yugioh' })[loc.pathname] || sp.get('game');
  if (pageGame) return NAV.some((n) => n.game === pageGame) ? pageGame : 'others';
  if (sp.get('cat') === 'accessory') return 'accessory';
  if (sp.get('cat') === 'goodies') return 'goodies';
  if (sp.get('tri') === 'nouveau') return 'new';
  return null;
}

function MegaNav({ navigate, active }) {
  const [open, setOpen] = React.useState(null);
  const navStore = useStore();
  const L = window.LC151 || {};
  const GAMES = L.GAMES || {};
  const gameUrl = L.gameUrl || ((g) => '/boutique.html?game=' + g);
  const all = navStore.all();
  const countGame = (g) => all.filter((p) => p.game === g).length;
  // Rayons en ligne pour un jeu : [[nom de la catégorie, nombre]], triés par nom.
  const rayonsOf = (g) => {
    const m = new Map();
    all.forEach((p) => { if (p.game === g && p.cat) m.set(p.cat, (m.get(p.cat) || 0) + 1); });
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], 'fr'));
  };
  const cur = lcNavCurrent(active);
  const linkStyle = (on) => ({ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', fontSize: 14, fontWeight: on ? 600 : 500, color: on ? 'var(--ink)' : 'var(--ink-2)', boxShadow: on ? 'inset 0 -2px 0 var(--ink)' : 'none', whiteSpace: 'nowrap' });
  // Sous-menu = une liste réglée : une ligne fine sous chaque rayon, le nombre à droite.
  const panelLink = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14, padding: '11px 2px', borderBottom: '1px solid var(--line)', color: 'var(--ink)', fontSize: 14.5, fontWeight: 500 };
  const count = (n) => <span style={{ fontSize: 13, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{n}</span>;
  return (
    <nav aria-label="Rayons" style={{ position: 'relative', background: 'var(--card)', borderBottom: '1px solid var(--line)' }} onMouseLeave={() => setOpen(null)} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(null); }}>
      <div className="container-wide lc-nav-scroll" style={{ display: 'flex', gap: 2, height: 46, alignItems: 'stretch' }}>
        {NAV.map((c) => {
          const hasPanel = !!(c.game || c.games);
          const href = c.href || (c.game ? gameUrl(c.game) : '#');
          return (
            <React.Fragment key={c.key}>
              <a href={href} className="lc-nav-link" style={linkStyle(cur === c.key)}
                onMouseEnter={() => setOpen(hasPanel ? c.key : null)} onFocus={() => setOpen(hasPanel ? c.key : null)}
                aria-haspopup={hasPanel ? 'true' : undefined} aria-expanded={hasPanel ? open === c.key : undefined}
                onClick={(e) => {
                  // Avec sous-menu : 1er clic (ou tap) = ouvrir, 2e = aller au rayon complet.
                  if (hasPanel && open !== c.key) { e.preventDefault(); setOpen(c.key); }
                  else if (c.games) { e.preventDefault(); setOpen(null); }
                }}>
                {c.label}{hasPanel && <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.7 }}><path d="M2 3.5l3 3 3-3"></path></svg>}
              </a>
              {hasPanel && open === c.key ? (
                <div onMouseEnter={() => setOpen(c.key)}
                  style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', boxShadow: 'var(--shadow)', zIndex: 60 }}>
                  <div className="container-wide" style={{ padding: '14px 24px 26px' }}>
                    {c.game ? (() => {
                      const rayons = rayonsOf(c.game);
                      const total = countGame(c.game);
                      return total === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 15, color: 'var(--ink)' }}>{GAMES[c.game] || c.label} n'est pas encore en ligne.</span>
                          <a href={href} style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>En savoir plus</a>
                        </div>
                      ) : (
                        <div className="lc-mega-games" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: 40, rowGap: 0 }}>
                          <a href={href} style={{ ...panelLink, fontWeight: 600 }}>Tout {GAMES[c.game] || c.label}{count(total)}</a>
                          {rayons.map(([name, n]) => (
                            <a key={name} href={'/boutique.html?game=' + c.game + '&rayon=' + encodeURIComponent(name)} style={panelLink}>{name.replace(/^Scellé — /, '')}{count(n)}</a>
                          ))}
                        </div>
                      );
                    })() : (
                      <div className="lc-mega-games" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', columnGap: 40, rowGap: 0 }}>
                        {c.games.map((g) => {
                          const n = countGame(g);
                          return <a key={g} href={gameUrl(g)} style={{ ...panelLink, color: n ? 'var(--ink)' : 'var(--muted)' }}>{GAMES[g] || g}{n ? count(n) : <span style={{ fontSize: 13, color: 'var(--muted)' }}>bientôt</span>}</a>;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
        <span style={{ marginLeft: 'auto' }}></span>
      </div>
    </nav>
  );
}

/* BANDEAU D'ANNONCE — une ligne tout en haut, au-dessus de l'en-tête (elle défile
   avec la page, l'en-tête seul reste collé). Les deux promesses viennent des
   réglages du site : seuil de livraison offerte (FREE_SHIP) et adresse du magasin. */
function TopBar() {
  const L = window.LC151 || {};
  const shop = L.SHOP || {};
  // Saison de Noël (dates dans data.js) : la phrase change, l'offre reste la même.
  const noel = !!(L.season && L.season() === 'noel');
  const today = new Date();
  const eve = today.getMonth() === 11 && today.getDate() >= 24;   // du 24 décembre à la fin de la saison
  return (
    <div className="lc-topbar" style={{ background: 'var(--header-2)', color: 'rgba(255,255,255,0.86)', textAlign: 'center', padding: '6px 16px', fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
      {noel ? (eve ? 'Joyeux Noël ! Livraison' : 'Noël approche : livraison') : 'Livraison'} offerte dès {L.FREE_SHIP || 100} €, retrait gratuit en magasin{shop.street ? <span className="lc-topbar-extra">{' au ' + shop.street + ', ' + shop.city}</span> : null}
    </div>
  );
}

/* HABILLAGE DE SAISON — une guirlande lumineuse accrochée sous l'en-tête, comme
   sur une devanture. Elle n'existe que pendant la saison (LC151.season() ===
   'noel', dates dans data.js) : rien à retirer après les fêtes. Purement
   décorative : cachée aux lecteurs d'écran, elle ne capte aucun clic et passe
   sous les menus. Le scintillement est coupé si le visiteur a demandé moins
   d'animations (storefront2.css). Un motif de 160 px répété sur la largeur :
   le fil, six ampoules aux couleurs du logo, et leur halo sur deux calques qui
   s'allument en alternance. */
function SeasonGarland() {
  const L = window.LC151 || {};
  if (!L.season || L.season() !== 'noel') return null;
  const lamps = [[20, 6.5, 'y'], [40, 8, 'r'], [60, 6.5, 'b'], [100, 6.5, 'g'], [120, 8, 'y'], [140, 6.5, 'r']];
  const tint = { y: '#FACA07', r: '#E5484D', b: '#4F93FF', g: '#2FB673' };
  const lamp = ([x, y, c], i) => (
    <g key={i}>
      <rect x={x - 1.1} y={y - 0.3} width="2.2" height="2.4" rx="0.5" fill="#24493C"></rect>
      <ellipse cx={x} cy={y + 5.4} rx="2.7" ry="3.5" fill={tint[c]}></ellipse>
    </g>
  );
  const halo = ([x, y, c], i) => <circle key={i} cx={x} cy={y + 5.4} r="9" fill={'url(#lc-gl-' + c + ')'}></circle>;
  const tile = { width: 160, height: 28, patternUnits: 'userSpaceOnUse' };
  return (
    <div className="lc-garland" aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '100%', height: 28, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg width="100%" height="28" focusable="false" style={{ display: 'block' }}>
        <defs>
          {Object.keys(tint).map((c) => (
            <radialGradient key={c} id={'lc-gl-' + c}>
              <stop offset="0" stopColor={tint[c]} stopOpacity="0.55"></stop>
              <stop offset="1" stopColor={tint[c]} stopOpacity="0"></stop>
            </radialGradient>
          ))}
          <pattern id="lc-gl-wire" {...tile}>
            <path d="M0 2 Q40 14 80 2 Q120 14 160 2" fill="none" stroke="#2F6B55" strokeWidth="1"></path>
            {lamps.map(lamp)}
          </pattern>
          <pattern id="lc-gl-a" {...tile}>{lamps.filter((l, i) => i % 2 === 0).map(halo)}</pattern>
          <pattern id="lc-gl-b" {...tile}>{lamps.filter((l, i) => i % 2 === 1).map(halo)}</pattern>
        </defs>
        <rect className="lc-garland-glow lc-garland-glow-a" width="100%" height="28" fill="url(#lc-gl-a)"></rect>
        <rect className="lc-garland-glow lc-garland-glow-b" width="100%" height="28" fill="url(#lc-gl-b)"></rect>
        <rect width="100%" height="28" fill="url(#lc-gl-wire)"></rect>
      </svg>
    </div>
  );
}

/* VIGNETTE SANS PHOTO — fond neutre + pictogramme générique selon le rayon.
   Les cartes gardent la tuile « 151 » ; le scellé, les accessoires et les goodies
   ont chacun leur silhouette (booster, boîte, protection, figurine, peluche,
   cadeau) pour qu'une rangée sans photo reste lisible d'un coup d'œil. Aucun
   visuel de marque : de simples tracés. */
function lcStageKind(p) {
  if (!p) return 'card';
  const c = String(p.cat || '').toLowerCase();
  if (p.type === 'single' || p.type === 'graded') return 'card';
  if (/booster|blister/.test(c)) return 'pack';
  if (p.type === 'sealed') return 'box';
  if (/peluche/.test(c)) return 'plush';
  if (/figurine|pop/.test(c)) return 'figure';
  if (p.type === 'accessory') return 'shield';
  if (p.type === 'goodies') return 'gift';
  return 'card';
}
const LC_STAGE_ICONS = {
  pack: <React.Fragment><path d="M9 6l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2v28l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2z"></path><path d="M9 11h16M9 29h16"></path><circle cx="17" cy="20" r="4"></circle></React.Fragment>,
  box: <React.Fragment><path d="M4 12l14-7 14 7v16l-14 7-14-7z"></path><path d="M4 12l14 7 14-7M18 19v16"></path><path d="M11 8.5l14 7"></path></React.Fragment>,
  shield: <React.Fragment><rect x="8" y="5" width="20" height="28" rx="2.5"></rect><rect x="12" y="9" width="12" height="16" rx="1.5"></rect><path d="M12 29h12"></path></React.Fragment>,
  figure: <React.Fragment><circle cx="18" cy="11" r="6"></circle><path d="M10 34v-6a8 8 0 0 1 16 0v6z"></path><path d="M7 34h22"></path></React.Fragment>,
  plush: <React.Fragment><circle cx="10" cy="10" r="4"></circle><circle cx="26" cy="10" r="4"></circle><circle cx="18" cy="20" r="11"></circle><circle cx="14" cy="18" r="1"></circle><circle cx="22" cy="18" r="1"></circle><path d="M15 24q3 2.5 6 0"></path></React.Fragment>,
  gift: <React.Fragment><rect x="5" y="14" width="26" height="19" rx="2"></rect><path d="M3 14h30v-5H3zM18 9v24"></path><path d="M18 9c-2-6-9-5-7-1 1 2 5 1 7 1zm0 0c2-6 9-5 7-1-1 2-5 1-7 1z"></path></React.Fragment>,
};
function ProductStage({ glyph, label, ratio = '1 / 1', big, kind }) {
  const icon = LC_STAGE_ICONS[kind];
  return (
    <div style={{ position: 'relative', aspectRatio: ratio, background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden' }}>
      {icon ? (
        <svg width={big ? 96 : 60} height={big ? 100 : 63} viewBox="0 0 36 38" fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
      ) : (
        /* carte : un simple contour aux proportions d'une carte (63 × 88) */
        <div style={{ width: big ? 96 : 60, height: big ? 134 : 84, borderRadius: big ? 7 : 5, border: '1px solid var(--line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: big ? 22 : 15, color: 'var(--muted)' }}>151</span>
        </div>
      )}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>{glyph || label}</span>
    </div>
  );
}

function LangSelect() {
  const langs = (window.lcI18n && window.lcI18n.langs) || [['fr', 'Français', '🇫🇷']];
  const [open, setOpen] = React.useState(false);
  const [cur, setCur] = React.useState(() => (window.lcI18n ? window.lcI18n.getLang() : 'fr'));
  const ref = React.useRef(null);
  const btnRef = React.useRef(null);
  const sel = langs.find((l) => l[0] === cur) || langs[0];
  const pick = (code) => { setCur(code); setOpen(false); if (window.lcI18n) window.lcI18n.setLang(code); };
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}
      onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); if (btnRef.current) btnRef.current.focus(); } }}>
      <button ref={btnRef} onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.05)', fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
        <span style={{ fontSize: 15 }}>{sel[2]}</span> {sel[1]} <span style={{ fontSize: 10, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>▾</span>
      </button>
      {open && (
        <div role="listbox" style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 6, minWidth: 180, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 30 }}>
          {langs.map(([code, name, flag]) => (
            <button key={code} role="option" aria-selected={code === cur} onClick={() => pick(code)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: code === cur ? 'var(--accent-wash)' : 'transparent', color: 'var(--ink)', fontSize: 14, fontWeight: code === cur ? 700 : 500, cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: 16 }}>{flag}</span> {name}
              {code === cur && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Footer({ navigate }) {
  const t = useLang();
  const col = (title, items) => (
    <div>
      {/* Filet or au-dessus du sur-titre mono — code visuel « maison premium ». */}
      <span className="lc-gold-rule" aria-hidden="true" style={{ display: 'block', marginBottom: 10 }}></span>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {items.map((it) => (
          <a key={it.label} href={it.href || '#'} onClick={(e) => { if (it.onClick) { e.preventDefault(); it.onClick(); } }}
            className={it.soon ? undefined : 'lc-foot-link'}
            style={{ fontSize: 14.5, fontWeight: 600, color: it.soon ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.82)', cursor: it.soon ? 'default' : 'pointer', pointerEvents: it.soon ? 'none' : 'auto' }}>
            {it.label}{it.soon ? ' (' + t('f_soon') + ')' : ''}
          </a>
        ))}
      </div>
    </div>
  );
  // Tracés d'icônes DISPONIBLES ; la liste réellement affichée vient de
  // LC151.SHOP.socials (source unique). Avant, six icônes en href="#" +
  // preventDefault() annonçaient une présence sociale inexistante — et
  // « Google »/« Apple », qui ne sont pas des réseaux, trahissaient le
  // remplissage de template. Sans compte réel renseigné : on n'affiche rien.
  const SOCIAL_ICONS = {
    Instagram: 'M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2m0 5.4A4.4 4.4 0 1 0 16.4 12 4.4 4.4 0 0 0 12 7.6m0 7.27A2.87 2.87 0 1 1 14.87 12 2.87 2.87 0 0 1 12 14.87m4.6-8.43a1.03 1.03 0 1 0 1.03 1.03 1.03 1.03 0 0 0-1.03-1.03',
    Facebook: 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12',
    TikTok: 'M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.1v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.05.78.12v-3.2a5.7 5.7 0 0 0-.78-.05A5.69 5.69 0 1 0 15.54 15.5V9.4a7.34 7.34 0 0 0 4.3 1.38V7.68a4.28 4.28 0 0 1-3.24-1.86',
    YouTube: 'M21.6 7.2s-.2-1.37-.8-1.97c-.76-.8-1.6-.8-2-.85C16 4.1 12 4.1 12 4.1h-.02s-4 0-6.8.28c-.4.05-1.24.05-2 .85-.6.6-.8 1.97-.8 1.97S2.16 8.8 2.16 10.4v1.5c0 1.6.2 3.2.2 3.2s.2 1.37.8 1.97c.76.8 1.76.77 2.2.86 1.6.15 6.64.2 6.64.2s4 0 6.8-.29c.4-.05 1.24-.05 2-.85.6-.6.8-1.97.8-1.97s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2M9.84 14.6V8.93l5.15 2.85z',
  };
  const socials = ((((window.LC151 || {}).SHOP || {}).socials) || [])
    .filter(([name, url]) => SOCIAL_ICONS[name] && url);
  const appBadge = null;
  const shop = (window.LC151 || {}).SHOP || {};
  // Un rayon sans article n'a pas de lien dans le pied de page.
  const footProducts = (window.LC151 || {}).PRODUCTS || [];
  const hasType = (ty) => footProducts.some((p) => p.type === ty);
  const hasPreorder = footProducts.some((p) => p.preorder);
  // Icônes SVG du bandeau de réassurance (mêmes tracés que ReassureIcon de Home.jsx,
  // dupliqués ici car Home.jsx n'est chargé que sur l'accueil).
  const footIcon = (name) => {
    const shapes = {
      check: <polyline points="20 6 9 17 4 12"></polyline>,
      truck: <React.Fragment><rect x="1" y="3" width="15" height="13" rx="1"></rect><path d="M16 8h4l3 3v5h-7V8z"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></React.Fragment>,
      bouclier: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>,
    };
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {shapes[name]}
      </svg>
    );
  };
  return (
    <footer style={{ background: 'var(--footer-bg)', color: 'var(--footer-text)', marginTop: 0 }}>
      {/* Trois engagements, en colonnes séparées par un trait — sans pictogramme. */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
        <div className="container-wide lc-foot-reassure" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: 0 }}>
          {[[t('r_auth_t'), t('r_auth_s')], [t('r_ship_t'), t('r_ship_s')], [t('r_pay_t'), t('r_pay_s')]].map(([ti, sub], n) => (
            <div key={ti} style={{ padding: '22px 24px', borderLeft: n ? '1px solid rgba(255,255,255,0.14)' : 'none' }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{ti}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{String(sub).replace(/ · /g, ', ')}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="container-wide" style={{ padding: '56px 24px 30px' }}>
        <div className="lc-foot-grid" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr 1fr', gap: 44, marginBottom: 40, alignItems: 'start' }}>
          <div>
            <div style={{ marginBottom: 18 }}><Logo size={30} onClick={() => navigate('home')} /></div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {[['Visa', 'visa'], ['Mastercard', 'mastercard'], ['American Express', 'amex']].map(([name, slug]) => (
                <span key={slug} title={name} style={{ height: 28, padding: '0 8px', borderRadius: 6, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', display: 'inline-flex', alignItems: 'center' }}>
                  <img src={'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/flat/' + slug + '.svg'} alt={name} style={{ height: 18, display: 'block' }} />
                </span>
              ))}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', maxWidth: 320 }}>
              La boutique TCG de Vienne : cartes à collectionner, mangas et objets de collection. On déniche, on authentifie et on conseille.
            </p>
            {/* Coordonnées du magasin — LC151.SHOP (source unique). Rien n'est
                affiché tant que l'adresse n'est pas renseignée. */}
            {shop.street && (
              <address style={{ fontStyle: 'normal', fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)', marginTop: 14, maxWidth: 320 }}>
                <a href={shop.mapsUrl || 'index.html#la-boutique'} target={shop.mapsUrl ? '_blank' : undefined} rel="noopener noreferrer" className="lc-foot-link" style={{ color: 'rgba(255,255,255,0.86)', fontWeight: 600 }}>{shop.street}, {shop.zip} {shop.city}</a>
                {(shop.hours || []).map(([d, h]) => <div key={d}>{d} : {h}</div>)}
                {shop.phone && <a href={'tel:' + shop.phone.replace(/\s/g, '')} className="lc-foot-link" style={{ color: 'rgba(255,255,255,0.86)' }}>{shop.phone}</a>}
              </address>
            )}
          </div>
          {col(t('f_buy'), [
            { label: t('nav_home'), href: 'index.html' },
            { label: t('nav_single'), onClick: () => navigate('catalogue', 'single') },
            hasType('graded') && { label: t('nav_graded'), onClick: () => navigate('catalogue', 'graded') },
            { label: t('f_displays'), onClick: () => navigate('catalogue', 'sealed') },
            { label: t('nav_accessory'), onClick: () => navigate('catalogue', 'accessory') },
            hasPreorder && { label: t('f_preorders'), onClick: () => navigate('catalogue', 'preorder') },
          ].filter(Boolean))}
          {col(t('f_house'), [
            { label: t('f_boutique'), href: 'index.html#la-boutique' },
            { label: t('f_about'), href: 'apropos.html' },
            { label: 'FAQ', href: 'faq.html' },
            { label: 'Nous contacter', onClick: () => openModal('contact') },
          ])}
          {col(t('f_account'), [
            { label: t('h_account'), onClick: () => openModal('account') },
            { label: t('f_orders'), onClick: () => openModal('orders') },
            { label: t('f_addresses'), onClick: () => openModal('addresses') },
            { label: t('f_alerts'), onClick: () => openModal('alerts') },
            { label: t('h_cart'), onClick: () => navigate('cart') },
          ])}
        </div>

        {/* divider + copyright / language */}
        <div style={{ paddingTop: 26, borderTop: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{t('f_copyright')}</span>
          <LangSelect />
        </div>

        {/* socials + legal links */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {socials.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name + ' (nouvel onglet)'} title={name} className="lc-social">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={SOCIAL_ICONS[name]} /></svg>
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13, fontWeight: 600 }}>
            <a href="confidentialite.html" className="lc-foot-link" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('f_cookies')}</a>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>
            <a href="cgv.html" className="lc-foot-link" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('f_terms')}</a>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>
            <a href="confidentialite.html" className="lc-foot-link" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('f_privacy')}</a>
          </div>
        </div>

        <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.4)' }}>
          Pokémon™ Nintendo / Game Freak — produits authentifiés · CLUB 151 n'est pas affilié à The Pokémon Company.
        </div>
      </div>
    </footer>
  );
}

/* StoreCard — wraps the DS ProductCard for art items; renders a beige
   placeholder card for sealed/accessory items. One consistent unit.
   Self-contained (inline badges + price) so the grid never depends on the
   compiled bundle lagging a turn behind component edits. */
/* Pointeur grossier (tactile) détecté une seule fois au chargement : pas de
   hover fiable sur mobile, le bouton favori reste donc toujours visible. */
let lcCoarsePointer = false;
try { lcCoarsePointer = window.matchMedia('(pointer: coarse)').matches; } catch (e) {}

/* Icône favori « marque-page » (toggle collection) — contour discret quand la
   carte n'est pas dans la collection, ruban rouge plein quand elle y est.
   Le contour idle suit la couleur du bouton (currentColor). */
function FavRibbon({ caught, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={caught ? 'var(--accent)' : 'none'}
      stroke={caught ? 'var(--accent)' : 'currentColor'}
      strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"
      aria-hidden="true" style={{ display: 'block' }}>
      <path d="M6 3h12v18l-6-4-6 4Z" />
    </svg>
  );
}

function lcBadgeStyle(tone) {
  const map = {
    sale: { background: 'var(--ink)', color: 'var(--on-ink)', border: '1px solid var(--ink)' },
    new: { background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--ink)' },
    graded: { background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--ink)' },
    // --red-ink et non --red : le rouge vif ne tient que 4.18:1 sur --red-soft (AA rate).
    oos: { background: 'var(--red-soft)', color: 'var(--red-ink)', border: '1px solid transparent' },
  };
  return { display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 'var(--radius-xs)', fontSize: 11.5, fontWeight: 600, lineHeight: 1.5, ...(map[tone] || map.new) };
}

/* Grade gradé robuste (BUG #5) : WooCommerce ne peuple pas toujours badge.label
   pour une carte gradée. On déduit alors l'organisme + la note dans l'ordre
   product.grade → nom → badge.label (même regex que le slab de Product.jsx).
   Renvoie « PSA 10 » ou null — aucune note fabriquée. */
function lcDeriveGrade(product) {
  const GRADE_RE = /\b(PSA|BGS|CGC|SGC)\s?(10|9\.5|9|8\.5|8|7|6|5)\b/i;
  const sources = [product.grade, product.name, (product.badge && product.badge.label)];
  for (let i = 0; i < sources.length; i++) {
    const m = String(sources[i] || '').match(GRADE_RE);
    if (m) return m[1].toUpperCase() + ' ' + m[2];
  }
  return null;
}

function StoreCard({ product, navigate }) {
  const cart = useCart();
  const favs = useFavorites();   // null si le store Favorites est absent → bouton masqué
  const open = () => navigate('product', product.id);
  const [hover, setHover] = React.useState(false);
  // Focus clavier sur le bouton favori : force sa visibilité (sinon opacity 0 hors hover).
  const [heartFocus, setHeartFocus] = React.useState(false);
  // Compteur d'AJOUTS aux favoris : incrémenté à chaque « ajout » (jamais au retrait).
  // Sert de key au cœur → rejoue lc-fav-pop, façon key={count} du badge panier.
  const [favPops, setFavPops] = React.useState(0);
  const liked = !!(favs && favs.has(product.id));
  const toggleFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    const wasLiked = liked;
    favs.toggle(product.id);
    if (!wasLiked) setFavPops((n) => n + 1);   // pop uniquement quand on AJOUTE
  };
  const fmt = (n) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const pct = product.oldPrice && product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const low = product.inStock && typeof product.stockLeft === 'number' && product.stockLeft <= 3;
  const unique = cart.isUnique(product.id);
  const inCart = cart.items().some((l) => l.id === product.id);
  const lockedUnique = unique && inCart;          // already in cart → can't add another
  // Slab gradée : liseré + ombre dorés sur toute la carte, halo doré sous l'image.
  // Le badge grade (« PSA 10 ») est réintégré : pastille navy à texte or, mono.
  const isGraded = product.type === 'graded';
  // Carte gradée sans badge serveur → on déduit la note (organisme + grade) pour
  // afficher la pastille quand même ; null si indéterminable (aucune pastille).
  const gradeBadge = (isGraded && !product.badge) ? lcDeriveGrade(product) : null;

  // Conteneur en <div> et non <a> : un <a> ne peut pas contenir de <button>
  // (favori + ajout panier). Le vrai lien focusable est le TITRE ; le onClick du
  // conteneur reste un confort souris.
  //
  // HABILLAGE « POCHETTE » : la carte n'a ni cadre ni ombre à elle — ce sont les
  // traits de la grille (.lc-pockets / .lc-pocket-row) qui la délimitent, comme
  // les pochettes d'une page de classeur. Au survol, rien ne bouge : le fond du
  // visuel fonce d'un ton. L'ajout au panier est un petit bouton au trait, à
  // droite du prix ; l'état du stock n'est écrit que s'il dit quelque chose
  // (rupture, dernier exemplaire, précommande).
  const canAdd = product.inStock && !lockedUnique;
  // Une carte à l'unité ou gradée est presque toujours une pièce unique : l'écrire sur
  // chacune n'apprend rien. « Dernier exemplaire » ne s'affiche donc que hors cartes.
  const isCardType = product.type === 'single' || product.type === 'graded';
  // Demande de la boutique : la quantité disponible est affichée telle quelle
  // (« 3 en stock »), sans formule d'urgence du type « plus qu'un exemplaire ».
  const stockLabel = (window.LC151 && window.LC151.stockLabel) ? window.LC151.stockLabel(product) : '';
  const note = !product.inStock ? 'Rupture' : product.preorder ? 'Précommande' : '';
  const rayonCourt = ({ "Cartes à l'unité": 'Carte', 'Cartes gradées': 'Carte gradée' })[product.cat] || String(product.cat || '').replace(/^(Scellé|Accessoires) — /, '');
  return (
    <div className={'lc-card lc-pocket' + (isGraded ? ' lc-graded' : '')} onClick={() => open()}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--card)', padding: 14, opacity: product.inStock ? 1 : 0.62 }}>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, display: 'flex', gap: 6 }}>
          {pct > 0 && <span style={lcBadgeStyle('sale')}>−{pct}%</span>}
          {product.badge
            ? <span style={lcBadgeStyle(product.badge.tone)}>{product.badge.label}</span>
            : (gradeBadge && <span style={lcBadgeStyle('graded')}>{gradeBadge}</span>)}
        </span>
        {favs && product.inStock && (
          <button type="button" className="lc-card-fav" aria-pressed={liked} aria-label={liked ? 'Retirer de ma collection' : 'Ajouter à ma collection'} title={liked ? 'Dans ma collection' : 'Ajouter à ma collection'}
            onClick={toggleFav}
            onFocus={() => setHeartFocus(true)} onBlur={() => setHeartFocus(false)}
            style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', border: '1px solid ' + (liked ? 'var(--accent)' : 'var(--line)'), color: 'var(--muted)', opacity: hover || liked || heartFocus || lcCoarsePointer ? 1 : 0, transition: 'opacity 0.15s ease' }}>
            <span key={favPops} className={favPops > 0 ? 'lc-fav-pop' : undefined} style={{ display: 'inline-flex' }}><FavRibbon caught={liked} size={14} /></span>
          </button>
        )}
        {/* Visuel : fond neutre, coins arrondis comme une carte sous pochette. */}
        <div style={{ borderRadius: 8, overflow: 'hidden', background: product.image ? '#FFFFFF' : 'var(--paper-2)', border: '1px solid ' + (product.image ? 'var(--line)' : 'transparent'), filter: hover ? 'brightness(0.975)' : 'none', transition: 'filter 0.15s ease' }}>
          {product.image ? (
            <div style={{ position: 'relative', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
              <img src={product.image} alt={product.name} loading="lazy" decoding="async" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.visibility = 'hidden'; }}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          ) : <ProductStage glyph={product.glyph} kind={lcStageKind(product)} />}
        </div>
      </div>
      <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {/* Vrai lien : ouvrable dans un nouvel onglet, et suivi par les moteurs de recherche. */}
        <a href={(window.LC151 && window.LC151.productUrl) ? window.LC151.productUrl(product.id) : 'produit.html?id=' + encodeURIComponent(product.id)}
          onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) { e.stopPropagation(); return; } e.preventDefault(); e.stopPropagation(); open(); }}
          style={{ textDecoration: 'none', color: 'var(--ink)', fontSize: 15, fontWeight: 500, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</a>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rayonCourt}{note ? <span style={{ color: product.inStock ? 'var(--ink-2)' : 'var(--red-ink)' }}>{', ' + note.toLowerCase()}</span> : null}</div>
        {stockLabel ? <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>{stockLabel}</div> : null}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 'auto', paddingTop: 10 }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
            <span style={{ fontWeight: 600, fontSize: 16.5, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{fmt(product.price)}&nbsp;€</span>
            {product.oldPrice > product.price && <span style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>{fmt(product.oldPrice)}&nbsp;€</span>}
          </span>
          <button type="button" className="lc-press lc-add" disabled={!canAdd}
            aria-label={!product.inStock ? (product.name + ' — indisponible')
              : lockedUnique ? (product.name + ' — déjà dans le panier')
              : ((product.preorder ? 'Précommander' : 'Ajouter au panier') + ' — ' + product.name)}
            title={lockedUnique ? 'Déjà dans le panier' : (product.inStock ? (product.preorder ? 'Précommander' : 'Ajouter au panier') : 'Indisponible')}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (canAdd) { cart.add(product.id); lcFlyToCart(e.currentTarget); } }}
            style={{ flexShrink: 0, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid ' + (lockedUnique ? 'var(--green)' : canAdd ? 'var(--ink)' : 'var(--line)'), background: lockedUnique ? 'var(--green-soft)' : 'transparent', color: lockedUnique ? 'var(--green)' : canAdd ? 'var(--ink)' : 'var(--muted)', cursor: canAdd ? 'pointer' : 'not-allowed' }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {lockedUnique ? <path d="M3 8.5l3.2 3L13 4.5"></path> : <path d="M8 2.5v11M2.5 8h11"></path>}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
function ProductRow({ eyebrow, title, products, navigate, onSeeAll }) {
  const ref = React.useRef(null);
  const scroll = (dir) => { if (ref.current) ref.current.scrollBy({ left: dir * 560, behavior: 'smooth' }); };
  if (!products.length) return null;
  const arrow = (d) => (
    <button key={d} onClick={() => scroll(d)} aria-label={d < 0 ? 'Précédent' : 'Suivant'}
      style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--ink)' }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d < 0 ? 'M7.5 2L3.5 6l4 4' : 'M4.5 2l4 4-4 4'}></path></svg>
    </button>
  );
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 16, flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(22px, 2.6vw, 30px)', letterSpacing: '-0.02em', lineHeight: 1.15, minWidth: 0 }}>{title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onSeeAll && onSeeAll(); }} style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4, textDecorationThickness: 1 }}>Tout voir</a>
          <div className="lc-row-nav" style={{ display: 'flex', gap: 6 }}>{[-1, 1].map(arrow)}</div>
        </div>
      </div>
      {/* .lc-pocket-row : un trait au-dessus, un en dessous, un entre chaque pochette. */}
      <div ref={ref} className="lc-pocket-row" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: '232px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
        {products.map((p) => <div key={p.id} style={{ scrollSnapAlign: 'start' }}><StoreCard product={p} navigate={navigate} /></div>)}
      </div>
    </section>
  );
}


/* ---- lightweight modal bus (mock account / contact / newsletter / checkout) ---- */
const __lcModalSubs = new Set();
let __lcModal = null;
function openModal(name) { __lcModal = name; __lcModalSubs.forEach((f) => f()); }
function closeModal() { __lcModal = null; __lcModalSubs.forEach((f) => f()); }
function useModalState() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => { __lcModalSubs.add(force); return () => __lcModalSubs.delete(force); }, []);
  return __lcModal;
}

/* Piège à focus pour les modales (a11y) : mémorise l'élément actif, focus le
   panneau à l'ouverture (tabIndex={-1} requis sur le panneau), boucle
   Tab/Shift+Tab entre les éléments focusables, ferme à Échap, puis restaure
   le focus à la fermeture. Partagé avec Checkout.jsx via window.lcUseFocusTrap
   (Chrome.js est chargé avant Checkout.js dans toutes les pages). */
function useFocusTrap(panelRef, onClose) {
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose; // toujours la dernière closure (évite un onClose périmé)
  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const prev = document.activeElement;
    panel.focus();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (closeRef.current) closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!els.length) { e.preventDefault(); return; }
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    panel.addEventListener('keydown', onKeyDown);
    return () => {
      panel.removeEventListener('keydown', onKeyDown);
      try { if (prev && typeof prev.focus === 'function') prev.focus(); } catch (err) {}
    };
  }, []);
}

/* fontSize 16 : en dessous, iOS Safari zoome tout seul à la mise au point sur le
   champ et l'utilisateur se retrouve à devoir dézoomer entre chaque saisie. */
const lcField = { width: '100%', padding: '11px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-strong)', background: 'var(--paper)', fontSize: 16, color: 'var(--ink)', outline: 'none', marginBottom: 12, boxSizing: 'border-box' };

/* Repli <button> natif si le design system (DS.Button) n'est pas encore chargé —
   même garde défensive que Checkout.jsx (const DS = ... || {} ; DS.Button ? ...).
   Style « accent bloc » commun aux modales. */
const lcModalBtnFallback = { width: '100%', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600, fontSize: 15, cursor: 'pointer' };

function ModalShell({ title, children, onClose }) {
  const panelRef = React.useRef(null);
  useFocusTrap(panelRef, onClose);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}></div>
      {/* maxHeight + overflowY : sans eux, une modale plus haute que l'écran
          (« Mes commandes » bien remplie, téléphone en paysage, gros zoom
          système) débordait en haut ET en bas SANS aucun moyen de faire
          défiler — le bouton de validation devenait inatteignable. Même
          traitement que la modale de paiement (Checkout.jsx). overscrollBehavior
          empêche la page du dessous de défiler en bout de liste. */}
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="lc-modal-title" tabIndex={-1} style={{ position: 'relative', width: 'min(440px, 100%)', maxHeight: '92vh', overflowY: 'auto', overscrollBehavior: 'contain', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 26, outline: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 id="lc-modal-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 22, letterSpacing: '-0.02em' }}>{title}</h3>
          <button onClick={onClose} aria-label="Fermer" style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-strong)', fontSize: 17, color: 'var(--ink)', cursor: 'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LcSuccess({ message, onClose }) {
  const DS = window.ADITCGDesignSystem_df75b7 || {};
  return (
    <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
      <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>✓</div>
      <p style={{ fontSize: 15.5, color: 'var(--ink-2)', marginBottom: 20, lineHeight: 1.55 }}>{message}</p>
      {DS.Button
        ? <DS.Button variant="accent" size="lg" block className="lc-press" onClick={onClose}>Fermer</DS.Button>
        : <button className="lc-press" onClick={onClose} style={lcModalBtnFallback}>Fermer</button>}
    </div>
  );
}

function FormModal({ title, fields, cta, success, onClose }) {
  const DS = window.ADITCGDesignSystem_df75b7 || {};
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  // On n'annonce « message envoyé » QUE si l'envoi a vraiment abouti. Avant, le
  // succès s'affichait quoi qu'il arrive : sans réception configurée (cas actuel)
  // le message ne partait nulle part et le client attendait une réponse sous 24 h
  // qui ne serait jamais venue.
  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const fd = new FormData(e.currentTarget);
    const obj = {};
    fd.forEach((v, k) => { obj[k] = v; });
    setSending(true); setFailed(false);
    let ok = false;
    try {
      ok = (window.LC151 && window.LC151.notify) ? await window.LC151.notify(title, obj) : false;
    } catch (err) { ok = false; }
    setSending(false);
    if (ok) setSent(true); else setFailed(true);
  };
  return (
    <ModalShell title={title} onClose={onClose}>
      {sent ? <LcSuccess message={success} onClose={onClose} /> : (
        <form onSubmit={submit}>
          {/* aria-label : le placeholder seul n'est pas un nom accessible fiable
              (il disparaît dès la saisie et certains lecteurs d'écran l'ignorent). */}
          {fields.map((f) => f.type === 'textarea'
            ? <textarea key={f.ph} name={f.ph} required aria-label={f.ph} placeholder={f.ph} rows={4} style={{ ...lcField, resize: 'vertical' }} />
            : <input key={f.ph} name={f.ph} type={f.type || 'text'} required aria-label={f.ph} placeholder={f.ph} style={lcField} />)}
          {failed && (
            <p role="alert" style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(179,38,30,0.08)', color: 'var(--red, #b3261e)', fontSize: 13.5, lineHeight: 1.5 }}>
              L’envoi n’a pas abouti. Écrivez-nous directement à{' '}
              <a href="mailto:contact@club151.fr" style={{ color: 'inherit', fontWeight: 600 }}>contact@club151.fr</a>.
            </p>
          )}
          {DS.Button
            ? <DS.Button type="submit" variant="accent" size="lg" block className="lc-press" disabled={sending}>{sending ? 'Envoi…' : cta}</DS.Button>
            : <button type="submit" className="lc-press" style={lcModalBtnFallback} disabled={sending}>{sending ? 'Envoi…' : cta}</button>}
        </form>
      )}
    </ModalShell>
  );
}

function AccountModal({ onClose }) {
  const DS = window.ADITCGDesignSystem_df75b7 || {};
  const auth = useAuth();
  const [tab, setTab] = React.useState('login');     // login | register | forgot
  const [sent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  if (auth.isLoggedIn()) {
    const u = auth.user();
    return (
      <ModalShell title="Mon compte" onClose={onClose}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, textTransform: 'uppercase' }}>{(u.name || 'C')[0]}</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 16 }}>{u.name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{u.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
          {[['Mes commandes', 'orders'], ['Mes adresses', 'addresses'], ['Mes alertes', 'alerts']].map(([it, target]) => (
            <button key={it} onClick={() => { openModal(target); }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.background = 'var(--accent-wash)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--card)'; }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', padding: '11px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)', fontSize: 14, cursor: 'pointer', transition: 'border-color 0.18s ease, background 0.18s ease' }}>
              {it}
              {it === 'Mes alertes' && window.LC151.Alerts.count() > 0 && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 'var(--radius-pill)', background: 'var(--accent)', color: 'var(--on-accent)', fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{window.LC151.Alerts.count()}</span>}
            </button>
          ))}
        </div>
        {DS.Button
          ? <DS.Button variant="primary" size="lg" block className="lc-press" onClick={() => { auth.logout(); onClose(); }}>Se déconnecter</DS.Button>
          : <button className="lc-press" onClick={() => { auth.logout(); onClose(); }} style={lcModalBtnFallback}>Se déconnecter</button>}
      </ModalShell>
    );
  }
  // Connexion / inscription classiques : e-mail + mot de passe.
  // Le mot de passe vit UNIQUEMENT dans l'état de ce formulaire, le temps de
  // l'envoi. Il n'est jamais écrit en localStorage, jamais mis dans l'URL.
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr('');
    const A = window.LC151.Auth;
    let r;
    if (tab === 'forgot') r = await A.forgot(email);
    else if (tab === 'register') r = await A.register(email, password, fullName.trim());
    else r = await A.login(email, password);
    setBusy(false);
    if (!r || !r.ok) { setErr((r && r.error) || 'Opération impossible pour le moment.'); return; }
    setPassword('');                       // on ne garde pas le mot de passe en mémoire
    if (tab === 'forgot') { setSent(true); return; }
    onClose();                             // connecté : le panneau se ferme
  };

  const tabBtn = (k, label) => (
    <button key={k} type="button" onClick={() => { setTab(k); setErr(''); }}
      style={{ flex: 1, height: 38, borderRadius: 'var(--radius-sm)', border: '1px solid',
        borderColor: tab === k ? 'var(--ink)' : 'var(--line-strong)',
        background: tab === k ? 'var(--ink)' : 'transparent',
        color: tab === k ? 'var(--on-ink)' : 'var(--ink)',
        fontWeight: 600, fontSize: 13.5, cursor: 'pointer', transition: 'border-color 0.18s ease, background 0.18s ease' }}>{label}</button>
  );

  const title = tab === 'register' ? 'Créer un compte' : (tab === 'forgot' ? 'Mot de passe oublié' : 'Connexion');

  return (
    <ModalShell title={title} onClose={onClose}>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <div className="lc-pop" style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-10 6L2 7"></path></svg>
          </div>
          <p style={{ fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.55, marginBottom: 18 }}>
            Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d’être envoyé.
            Pensez à regarder dans vos indésirables.
          </p>
          {DS.Button
            ? <DS.Button variant="accent" size="lg" block className="lc-press" onClick={() => { setSent(false); setTab('login'); }}>Retour à la connexion</DS.Button>
            : <button className="lc-press" onClick={() => { setSent(false); setTab('login'); }} style={lcModalBtnFallback}>Retour à la connexion</button>}
        </div>
      ) : (
        <React.Fragment>
          {tab !== 'forgot' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {tabBtn('login', 'Connexion')}
              {tabBtn('register', 'Créer un compte')}
            </div>
          )}
          {tab === 'register' && (
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 14 }}>
              Votre nom, votre e-mail et un mot de passe suffisent. L'adresse de livraison est demandée
              à la commande, et vous pouvez aussi commander sans créer de compte.
            </p>
          )}
          {tab === 'forgot' && (
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 14 }}>
              Indiquez votre e-mail : nous vous envoyons un lien pour choisir un nouveau mot de passe.
            </p>
          )}
          <form onSubmit={submit}>
            {tab === 'register' && (
              <input required type="text" autoComplete="name" aria-label="Prénom et nom" placeholder="Prénom et nom" maxLength={80}
                value={fullName} onChange={(e) => setFullName(e.target.value)} style={lcField} />
            )}
            <input required type="email" autoComplete="email" aria-label="Adresse e-mail" placeholder="votre@email.fr"
              value={email} onChange={(e) => setEmail(e.target.value)} style={lcField} />
            {tab !== 'forgot' && (
              <input required type="password" aria-label="Mot de passe" placeholder="Mot de passe"
                autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                minLength={tab === 'register' ? 8 : undefined}
                value={password} onChange={(e) => setPassword(e.target.value)} style={lcField} />
            )}
            {tab === 'register' && (
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '-6px 0 12px' }}>8 caractères minimum.</p>
            )}
            {err && (
              <p role="alert" style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(179,38,30,0.08)', color: 'var(--red, #b3261e)', fontSize: 13.5, lineHeight: 1.5 }}>{err}</p>
            )}
            {DS.Button
              ? <DS.Button type="submit" variant="accent" size="lg" block className="lc-press" disabled={busy}>{busy ? 'Un instant…' : (tab === 'register' ? 'Créer mon compte' : (tab === 'forgot' ? 'Envoyer le lien' : 'Se connecter'))}</DS.Button>
              : <button type="submit" className="lc-press" style={lcModalBtnFallback} disabled={busy}>{busy ? 'Un instant…' : (tab === 'register' ? 'Créer mon compte' : (tab === 'forgot' ? 'Envoyer le lien' : 'Se connecter'))}</button>}
          </form>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button type="button" onClick={() => { setTab(tab === 'forgot' ? 'login' : 'forgot'); setErr(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--ink-2)', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer', padding: 4 }}>
              {tab === 'forgot' ? 'Revenir à la connexion' : 'Mot de passe oublié ?'}
            </button>
          </div>
        </React.Fragment>
      )}
    </ModalShell>
  );
}

function AlertsModal({ onClose }) {
  const auth = useAuth();
  const alerts = useAlerts();
  const [kw, setKw] = React.useState('');
  if (!auth.isLoggedIn()) return <AccountModal onClose={onClose} />;
  const topics = alerts.topics();
  const data = alerts.all();
  const addKw = (e) => { e.preventDefault(); alerts.addKeyword(kw); setKw(''); };

  return (
    <ModalShell title="Mes alertes" onClose={onClose}>
      <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 16 }}>
        Soyez prévenu·e par e-mail dès qu'un produit arrive ou revient en stock. Cochez les catégories qui vous intéressent.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
        {topics.map((t) => {
          const on = alerts.hasTopic(t.key);
          return (
            <button key={t.key} onClick={() => alerts.toggleTopic(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid', borderColor: on ? 'var(--ink)' : 'var(--line)', background: on ? 'var(--accent-wash)' : 'var(--card)', color: 'var(--ink)', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 38, height: 22, borderRadius: 'var(--radius-pill)', background: on ? 'var(--accent)' : 'var(--line-strong)', position: 'relative', flexShrink: 0, transition: 'background 0.18s ease' }}>
                <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: on ? 'var(--on-accent)' : 'var(--card)', transition: 'left 0.18s ease' }}></span>
              </span>
              <span style={{ flex: 1, fontWeight: on ? 600 : 400 }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 14, marginBottom: 8 }}>Alerte sur un mot-clé</div>
      <form onSubmit={addKw} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="ex. Dracaufeu, Méga-Évolution…" style={{ ...lcField, marginBottom: 0 }} />
        <button type="submit" style={{ flexShrink: 0, padding: '0 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--ink)', color: 'var(--on-ink)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>Ajouter</button>
      </form>
      {data.keywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {data.keywords.map((k) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 8px 6px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--paper-2)', border: '1px solid var(--line)', fontSize: 13 }}>
              {k}
              <button onClick={() => alerts.removeKeyword(k)} aria-label={'Retirer ' + k} style={{ width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'var(--line-strong)', color: 'var(--paper)', fontSize: 11, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', paddingTop: 6, borderTop: '1px solid var(--line)' }}>
        {alerts.count() > 0 ? `${alerts.count()} alerte${alerts.count() > 1 ? 's' : ''} active${alerts.count() > 1 ? 's' : ''} · envoyées à ${auth.user().email}` : 'Aucune alerte active pour le moment.'}
      </div>
    </ModalShell>
  );
}

function OrdersModal({ onClose }) {
  const DS = window.ADITCGDesignSystem_df75b7 || {};
  const auth = useAuth();
  const { fmt } = window.LC151;
  // Les commandes viennent du SERVEUR (WooCommerce), plus du localStorage : une
  // commande passée depuis un autre appareil doit apparaître ici, et une
  // commande n'est réelle que si la boutique la connaît. L'ancien écran ne
  // montrait que ce qu'avait enregistré CE navigateur.
  const [state, setState] = React.useState({ loading: true, orders: [], error: '' });
  const loggedIn = auth.isLoggedIn();
  React.useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    fetch('/api/orders/mine', { credentials: 'same-origin' })
      .then((r) => r.json().catch(() => ({})).then((j) => ({ ok: r.ok, j: j })))
      .then((res) => {
        if (cancelled) return;
        if (!res.ok || !res.j || res.j.ok !== true) {
          setState({ loading: false, orders: [], error: (res.j && res.j.error) || 'Commandes indisponibles pour le moment.' });
          return;
        }
        setState({ loading: false, orders: Array.isArray(res.j.orders) ? res.j.orders : [], error: '' });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, orders: [], error: 'Erreur réseau — impossible de charger vos commandes.' });
      });
    return () => { cancelled = true; };
  }, [loggedIn]);
  if (!loggedIn) return <AccountModal onClose={onClose} />;
  const list = state.orders;
  if (state.loading) {
    return (
      <ModalShell title="Mes commandes" onClose={onClose}>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', textAlign: 'center', padding: '24px 0' }}>Chargement de vos commandes…</p>
      </ModalShell>
    );
  }
  // Un échec doit se VOIR : afficher « aucune commande » alors que le serveur
  // n'a pas répondu ferait croire à un historique vide, ce qui est bien pire.
  if (state.error) {
    return (
      <ModalShell title="Mes commandes" onClose={onClose}>
        <p role="alert" style={{ margin: 0, padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(179,38,30,0.08)', color: 'var(--red, #b3261e)', fontSize: 13.5, lineHeight: 1.5 }}>{state.error}</p>
      </ModalShell>
    );
  }
  return (
    <ModalShell title="Mes commandes" onClose={onClose}>
      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 14.5, color: 'var(--ink-2)', marginBottom: 18 }}>Vous n'avez pas encore passé de commande.</p>
          {DS.Button
            ? <DS.Button variant="accent" size="lg" block className="lc-press" onClick={onClose}>Explorer la boutique</DS.Button>
            : <button className="lc-press" onClick={onClose} style={lcModalBtnFallback}>Explorer la boutique</button>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((o) => (
            <div key={o.number} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13.5 }}>N° {o.number}</span>
                {/* Le libellé vient du serveur : « on-hold » ne veut pas dire la
                    même chose pour un retrait (prête) et une livraison (en
                    attente). La couleur suit le sens, pas le vert par défaut. */}
                <span style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 'var(--radius-pill)', fontWeight: 600,
                  background: /annul|échou|rembours/i.test(o.statusLabel) ? 'var(--red-soft)' : (/prête|retirée|expédiée/i.test(o.statusLabel) ? 'var(--green-soft)' : 'var(--accent-wash)'),
                  color: /annul|échou|rembours/i.test(o.statusLabel) ? 'var(--red)' : (/prête|retirée|expédiée/i.test(o.statusLabel) ? 'var(--green)' : 'var(--accent)') }}>{o.statusLabel}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 8 }}>{o.date ? new Date(o.date).toLocaleDateString('fr-FR') : '—'} · {(o.items || []).reduce((s, i) => s + i.qty, 0)} article(s)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--ink-2)' }}>{o.method || 'Livraison'}</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{fmt(o.total)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}

function AddressesModal({ onClose }) {
  const DS = window.ADITCGDesignSystem_df75b7 || {};
  const auth = useAuth();
  // Hooks TOUJOURS appelés avant tout return conditionnel (règles des hooks) :
  // se connecter pendant que la modale est ouverte ne doit pas faire varier leur nombre.
  const loggedIn = auth.isLoggedIn();
  const u = loggedIn ? auth.user() : {};
  const saved = u.address || {};
  const [a, setA] = React.useState({ name: saved.name || u.name || '', addr: saved.addr || '', zip: saved.zip || '', city: saved.city || '', phone: saved.phone || '' });
  const [done, setDone] = React.useState(false);
  const [err, setErr] = React.useState({});
  // Si l'utilisateur se connecte pendant que la modale est ouverte, précharge son adresse.
  React.useEffect(() => {
    if (loggedIn) {
      const cu = auth.user() || {}; const sv = cu.address || {};
      setA({ name: sv.name || cu.name || '', addr: sv.addr || '', zip: sv.zip || '', city: sv.city || '', phone: sv.phone || '' });
      setDone(false); setErr({});
    }
  }, [loggedIn]);
  if (!loggedIn) return <AccountModal onClose={onClose} />;
  const set = (k, v) => { setA((s) => ({ ...s, [k]: v })); setDone(false); };

  const save = async () => {
    const e = {};
    ['name', 'addr', 'zip', 'city'].forEach((k) => { if (!String(a[k]).trim()) e[k] = 1; });
    if (a.zip && !/^\d{4,5}$/.test(a.zip.trim())) e.zip = 1;
    setErr(e);
    if (Object.keys(e).length) return;
    // setAddress écrit dans la fiche client WooCommerce : on ATTEND la réponse
    // avant d'annoncer « enregistré ». Annoncer tout de suite laisserait croire
    // l'adresse sauvegardée alors qu'elle aurait disparu au prochain appareil.
    const r = await auth.setAddress(a);
    if (r && r.ok === false) { setErr({ server: r.error }); setDone(false); return; }
    setDone(true);
  };
  const fld = (k) => ({ ...lcField, ...(err[k] ? { borderColor: 'var(--red)' } : {}) });
  const lbl = { fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, display: 'block' };

  return (
    <ModalShell title="Mes adresses" onClose={onClose}>
      <p style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 16 }}>Votre adresse de livraison par défaut — pré-remplie automatiquement au paiement.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div><label style={lbl} htmlFor="lc-addr-name">Nom complet</label><input id="lc-addr-name" aria-invalid={err.name ? true : undefined} style={fld('name')} value={a.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div><label style={lbl} htmlFor="lc-addr-addr">Adresse</label><input id="lc-addr-addr" aria-invalid={err.addr ? true : undefined} style={fld('addr')} value={a.addr} onChange={(e) => set('addr', e.target.value)} placeholder="N° et rue" /></div>
        <div className="lc-addr-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <div><label style={lbl} htmlFor="lc-addr-zip">Code postal</label><input id="lc-addr-zip" aria-invalid={err.zip ? true : undefined} style={fld('zip')} value={a.zip} onChange={(e) => set('zip', e.target.value)} /></div>
          <div><label style={lbl} htmlFor="lc-addr-city">Ville</label><input id="lc-addr-city" aria-invalid={err.city ? true : undefined} style={fld('city')} value={a.city} onChange={(e) => set('city', e.target.value)} /></div>
        </div>
        <div><label style={lbl} htmlFor="lc-addr-phone">Téléphone (optionnel)</label><input id="lc-addr-phone" style={lcField} value={a.phone} onChange={(e) => set('phone', e.target.value)} /></div>
        {/* Échec serveur et champs invalides sont deux problèmes distincts :
            « vérifiez les champs en rouge » serait trompeur si la saisie est
            bonne et que c'est l'enregistrement en boutique qui a échoué. */}
        {err.server && <div role="alert" style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600, lineHeight: 1.5 }}>{err.server}</div>}
        {!err.server && Object.keys(err).length > 0 && <div role="alert" style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>Veuillez vérifier les champs en rouge.</div>}
        {done && <div role="status" style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><span>✓</span> Adresse enregistrée.</div>}
        {DS.Button
          ? <DS.Button variant="accent" size="lg" block className="lc-press" onClick={save}>{done ? 'Enregistré ✓' : 'Enregistrer l’adresse'}</DS.Button>
          : <button className="lc-press" onClick={save} style={lcModalBtnFallback}>{done ? 'Enregistré ✓' : 'Enregistrer l’adresse'}</button>}
      </div>
    </ModalShell>
  );
}

function ModalHost() {
  const name = useModalState();
  if (!name) return null;
  if (name === 'account') return <AccountModal onClose={closeModal} />;
  if (name === 'alerts') return <AlertsModal onClose={closeModal} />;
  if (name === 'contact') return <FormModal title="Nous contacter" onClose={closeModal} cta="Envoyer le message" success="Merci ! Votre message a bien été envoyé — nous vous répondons sous 24 h." fields={[{ ph: 'Votre nom' }, { ph: 'Votre e-mail', type: 'email' }, { ph: 'Votre message', type: 'textarea' }]} />;
  if (name === 'newsletter') return <FormModal title="Être prévenu des nouveautés" onClose={closeModal} cta="Je m'inscris" success="Inscription confirmée ! Vous recevrez nos arrivages et précommandes en avant-première." fields={[{ ph: 'Votre e-mail', type: 'email' }]} />;
  if (name === 'checkout') return window.CheckoutModal ? <window.CheckoutModal onClose={closeModal} /> : null;
  if (name === 'orders') return <OrdersModal onClose={closeModal} />;
  if (name === 'addresses') return <AddressesModal onClose={closeModal} />;
  return null;
}

function lcNavigate(view, arg) {
  // Chemins ABSOLUS : les pages produits vivent dans /produits/, les liens
  // relatifs ne s'y résoudraient pas correctement.
  if (view === 'product') { window.location.href = window.LC151.productUrl(arg); return; }
  if (view === 'catalogue') { window.location.href = '/boutique.html' + (arg && arg !== 'all' ? '?cat=' + encodeURIComponent(arg) : ''); return; }
  if (view === 'cart') { window.location.href = '/panier.html'; return; }
  window.location.href = '/index.html';
}
Object.assign(window, { TopBar, lcStageKind, lcNavigate, useCart, useStore, useAuth, useAlerts, useFavorites, lcUseFocusTrap: useFocusTrap, Pokeball, FavRibbon, lcFlyToCart, Logo, Announcement, ThemeToggle, Header, ProductStage, Footer, StoreCard, ProductRow, openModal, closeModal, ModalHost });
