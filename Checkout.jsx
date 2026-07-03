/* leclub151 — Tunnel de paiement (checkout multi-étapes)
   Livraison → Paiement → Confirmation. Crée une commande, vide le panier.
   Paiement simulé (validation Luhn / date / CVC) — à brancher sur un vrai PSP
   (Stripe, WooCommerce Payments) en production. */

// Piège à focus partagé (focus initial, Tab en boucle, Échap, restauration du
// focus) défini dans Chrome.jsx — chargé avant ce fichier dans toutes les
// pages. Garde défensive : no-op si absent, pour ne jamais casser le paiement.
const useFocusTrap = window.lcUseFocusTrap || function () {};

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
  // --- Paiement intégré Stripe (Payment Element) ---
  const [stripeReady, setStripeReady] = React.useState(false);
  const cardBoxRef = React.useRef(null);   // conteneur DOM du formulaire de carte
  const stripeRef = React.useRef(null);
  const elementsRef = React.useRef(null);

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
  // Paiement carte INTÉGRÉ au site (Stripe Payment Element) — pas de redirection.
  const stripeEmbedded = !!(window.LCPay && window.LCPay.isLive && window.LCPay.isLive() && ship.method !== 'pickup');

  // On n'envoie au serveur que { id, qty } : c'est lui qui détient les prix.
  const currentLines = () => items
    .map((l) => { const p = window.LC151.get(l.id); return p ? { id: l.id, qty: l.qty } : null; })
    .filter(Boolean);

  // Monte (ou remonte) le formulaire de carte Stripe dès qu'on entre à l'étape
  // paiement, et le reconstruit si le total change (changement de livraison).
  React.useEffect(() => {
    if (step !== 'paiement' || !stripeEmbedded) return;
    let cancelled = false;
    let el = null;
    setStripeReady(false);
    (async () => {
      try {
        const stripe = await window.LCPay.ensureStripe();
        if (cancelled) return;
        const data = await window.LCPay.createPaymentIntent({ items: currentLines(), method: ship.method, email: ship.email });
        if (cancelled || !data.clientSecret) throw new Error('Paiement indisponible');
        const elements = stripe.elements({ clientSecret: data.clientSecret, appearance: { theme: 'stripe' } });
        el = elements.create('payment', { layout: 'tabs' });
        if (cancelled) return;
        el.mount(cardBoxRef.current);
        stripeRef.current = stripe;
        elementsRef.current = elements;
        if (!cancelled) setStripeReady(true);
      } catch (e) {
        if (!cancelled) setErrors((prev) => ({ ...prev, pay: (e && e.message) ? String(e.message) : 'Paiement indisponible' }));
      }
    })();
    return () => { cancelled = true; try { if (el) el.unmount(); } catch (e) {} };
  }, [step, stripeEmbedded, total, ship.method]);

  const validatePay = () => {
    if (ship.method === 'pickup') return true; // pay in store
    if (stripeEmbedded) return true;           // carte gérée par le Payment Element
    const e = {};
    // Validation Luhn centralisée dans payments.js (LCPay.luhn) — repli sur un
    // simple contrôle de format si la couche paiement n'est pas chargée.
    const luhnOk = (window.LCPay && window.LCPay.luhn) ? window.LCPay.luhn(pay.card) : /^\d{13,19}$/.test((pay.card || '').replace(/\s+/g, ''));
    if (!luhnOk) e.card = 1;
    const m = pay.exp.match(/^(\d{2})\/(\d{2})$/);
    if (!m || +m[1] < 1 || +m[1] > 12) e.exp = 1;
    else { const exp = new Date(2000 + +m[2], +m[1], 0, 23, 59); if (exp < new Date()) e.exp = 1; }
    if (!/^\d{3,4}$/.test(pay.cvc)) e.cvc = 1;
    if (!pay.holder.trim()) e.holder = 1;
    setErrors(e); return Object.keys(e).length === 0;
  };

  const [paying, setPaying] = React.useState(false);
  const panelRef = React.useRef(null);
  // Aucune fermeture (Échap, scrim, ×) pendant la confirmation du paiement
  // (perte du contexte Stripe) — le hook relit cette closure à chaque rendu.
  const guardedClose = () => { if (!paying) onClose(); };
  useFocusTrap(panelRef, guardedClose);
  const goPay = () => { if (validateShip()) { setErrors({}); setStep('paiement'); } };

  const placeOrder = async () => {
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
    const orderData = {
      email: ship.email, name: ship.name,
      items: lines,
      subtotal, shipping: shippingCost, total,
      method: ship.method, address: ship.addr + ', ' + ship.zip + ' ' + ship.city,
    };
    const finalize = (result) => {
      const o = Orders.add({
        ...orderData,
        paid: ship.method !== 'pickup' ? !!(result && result.paid) : false,
        payRef: result ? result.ref : null,
      });
      try { localStorage.removeItem('lc151_pending_order'); } catch (e) {}
      setOrder(o); cart.clear(); setPaying(false); setStep('confirme');
    };

    // --- 1) Paiement carte INTÉGRÉ (Stripe Payment Element) ---
    if (stripeEmbedded) {
      if (!stripeReady || !stripeRef.current || !elementsRef.current) {
        setErrors({ pay: 'Le formulaire de paiement n’est pas encore prêt — patientez une seconde.' });
        return;
      }
      setPaying(true);
      // Mémorise la commande au cas où une authentification 3-D Secure imposerait
      // un aller-retour (carte qui le demande) → finalisée au retour (merci.html).
      try { localStorage.setItem('lc151_pending_order', JSON.stringify({ ts: Date.now(), order: orderData })); } catch (e) {}
      try {
        const result = await stripeRef.current.confirmPayment({
          elements: elementsRef.current,
          redirect: 'if_required',
          confirmParams: { return_url: location.origin + '/merci.html', receipt_email: ship.email || undefined },
        });
        if (result.error) {
          setPaying(false);
          setErrors({ pay: result.error.message || 'Paiement refusé.' });
          return;
        }
        const pi = result.paymentIntent;
        if (pi && (pi.status === 'succeeded' || pi.status === 'processing')) {
          finalize({ paid: true, ref: pi.id });
          // Verrou d'idempotence (même format que finalizeOnce dans merci.html) :
          // marque ce PaymentIntent comme déjà finalisé pour qu'une visite de
          // merci.html?payment_intent=… ne recrée pas la commande en double.
          try {
            const done = JSON.parse(localStorage.getItem('lc151_done_sessions') || '[]');
            if (done.indexOf(pi.id) === -1) {
              done.push(pi.id);
              localStorage.setItem('lc151_done_sessions', JSON.stringify(done));
            }
          } catch (e) {}
        } else {
          setPaying(false);
          setErrors({ pay: 'Paiement non confirmé. Réessayez.' });
        }
      } catch (e) {
        setPaying(false);
        setErrors({ pay: (e && e.message) ? String(e.message) : 'Erreur de paiement.' });
      }
      return;
    }

    // --- 2) Retrait en boutique / 3) mode démo (simulation) ---
    const card = { method: ship.method, card: pay.card, exp: pay.exp, cvc: pay.cvc, holder: pay.holder, ship: ship };
    const payFlow = (window.LCPay && window.LCPay.process)
      ? window.LCPay.process(orderData, card)
      : Promise.resolve({ paid: ship.method !== 'pickup', ref: null });
    setPaying(true);
    payFlow.then(finalize).catch(function (e) {
      setPaying(false);
      setErrors({ card: 1, pay: (e && e.message) ? String(e.message) : 'Paiement indisponible' });
    });
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
              {p.image ? <img src={p.image} alt="" loading="lazy" decoding="async" style={{ maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11, color: 'var(--muted)' }}>151</span>}
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
      <div onClick={guardedClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }}></div>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Paiement sécurisé" tabIndex={-1} style={{ position: 'relative', width: 'min(760px, 100%)', maxHeight: '92vh', overflowY: 'auto', background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 26, outline: 'none' }}>
        {/* head */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>
            {step === 'confirme' ? 'Commande confirmée' : 'Paiement sécurisé'}
          </h3>
          <button onClick={guardedClose} aria-label="Fermer" style={{ marginLeft: 'auto', width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', fontSize: 17, color: 'var(--ink)', cursor: 'pointer', background: 'transparent' }}>×</button>
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
            <div className="lc-confirm-ic" style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px' }}>✓</div>
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
                    <div><label style={lbl} htmlFor="lc-co-name">Nom complet</label><input id="lc-co-name" autoComplete="name" aria-invalid={!!errors.name} style={errStyle('name')} value={ship.name} onChange={(e) => setS('name', e.target.value)} /></div>
                    <div><label style={lbl} htmlFor="lc-co-email">E-mail</label><input id="lc-co-email" type="email" required autoComplete="email" aria-invalid={!!errors.email} style={errStyle('email')} value={ship.email} onChange={(e) => setS('email', e.target.value)} /></div>
                  </div>
                  <div style={{ marginBottom: 12 }}><label style={lbl} htmlFor="lc-co-addr">Adresse</label><input id="lc-co-addr" autoComplete="street-address" aria-invalid={!!errors.addr} style={errStyle('addr')} value={ship.addr} onChange={(e) => setS('addr', e.target.value)} placeholder="N° et rue" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
                    <div><label style={lbl} htmlFor="lc-co-zip">Code postal</label><input id="lc-co-zip" autoComplete="postal-code" aria-invalid={!!errors.zip} style={errStyle('zip')} value={ship.zip} onChange={(e) => setS('zip', e.target.value)} /></div>
                    <div><label style={lbl} htmlFor="lc-co-city">Ville</label><input id="lc-co-city" autoComplete="address-level2" aria-invalid={!!errors.city} style={errStyle('city')} value={ship.city} onChange={(e) => setS('city', e.target.value)} /></div>
                  </div>
                  <div style={{ marginBottom: 16 }}><label style={lbl} htmlFor="lc-co-phone">Téléphone (optionnel)</label><input id="lc-co-phone" type="tel" autoComplete="tel" style={field} value={ship.phone} onChange={(e) => setS('phone', e.target.value)} /></div>
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
                  ) : stripeEmbedded ? (
                    <React.Fragment>
                      <div style={{ minHeight: 80, marginBottom: 12 }}>
                        {/* Le formulaire de carte Stripe est monté ici (Payment Element) */}
                        <div ref={cardBoxRef}></div>
                        {!stripeReady && !errors.pay && (
                          <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 2px' }}>Chargement du paiement sécurisé…</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}><span>🔒</span> Paiement chiffré par Stripe · vos données bancaires ne sont jamais stockées sur ce site</div>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div style={{ marginBottom: 12 }}><label style={lbl} htmlFor="lc-co-card">Numéro de carte</label><input id="lc-co-card" inputMode="numeric" aria-invalid={!!errors.card} aria-describedby={errors.card ? 'lc-co-card-err' : undefined} style={errStyle('card')} value={pay.card} onChange={(e) => setP('card', fmtCard(e.target.value))} placeholder="4242 4242 4242 4242" /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div><label style={lbl} htmlFor="lc-co-exp">Expiration</label><input id="lc-co-exp" inputMode="numeric" aria-invalid={!!errors.exp} aria-describedby={errors.exp ? 'lc-co-card-err' : undefined} style={errStyle('exp')} value={pay.exp} onChange={(e) => setP('exp', fmtExp(e.target.value))} placeholder="MM/AA" /></div>
                        <div><label style={lbl} htmlFor="lc-co-cvc">CVC</label><input id="lc-co-cvc" inputMode="numeric" aria-invalid={!!errors.cvc} aria-describedby={errors.cvc ? 'lc-co-card-err' : undefined} style={errStyle('cvc')} value={pay.cvc} onChange={(e) => setP('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" /></div>
                      </div>
                      <div style={{ marginBottom: 8 }}><label style={lbl} htmlFor="lc-co-holder">Titulaire de la carte</label><input id="lc-co-holder" autoComplete="cc-name" aria-invalid={!!errors.holder} aria-describedby={errors.holder ? 'lc-co-card-err' : undefined} style={errStyle('holder')} value={pay.holder} onChange={(e) => setP('holder', e.target.value)} /></div>
                      {(errors.card || errors.exp || errors.cvc || errors.holder) && <div id="lc-co-card-err" role="alert" style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 10 }}>Vérifiez les informations de paiement saisies.</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}><span>🔒</span> Paiement chiffré · vos données ne sont pas stockées</div>
                    </React.Fragment>
                  )}
                  {(errors.stock || errors.cart) && <div role="alert" style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 10 }}>{errors.cart ? 'Votre panier est vide.' : 'Un article n’est plus disponible — retirez-le du panier pour continuer.'}</div>}
                  {errors.pay && <div role="alert" style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 10, lineHeight: 1.5 }}>Paiement impossible : {errors.pay}</div>}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setErrors({}); setStep('livraison'); }} style={{ padding: '0 18px', height: 46, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', background: 'transparent', color: 'var(--ink)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>← Retour</button>
                    <button onClick={placeOrder} disabled={paying || (stripeEmbedded && !stripeReady)} style={{ flex: 1, height: 46, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600, fontSize: 15, cursor: (paying || (stripeEmbedded && !stripeReady)) ? 'wait' : 'pointer', opacity: (paying || (stripeEmbedded && !stripeReady)) ? 0.7 : 1 }}>{paying ? 'Traitement…' : (ship.method === 'pickup' ? 'Valider la commande' : 'Payer ' + fmt(total))}</button>
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
