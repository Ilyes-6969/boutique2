/* CLUB 151 — Tunnel de paiement (checkout multi-étapes)
   Livraison → Paiement → Confirmation. Crée une commande, vide le panier.
   Paiement simulé (validation Luhn / date / CVC) — à brancher sur un vrai PSP
   (Stripe, WooCommerce Payments) en production. */

// Piège à focus partagé (focus initial, Tab en boucle, Échap, restauration du
// focus) défini dans Chrome.jsx — chargé avant ce fichier dans toutes les
// pages. Garde défensive : no-op si absent, pour ne jamais casser le paiement.
const useFocusTrap = window.lcUseFocusTrap || function () {};

// Radio « mode de livraison » — état hover local (comme DS.Button) : bordure accent
// au survol même hors sélection, transition douce. Sélectionné : fond accent-wash.
function ShipOption({ selected, onSelect, label, eta, cost, fmt }) {
  const [hover, setHover] = React.useState(false);
  const active = selected || hover;
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-pressed={selected}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 'var(--radius-sm)', border: '1.5px solid', borderColor: active ? 'var(--accent)' : 'var(--line)', background: selected ? 'var(--accent-wash)' : 'var(--card)', cursor: 'pointer', textAlign: 'left', transition: 'border-color var(--dur-fast, 150ms) var(--ease-out, ease), background var(--dur-fast, 150ms) var(--ease-out, ease)' }}
    >
      <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid', borderColor: active ? 'var(--accent)' : 'var(--line-strong)', flexShrink: 0, position: 'relative', transition: 'border-color var(--dur-fast, 150ms) var(--ease-out, ease)' }}>{selected && <span className="lc-pop" style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: 'var(--accent)' }}></span>}</span>
      <span style={{ flex: 1 }}><span style={{ fontWeight: 600, fontSize: 14, display: 'block' }}>{label}</span><span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{eta}</span></span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13.5, color: cost === 0 ? 'var(--green)' : 'var(--ink)' }}>{cost === 0 ? 'Offert' : fmt(cost)}</span>
    </button>
  );
}

function CheckoutModal({ onClose }) {
  const DS = window.ADITCGDesignSystem_df75b7 || {};
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

  // Focus « dessiné » : anneau accent + bordure accent au focus de chaque champ.
  // Piloté en React (onFocus/onBlur) plutôt qu'en CSS car les champs sont stylés inline.
  const [focused, setFocused] = React.useState(null);
  // Bordure en longhand (width/style/color séparés) et NON en raccourci `border` :
  // React qui diffe `border` → `borderColor` réinitialise width/style à vide et fait
  // « disparaître » la bordure au focus. Le longhand garde width/style stables.
  const field = { width: '100%', padding: '11px 13px', borderRadius: 'var(--radius-sm)', borderWidth: '1.5px', borderStyle: 'solid', borderColor: 'var(--line-strong)', background: 'var(--paper)', fontSize: 14.5, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', transition: 'border-color var(--dur-fast, 150ms) var(--ease-out, ease), box-shadow var(--dur-fast, 150ms) var(--ease-out, ease)' };
  const lbl = { fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, display: 'block' };
  // Ordre de priorité visuelle : erreur (rouge) < focus (accent). Un champ en
  // erreur qu'on refocalise passe à l'anneau accent — invitation claire à corriger.
  const errStyle = (k) => {
    const base = errors[k] ? { ...field, borderColor: 'var(--red)' } : field;
    if (focused === k) return { ...base, borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-wash)' };
    return base;
  };
  // Props communes à câbler sur chaque champ pour animer le focus.
  const focusProps = (k) => ({ onFocus: () => setFocused(k), onBlur: () => setFocused((f) => (f === k ? null : f)) });

  // Erreurs DÉCRITES EN TEXTE, et pas seulement par le liseré rouge : la couleur
  // seule exclut les daltoniens (WCAG 1.4.1) et `aria-invalid` annonce « champ
  // invalide » sans jamais dire POURQUOI (WCAG 3.3.1). Le message est relié au
  // champ par aria-describedby pour être lu à la suite de son intitulé.
  const ERR_MSG = {
    name: 'Indiquez votre nom complet.',
    email: 'Indiquez une adresse e-mail valide (ex. prenom@exemple.fr).',
    addr: 'Indiquez votre adresse (numéro et rue).',
    zip: 'Code postal invalide : 4 ou 5 chiffres.',
    city: 'Indiquez votre ville.',
    card: 'Numéro de carte invalide.',
    exp: 'Date d’expiration invalide ou dépassée.',
    cvc: 'Cryptogramme invalide : 3 ou 4 chiffres.',
    holder: 'Indiquez le nom inscrit sur la carte.',
  };
  const errId = (k) => 'lc-co-err-' + k;
  const errProps = (k) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? errId(k) : undefined });
  const fieldErr = (k) => ((errors[k] && ERR_MSG[k])
    ? <span id={errId(k)} style={{ display: 'block', marginTop: 5, fontSize: 12.5, lineHeight: 1.4, color: 'var(--red)' }}>{ERR_MSG[k]}</span>
    : null);

  // Petites icônes SVG stroke (mêmes tracés que la réassurance de Chrome.jsx,
  // recopiées ici car ce fichier ne peut pas importer Chrome.jsx).
  const reIcon = (name) => {
    const shapes = {
      truck: <React.Fragment><rect x="1" y="3" width="15" height="13" rx="1"></rect><path d="M16 8h4l3 3v5h-7V8z"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></React.Fragment>,
      bouclier: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>,
      retour: <React.Fragment><polyline points="1 4 1 10 7 10"></polyline><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"></path></React.Fragment>,
    };
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>{shapes[name]}</svg>;
  };
  // Mini-logos moyens de paiement monochromes (CB / Visa / Mastercard), sobres.
  const payMark = (name) => {
    const marks = {
      cb: <svg width="30" height="20" viewBox="0 0 34 22" aria-label="Carte bancaire" role="img"><rect x="0.75" y="0.75" width="32.5" height="20.5" rx="3.25" fill="none" stroke="currentColor" strokeWidth="1.5"></rect><rect x="4" y="7" width="6" height="5" rx="1" fill="currentColor" opacity="0.9"></rect><rect x="4" y="15" width="16" height="2" rx="1" fill="currentColor" opacity="0.55"></rect></svg>,
      visa: <svg width="30" height="20" viewBox="0 0 34 22" aria-label="Visa" role="img"><rect x="0.75" y="0.75" width="32.5" height="20.5" rx="3.25" fill="none" stroke="currentColor" strokeWidth="1.5"></rect><text x="17" y="15" textAnchor="middle" fontFamily="var(--font-display, sans-serif)" fontWeight="800" fontSize="9" letterSpacing="0.06em" fill="currentColor">VISA</text></svg>,
      mc: <svg width="30" height="20" viewBox="0 0 34 22" aria-label="Mastercard" role="img"><rect x="0.75" y="0.75" width="32.5" height="20.5" rx="3.25" fill="none" stroke="currentColor" strokeWidth="1.5"></rect><circle cx="14" cy="11" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.5"></circle><circle cx="20" cy="11" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55"></circle></svg>,
    };
    return marks[name];
  };

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

  // Monte le formulaire de carte Stripe à l'ENTRÉE de l'étape paiement.
  // Deps volontairement réduites à [step, stripeEmbedded] : le montant du
  // PaymentIntent est FIGÉ à sa création (le serveur l'a calculé via priceItems
  // à ce moment-là). Inclure `total`/`ship.method` remonterait l'Element si le
  // prix changeait pendant la saisie (ex. réconciliation cross-onglet) et FERAIT
  // PERDRE la carte au client. Changer de mode de livraison ramène à l'étape
  // livraison ; le retour au paiement (changement de `step`) re-crée donc un PI
  // au bon montant. Cas limite accepté : si le panier change dans un autre onglet
  // pendant la saisie, l'affichage se met à jour mais le PI reste au montant figé
  // — mieux vaut ça que perdre la carte ; le total faisant foi reste celui de Stripe.
  React.useEffect(() => {
    if (step !== 'paiement' || !stripeEmbedded) return;
    let cancelled = false;
    let el = null;
    setStripeReady(false);
    (async () => {
      try {
        const stripe = await window.LCPay.ensureStripe();
        if (cancelled) return;
        // Coordonnées transmises au serveur pour le reçu Stripe et l'adresse de
        // livraison du PaymentIntent (jamais pour le calcul du montant).
        const data = await window.LCPay.createPaymentIntent({
          items: currentLines(),
          method: ship.method,
          email: ship.email,
          customer: { name: ship.name, email: ship.email, addr: ship.addr, zip: ship.zip, city: ship.city, phone: ship.phone },
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps figées à dessein (cf. commentaire ci-dessus : ne pas remonter l'Element sur variation de prix).
  }, [step, stripeEmbedded]);

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
  // Retrait en boutique : passe à true si la notification serveur a échoué, pour
  // afficher un bandeau honnête sur l'écran de confirmation (voir finalize()).
  const [pickupNotifyFailed, setPickupNotifyFailed] = React.useState(false);
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
      // Snapshot des lignes AVANT cart.clear() (currentLines lit le panier courant).
      const notifyLines = ship.method === 'pickup' ? currentLines() : null;
      try { localStorage.removeItem('lc151_pending_order'); } catch (e) { console.warn('[lc151] pending_order non nettoyé', e); }
      // La confirmation s'affiche TOUJOURS et immédiatement : un souci de
      // notification ne doit jamais la bloquer.
      setOrder(o); cart.clear(); setPaying(false); setStep('confirme');
      // Retrait en boutique : pas de Stripe, donc pas de webhook → on notifie le
      // commerçant côté serveur et on EXPLOITE le booléen renvoyé. En cas d'échec
      // (429, réseau, ok:false…), la commande reste confirmée mais on lève un
      // bandeau honnête invitant le client à confirmer par téléphone/e-mail. Les
      // paiements carte, eux, sont couverts par le webhook Stripe.
      if (notifyLines && window.LCPay && window.LCPay.notifyPickupOrder) {
        try {
          Promise.resolve(window.LCPay.notifyPickupOrder({
            ref: o.number,
            customer: { name: ship.name, email: ship.email, phone: ship.phone },
            items: notifyLines,
          }))
            .then((ok) => { if (!ok) setPickupNotifyFailed(true); })
            .catch(() => setPickupNotifyFailed(true));
        } catch (e) { setPickupNotifyFailed(true); }
      }
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
      // Non fatal (les coordonnées voyagent déjà vers Stripe via `customer`),
      // mais on loggue : sinon un échec d'écriture ici (quota, navigation privée)
      // laisserait merci.html reconstruire une commande sans nom/adresse en silence.
      try { localStorage.setItem('lc151_pending_order', JSON.stringify({ ts: Date.now(), order: orderData })); }
      catch (e) { console.warn('[lc151] pending_order non sauvegardé', e); }
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
    // Une commande à encaisser ne doit JAMAIS être confirmée sans passerelle.
    // Si payments.js n'est pas chargé (bloqueur, coupure réseau, déploiement
    // incomplet), window.LCPay est absent : on bloque au lieu de déclarer la
    // commande payée — sinon aucun euro ne bouge, aucun PaymentIntent n'existe,
    // aucun webhook ne part, et le marchand n'a aucune trace de la vente.
    // Le retrait en boutique reste autorisé : il n'encaisse rien ici (paid=false).
    const hasGateway = !!(window.LCPay && window.LCPay.process);
    if (ship.method !== 'pickup' && !hasGateway) {
      setErrors({ pay: 'Paiement indisponible pour le moment — rechargez la page ou réessayez dans un instant.' });
      return;
    }
    const card = { method: ship.method, card: pay.card, exp: pay.exp, cvc: pay.cvc, holder: pay.holder, ship: ship };
    const payFlow = hasGateway
      ? window.LCPay.process(orderData, card)
      : Promise.resolve({ paid: false, ref: null });
    setPaying(true);
    payFlow.then(finalize).catch(function (e) {
      setPaying(false);
      setErrors({ card: 1, pay: (e && e.message) ? String(e.message) : 'Paiement indisponible' });
    });
  };

  const steps = [['livraison', 'Livraison'], ['paiement', 'Paiement'], ['confirme', 'Confirmation']];
  const stepIdx = steps.findIndex((s) => s[0] === step);

  // Rangée de réassurance paiement : moyens acceptés (SVG monochromes) + mention
  // « 100% sécurisé ». Partagée par le formulaire carte manuel et le Payment Element.
  const payReassure = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16, color: 'var(--muted)' }}>
      <span style={{ display: 'inline-flex', gap: 6 }} aria-hidden="true">{payMark('cb')}{payMark('visa')}{payMark('mc')}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        Paiement 100&nbsp;% sécurisé{stripeEmbedded ? ' par Stripe' : ''}
      </span>
    </div>
  );

  // Total économisé sur les articles en promotion. Fourni par le CONTRAT
  // window.LC151.cartSavings(items) (source unique) — repli défensif à 0 si la
  // couche data.js n'est pas encore chargée. On ne recalcule pas ici.
  const savings = (window.LC151 && typeof window.LC151.cartSavings === 'function')
    ? window.LC151.cartSavings(items)
    : 0;
  // Barre « livraison offerte » (même logique que le drawer panier).
  const freeShipRemaining = Math.max(0, FREE_SHIP - subtotal);
  const freeShipPct = Math.min(100, (subtotal / FREE_SHIP) * 100);

  // Puces de garantie sous le total — rassurent au moment de payer.
  const guaranteeItems = [
    ['truck', 'Livraison suivie', 'Colissimo assuré, remis contre signature'],
    ['bouclier', 'Authenticité garantie', 'Chaque carte vérifiée par nos soins'],
    ['retour', 'Retours sous 14 jours', 'Rétractation simple, remboursement rapide'],
  ];

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
      {/* Barre « livraison offerte » — halo de valeur avant le total */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 7 }}>
          {freeShipRemaining > 0
            ? <span>Plus que <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{fmt(freeShipRemaining)}</strong> pour la livraison offerte</span>
            : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontWeight: 600 }}><span className="lc-pop" style={{ display: 'inline-flex' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg></span> Livraison offerte débloquée</span>}
        </div>
        <div className={freeShipRemaining === 0 ? 'lc-shimmer' : undefined} style={{ height: 6, borderRadius: 3, background: 'var(--card)', overflow: 'hidden' }}>
          <div style={{ width: freeShipPct + '%', height: '100%', background: freeShipRemaining === 0 ? 'var(--green)' : 'var(--accent)', transition: 'width var(--dur-normal, 300ms) var(--ease-out, ease)' }}></div>
        </div>
      </div>
      <div style={{ borderTop: '1.5px solid var(--line)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}><span>Sous-total</span><span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(subtotal)}</span></div>
        {savings > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green)', fontWeight: 600 }}><span>Vous économisez</span><span style={{ fontFamily: 'var(--font-mono)' }}>−{fmt(savings)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}><span>Livraison</span><span style={{ fontFamily: 'var(--font-mono)', color: shippingCost === 0 ? 'var(--green)' : 'var(--ink-2)', fontWeight: shippingCost === 0 ? 600 : 400 }}>{shippingCost === 0 ? 'Offerte' : fmt(shippingCost)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 4 }}><span>Total</span><span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(total)}</span></div>
      </div>
      {/* Puces de garantie */}
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 14, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {guaranteeItems.map(([ic, ti, sub]) => (
          <div key={ti} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ color: 'var(--accent)', marginTop: 1, display: 'flex' }}>{reIcon(ic)}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{ti}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.35 }}>{sub}</div>
            </div>
          </div>
        ))}
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

        {/* stepper — pastilles avec transition douce background/color quand l'étape avance */}
        {step !== 'confirme' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
            {steps.slice(0, 2).map(([k, label], i) => {
              const done = i < stepIdx;
              const active = i === stepIdx;
              const on = i <= stepIdx;
              return (
                <React.Fragment key={k}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span key={on ? 'on-' + k : 'off-' + k} className={active ? 'lc-pop' : undefined} style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: on ? 'var(--accent)' : 'var(--paper-2)', color: on ? 'var(--on-accent)' : 'var(--muted)', transition: 'background var(--dur-normal, 300ms) var(--ease-out, ease), color var(--dur-normal, 300ms) var(--ease-out, ease)' }}>
                      {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> : (i + 1)}
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: on ? 'var(--ink)' : 'var(--muted)', transition: 'color var(--dur-normal, 300ms) var(--ease-out, ease)' }}>{label}</span>
                  </div>
                  {i === 0 && (
                    <span style={{ flex: 1, height: 1.5, background: 'var(--line)', position: 'relative', overflow: 'hidden' }}>
                      <span style={{ position: 'absolute', inset: 0, background: 'var(--accent)', transformOrigin: 'left', transform: stepIdx >= 1 ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform var(--dur-normal, 300ms) var(--ease-out, ease)' }}></span>
                    </span>
                  )}
                </React.Fragment>
              );
            })}
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
            {/* Retrait en boutique : la notification serveur a échoué → l'échec doit
                rester VISIBLE (la commande est bien enregistrée pour autant). */}
            {pickupNotifyFailed && (
              <div role="alert" style={{ maxWidth: 420, margin: '0 auto 18px', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--red-soft)', borderLeft: '3px solid var(--red)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.5 }}>Votre commande est bien enregistrée, mais nous n’avons pas pu nous notifier automatiquement — merci de contacter la boutique pour confirmer votre retrait.</div>
              </div>
            )}
            {DS.Button
              ? <DS.Button className="lc-press" variant="accent" size="lg" onClick={onClose}>Continuer mes achats</DS.Button>
              : <button onClick={onClose} style={{ padding: '12px 28px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Continuer mes achats</button>}
          </div>
        ) : (
          <div className="lc-checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: 24 }}>
            {/* key={step} → remonte à chaque changement d'étape : le fade-up .lc-line-in
                se rejoue, livraison→paiement glisse (inerte sous reduced-motion). */}
            <div key={step} className="lc-line-in">
              {step === 'livraison' ? (
                <React.Fragment>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div><label style={lbl} htmlFor="lc-co-name">Nom complet</label><input id="lc-co-name" autoComplete="name" {...errProps('name')} style={errStyle('name')} {...focusProps('name')} value={ship.name} onChange={(e) => setS('name', e.target.value)} />{fieldErr('name')}</div>
                    <div><label style={lbl} htmlFor="lc-co-email">E-mail</label><input id="lc-co-email" type="email" required autoComplete="email" {...errProps('email')} style={errStyle('email')} {...focusProps('email')} value={ship.email} onChange={(e) => setS('email', e.target.value)} />{fieldErr('email')}</div>
                  </div>
                  <div style={{ marginBottom: 12 }}><label style={lbl} htmlFor="lc-co-addr">Adresse</label><input id="lc-co-addr" autoComplete="street-address" {...errProps('addr')} style={errStyle('addr')} {...focusProps('addr')} value={ship.addr} onChange={(e) => setS('addr', e.target.value)} placeholder="N° et rue" />{fieldErr('addr')}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
                    <div><label style={lbl} htmlFor="lc-co-zip">Code postal</label><input id="lc-co-zip" autoComplete="postal-code" {...errProps('zip')} style={errStyle('zip')} {...focusProps('zip')} value={ship.zip} onChange={(e) => setS('zip', e.target.value)} />{fieldErr('zip')}</div>
                    <div><label style={lbl} htmlFor="lc-co-city">Ville</label><input id="lc-co-city" autoComplete="address-level2" {...errProps('city')} style={errStyle('city')} {...focusProps('city')} value={ship.city} onChange={(e) => setS('city', e.target.value)} />{fieldErr('city')}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}><label style={lbl} htmlFor="lc-co-phone">Téléphone (optionnel)</label><input id="lc-co-phone" type="tel" autoComplete="tel" style={errStyle('phone')} {...focusProps('phone')} value={ship.phone} onChange={(e) => setS('phone', e.target.value)} /></div>
                  <label style={lbl}>Mode de livraison</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                    {Object.values(Orders.methods()).map((m) => (
                      <ShipOption key={m.key} selected={ship.method === m.key} onSelect={() => setS('method', m.key)} label={m.label} eta={m.eta} cost={Orders.shippingCost(m.key, subtotal)} fmt={fmt} />
                    ))}
                  </div>
                  {DS.Button
                    ? <DS.Button className="lc-press" variant="accent" size="lg" block iconRight="→" onClick={goPay}>Continuer vers le paiement</DS.Button>
                    : <button onClick={goPay} style={{ width: '100%', height: 46, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Continuer vers le paiement →</button>}
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
                      {payReassure}
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div style={{ marginBottom: 12 }}><label style={lbl} htmlFor="lc-co-card">Numéro de carte</label><input id="lc-co-card" inputMode="numeric" {...errProps('card')} style={errStyle('card')} {...focusProps('card')} value={pay.card} onChange={(e) => setP('card', fmtCard(e.target.value))} placeholder="4242 4242 4242 4242" />{fieldErr('card')}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div><label style={lbl} htmlFor="lc-co-exp">Expiration</label><input id="lc-co-exp" inputMode="numeric" {...errProps('exp')} style={errStyle('exp')} {...focusProps('exp')} value={pay.exp} onChange={(e) => setP('exp', fmtExp(e.target.value))} placeholder="MM/AA" />{fieldErr('exp')}</div>
                        <div><label style={lbl} htmlFor="lc-co-cvc">CVC</label><input id="lc-co-cvc" inputMode="numeric" {...errProps('cvc')} style={errStyle('cvc')} {...focusProps('cvc')} value={pay.cvc} onChange={(e) => setP('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" />{fieldErr('cvc')}</div>
                      </div>
                      <div style={{ marginBottom: 8 }}><label style={lbl} htmlFor="lc-co-holder">Titulaire de la carte</label><input id="lc-co-holder" autoComplete="cc-name" {...errProps('holder')} style={errStyle('holder')} {...focusProps('holder')} value={pay.holder} onChange={(e) => setP('holder', e.target.value)} />{fieldErr('holder')}</div>
                      {/* Résumé annoncé aux lecteurs d'écran à la soumission ; le détail
                          exact vit sous chaque champ (fieldErr) via aria-describedby. */}
                      {(errors.card || errors.exp || errors.cvc || errors.holder) && <div role="alert" style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 10 }}>Vérifiez les informations de paiement signalées ci-dessus.</div>}
                      {payReassure}
                    </React.Fragment>
                  )}
                  {(errors.stock || errors.cart) && <div role="alert" style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 10 }}>{errors.cart ? 'Votre panier est vide.' : 'Un article n’est plus disponible — retirez-le du panier pour continuer.'}</div>}
                  {errors.pay && <div role="alert" style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 10, lineHeight: 1.5 }}>Paiement impossible : {errors.pay}</div>}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
                    {DS.Button
                      ? <DS.Button variant="outline" size="lg" iconLeft="←" onClick={() => { setErrors({}); setStep('livraison'); }}>Retour</DS.Button>
                      : <button onClick={() => { setErrors({}); setStep('livraison'); }} style={{ padding: '0 18px', height: 46, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line-strong)', background: 'transparent', color: 'var(--ink)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>← Retour</button>}
                    {/* flex:1 porté par le wrapper — ne pas passer `style` à DS.Button
                        (son `style` calculé serait écrasé par le prop `rest`). */}
                    {DS.Button
                      ? <div style={{ flex: 1, display: 'flex' }}><DS.Button className="lc-press" variant="accent" size="lg" block onClick={placeOrder} disabled={paying || (stripeEmbedded && !stripeReady)}>{paying ? 'Traitement…' : (ship.method === 'pickup' ? 'Valider la commande' : 'Payer ' + fmt(total))}</DS.Button></div>
                      : <button onClick={placeOrder} disabled={paying || (stripeEmbedded && !stripeReady)} style={{ flex: 1, height: 46, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600, fontSize: 15, cursor: (paying || (stripeEmbedded && !stripeReady)) ? 'wait' : 'pointer', opacity: (paying || (stripeEmbedded && !stripeReady)) ? 0.7 : 1 }}>{paying ? 'Traitement…' : (ship.method === 'pickup' ? 'Valider la commande' : 'Payer ' + fmt(total))}</button>}
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
