/* leclub151 — Catalogue (boutique grid + filters) */

/* Normalisation accents/casse — même logique que lcNormalize de Chrome.jsx
   (SearchBox) : les liens du méga-menu pré-remplissent q avec des libellés
   accentués (« Écarlate & Violet »…), le filtre doit matcher comme le header. */
function catNormalize(s) {
  const str = String(s || '').toLowerCase();
  try { return str.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { return str; }
}

// Icône favori « marque-page » partagée (Chrome.jsx, chargé avant) — repli discret.
const FavRibbon = window.FavRibbon || function () { return null; };

function Catalogue({ navigate, initialFilter, initialQuery, initialGame }) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const { PRODUCTS, FILTERS } = window.LC151;
  const CHIPS = [...FILTERS, { key: 'preorder', label: 'Précommande' }];
  const [filter, setFilter] = React.useState(initialFilter || 'all');
  const [query, setQuery] = React.useState(initialQuery || '');
  const [sort, setSort] = React.useState('feat');
  // Pagination d'affichage : la grille rend 48 produits, puis « Afficher plus »
  // (le catalogue WooCommerce peut compter plusieurs centaines de produits).
  const PAGE_SIZE = 48;
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const game = initialGame || 'pokemon';
  const GAMES = { pokemon: 'Pokémon', lorcana: 'Disney Lorcana', onepiece: 'One Piece Card Game', magic: 'Magic: The Gathering', yugioh: 'Yu-Gi-Oh!' };
  const comingSoon = game !== 'pokemon';

  React.useEffect(() => { if (initialFilter) setFilter(initialFilter); }, [initialFilter]);
  React.useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filter, query]);   // filtre/recherche → retour en haut de liste

  // Catalogue source-of-truth state (drives loading / error / empty UI).
  // useStore() s'abonne au Store : la grille se re-rend à l'arrivée du
  // catalogue (/api/catalog résout souvent APRÈS le montage React) au lieu
  // de rester figée sur les squelettes.
  const Store = useStore();
  // Favoris (C4) — useFavorites (Chrome.jsx) s'abonne au store et renvoie null
  // s'il est absent : le chip « ♥ Favoris » n'apparaît alors jamais.
  const favStore = useFavorites();
  const favIds = favStore ? favStore.all() : [];
  const showFavChip = !!favStore && (favIds.length > 0 || filter === 'favs');
  const wp = Store.wpStatus();              // { state: off|loading|ok|error, error }
  const loading = wp.state === 'loading';
  const errored = wp.state === 'error';
  // Respiration : plus d'air entre les rangées qu'entre les colonnes — la grille
  // « respire » verticalement sans écarter les cartes horizontalement.
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', rowGap: 24, columnGap: 18 };
  const stateBox = { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '72px 24px' };
  // Pastille icône partagée des états (aucun résultat / erreur) — même traitement
  // que le rayon « bientôt disponible » (rond var(--accent-wash)), pour l'homogénéité.
  const stateIcon = (glyph) => (
    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-wash)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 18 }}>{glyph}</div>
  );

  const q = catNormalize(query.trim());
  let list = comingSoon ? [] : filter === 'favs'
    ? PRODUCTS.filter((p) => favIds.indexOf(p.id) !== -1)
    : PRODUCTS.filter((p) => filter === 'all' ? true : filter === 'preorder' ? p.preorder : p.type === filter);
  if (q) list = list.filter((p) => catNormalize((p.name || '') + ' ' + (p.set || '') + ' ' + (p.num || '') + ' ' + (p.cat || '')).includes(q));
  if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  const visible = list.slice(0, visibleCount);
  const hiddenCount = list.length - visible.length;
  // Grille : miniature (thumb) si le catalogue en fournit une, sinon l'image
  // pleine taille — sans toucher StoreCard (Chrome.jsx), qui lit product.image.
  const gridProduct = (p) => (p.thumb ? { ...p, image: p.thumb } : p);

  return (
    <div>
      {/* PAGE HEAD */}
      <section style={{ borderBottom: '1.5px solid var(--line)', background: 'var(--paper-2)' }}>
        <div className="container-wide" style={{ padding: '44px 24px 38px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }}>Accueil</a> &nbsp;/&nbsp; {comingSoon ? GAMES[game] : 'Boutique'}
          </div>
          <h1 className="display-2" style={{ marginBottom: 10 }}>{comingSoon ? GAMES[game] : 'La boutique'}</h1>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', maxWidth: 560 }}>
            {comingSoon
              ? 'Rayon ' + GAMES[game] + ' bientôt disponible chez leclub151 — singles, scellé et accessoires. Revenez vite ou activez une alerte.'
              : "Cartes à l'unité, gradées, scellé et accessoires. Les rayons se remplissent — revenez très vite !"}
          </p>
        </div>
      </section>

      {/* TOOLBAR (masquée sur les rayons « bientôt disponibles ») */}
      {!comingSoon && (
      <div className="lc-cat-toolbar" style={{ position: 'sticky', top: 124, zIndex: 30, background: 'var(--paper-2)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1.5px solid var(--line)' }}>
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* La pastille active porte une micro-ombre (--shadow-xs) pour se
                détacher des inactives : DS.Tag pose son propre style, on enveloppe
                donc le chip actif d'un span pilulé qui porte l'ombre. */}
            {CHIPS.map((f) => <ChipShell key={f.key} active={filter === f.key}><DS.Tag active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</DS.Tag></ChipShell>)}
            {showFavChip && <ChipShell active={filter === 'favs'}><DS.Tag active={filter === 'favs'} onClick={() => setFilter('favs')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FavRibbon caught={true} size={12} />Ma collection</span></DS.Tag></ChipShell>}
          </div>
          {/* Groupe tri : séparateur discret + compteur mis en valeur + select stylé. */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span aria-hidden="true" style={{ width: 1.5, height: 22, background: 'var(--line)', borderRadius: 1, alignSelf: 'center' }}></span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{loading ? '…' : list.length + ' produits'}</span>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>
      </div>
      )}

      {/* GRID */}
      <section className="container-wide" style={{ padding: '36px 24px 80px' }}>
        {loading ? (
          <div style={gridStyle} aria-busy="true" aria-label="Chargement du catalogue">
            {/* ~16 squelettes : remplit la 1re page visible pour éviter le saut de mise en page à l'arrivée du catalogue. */}
            {Array.from({ length: 16 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
          </div>
        ) : errored ? (
          <div style={stateBox} role="alert">
            {stateIcon('!')}
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Catalogue momentanément indisponible</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16, maxWidth: 440 }}>Le catalogue est momentanément indisponible. Réessayez dans un instant.</p>
            <DS.Button variant="outline" onClick={() => Store.refreshFromWp()}>Réessayer</DS.Button>
          </div>
        ) : comingSoon ? (
          <div style={stateBox}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-wash)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 18 }}>★</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', marginBottom: 8 }}>{GAMES[game]} arrive bientôt</div>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: 460, marginBottom: 22, lineHeight: 1.6 }}>Nous préparons un rayon {GAMES[game]} complet — singles, boosters, displays et accessoires. Laissez-nous votre e-mail pour être prévenu de l'ouverture.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <DS.Button variant="accent" onClick={() => openModal('newsletter')}>Être prévenu</DS.Button>
              <DS.Button variant="outline" onClick={() => navigate('catalogue', 'all')}>Voir le rayon Pokémon</DS.Button>
            </div>
          </div>
        ) : list.length === 0 ? (
          q ? (
            /* Recherche active sans résultat (ex. sous-lien du méga-menu) :
               sortie propre vers le rayon complet plutôt qu'une grille vide. */
            <div style={stateBox}>
              {stateIcon('⌕')}
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Aucun résultat pour «&nbsp;{query.trim()}&nbsp;» dans ce rayon</div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16, maxWidth: 440 }}>Essayez un autre terme, ou parcourez l'ensemble du rayon.</p>
              <DS.Button variant="outline" onClick={() => setQuery('')}>Voir tout le rayon</DS.Button>
            </div>
          ) : filter === 'favs' ? (
            <div style={stateBox}>
              <div style={{ marginBottom: 16, opacity: 0.9 }}><FavRibbon caught={true} size={40} /></div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Votre collection est vide</div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 440 }}>Cliquez le marque-page d'une carte pour la retrouver ici.</p>
            </div>
          ) : (
          <div style={stateBox}>
            {stateIcon('★')}
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Aucun produit pour le moment</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 440 }}>Les rayons se remplissent — revenez très vite !</p>
          </div>
          )
        ) : (
          <React.Fragment>
            <div style={gridStyle}>
              {visible.map((p) => <StoreCard key={p.id} product={gridProduct(p)} navigate={navigate} />)}
            </div>
            {hiddenCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                <DS.Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  Afficher plus ({hiddenCount} restant{hiddenCount > 1 ? 's' : ''})
                </DS.Button>
              </div>
            )}
          </React.Fragment>
        )}
      </section>
    </div>
  );
}
/* ChipShell — enveloppe pilulée qui porte la micro-ombre du chip ACTIF, pour le
   détacher des inactifs sans réécrire le style interne de DS.Tag. Passthrough
   transparent quand inactif (aucune boîte, aucune ombre). */
function ChipShell({ active, children }) {
  if (!active) return children;
  return <span style={{ display: 'inline-flex', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-xs)' }}>{children}</span>;
}

/* SortSelect — <select> de tri habillé : chevron OS masqué (appearance:none) et
   remplacé par une flèche dessinée, radius pilulé cohérent avec les chips, bordure
   qui s'appuie au survol. Reste un vrai <select> natif (accessibilité clavier). */
function SortSelect({ value, onChange }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const strong = hover || focus;
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Trier les produits"
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', padding: '9px 34px 9px 14px', borderRadius: 'var(--radius-pill)', border: '1.5px solid ' + (strong ? 'var(--ink)' : 'var(--line-strong)'), background: 'var(--card)', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer', outline: 'none', transition: 'border-color var(--dur-fast) var(--ease-out)' }}>
        <option value="feat">En vedette</option>
        <option value="price-asc">Prix croissant</option>
        <option value="price-desc">Prix décroissant</option>
      </select>
      {/* Chevron dessiné (le natif est masqué par appearance:none). */}
      <span aria-hidden="true" style={{ position: 'absolute', right: 13, top: '50%', width: 8, height: 8, borderRight: '1.5px solid ' + (strong ? 'var(--ink)' : 'var(--muted)'), borderBottom: '1.5px solid ' + (strong ? 'var(--ink)' : 'var(--muted)'), transform: 'translateY(-70%) rotate(45deg)', pointerEvents: 'none', transition: 'border-color var(--dur-fast) var(--ease-out)' }}></span>
    </div>
  );
}

/* SkeletonCard — squelette FIDÈLE à l'anatomie de StoreCard (Chrome.jsx) :
   fantôme de badge (coin haut-gauche), eyebrow catégorie, titre 2 lignes,
   ligne prix mono courte, pastille stock (point + libellé), bouton d'ajout.
   Les proportions (aspect 1/1, padding 14/16/16, hauteurs) épousent la vraie
   carte pour éviter le saut de mise en page au remplacement. L'entrée est
   décalée par index (lc-line-in, active seulement sous no-preference). */
function SkeletonCard({ index = 0 }) {
  const bar = (w, h, mt, extra) => <div style={{ width: w, height: h, marginTop: mt, borderRadius: 6, background: 'var(--line)', ...extra }}></div>;
  // Entrée décalée (lc-line-in) portée par le wrapper — le pouls (lcPulse) est
  // sur la carte interne pour ne pas écraser l'animation d'entrée (le shorthand
  // `animation` inline l'emporterait sur la classe). L'entrée reste inactive
  // sous prefers-reduced-motion (déclarée seulement en no-preference).
  return (
    <div className="lc-line-in" style={{ animationDelay: (index * 45) + 'ms' }}>
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)', animation: 'lcPulse 1.3s ease-in-out infinite' }}>
        {/* Zone image + fantôme de badge (coin haut-gauche, comme StoreCard). */}
        <div style={{ position: 'relative', aspectRatio: '1 / 1', background: 'var(--paper-2)' }}>
          <div style={{ position: 'absolute', top: 12, left: 12, width: 48, height: 20, borderRadius: 'var(--radius-pill)', background: 'var(--line)' }}></div>
        </div>
        {/* Corps : eyebrow, titre 2 lignes, prix mono court, pastille stock, bouton. */}
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
          {bar('38%', 10, 0)}
          <div style={{ minHeight: 40, marginTop: 5 }}>{bar('88%', 14, 0)}{bar('60%', 14, 7)}</div>
          {bar('34%', 17, 4)}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--line-strong)', flex: 'none' }}></span>
            {bar('52%', 9, 0)}
          </div>
          {bar('100%', 42, 12, { borderRadius: 'var(--radius-sm)' })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Catalogue, SkeletonCard });
