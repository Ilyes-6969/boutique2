/* leclub151 — Tunnel de paiement (checkout multi-étapes)
   Livraison → Paiement → Confirmation. Crée une commande, vide le panier.
   Paiement simulé (validation Luhn / date / CVC) — à brancher sur un vrai PSP
   (Stripe, WooCommerce Payments) en production. */

function lcLuhn(num) {
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

function CheckoutModal({ onClose }) {
  const cart = useCart();
  const auth = useAuth();
  const { fmt, Orders, FREE_SHIP } = window.LC151;
  const items = cart.items();
  const subtotal = cart.subtotal();

  const [step, setStep] = React.useState('livraison'); // livraison | paiement | confirme
  const [order, setOrder] = React.useState(null);
  const u = auth.user() || {};
  const sa = u.address || {};
  const [ship, setShip] = React.useState({ name: sa.name || u.name || '', email: u.email || '', addr: sa.addr || '', city: sa.city || '', zip: sa.zip || '', phone: sa.phone || '', method: 'standard' });
  const [pay, setPay] = React.useState({ card: '', exp: '', cvc: '', holder: '' });
  const [errors, setErrors] = React.useState({});

  const shippingCost = Orders.shippingCost(ship.method, subtotal);
  const total = subtotal + shippingCost;

  const field = { width: '100%', padding: '11px 13px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', background: 'var(--paper)', fontSize: 14.5, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' };
  const lbl = { fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, display: 'block' };
  const errStyle = (k) => errors[k] ? { ...field, borderColor: 'var(--red)' } : field;

  const setS = (k, v) => setShip((s) => ({ ...s, [k]: v }));
  const setP = (k, v) => setPay((p) => ({ ...p, [k]: v }));

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };

  const validateShip = () => {
    const e = {};
    ['name', 'email', 'addr', 'city', 'zip'].forEach((k) => { if (!String(ship[k]).trim()) e[k] = 1; });
    if (ship.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ship.email)) e.email = 1;
    if (ship.zip && !/^\d{4,5}$/.test(ship.zip.trim())) e.zip = 1;
    setErrors(e); return Object.keys(e).length === 0;
  };
  const validatePay = () => {
    if (ship.method === 'pickup') return true; // pay in store
    const e = {};
    if (!lcLuhn(pay.card)) e.card = 1;
    const m = pay.exp.match(/^(\d{2})\/(\d{2})$/);
    if (!m || +m[1] < 1 || +m[1] > 12) e.exp = 1;
    else { const exp = new Date(2000 + +m[2], +m[1], 0, 23, 59); if (exp < new Date()) e.exp = 1; }
    if (!/^\d{3,4}$/.test(pay.cvc)) e.cvc = 1;
    if (!pay.holder.trim()) e.holder = 1;
    setErrors(e); return Object.keys(e).length === 0;
  };

  const [paying, setPaying] = React.useState(false);
  const goPay = () => { if (validateShip()) { setErrors({}); setStep('paiement'); } };
  const placeOrder = () => {
    if (paying) return;
    if (!validatePay()) return;
    // Re-resolve every line against the LIVE catalogue — never trust the cart blindly.
    const resolved = items
      .map((l) => { const p = window.LC151.get(l.id); return p ? { p: p, l: l } : null; })
      .filter(Boolean);
    if (resolved.length === 0) { setErrors({ cart: 1 }); return; }        // nothing left to buy
    if (resolved.some(({ p }) => p.inStock === false)) { setErrors({ stock: 1 }); return; } // went OOS
    setErrors({});
    const lines = resolved.map(({ p, l }) => ({ name: p.name, qty: l.qty, price: p.price }));
    const finalize = (result) => {
      const o = Orders.add({
        email: ship.email, name: ship.name,
        items: lines,
        subtotal, shipping: shippingCost, total,
        method: ship.method, address: ship.addr + ', ' + ship.zip + ' ' + ship.city,
        paid: ship.method !== 'pickup' ? !!(result && result.paid) : false,
        payRef: result ? result.ref : null,
      });
      setOrder(o); cart.clear(); setPaying(false); setStep('confirme');
    };
    // Couche paiement isolée (payments.js) — simulation aujourd'hui, vrai PSP
    // (Stripe / Qonto / SumUp) demain : un seul fichier à changer.
    const card = { method: ship.method, card: pay.card, exp: pay.exp, cvc: pay.cvc, holder: pay.holder };
    const payFlow = (window.LCPay && window.LCPay.process)
      ? window.LCPay.process({ items: lines, total: total }, card)
      : Promise.resolve({ paid: ship.method !== 'pickup', ref: null });
    setPaying(true);
    payFlow.then(finalize).catch(function () { setPaying(false); setErrors({ card: 1 }); });
  };

  const steps = [['livraison', 'Livraison'], ['paiement', 'Paiement'], ['confirme', 'Confirmation']];
  const stepIdx = steps.findIndex((s) => s[0] === step);

  const summary = (
    <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--radius)', padding: '18px 18px 20px', alignSelf: 'flex-start' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Récapitulatif</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, maxHeight: 220, overflowY: 'auto' }}>
        {items.map((l) => { const p = window.LC151.get(l.id); if (!p) return null; return (
          <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 6, background: 'var(--card)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {p.image ? <img src={p.image} alt="" style={{ maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11, color: 'var(--muted)' }}>151</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>×{l.qty}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600 }}>{fmt(p.price * l.qty)}</div>
          </div>
        ); })}
      </div>
      <div style={{ borderTop: '1.5px solid var(--line)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}><span>Sous-total</span><span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(subtotal)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}><span>Livraison</span><span style={{ fontFamily: 'var(--font-mono)' }}>{shippingCost === 0 ? 'Offerte' : fmt(shippingCost)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 4 }}><span>Total</span><span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(total)}</span></div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }}></div>
      <div role="dialog" aria-modal="true" aria-label="Paiement sécurisé" style={{ position: 'relative', width: 'min(760px, 100%)', maxHeight: '92vh', overflowY: 'auto', background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 26 }}>
        {/* head */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>
            {step === 'confirme' ? 'Commande confirmée' : 'Paiement sécurisé'}
          </h3>
          <button onClick={onClose} aria-label="Fermer" style={{ marginLeft: 'auto', width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', fontSize: 17, color: 'var(--ink)', cursor: 'pointer', background: 'transparent' }}>×</button>
        </div>

        {/* stepper */}
        {step !== 'confirme' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
            {steps.slice(0, 2).map(([k, label], i) => (
              <React.Fragment key={k}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: i <= stepIdx ? 'var(--accent)' : 'var(--paper-2)', color: i <= stepIdx ? 'var(--on-accent)' : 'var(--muted)' }}>{i + 1}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: i <= stepIdx ? 'var(--ink)' : 'var(--muted)' }}>{label}</span>
                </div>
                {i === 0 && <span style={{ flex: 1, height: 1.5, background: 'var(--line)' }}></span>}
              </React.Fragment>
            ))}
          </div>
        )}

        {step === 'confirme' ? (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px' }}>✓</div>
            <p style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 6 }}>Merci {order.name} ! Votre commande est confirmée.</p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, marginBottom: 18 }}>N° {order.number}</div>
            <div style={{ maxWidth: 420, margin: '0 auto 22px', textAlign: 'left', background: 'var(--paper-2)', borderRadius: 'var(--radius)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}><span style={{ color: 'var(--ink-2)' }}>Total</span><strong style={{ fontFamily: 'var(--font-mono)' }}>{fmt(order.total)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}><span style={{ color: 'var(--ink-2)' }}>Livraison</span><span>{Orders.methods()[order.method].label}</span></div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>{order.paid ? 'Paiement reçu.' : 'À régler au retrait en boutique.'} Un e-mail de confirmation a été envoyé à {order.email}.</div>
            </div>
            <button onClick={onClose} style={{ padding: '12px 28px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Continuer mes achats</button>
          </div>
        ) : (
          <div className="lc-checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: 24 }}>
            <div>
              {step === 'livraison' ? (
                <React.Fragment>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div><label style={lbl}>Nom complet</label><input style={errStyle('name')} value={ship.name} onChange={(e) => setS('name', e.target.value)} /></div>
                    <div><label style={lbl}>E-mail</label><input style={errStyle('email')} value={ship.email} onChange={(e) => setS('email', e.target.value)} /></div>
                  </div>
                  <div style={{ marginBottom: 12 }}><label style={lbl}>Adresse</label><input style={errStyle('addr')} value={ship.addr} onChange={(e) => setS('addr', e.target.value)} placeholder="N° et rue" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
                    <div><label style={lbl}>Code postal</label><input style={errStyle('zip')} value={ship.zip} onChange={(e) => setS('zip', e.target.value)} /></div>
                    <div><label style={lbl}>Ville</label><input style={errStyle('city')} value={ship.city} onChange={(e) => setS('city', e.target.value)} /></div>
                  </div>
                  <div style={{ marginBottom: 16 }}><label style={lbl}>Téléphone (optionnel)</label><input style={field} value={ship.phone} onChange={(e) => setS('phone', e.target.value)} /></div>
                  <label style={lbl}>Mode de livraison</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                    {Object.values(Orders.methods()).map((m) => {
                      const cost = Orders.shippingCost(m.key, subtotal);
                      const on = ship.method === m.key;
                      return (
                        <button key={m.key} onClick={() => setS('method', m.key)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 'var(--radius-sm)', border: '1.5px solid', borderColor: on ? 'var(--accent)' : 'var(--line)', background: on ? 'var(--accent-wash)' : 'var(--card)', cursor: 'pointer', textAlign: 'left' }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid', borderColor: on ? 'var(--accent)' : 'var(--line-strong)', flexShrink: 0, position: 'relative' }}>{on && <span style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: 'var(--accent)' }}></span>}</span>
                          <span style={{ flex: 1 }}><span style={{ fontWeight: 600, fontSize: 14, display: 'block' }}>{m.label}</span><span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{m.eta}</span></span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13.5, color: cost === 0 ? 'var(--green)' : 'var(--ink)' }}>{cost === 0 ? 'Offert' : fmt(cost)}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={goPay} style={{ width: '100%', height: 46, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Continuer vers le paiement →</button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {ship.method === 'pickup' ? (
                    <div style={{ padding: '20px', background: 'var(--accent-wash)', border: '1.5px solid var(--accent-soft)', borderRadius: 'var(--radius)', marginBottom: 16, fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>
                      Vous avez choisi le <strong>retrait en boutique</strong> à Vienne. Vous réglerez sur place — aucune carte requise maintenant.
                    </div>
                  ) : (
                    <React.Fragment>
                      <div style={{ marginBottom: 12 }}><label style={lbl}>Numéro de carte</label><input inputMode="numeric" style={errStyle('card')} value={pay.card} onChange={(e) => setP('card', fmtCard(e.target.value))} placeholder="4242 4242 4242 4242" /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div><label style={lbl}>Expiration</label><input inputMode="numeric" style={errStyle('exp')} value={pay.exp} onChange={(e) => setP('exp', fmtExp(e.target.value))} placeholder="MM/AA" /></div>
                        <div><label style={lbl}>CVC</label><input inputMode="numeric" style={errStyle('cvc')} value={pay.cvc} onChange={(e) => setP('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" /></div>
                      </div>
                      <div style={{ marginBottom: 8 }}><label style={lbl}>Titulaire de la carte</label><input style={errStyle('holder')} value={pay.holder} onChange={(e) => setP('holder', e.target.value)} /></div>
                      {(errors.card || errors.exp || errors.cvc || errors.holder) && <div style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 10 }}>Vérifiez les informations de paiement saisies.</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}><span>🔒</span> Paiement chiffré · vos données ne sont pas stockées</div>
                    </React.Fragment>
                  )}
                  {(errors.stock || errors.cart) && <div style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 10 }}>{errors.cart ? 'Votre panier est vide.' : 'Un article n’est plus disponible — retirez-le du panier pour continuer.'}</div>}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setErrors({}); setStep('livraison'); }} style={{ padding: '0 18px', height: 46, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', background: 'transparent', color: 'var(--ink)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>← Retour</button>
                    <button onClick={placeOrder} disabled={paying} style={{ flex: 1, height: 46, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600, fontSize: 15, cursor: paying ? 'wait' : 'pointer', opacity: paying ? 0.7 : 1 }}>{paying ? 'Traitement…' : (ship.method === 'pickup' ? 'Valider la commande' : 'Payer ' + fmt(total))}</button>
                  </div>
                </React.Fragment>
              )}
            </div>
            {summary}
          </div>
        )}
      </div>
    </div>
  );
}
Object.assign(window, { CheckoutModal });
