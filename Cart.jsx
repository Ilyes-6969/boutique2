/* leclub151 — Panier (slide-over drawer) */
function CartDrawer({ open, onClose, navigate }) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const cart = useCart();
  const auth = useAuth();
  const { fmt, FREE_SHIP } = window.LC151;
  const items = cart.items();
  const subtotal = cart.subtotal();
  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIP) * 100);
  const loggedIn = auth.isLoggedIn();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: open ? 'auto' : 'none' }}>
      {/* scrim */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(26,23,20,0.45)', opacity: open ? 1 : 0, transition: 'opacity 0.3s ease' }}></div>
      {/* panel */}
      <aside role="dialog" aria-modal="true" aria-label="Votre panier" aria-hidden={!open} style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: 'min(440px, 100%)', background: 'var(--paper)', borderLeft: '1.5px solid var(--line)', boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', visibility: open ? 'visible' : 'hidden', transition: 'transform 0.32s cubic-bezier(0.2,0.8,0.2,1), visibility 0.32s', display: 'flex', flexDirection: 'column' }}>
        {/* head */}
        <div style={{ padding: '20px 22px', borderBottom: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19 }}>Votre panier <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 14 }}>({cart.count()})</span></div>
          <button onClick={onClose} aria-label="Fermer" style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', fontSize: 16, color: 'var(--ink)' }}>×</button>
        </div>

        {items.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 30, textAlign: 'center' }}>
            <ProductStage glyph="Panier vide" />
            <p style={{ color: 'var(--ink-2)', fontSize: 14.5 }}>Votre panier est vide pour l'instant.</p>
            <DS.Button variant="primary" onClick={() => { onClose(); navigate('catalogue'); }}>Explorer la boutique</DS.Button>
          </div>
        ) : (
          <React.Fragment>
            {/* free-ship progress */}
            <div style={{ padding: '16px 22px', borderBottom: '1.5px solid var(--line)' }}>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>
                {remaining > 0 ? <span>Plus que <strong style={{ color: 'var(--ink)' }}>{fmt(remaining)}</strong> pour la livraison offerte</span> : <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Livraison offerte débloquée</span>}
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--paper-2)', overflow: 'hidden' }}>
                <div style={{ width: pct + '%', height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>

            {/* lines */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px' }}>
              {items.map((line) => {
                const p = window.LC151.get(line.id);
                if (!p) return null;   // stale line — Cart.reconcile() prunes it; never crash
                return (
                  <div key={line.id} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1.5px solid var(--line)' }}>
                    <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 'var(--radius-sm)', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, overflow: 'hidden' }}>
                      {(p.thumb || p.image) ? <img src={p.thumb || p.image} alt={p.name} loading="lazy" decoding="async" style={{ maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--muted)' }}>151</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, lineHeight: 1.25 }}>{p.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', margin: '3px 0 8px' }}>{p.num}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        {window.LC151.Cart.isUnique(line.id)
                          ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '5px 9px' }}>Pièce unique · 1</span>
                          : <DS.QtyStepper value={line.qty} onChange={(q) => cart.setQty(line.id, q)} max={Math.min(10, cart.qtyCap(line.id))} />}
                        <DS.PriceTag price={p.price * line.qty} size="sm" />
                      </div>
                    </div>
                    <button onClick={() => cart.remove(line.id)} aria-label="Retirer" style={{ alignSelf: 'flex-start', fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>✕</button>
                  </div>
                );
              })}
            </div>

            {/* foot */}
            <div style={{ padding: '18px 22px 22px', borderTop: '1.5px solid var(--line)', background: 'var(--card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>Sous-total</span>
                <DS.PriceTag price={subtotal} size="lg" />
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>Taxes incluses · livraison calculée à l'étape suivante</div>
              {loggedIn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, color: 'var(--ink-2)' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{(auth.user().name || 'C')[0]}</span>
                  Connecté · {auth.user().name}
                </div>
              )}
              <DS.Button variant="accent" size="lg" block iconRight="→" onClick={() => { onClose(); openModal('checkout'); }}>Passer commande</DS.Button>
              {!loggedIn && (
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <button onClick={() => { onClose(); openModal('account'); }} style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-body)', background: 'transparent', textDecoration: 'underline', textUnderlineOffset: 2 }}>Vous avez un compte ? Se connecter</button>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Créez un compte pour suivre vos commandes.</div>
                </div>
              )}
              <button onClick={onClose} style={{ width: '100%', marginTop: 10, fontSize: 13.5, color: 'var(--ink-2)', fontFamily: 'var(--font-body)' }}>Continuer mes achats</button>
            </div>
          </React.Fragment>
        )}
      </aside>
    </div>
  );
}
function CartPage({ navigate }) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const cart = useCart();
  const auth = useAuth();
  const { fmt, FREE_SHIP } = window.LC151;
  const items = cart.items();
  const subtotal = cart.subtotal();
  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIP) * 100);
  const loggedIn = auth.isLoggedIn();

  return (
    <div>
      <section className="container-wide" style={{ padding: '28px 24px 8px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          <a href="index.html">Accueil</a> &nbsp;/&nbsp; <span style={{ color: 'var(--ink)' }}>Panier</span>
        </div>
      </section>
      <section className="container-wide" style={{ padding: '12px 24px 80px' }}>
        <h1 className="display-2" style={{ marginBottom: 24 }}>Votre panier</h1>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-lg)', background: 'var(--card)' }}>
            <p style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 20 }}>Votre panier est vide pour l'instant.</p>
            <DS.Button variant="accent" onClick={() => navigate('catalogue', 'all')}>Explorer la boutique</DS.Button>
          </div>
        ) : (
          <div className="lc-cart-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr', gap: 32, alignItems: 'start' }}>
            <div style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--card)' }}>
              {items.map((line) => {
                const p = window.LC151.get(line.id);
                if (!p) return null;
                return (
                  <div key={line.id} style={{ display: 'flex', gap: 16, padding: '18px 20px', borderBottom: '1.5px solid var(--line)' }}>
                    <a href={window.LC151.productUrl(p.id)} style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 'var(--radius-sm)', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, overflow: 'hidden' }}>
                      {(p.thumb || p.image) ? <img src={p.thumb || p.image} alt={p.name} loading="lazy" decoding="async" style={{ maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--muted)' }}>151</span>}
                    </a>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a href={window.LC151.productUrl(p.id)} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: 'var(--ink)' }}>{p.name}</a>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', margin: '4px 0 10px' }}>{p.cat} · {p.num}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        {cart.isUnique(line.id)
                          ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '6px 10px' }}>Pièce unique · 1</span>
                          : <DS.QtyStepper value={line.qty} onChange={(q) => cart.setQty(line.id, q)} max={Math.min(10, cart.qtyCap(line.id))} />}
                        <DS.PriceTag price={p.price * line.qty} size="md" />
                      </div>
                    </div>
                    <button onClick={() => cart.remove(line.id)} aria-label="Retirer" style={{ alignSelf: 'flex-start', fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--font-mono)', background: 'transparent' }}>✕</button>
                  </div>
                );
              })}
            </div>
            <div style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--card)', padding: '22px 22px 24px', position: 'sticky', top: 96 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Récapitulatif</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>
                  {remaining > 0 ? <span>Plus que <strong style={{ color: 'var(--ink)' }}>{fmt(remaining)}</strong> pour la livraison offerte</span> : <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Livraison offerte débloquée</span>}
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--paper-2)', overflow: 'hidden' }}>
                  <div style={{ width: pct + '%', height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>Sous-total ({cart.count()})</span>
                <DS.PriceTag price={subtotal} size="lg" />
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16 }}>Taxes incluses · livraison à l'étape suivante</div>
              <DS.Button variant="accent" size="lg" block iconRight="→" onClick={() => openModal('checkout')}>Passer commande</DS.Button>
              {!loggedIn && (
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <button onClick={() => openModal('account')} style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-body)', background: 'transparent', textDecoration: 'underline', textUnderlineOffset: 2 }}>Vous avez un compte ? Se connecter</button>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Créez un compte pour suivre vos commandes.</div>
                </div>
              )}
              <a href="boutique.html" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13.5, color: 'var(--ink-2)' }}>Continuer mes achats</a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
Object.assign(window, { CartDrawer, CartPage });
