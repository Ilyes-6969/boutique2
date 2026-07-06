/* leclub151 — shared chrome: Logo, Announcement, Header, Footer, ProductStage, useCart */

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
    const cartBtn = document.querySelector('[data-cart-btn]');
    if (!cartBtn || !fromEl) return;
    const a = fromEl.getBoundingClientRect();
    const b = cartBtn.getBoundingClientRect();
    const startX = a.left + a.width / 2, startY = a.top + a.height / 2;
    const endX = b.left + b.width / 2, endY = b.top + b.height / 2;
    const ball = document.createElement('div');
    ball.setAttribute('aria-hidden', 'true');
    ball.style.cssText = 'position:fixed;left:' + (startX - 16) + 'px;top:' + (startY - 16) + 'px;width:32px;height:32px;z-index:9998;pointer-events:none;will-change:transform,opacity;transition:transform 0.62s cubic-bezier(0.5,-0.25,0.3,1),opacity 0.62s ease;filter:drop-shadow(0 6px 10px rgba(0,0,0,0.3));';
    ball.innerHTML = '<svg width="32" height="32" viewBox="0 0 100 100"><defs><clipPath id="flyclip"><circle cx="50" cy="50" r="47"/></clipPath></defs><g clip-path="url(#flyclip)"><rect x="0" y="0" width="100" height="50" fill="#EE1515"/><rect x="0" y="50" width="100" height="50" fill="#fff"/><rect x="0" y="44" width="100" height="12" fill="#1a1a1a"/></g><circle cx="50" cy="50" r="47" fill="none" stroke="#1a1a1a" stroke-width="5"/><circle cx="50" cy="50" r="15" fill="#fff" stroke="#1a1a1a" stroke-width="5"/></svg>';
    document.body.appendChild(ball);
    requestAnimationFrame(() => {
      ball.style.transform = 'translate(' + (endX - startX) + 'px,' + (endY - startY) + 'px) scale(0.3) rotate(540deg)';
      ball.style.opacity = '0.2';
    });
    setTimeout(() => ball.remove(), 680);
  } catch (e) {}
}

function Pokeball({ size = 16, style, float = false }) {
  const idRef = React.useRef(null);
  if (idRef.current === null) idRef.current = (window.__pbSeq = (window.__pbSeq || 0) + 1);
  const u = 'pb' + idRef.current;
  return (
    <span className={'lc-pb' + (float ? ' lc-pb-float' : '')} style={{ display: 'inline-flex', flexShrink: 0, lineHeight: 0, ...style }}>
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id={u + 'r'} cx="36%" cy="27%" r="80%">
            <stop offset="0%" stopColor="#ff9d9d" />
            <stop offset="34%" stopColor="#ee1515" />
            <stop offset="100%" stopColor="#990b0b" />
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

function Logo({ onClick, size = 22 }) {
  const h = Math.round(size * 1.7);
  const w = Math.round(h * 1.86);
  const fill = 'var(--logo-fill)';
  const edge = 'var(--logo-edge)';
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }} aria-label="leclub151 — C151"
      style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}>
      <svg className="lc-logo-mark" width={w} height={h} viewBox="0 0 171 92" style={{ overflow: 'visible', display: 'block' }}>
        {/* C en Pokéball (ouverture à droite), légèrement incliné comme les chiffres */}
        <g transform="skewX(-7)">
          <path d="M 58 27 A 23 23 0 1 0 58 65" fill="none" stroke={edge} strokeWidth="20" strokeLinecap="round" />
          <path d="M 58 27 A 23 23 0 1 0 58 65" fill="none" stroke={fill} strokeWidth="13" strokeLinecap="round" />
          {/* barre équatoriale + bouton central */}
          <rect x="19" y="40.5" width="25" height="11" rx="5.5" fill={fill} stroke={edge} strokeWidth="2" />
          <circle cx="44" cy="46" r="8.5" fill="var(--logo-btn)" stroke={edge} strokeWidth="4" />
        </g>
        {/* 151 collé au C, pour lire « C151 » d'un bloc */}
        <text x="62" y="69" fontFamily="var(--font-display)" fontWeight="900" fontStyle="italic" fontSize="58"
          fill={fill} stroke={edge} strokeWidth="2.4" paintOrder="stroke" strokeLinejoin="round"
          style={{ letterSpacing: '-1.5px' }}>151</text>
      </svg>
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
  const socials = [['Facebook', 'https://facebook.com'], ['Instagram', 'https://instagram.com'], ['YouTube', 'https://youtube.com'], ['Discord', 'https://discord.com']];
  return (
    <div style={{ background: 'var(--header-2)', color: 'rgba(234,239,251,0.9)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="container-wide lc-ann" style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 38, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em' }}>
        <div className="lc-ann-side" style={{ display: 'flex', gap: 14 }}>
          {socials.map(([s, url]) => (
            <a key={s} className="lc-util" href={url} target="_blank" rel="noreferrer" style={{ color: 'rgba(234,239,251,0.6)', textTransform: 'uppercase' }}>{s}</a>
          ))}
        </div>
        <div style={{ flex: 1, textAlign: 'center', textTransform: 'uppercase', color: 'rgba(234,239,251,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Pokeball size={13} /> {t('ann_free')}
        </div>
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
          '<rect x="0" y="0" width="100" height="50" fill="#EE1515"/>' +
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
      style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', border: light ? '1.5px solid rgba(255,255,255,0.25)' : '1.5px solid var(--line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: light ? '#EAEFFB' : 'var(--ink)', background: 'transparent' }}>
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: compact ? '0 6px 0 14px' : '0 6px 0 16px', height: compact ? 42 : 44, borderRadius: 'var(--radius-pill)', border: '1.5px solid ' + (focused ? 'var(--accent)' : 'transparent'), background: 'var(--card)', transition: 'border-color 0.15s ease' }}>
        <span style={{ display: 'flex', color: 'var(--muted)' }} aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg></span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown}
          onFocus={() => { setFocused(true); if (query.trim().length >= 2 && sugg.length) setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder={t('search_ph')} aria-label={t('search_ph')}
          role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" autoComplete="off"
          aria-activedescendant={open && sel >= 0 ? idBase + '-' + sel : undefined}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--ink)', width: '100%' }} />
        <button onClick={runSearch} style={{ height: compact ? 32 : 34, padding: compact ? '0 14px' : '0 16px', borderRadius: 'var(--radius-pill)', background: 'var(--accent)', color: 'var(--on-accent)', fontFamily: 'var(--font-mono)', fontSize: compact ? 11 : 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t('ok')}</button>
      </div>
      {open && (
        <div role="listbox" id={listId} aria-label="Suggestions de recherche"
          style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', zIndex: 70 }}>
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
              <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
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
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--header-bg)', borderBottom: '3px solid var(--accent)' }}>
      {/* main row */}
      <div className="container-wide" style={{ display: 'flex', alignItems: 'center', gap: 24, height: 76 }}>
        <Logo onClick={() => navigate('home')} size={26} />
        <div className="lc-search" style={{ flex: 1, maxWidth: 540, marginLeft: 12 }}>
          <SearchBox />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle light />
          <a href="#" onClick={(e) => { e.preventDefault(); openModal('account'); }} title={loggedIn ? ('Mon compte · ' + auth.user().name) : 'Mon compte'} aria-label="Mon compte"
            style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: loggedIn ? 'var(--on-accent)' : '#EAEFFB', background: loggedIn ? 'var(--accent)' : 'transparent' }}>
            {loggedIn ? (
              <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>{(auth.user().name || 'C')[0]}</span>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
          </a>
          <button onClick={handleCart} aria-label="Panier" data-cart-btn="1"
            style={{ position: 'relative', height: 40, padding: '0 18px 0 16px', display: 'flex', alignItems: 'center', gap: 9, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: 'var(--on-accent)', fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600 }}>
            {t('h_cart')}
            <span key={count} className={count > 0 ? 'lc-bump' : undefined} style={{ minWidth: 20, height: 20, padding: '0 5px', borderRadius: 'var(--radius-pill)', background: 'var(--on-accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700 }}>{count}</span>
          </button>
        </div>
      </div>
      {/* Recherche mobile (visible uniquement sur petit écran, voir storefront2.css) */}
      <div className="lc-search-mobile" style={{ padding: '0 16px 12px' }}>
        <SearchBox compact />
      </div>
      <MegaNav navigate={navigate} active={active} />
      {/* C3 — drawer panier rendu via portal dans <body> : le header sticky
          (zIndex 50) crée un contexte d'empilement qui piégerait le zIndex 100
          du drawer sous la barre mobile .lc-sticky-cta (zIndex 80, contexte
          racine). Rendu en permanence pour conserver la transition. */}
      {hasDrawer && ReactDOM.createPortal(
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} navigate={navigate} />,
        document.body
      )}
    </header>
  );
}

const NAV = [
  { key: 'home', label: 'Accueil' },
  { key: 'single', label: "Cartes à l'unité", cols: [
    { title: 'Par série', items: ['Wizards (WOTC)', 'Bloc EX', 'Diamant & Perle', 'Platine', 'HeartGold SoulSilver', 'Noir & Blanc', 'XY', 'Soleil & Lune', 'Épée & Bouclier', 'Écarlate & Violet', 'Méga-Évolution', 'Promo'] },
    { title: 'Populaire', items: ['Dernière série', 'Meilleures ventes', 'Cartes Holo', 'Cartes rares', 'Édition 1ère'] },
  ] },
  { key: 'graded', label: 'Cartes gradées', cols: [
    { title: 'Certification', items: ['PSA', 'BGS', 'CGC'] },
    { title: 'Par série', items: ['Wizards', 'Bloc EX', 'XY', 'Soleil & Lune', 'Épée & Bouclier', 'Écarlate & Violet', 'Méga-Évolution'] },
  ] },
  { key: 'sealed', label: 'Scellé', cols: [
    { title: 'Type de produit', items: ['Display / Boîte de boosters', 'ETB — Dresseur d’Élite', 'Coffret', 'Booster', 'Pokébox', 'Tripack / Duopack', 'Deck'] },
    { title: 'Séries récentes', items: ['Méga-Évolution', 'Aventures Ensemble', 'Écarlate & Violet', 'Pokémon Japonais'] },
  ] },
  { key: 'accessory', label: 'Accessoires', cols: [
    { title: 'Protection', items: ['Protège-cartes', 'Classeurs', 'Folio / Binder', 'Deck Box', 'Toploaders', 'Tapis / Playmat'] },
    { title: 'Marques', items: ['Ultra Pro', 'Ultimate Guard', 'Dragon Shield', 'Gamegenic'] },
  ] },
  { key: 'preorder', label: 'Précommande' },
  { key: 'univers', label: 'Autres jeux', games: [['Pokémon', 'boutique.html'], ['Disney Lorcana', 'lorcana.html'], ['One Piece', 'one-piece.html'], ['Magic: The Gathering', 'magic.html'], ['Yu-Gi-Oh!', 'yugioh.html']] },
  { key: 'catalogue', label: 'Toute la boutique' },
];

/* Libellés du méga-menu trop génériques pour pré-remplir la recherche (?q) :
   pour ceux-là, le lien pointe vers le rayon complet (?cat seul). */
const LC_MEGA_GENERIC = ['Dernière série', 'Meilleures ventes'];

function MegaNav({ navigate, active }) {
  const [open, setOpen] = React.useState(null);
  const t = useLang();
  const go = (item) => { setOpen(null); navigate(item.key === 'home' ? 'home' : 'catalogue', item.key === 'home' ? undefined : item.key === 'catalogue' ? 'all' : item.key); };
  return (
    <nav style={{ borderTop: '1px solid rgba(255,255,255,0.12)', position: 'relative', background: 'var(--header-2)' }} onMouseLeave={() => setOpen(null)} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(null); }}>
      <div className="container-wide lc-nav-scroll" style={{ display: 'flex', gap: 2, height: 48, alignItems: 'stretch' }}>
        {NAV.map((c) => {
          const on = active === c.key || (c.key === 'home' && active === 'home');
          const hasPanel = !!(c.cols || c.games);
          return (
            <React.Fragment key={c.key}>
            <a href="#" className="lc-nav-link" onMouseEnter={() => setOpen(hasPanel ? c.key : null)}
              onFocus={() => setOpen(hasPanel ? c.key : null)}
              aria-haspopup={hasPanel ? 'true' : undefined} aria-expanded={hasPanel ? open === c.key : undefined}
              onClick={(e) => { e.preventDefault(); if (c.cols) { if (open === c.key) { go(c); } else { setOpen(c.key); } } else if (c.games) { setOpen(open === c.key ? null : c.key); } else { go(c); } }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 15px', fontSize: 13.5, fontWeight: 600, color: on ? '#fff' : 'rgba(234,239,251,0.72)', borderBottom: '3px solid', borderColor: on ? 'var(--yellow)' : 'transparent', whiteSpace: 'nowrap' }}>
              {(window.lcI18n && window.lcI18n.t('nav_' + c.key) !== 'nav_' + c.key) ? t('nav_' + c.key) : c.label}{hasPanel && <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span>}
            </a>
            {/* panneau rendu juste après son onglet dans le DOM : atteignable au Tab (position absolute → hors du flux flex, échappe à l'overflow de .lc-nav-scroll car rattaché au <nav> relatif) */}
            {hasPanel && open === c.key ? (
          <div className="lc-mega-panel" onMouseEnter={() => setOpen(c.key)}
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', borderTop: '1.5px solid var(--line)', borderBottom: '1.5px solid var(--line)', boxShadow: 'var(--shadow)', zIndex: 60 }}>
            {c.games ? (
              <div className="container-wide lc-mega-games" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, padding: '22px 24px 26px' }}>
                {c.games.map(([label, href]) => (
                  <a key={href} href={href}
                    style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', color: 'var(--ink)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: href === 'boutique.html' ? 'var(--accent)' : 'var(--muted)' }}>{href === 'boutique.html' ? 'Explorer' : 'Bientôt'}</span>
                  </a>
                ))}
              </div>
            ) : (
            <div className="container-wide lc-mega-cols" style={{ display: 'flex', gap: 56, padding: '26px 24px 30px' }}>
              {c.cols.map((col) => (
                <div key={col.title}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 14 }}>{col.title}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: col.items.length > 6 ? '1fr 1fr' : '1fr', gap: '9px 36px' }}>
                    {col.items.map((it) => (
                      /* boutique.html lit ?q et le passe à Catalogue (initialQuery) :
                         chaque sous-lien pré-filtre son rayon, sauf libellés génériques. */
                      <a key={it} href={'/boutique.html?cat=' + encodeURIComponent(c.key) + (LC_MEGA_GENERIC.indexOf(it) !== -1 ? '' : '&q=' + encodeURIComponent(it))}
                        style={{ fontSize: 14, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-2)'; }}>{it}</a>
                    ))}
                  </div>
                </div>
              ))}
              <div className="lc-mega-rail" style={{ marginLeft: 'auto', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, paddingLeft: 40, borderLeft: '1.5px solid var(--line)', minWidth: 200 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>{c.label}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>Parcourez tout le rayon et filtrez par série, état et prix.</div>
                <a href="#" onClick={(e) => { e.preventDefault(); go(c); }} style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tout voir →</a>
              </div>
            </div>
            )}
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

/* Beige placeholder stage for sealed/accessory products (no card art). */
function ProductStage({ glyph, label, ratio = '1 / 1', big }) {
  return (
    <div style={{ position: 'relative', aspectRatio: ratio, background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden' }}>
      <div style={{ width: big ? 96 : 64, height: big ? 132 : 88, borderRadius: 6, border: '2px solid var(--line-strong)', background: 'repeating-linear-gradient(135deg, transparent 0 9px, rgba(26,23,20,0.04) 9px 18px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: big ? 22 : 15, color: 'var(--muted)' }}>151</span>
      </div>
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
        <div role="listbox" style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 6, minWidth: 180, background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 30 }}>
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
  const socials = [
    ['Instagram', 'M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2m0 5.4A4.4 4.4 0 1 0 16.4 12 4.4 4.4 0 0 0 12 7.6m0 7.27A2.87 2.87 0 1 1 14.87 12 2.87 2.87 0 0 1 12 14.87m4.6-8.43a1.03 1.03 0 1 0 1.03 1.03 1.03 1.03 0 0 0-1.03-1.03'],
    ['Facebook', 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12'],
    ['TikTok', 'M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.1v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.05.78.12v-3.2a5.7 5.7 0 0 0-.78-.05A5.69 5.69 0 1 0 15.54 15.5V9.4a7.34 7.34 0 0 0 4.3 1.38V7.68a4.28 4.28 0 0 1-3.24-1.86'],
    ['YouTube', 'M21.6 7.2s-.2-1.37-.8-1.97c-.76-.8-1.6-.8-2-.85C16 4.1 12 4.1 12 4.1h-.02s-4 0-6.8.28c-.4.05-1.24.05-2 .85-.6.6-.8 1.97-.8 1.97S2.16 8.8 2.16 10.4v1.5c0 1.6.2 3.2.2 3.2s.2 1.37.8 1.97c.76.8 1.76.77 2.2.86 1.6.15 6.64.2 6.64.2s4 0 6.8-.29c.4-.05 1.24-.05 2-.85.6-.6.8-1.97.8-1.97s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2M9.84 14.6V8.93l5.15 2.85z'],
    ['Google', 'M21.35 11.1H12v2.93h5.35c-.23 1.4-1.66 4.1-5.35 4.1a5.86 5.86 0 0 1 0-11.72 5.2 5.2 0 0 1 3.68 1.44l2-1.93A8.46 8.46 0 0 0 12 3.5a8.5 8.5 0 1 0 0 17 7.96 7.96 0 0 0 8.15-8.36c0-.7-.07-1.4-.16-2.04z'],
    ['Apple', 'M16.36 12.78c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.71-3.18-1.73-1.36-.14-2.65.8-3.34.8-.68 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.6 2.18-1.54 2.67-.4 6.62 1.1 8.79.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.14a9.3 9.3 0 0 0 1.2-2.45c-.03-.01-2.3-.88-2.32-3.49M14.18 6.1c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.56 1.3-.56.64-1.05 1.68-.92 2.67.97.08 1.97-.49 2.58-1.2'],
  ];
  const appBadge = null;
  // Icônes SVG du bandeau de réassurance (mêmes tracés que ReassureIcon de Home.jsx,
  // dupliqués ici car Home.jsx n'est chargé que sur l'accueil).
  const footIcon = (name) => {
    const shapes = {
      check: <polyline points="20 6 9 17 4 12"></polyline>,
      truck: <React.Fragment><rect x="1" y="3" width="15" height="13" rx="1"></rect><path d="M16 8h4l3 3v5h-7V8z"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></React.Fragment>,
      bouclier: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>,
    };
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {shapes[name]}
      </svg>
    );
  };
  return (
    <footer style={{ background: 'var(--footer-bg)', color: 'var(--footer-text)', marginTop: 0 }}>
      {/* reassurance strip */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 56, padding: '26px 24px' }}>
          {[['check', t('r_auth_t'), t('r_auth_s')], ['truck', t('r_ship_t'), t('r_ship_s')], ['bouclier', t('r_pay_t'), t('r_pay_s')]].map(([ic, ti, s]) => (
            <div key={ti} className="lc-reassure" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <span className="lc-reassure-ic" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>{footIcon(ic)}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5 }}>{ti}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container-wide" style={{ padding: '56px 24px 30px' }}>
        <div className="lc-foot-grid" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr 1fr', gap: 44, marginBottom: 40, alignItems: 'start' }}>
          <div>
            <div style={{ marginBottom: 18 }}><Logo size={30} onClick={() => navigate('home')} /></div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {[['Visa', 'visa'], ['Mastercard', 'mastercard'], ['Maestro', 'maestro'], ['American Express', 'amex'], ['PayPal', 'paypal']].map(([name, slug]) => (
                <span key={slug} title={name} style={{ height: 28, padding: '0 8px', borderRadius: 6, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', display: 'inline-flex', alignItems: 'center' }}>
                  <img src={'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/flat/' + slug + '.svg'} alt={name} style={{ height: 18, display: 'block' }} />
                </span>
              ))}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', maxWidth: 320 }}>
              La boutique des collectionneurs Pokémon, à Vienne. On déniche, on authentifie et on conseille.
            </p>
          </div>
          {col(t('f_buy'), [
            { label: t('nav_home'), href: 'index.html' },
            { label: t('nav_single'), onClick: () => navigate('catalogue', 'single') },
            { label: t('nav_graded'), onClick: () => navigate('catalogue', 'graded') },
            { label: t('f_displays'), onClick: () => navigate('catalogue', 'sealed') },
            { label: t('nav_accessory'), onClick: () => navigate('catalogue', 'accessory') },
            { label: t('f_preorders'), onClick: () => navigate('catalogue', 'preorder') },
          ])}
          {col(t('f_house'), [
            { label: t('f_boutique'), onClick: () => openModal('contact') },
            { label: t('f_about'), href: 'apropos.html' },
            { label: 'FAQ', href: 'faq.html' },
            { label: t('f_auth'), onClick: () => openModal('contact') },
            { label: t('f_news'), soon: true },
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
            {socials.map(([name, d]) => (
              <a key={name} href="#" onClick={(e) => e.preventDefault()} aria-label={name} title={name} className="lc-social">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
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
          Pokémon™ Nintendo / Game Freak — produits authentifiés · leclub151 n'est pas affilié à The Pokémon Company.
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
   hover fiable sur mobile, le bouton « Attraper » reste donc toujours visible. */
let lcCoarsePointer = false;
try { lcCoarsePointer = window.matchMedia('(pointer: coarse)').matches; } catch (e) {}

/* Icône Pokéball « Attraper » (toggle collection) — contour quand la carte
   n'est pas attrapée, Pokéball rouge pleine quand elle l'est. Style ligne des
   autres icônes du site ; le rouge/blanc reste lisible dans les deux thèmes. */
function CatchBall({ caught, size = 18 }) {
  if (caught) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="9" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.6" />
        <path d="M3 12h18" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3.3" fill="#fff" />
        <circle cx="12" cy="12" r="1.3" fill="var(--accent)" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function lcBadgeStyle(tone) {
  const map = {
    sale: { background: 'var(--ink)', color: 'var(--on-ink)', border: '1.5px solid var(--ink)' },
    new: { background: 'var(--accent)', color: 'var(--on-accent)', border: '1.5px solid var(--accent)' },
    graded: { background: 'var(--card)', color: 'var(--ink)', border: '1.5px solid var(--line-strong)' },
    oos: { background: 'var(--red-soft)', color: 'var(--red)', border: '1.5px solid transparent' },
  };
  return { display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.4, whiteSpace: 'nowrap', ...(map[tone] || map.new) };
}

function StoreCard({ product, navigate }) {
  const cart = useCart();
  const favs = useFavorites();   // null si le store Favorites est absent → bouton masqué
  const open = () => navigate('product', product.id);
  const [hover, setHover] = React.useState(false);
  // Focus clavier sur le bouton Attraper : force sa visibilité (sinon opacity 0 hors hover).
  const [heartFocus, setHeartFocus] = React.useState(false);
  const liked = !!(favs && favs.has(product.id));
  const fmt = (n) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const pct = product.oldPrice && product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const low = product.inStock && typeof product.stockLeft === 'number' && product.stockLeft <= 3;
  const unique = cart.isUnique(product.id);
  const inCart = cart.items().some((l) => l.id === product.id);
  const lockedUnique = unique && inCart;          // already in cart → can't add another

  return (
    <a href="#" className="lc-card" onClick={(e) => { e.preventDefault(); open(); }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', flexDirection: 'column', background: 'var(--card)', border: '1.5px solid', borderColor: hover ? 'var(--line-strong)' : 'var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', transition: 'all 0.2s ease', transform: hover ? 'translateY(-4px)' : 'none', boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-xs)', color: 'var(--ink)' }}>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 6 }}>
          {pct > 0 && <span style={lcBadgeStyle('sale')}>−{pct}%</span>}
          {product.badge && product.badge.tone !== 'graded' && <span style={lcBadgeStyle(product.badge.tone)}>{product.badge.label}</span>}
        </span>
        {!product.inStock && <span style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}><span style={lcBadgeStyle('oos')}>Rupture</span></span>}
        {favs && product.inStock && (
          <button type="button" aria-pressed={liked} aria-label={liked ? 'Retirer de ma collection' : 'Attraper cette carte'} title={liked ? 'Dans ma collection' : 'Attraper'}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); favs.toggle(product.id); }}
            onFocus={() => setHeartFocus(true)} onBlur={() => setHeartFocus(false)}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', border: '1.5px solid ' + (liked ? 'var(--accent)' : 'var(--line)'), color: 'var(--muted)', opacity: hover || liked || heartFocus || lcCoarsePointer ? 1 : 0, transition: 'opacity 0.2s ease, border-color 0.2s ease' }}><CatchBall caught={liked} size={17} /></button>
        )}
        {product.image ? (
          <div style={{ aspectRatio: '1 / 1', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22, overflow: 'hidden' }}>
            <img src={product.image} alt={product.name} loading="lazy" decoding="async" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140'%3E%3Crect width='100' height='140' rx='8' fill='%23efe9da'/%3E%3Ctext x='50' y='80' font-family='sans-serif' font-size='28' font-weight='bold' fill='%23b9ad95' text-anchor='middle'%3E151%3C/text%3E%3C/svg%3E"; }} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.18))', transition: 'transform 0.35s cubic-bezier(0.2,0.8,0.2,1)', transform: hover ? 'scale(1.06)' : 'scale(1)' }} />
          </div>
        ) : <ProductStage glyph={product.glyph} />}
      </div>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--muted)' }}>{product.cat}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16.5, lineHeight: 1.22, letterSpacing: '-0.01em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40 }}>{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
          {product.oldPrice > product.price && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>{fmt(product.oldPrice)}&nbsp;€</span>}
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 18, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{fmt(product.price)}&nbsp;€</span>
          {pct > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>−{fmt(product.oldPrice - product.price)}&nbsp;€</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.04em', color: product.inStock ? (low ? 'var(--ink)' : 'var(--green)') : 'var(--muted)', fontWeight: low ? 600 : 400 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: product.inStock ? (low ? 'var(--accent)' : 'var(--green)') : 'var(--line-strong)' }}></span>
          {product.inStock ? (product.preorder ? 'Précommande · à la sortie' : low ? `Plus que ${product.stockLeft} en stock` : 'En stock · expédié sous 48 h') : 'Bientôt de retour'}
        </div>
        <button type="button" disabled={!product.inStock || lockedUnique} aria-label="Ajouter au panier"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (product.inStock && !lockedUnique) { cart.add(product.id); lcFlyToCart(e.currentTarget); } }}
          style={{ marginTop: 12, width: '100%', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, cursor: (product.inStock && !lockedUnique) ? 'pointer' : 'not-allowed', transition: 'all 0.18s ease', border: '1.5px solid', borderColor: lockedUnique ? 'var(--green)' : (product.inStock ? 'var(--ink)' : 'var(--line)'), background: lockedUnique ? 'var(--green-soft)' : (!product.inStock ? 'transparent' : hover ? 'var(--accent)' : 'var(--ink)'), color: lockedUnique ? 'var(--green)' : (!product.inStock ? 'var(--muted)' : (hover ? 'var(--on-accent)' : 'var(--on-ink)')), boxShadow: product.inStock && hover && !lockedUnique ? 'var(--shadow-accent)' : 'none' }}>
          {lockedUnique ? <React.Fragment><span style={{ fontSize: 15 }}>✓</span> Dans le panier (1/1)</React.Fragment> : (product.inStock ? <React.Fragment><span style={{ fontSize: 16 }}>＋</span> {product.preorder ? 'Précommander' : 'Ajouter au panier'}</React.Fragment> : 'Indisponible')}
        </button>
      </div>
    </a>
  );
}

/* ProductRow — a titled horizontal carousel of StoreCards (shop rayon). */
function ProductRow({ eyebrow, title, products, navigate, onSeeAll }) {
  const ref = React.useRef(null);
  const scroll = (dir) => { if (ref.current) ref.current.scrollBy({ left: dir * 560, behavior: 'smooth' }); };
  if (!products.length) return null;
  return (
    <section style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em' }}>{title}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onSeeAll && onSeeAll(); }} style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Tout voir →</a>
          <div style={{ display: 'flex', gap: 6 }}>
            {[-1, 1].map((d) => (
              <button key={d} onClick={() => scroll(d)} aria-label={d < 0 ? 'Précédent' : 'Suivant'}
                style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', background: 'var(--card)', color: 'var(--ink)', fontSize: 15 }}>{d < 0 ? '‹' : '›'}</button>
            ))}
          </div>
        </div>
      </div>
      <div ref={ref} style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: '248px', gap: 18, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 6, scrollbarWidth: 'none' }}>
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

const lcField = { width: '100%', padding: '11px 13px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', background: 'var(--paper)', fontSize: 14.5, color: 'var(--ink)', outline: 'none', marginBottom: 12, boxSizing: 'border-box' };
function lcCta() { return { width: '100%', height: 46, borderRadius: 'var(--radius-sm)', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, cursor: 'pointer', background: 'var(--accent)', color: 'var(--on-accent)' }; }

function ModalShell({ title, children, onClose }) {
  const panelRef = React.useRef(null);
  useFocusTrap(panelRef, onClose);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}></div>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="lc-modal-title" tabIndex={-1} style={{ position: 'relative', width: 'min(440px, 100%)', background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 26, outline: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 id="lc-modal-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>{title}</h3>
          <button onClick={onClose} aria-label="Fermer" style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', fontSize: 17, color: 'var(--ink)', cursor: 'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LcSuccess({ message, onClose }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
      <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>✓</div>
      <p style={{ fontSize: 15.5, color: 'var(--ink-2)', marginBottom: 20, lineHeight: 1.55 }}>{message}</p>
      <button onClick={onClose} style={lcCta()}>Fermer</button>
    </div>
  );
}

function FormModal({ title, fields, cta, success, onClose }) {
  const [sent, setSent] = React.useState(false);
  const submit = (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.currentTarget);
      const obj = {};
      fd.forEach((v, k) => { obj[k] = v; });
      if (window.LC151 && window.LC151.notify) window.LC151.notify(title, obj);   // envoi réel si configuré
    } catch (err) {}
    setSent(true);
  };
  return (
    <ModalShell title={title} onClose={onClose}>
      {sent ? <LcSuccess message={success} onClose={onClose} /> : (
        <form onSubmit={submit}>
          {fields.map((f) => f.type === 'textarea'
            ? <textarea key={f.ph} name={f.ph} required placeholder={f.ph} rows={4} style={{ ...lcField, resize: 'vertical' }} />
            : <input key={f.ph} name={f.ph} type={f.type || 'text'} required placeholder={f.ph} style={lcField} />)}
          <button type="submit" style={lcCta()}>{cta}</button>
        </form>
      )}
    </ModalShell>
  );
}

function AccountModal({ onClose }) {
  const auth = useAuth();
  const [tab, setTab] = React.useState('login');
  const [sent, setSent] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  if (auth.isLoggedIn()) {
    const u = auth.user();
    return (
      <ModalShell title="Mon compte" onClose={onClose}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, textTransform: 'uppercase' }}>{(u.name || 'C')[0]}</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{u.name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{u.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
          {[['Mes commandes', 'orders'], ['Mes adresses', 'addresses'], ['Mes alertes', 'alerts']].map(([it, target]) => (
            <button key={it} onClick={() => { openModal(target); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', padding: '11px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line)', background: 'var(--card)', color: 'var(--ink)', fontSize: 14, cursor: 'pointer' }}>
              {it}
              {it === 'Mes alertes' && window.LC151.Alerts.count() > 0 && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 'var(--radius-pill)', background: 'var(--accent)', color: 'var(--on-accent)', fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{window.LC151.Alerts.count()}</span>}
            </button>
          ))}
        </div>
        <button onClick={() => { auth.logout(); onClose(); }} style={{ ...lcCta(), background: 'var(--ink)', color: 'var(--on-ink)' }}>Se déconnecter</button>
      </ModalShell>
    );
  }
  const title = tab === 'login' ? 'Connexion' : 'Créer un compte';
  const submit = (e) => {
    e.preventDefault();
    window.LC151.Auth.login(email, tab === 'register' ? name : '');
    setSent(true);
  };
  return (
    <ModalShell title={title} onClose={onClose}>
      {sent ? <LcSuccess message={tab === 'login' ? 'Connexion réussie. Vous pouvez finaliser votre commande.' : 'Compte créé. Bienvenue ! Vous pouvez maintenant commander.'} onClose={onClose} /> : (
        <React.Fragment>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[['login', 'Connexion'], ['register', 'Créer un compte']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ flex: 1, height: 38, borderRadius: 'var(--radius-sm)', border: '1.5px solid', borderColor: tab === k ? 'var(--ink)' : 'var(--line-strong)', background: tab === k ? 'var(--ink)' : 'transparent', color: tab === k ? 'var(--on-ink)' : 'var(--ink)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
          <form onSubmit={submit}>
            {tab === 'register' && <input required placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} style={lcField} />}
            <input required type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={lcField} />
            <input required type="password" placeholder="Mot de passe" style={lcField} />
            <button type="submit" style={lcCta()}>{tab === 'login' ? 'Se connecter' : 'Créer mon compte'}</button>
          </form>
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
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid', borderColor: on ? 'var(--ink)' : 'var(--line)', background: on ? 'var(--accent-wash)' : 'var(--card)', color: 'var(--ink)', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 38, height: 22, borderRadius: 'var(--radius-pill)', background: on ? 'var(--accent)' : 'var(--line-strong)', position: 'relative', flexShrink: 0, transition: 'background 0.18s ease' }}>
                <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: on ? 'var(--on-accent)' : 'var(--card)', transition: 'left 0.18s ease' }}></span>
              </span>
              <span style={{ flex: 1, fontWeight: on ? 600 : 400 }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Alerte sur un mot-clé</div>
      <form onSubmit={addKw} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="ex. Dracaufeu, Méga-Évolution…" style={{ ...lcField, marginBottom: 0 }} />
        <button type="submit" style={{ flexShrink: 0, padding: '0 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--ink)', color: 'var(--on-ink)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>Ajouter</button>
      </form>
      {data.keywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {data.keywords.map((k) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 8px 6px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--paper-2)', border: '1.5px solid var(--line)', fontSize: 13 }}>
              {k}
              <button onClick={() => alerts.removeKeyword(k)} aria-label={'Retirer ' + k} style={{ width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'var(--line-strong)', color: 'var(--paper)', fontSize: 11, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', paddingTop: 6, borderTop: '1.5px solid var(--line)' }}>
        {alerts.count() > 0 ? `${alerts.count()} alerte${alerts.count() > 1 ? 's' : ''} active${alerts.count() > 1 ? 's' : ''} · envoyées à ${auth.user().email}` : 'Aucune alerte active pour le moment.'}
      </div>
    </ModalShell>
  );
}

function OrdersModal({ onClose }) {
  const auth = useAuth();
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => window.LC151.Orders.subscribe(force), []);
  if (!auth.isLoggedIn()) return <AccountModal onClose={onClose} />;
  const { fmt, Orders } = window.LC151;
  const list = Orders.forUser(auth.user().email);
  return (
    <ModalShell title="Mes commandes" onClose={onClose}>
      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 14.5, color: 'var(--ink-2)', marginBottom: 18 }}>Vous n'avez pas encore passé de commande.</p>
          <button onClick={onClose} style={lcCta()}>Explorer la boutique</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((o) => (
            <div key={o.number} style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13.5 }}>{o.number}</span>
                <span style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: 'var(--green-soft)', color: 'var(--green)', fontWeight: 600 }}>{o.status}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 8 }}>{new Date(o.date).toLocaleDateString('fr-FR')} · {(o.items || []).reduce((s, i) => s + i.qty, 0)} article(s)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--ink-2)' }}>{((window.LC151.Orders.methods()[o.method] || {}).label || 'Livraison standard')}</span>
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

  const save = () => {
    const e = {};
    ['name', 'addr', 'zip', 'city'].forEach((k) => { if (!String(a[k]).trim()) e[k] = 1; });
    if (a.zip && !/^\d{4,5}$/.test(a.zip.trim())) e.zip = 1;
    setErr(e);
    if (Object.keys(e).length) return;
    auth.setAddress(a);
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
        {Object.keys(err).length > 0 && <div role="alert" style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>Veuillez vérifier les champs en rouge.</div>}
        {done && <div role="status" style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><span>✓</span> Adresse enregistrée.</div>}
        <button onClick={save} style={lcCta()}>{done ? 'Enregistré ✓' : 'Enregistrer l’adresse'}</button>
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
Object.assign(window, { lcNavigate, useCart, useStore, useAuth, useAlerts, useFavorites, lcUseFocusTrap: useFocusTrap, Pokeball, CatchBall, lcFlyToCart, Logo, Announcement, ThemeToggle, Header, ProductStage, Footer, StoreCard, ProductRow, openModal, closeModal, ModalHost });
