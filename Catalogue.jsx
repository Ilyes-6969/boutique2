/* leclub151 — Catalogue (boutique grid + filters) */
function Catalogue({ navigate, initialFilter }) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const { PRODUCTS, FILTERS } = window.LC151;
  const CHIPS = [...FILTERS, { key: 'preorder', label: 'Précommande' }];
  const [filter, setFilter] = React.useState(initialFilter || 'all');
  const [sort, setSort] = React.useState('feat');

  React.useEffect(() => { if (initialFilter) setFilter(initialFilter); }, [initialFilter]);

  // Catalogue source-of-truth state (drives loading / error / empty UI).
  const Store = window.LC151.Store;
  const wp = Store.wpStatus();              // { state: off|loading|ok|error, error }
  const loading = wp.state === 'loading';
  const errored = wp.state === 'error';
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 18 };
  const stateBox = { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '72px 24px' };

  let list = PRODUCTS.filter((p) => filter === 'all' ? true : filter === 'preorder' ? p.preorder : p.type === filter);
  if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);

  return (
    <div>
      {/* PAGE HEAD */}
      <section style={{ borderBottom: '1.5px solid var(--line)', background: 'var(--paper-2)' }}>
        <div className="container-wide" style={{ padding: '44px 24px 38px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }}>Accueil</a> &nbsp;/&nbsp; Boutique
          </div>
          <h1 className="display-2" style={{ marginBottom: 10 }}>La boutique</h1>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', maxWidth: 560 }}>
            Cartes à l'unité, gradées, scellé et accessoires. Le catalogue est géré depuis WordPress / WooCommerce — il apparaîtra ici dès l'ajout de vos produits.
          </p>
        </div>
      </section>

      {/* TOOLBAR */}
      <div style={{ position: 'sticky', top: 124, zIndex: 30, background: 'var(--header-bg)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1.5px solid var(--line)' }}>
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CHIPS.map((f) => <DS.Tag key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</DS.Tag>)}
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

      {/* GRID */}
      <section className="container-wide" style={{ padding: '36px 24px 80px' }}>
        {loading ? (
          <div style={gridStyle} aria-busy="true" aria-label="Chargement du catalogue">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : errored ? (
          <div style={stateBox} role="alert">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Catalogue momentanément indisponible</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16, maxWidth: 440 }}>Impossible de charger les produits ({wp.error}). Vérifiez la connexion WooCommerce et réessayez.</p>
            <DS.Button variant="outline" onClick={() => Store.refreshFromWp()}>Réessayer</DS.Button>
          </div>
        ) : list.length === 0 ? (
          <div style={stateBox}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Aucun produit pour le moment</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 440 }}>Le catalogue est géré depuis WordPress / WooCommerce — vos produits apparaîtront ici dès leur ajout.</p>
          </div>
        ) : (
          <div style={gridStyle}>
            {list.map((p) => <StoreCard key={p.id} product={p} navigate={navigate} />)}
          </div>
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
