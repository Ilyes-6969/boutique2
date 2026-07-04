/* leclub151 — Catalogue (boutique grid + filters) */
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
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 18 };
  const stateBox = { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '72px 24px' };

  const q = query.trim().toLowerCase();
  let list = comingSoon ? [] : filter === 'favs'
    ? PRODUCTS.filter((p) => favIds.indexOf(p.id) !== -1)
    : PRODUCTS.filter((p) => filter === 'all' ? true : filter === 'preorder' ? p.preorder : p.type === filter);
  if (q) list = list.filter((p) => ((p.name || '') + ' ' + (p.set || '') + ' ' + (p.num || '') + ' ' + (p.cat || '')).toLowerCase().includes(q));
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
            {CHIPS.map((f) => <DS.Tag key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</DS.Tag>)}
            {showFavChip && <DS.Tag active={filter === 'favs'} onClick={() => setFilter('favs')}>♥ Favoris</DS.Tag>}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{loading ? '…' : list.length + ' produits'}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', background: 'var(--card)', fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer' }}>
              <option value="feat">En vedette</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
        </div>
      </div>
      )}

      {/* GRID */}
      <section className="container-wide" style={{ padding: '36px 24px 80px' }}>
        {loading ? (
          <div style={gridStyle} aria-busy="true" aria-label="Chargement du catalogue">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : errored ? (
          <div style={stateBox} role="alert">
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
          filter === 'favs' ? (
            <div style={stateBox}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Aucun favori pour l'instant</div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 440 }}>Cliquez le ♥ d'une carte pour la retrouver ici.</p>
            </div>
          ) : (
          <div style={stateBox}>
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
/* Skeleton placeholder shown while the WooCommerce catalogue loads. */
function SkeletonCard() {
  const bar = (w, h, mt) => <div style={{ width: w, height: h, marginTop: mt, borderRadius: 6, background: 'var(--paper-2)' }}></div>;
  return (
    <div style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', animation: 'lcPulse 1.3s ease-in-out infinite' }}>
      <div style={{ aspectRatio: '1 / 1', background: 'var(--paper-2)' }}></div>
      <div style={{ padding: '14px 16px 16px' }}>
        {bar('40%', 9, 0)}{bar('85%', 15, 10)}{bar('55%', 15, 8)}{bar('100%', 42, 14)}
      </div>
    </div>
  );
}

Object.assign(window, { Catalogue, SkeletonCard });
