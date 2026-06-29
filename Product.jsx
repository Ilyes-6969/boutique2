/* leclub151 — Fiche produit (product detail) */
function Product({ navigate, productId, onCart }) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const { PRODUCTS, Cart, FREE_SHIP, fmt } = window.LC151;
  const cart = useCart();
  const product = window.LC151.get(productId) || PRODUCTS[0];
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  const lockedUnique = product ? (cart.isUnique(product.id) && cart.items().some((l) => l.id === product.id)) : false;
  if (!product) {
    return (
      <div className="container-wide" style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--ink-2)' }}>
        <h1 className="display-3" style={{ marginBottom: 10 }}>Produit indisponible</h1>
        <p style={{ marginBottom: 24 }}>Ce produit n'est pas encore en ligne.</p>
        <DS.Button variant="accent" onClick={() => navigate('home')}>Retour à l'accueil</DS.Button>
      </div>
    );
  }

  const related = PRODUCTS.filter((p) => p.id !== product.id && p.type === product.type).slice(0, 4);
  const relList = related.length ? related : PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const addToCart = (e) => {
    Cart.add(product.id, qty);
    if (e && e.currentTarget && window.lcFlyToCart) window.lcFlyToCart(e.currentTarget);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const specs = [
    ['Série', product.set],
    ['Numéro', product.num],
    ['Rareté', product.rarity || '—'],
    ['État', product.type === 'graded' ? 'Sous coque — certifié' : 'Near Mint'],
    ['Référence', 'LC151-' + product.id.toUpperCase()],
  ];

  return (
    <div>
      <section className="container-wide" style={{ padding: '28px 24px 16px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }}>Accueil</a> &nbsp;/&nbsp;
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('catalogue', product.type); }}> {product.cat}</a> &nbsp;/&nbsp;
          <span style={{ color: 'var(--ink)' }}> {product.name}</span>
        </div>
      </section>

      <section className="container-wide lc-prod-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, padding: '20px 24px 72px', alignItems: 'start' }}>
        {/* GALLERY */}
        <div className="lc-prod-gallery" style={{ position: 'sticky', top: 92 }}>
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 460 }}>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ maxHeight: 440, filter: 'drop-shadow(0 22px 36px rgba(26,23,20,0.30))' }} />
            ) : (
              <div style={{ width: '70%' }}><ProductStage glyph={product.glyph} ratio="3 / 4" big /></div>
            )}
          </div>
        </div>

        {/* INFO */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {product.badge && <DS.Badge tone={product.badge.tone}>{product.badge.label}</DS.Badge>}
            <DS.Badge tone={product.inStock ? 'stock' : 'oos'}>{product.inStock ? 'En stock' : 'Rupture'}</DS.Badge>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>{product.cat} · {product.set}</div>
          <h1 className="display-2" style={{ marginBottom: 18 }}>{product.name}</h1>
          <div style={{ marginBottom: 22 }}><DS.PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" /></div>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-2)', marginBottom: 28, maxWidth: 520 }}>{product.desc}</p>

          {window.LC151.Cart.isUnique(product.id) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', marginBottom: 20, background: 'var(--accent-wash)', border: '1.5px solid var(--accent-soft)', borderRadius: 'var(--radius-sm)', fontSize: 13.5, color: 'var(--ink)' }}>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>1 / 1</span>
              <span style={{ color: 'var(--ink-2)' }}>Pièce unique — une seule édition disponible en boutique.</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            {!window.LC151.Cart.isUnique(product.id) && <DS.QtyStepper value={qty} onChange={setQty} max={10} />}
            <div style={{ flex: 1 }}>
              <DS.Button variant="accent" size="lg" block disabled={!product.inStock || lockedUnique} iconLeft={lockedUnique ? '✓' : (added ? '✓' : '＋')} onClick={lockedUnique ? undefined : addToCart}>
                {lockedUnique ? 'Déjà dans le panier (1/1)' : (added ? 'Ajouté au panier' : product.inStock ? 'Ajouter au panier' : 'Indisponible')}
              </DS.Button>
            </div>
          </div>
          <DS.Button variant="outline" size="lg" block onClick={() => { Cart.add(product.id, qty); onCart(); }} disabled={!product.inStock}>Acheter maintenant</DS.Button>

          <div style={{ marginTop: 18, padding: '12px 16px', background: 'var(--accent-wash)', border: '1.5px solid var(--accent-soft)', borderRadius: 'var(--radius-sm)', fontSize: 13.5, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--ink)' }}>★</span> Livraison offerte dès {FREE_SHIP} € · expédition protégée sous 48 h
          </div>

          {/* SPECS */}
          <div style={{ marginTop: 32, border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {specs.map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 18px', background: i % 2 ? 'transparent' : 'var(--paper-2)', fontSize: 14 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section style={{ borderTop: '1.5px solid var(--line)' }}>
        <div className="container-wide" style={{ padding: '56px 24px 80px' }}>
          <h2 className="display-3" style={{ marginBottom: 26 }}>Dans le même rayon</h2>
          <div className="lc-grid-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {relList.map((p) => <StoreCard key={p.id} product={p} navigate={navigate} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
Object.assign(window, { Product });
