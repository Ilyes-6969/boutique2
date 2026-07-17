/* CLUB 151 — Fiche produit (product detail) */

// Piège à focus partagé (défini dans Chrome.jsx, chargé avant ce fichier dans
// toutes les pages) — garde défensive : no-op si absent, comme Checkout.jsx.
const useFocusTrap = window.lcUseFocusTrap || function () {};
// Hook favoris partagé (Chrome.jsx) — garde défensive : renvoie null si le
// store Favorites est absent, le bouton est alors masqué (même logique que StoreCard).
const useFavorites = window.useFavorites || function () { return null; };
// Icône favori « marque-page » partagée (Chrome.jsx, chargé avant) — repli discret.
const FavRibbon = window.FavRibbon || function () { return null; };

/* LIGHTBOX plein écran (tap mobile / clic) — sous-composant monté uniquement
   quand le zoom est ouvert : le piège à focus (focus initial, Tab en boucle,
   Échap, restauration du focus) y est appelé inconditionnellement (règles des
   hooks). Fermeture Échap ou clic sur le scrim. */
function ProductLightbox({ src, name, placeholderSvg, onClose }) {
  const panelRef = React.useRef(null);
  useFocusTrap(panelRef, onClose);
  return (
    <div ref={panelRef} role="dialog" aria-modal="true" aria-label={name} tabIndex={-1}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(12,10,8,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out', outline: 'none' }}>
      <img src={src} alt={name} decoding="async"
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderSvg; }}
        style={{ maxWidth: '92vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} />
      <button type="button" aria-label="Fermer" autoFocus onClick={onClose}
        style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', border: '1.5px solid var(--line)', color: 'var(--ink)', fontSize: 16, cursor: 'pointer' }}>✕</button>
    </div>
  );
}

function Product({ navigate, productId, onCart }) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const { PRODUCTS, Cart, FREE_SHIP, fmt } = window.LC151;
  const cart = useCart();
  // Abonnement au Store : le catalogue (/api/catalog) résout souvent APRÈS le
  // montage — ce re-rendu transforme le squelette en fiche produit à l'arrivée.
  const Store = useStore();
  const product = window.LC151.get(productId);
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  // GALERIE : index de l'image affichée + plein écran mobile (lightbox).
  const [imgIdx, setImgIdx] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  // BARRE STICKY MOBILE : visible quand le CTA principal est sorti par le haut.
  const [stickyOn, setStickyOn] = React.useState(false);
  const zoomImgRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  // FAVORIS — appelé inconditionnellement (règles des hooks), AVANT l'early
  // return : null si le store Favorites est absent → cœur masqué.
  const favs = useFavorites();
  // Compteur d'AJOUTS aux favoris (jamais au retrait) → key du ruban : rejoue
  // lc-fav-pop uniquement à l'ajout, comme StoreCard (Chrome.jsx). Hook déclaré
  // avant l'early return (règles des hooks).
  const [favPops, setFavPops] = React.useState(0);
  const lockedUnique = product ? (cart.isUnique(product.id) && cart.items().some((l) => l.id === product.id)) : false;

  // Préférences visiteur — le zoom loupe est désactivé si l'utilisateur demande
  // moins d'animations (prefers-reduced-motion) ou sur écran tactile
  // (pointer: coarse) : là, un tap ouvre un simple plein écran.
  const mq = (q) => { try { return !!(window.matchMedia && window.matchMedia(q).matches); } catch (e) { return false; } };
  const hoverZoomOn = !mq('(prefers-reduced-motion: reduce)') && !mq('(pointer: coarse)');

  // Changement de produit (navigation SPA) → repartir sur la première image.
  React.useEffect(() => { setImgIdx(0); setLightbox(false); }, [product && product.id]);

  // SEO par produit : sans cela, toutes les fiches partagent le même <title>,
  // la même description et le même og:title (duplicate content) → aucune carte
  // ne ressort sur Google. On met aussi un canonical + un JSON-LD Product/Offer.
  React.useEffect(() => {
    if (!product) return;
    const title = product.name + ' — CLUB 151';
    document.title = title;
    const desc = String(product.desc || (product.name + ' — disponible chez CLUB 151, boutique de cartes Pokémon à Vienne.')).slice(0, 160);
    const url = location.origin + '/produit.html?id=' + encodeURIComponent(product.id);
    const setMeta = (sel, val) => {
      let el = document.head.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        const m = sel.match(/\[(name|property)="([^"]+)"\]/);
        if (m) el.setAttribute(m[1], m[2]);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };
    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', desc);
    if (product.image) { setMeta('meta[property="og:image"]', product.image); setMeta('meta[name="twitter:image"]', product.image); }
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
    link.setAttribute('href', url);
    let ld = document.getElementById('lc-product-ld');
    if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'lc-product-ld'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: product.name,
      description: desc, image: product.image || undefined,
      sku: 'LC151-' + product.id.toUpperCase(), brand: { '@type': 'Brand', name: 'Pokémon' },
      offers: {
        '@type': 'Offer', price: product.price, priceCurrency: 'EUR',
        availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        url: url,
      },
    });
    // name/image/desc aussi en deps : le catalogue (/api/catalog) peut se
    // résoudre en deux temps — sans elles, les métadonnées resteraient périmées.
  }, [product && product.id, product && product.price, product && product.inStock, product && product.name, product && product.image, product && product.desc]);

  // Lightbox : fermeture Échap + verrou du scroll d'arrière-plan.
  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(false); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [lightbox]);

  // VU RÉCEMMENT : enregistre la visite (store créé par un autre module —
  // garde défensive, le site fonctionne sans).
  React.useEffect(() => {
    if (!product) return;
    const R = window.LC151 && window.LC151.Recent;
    if (R && typeof R.add === 'function') { try { R.add(product.id); } catch (e) {} }
  }, [product && product.id]);

  // BARRE STICKY : IntersectionObserver sur le CTA principal — visible → barre
  // cachée ; sorti de l'écran par le HAUT → barre visible.
  React.useEffect(() => {
    if (!product || product.inStock === false) return;
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      const en = entries[0];
      setStickyOn(!en.isIntersecting && en.boundingClientRect.top < 0);
    }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [product && product.id, product && product.inStock]);

  if (!product) {
    // Catalogue encore en chargement → squelette, PAS de faux « Produit
    // indisponible » : l'indisponibilité n'est affirmée qu'une fois le
    // catalogue résolu (ok / off / error).
    if (Store.wpStatus().state === 'loading') {
      const bone = { borderRadius: 'var(--radius-sm)', background: 'var(--paper-2)', animation: 'lcPulse 1.3s ease-in-out infinite' };
      return (
        <section className="container-wide lc-prod-grid" aria-busy="true" aria-label="Chargement du produit"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, padding: '48px 24px 72px', alignItems: 'start' }}>
          <div style={{ ...bone, minHeight: 460, borderRadius: 'var(--radius-lg)' }}></div>
          <div>
            <div style={{ ...bone, width: '40%', height: 14 }}></div>
            <div style={{ ...bone, width: '85%', height: 36, marginTop: 16 }}></div>
            <div style={{ ...bone, width: '30%', height: 26, marginTop: 18 }}></div>
            <div style={{ ...bone, width: '100%', height: 90, marginTop: 26 }}></div>
            <div style={{ ...bone, width: '100%', height: 52, marginTop: 28 }}></div>
          </div>
        </section>
      );
    }
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

  // VU RÉCEMMENT (affichage) : jusqu'à 4 produits, hors produit courant.
  // Store optionnel (créé ailleurs) → tout est gardé, section masquée sinon.
  const Recent = window.LC151 && window.LC151.Recent;
  let recentProducts = [];
  if (Recent && typeof Recent.all === 'function') {
    try {
      const ids = Recent.all();
      recentProducts = (Array.isArray(ids) ? ids : [])
        .filter((id) => id !== product.id)
        .map((id) => window.LC151.get(id))
        .filter(Boolean)
        .slice(0, 4);
    } catch (e) { recentProducts = []; }
  }

  const addToCart = (e) => {
    Cart.add(product.id, qty);
    if (e && e.currentTarget && window.lcFlyToCart) window.lcFlyToCart(e.currentTarget);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  // FAVORI — même ruban que StoreCard (Chrome.jsx), toujours visible ici
  // (pas d'opacity au survol) ; bouton rendu uniquement si le store existe.
  const liked = !!(favs && favs.has(product.id));
  const toggleFav = () => {
    const wasLiked = liked;
    favs.toggle(product.id);
    if (!wasLiked) setFavPops((n) => n + 1);   // pop uniquement quand on AJOUTE
  };
  const favBtn = (size) => favs && (
    <button type="button" aria-pressed={liked} aria-label={liked ? 'Retirer de ma collection' : 'Ajouter à ma collection'} title={liked ? 'Dans ma collection' : 'Ajouter à ma collection'}
      onClick={toggleFav}
      style={{ width: size, height: size, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', border: '1.5px solid ' + (liked ? 'var(--accent)' : 'var(--line)'), color: 'var(--muted)', cursor: 'pointer', transition: 'border-color 0.2s ease' }}>
      {/* Micro-pop uniquement à l'AJOUT : la key = compteur d'ajouts remonte le
          span → rejoue .lc-fav-pop (jamais au retrait ; n'anime que sous no-preference). */}
      <span key={favPops} className={favPops > 0 ? 'lc-fav-pop' : undefined} style={{ display: 'flex' }}><FavRibbon caught={liked} size={size >= 36 ? 18 : 15} /></span>
    </button>
  );

  // GALERIE : contrat « images » [{ src, thumb }] (max 6, /api/catalog), avec
  // repli sur l'image unique historique — compat descendante garantie.
  const gallery = (product.images && product.images.length)
    ? product.images.filter((im) => im && im.src)
    : (product.image ? [{ src: product.image, thumb: product.thumb || product.image }] : []);
  const current = gallery.length ? gallery[Math.min(imgIdx, gallery.length - 1)] : null;
  const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140'%3E%3Crect width='100' height='140' rx='8' fill='%23efe9da'/%3E%3Ctext x='50' y='80' font-family='sans-serif' font-size='28' font-weight='bold' fill='%23b9ad95' text-anchor='middle'%3E151%3C/text%3E%3C/svg%3E";

  // ZOOM loupe : scale(2) + transform-origin suivant le pointeur, dans un
  // conteneur overflow:hidden (compositor-friendly : transform uniquement,
  // pas de re-rendu React — style posé directement via ref).
  const handleZoomMove = (e) => {
    const img = zoomImgRef.current;
    if (!img) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    img.style.transformOrigin = x + '% ' + y + '%';
    img.style.transform = 'scale(2)';
  };
  const handleZoomLeave = () => {
    const img = zoomImgRef.current;
    if (img) img.style.transform = 'none';
  };

  // Caractéristiques ADAPTÉES au type d'article (cohérentes, sans champ vide
  // ni mention absurde — ex. pas de « Rareté / Near Mint » sur un accessoire).
  const ref = 'LC151-' + product.id.toUpperCase();
  const isCard = product.type === 'single' || product.type === 'graded';
  const rawSpecs = isCard
    ? [
        ['Série', product.set],
        ['Numéro', product.num],
        ['Rareté', product.rarity],
        ['État', product.type === 'graded' ? 'Certifiée — sous coque' : 'Near Mint'],
        ['Référence', ref],
      ]
    : product.type === 'sealed'
    ? [
        ['Catégorie', product.cat],
        ['Édition', product.set],
        ['État', 'Neuf — scellé'],
        ['Référence', ref],
      ]
    : [
        ['Catégorie', product.cat],
        ['Détail', product.set],
        ['État', 'Neuf'],
        ['Référence', ref],
      ];
  const specs = rawSpecs.filter(function (row) { var v = row[1]; return v && String(v).trim() && v !== '—'; });

  // CERTIFICATION « SLAB » (product.type === 'graded') — grade ROBUSTE. On déduit
  // l'organisme + la note dans l'ordre : product.grade (champ serveur dédié) →
  // parse du nom (PSA/BGS/CGC/SGC + note) → badge.label → sinon null. On ne
  // fabrique JAMAIS de fausse note : sans grade fiable, le slab bascule sur une
  // version générique digne (« Carte certifiée · sous coque scellée »).
  //   millésime ← 1er groupe de 4 chiffres réel trouvé dans `set` (affiché si présent).
  //   mention   ← rareté réelle (« Gem Mint ») si connue, sinon neutre.
  const isGraded = product.type === 'graded';
  const deriveGrade = (p) => {
    const GRADE_RE = /\b(PSA|BGS|CGC|SGC)\s?(10|9\.5|9|8\.5|8|7|6|5)\b/i;
    const sources = [p.grade, p.name, (p.badge && p.badge.label)];
    for (let i = 0; i < sources.length; i++) {
      const m = String(sources[i] || '').match(GRADE_RE);
      if (m) return { org: m[1].toUpperCase(), grade: m[2] };
    }
    return null;
  };
  let cert = null;
  if (isGraded) {
    const g = deriveGrade(product);
    const ym = String(product.set || '').match(/\b(19|20)\d{2}\b/);      // millésime réel si présent
    const year = ym ? ym[0] : '';
    const rarityLabel = String(product.rarity || '').trim();
    if (g) {
      // Grade fiable → organisme + note. Mention sobre : rareté réelle si connue.
      const seal = rarityLabel ? (rarityLabel + ' · certifiée') : 'Certifiée · sous coque';
      cert = { generic: false, org: g.org, grade: g.grade, year, seal };
    } else {
      // Aucun grade fiable → slab générique digne, SANS faux organisme ni fausse note.
      cert = { generic: true, org: '', grade: '', year, seal: '' };
    }
  }

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
            {current ? (
              <button type="button" aria-label="Agrandir l'image"
                onMouseMove={hoverZoomOn ? handleZoomMove : undefined}
                onMouseLeave={hoverZoomOn ? handleZoomLeave : undefined}
                onClick={() => setLightbox(true)}
                style={{ overflow: 'hidden', border: 'none', background: 'transparent', padding: 0, margin: 0, cursor: 'zoom-in', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '100%' }}>
                {/* key={imgIdx} : remonte l'<img> au changement de vignette →
                    remet aussi à zéro le transform posé impérativement par la loupe */}
                <img key={imgIdx} ref={zoomImgRef} src={current.src} alt={product.name} decoding="async"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderSvg; }}
                  style={{ maxHeight: 440, maxWidth: '100%', display: 'block', filter: 'drop-shadow(0 22px 36px rgba(26,23,20,0.30))', transition: hoverZoomOn ? 'transform 0.18s ease' : 'none' }} />
              </button>
            ) : (
              <div style={{ width: '70%' }}><ProductStage glyph={product.glyph} ratio="3 / 4" big /></div>
            )}
          </div>
          {gallery.length > 1 && (
            <div role="group" aria-label="Images du produit"
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') { e.preventDefault(); setImgIdx((i) => (i + 1) % gallery.length); }
                if (e.key === 'ArrowLeft') { e.preventDefault(); setImgIdx((i) => (i - 1 + gallery.length) % gallery.length); }
              }}
              style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {gallery.map((im, i) => (
                <button key={i} type="button" aria-label={'Image ' + (i + 1)} aria-current={i === imgIdx ? 'true' : undefined}
                  onClick={() => setImgIdx(i)}
                  style={{ width: 64, height: 64, padding: 4, borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--card)', border: '2px solid', borderColor: i === imgIdx ? 'var(--accent)' : 'var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={im.thumb || im.src} alt="" decoding="async" loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderSvg; }}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {product.badge && <DS.Badge tone={product.badge.tone}>{product.badge.label}</DS.Badge>}
            <DS.Badge tone={product.inStock ? 'stock' : 'oos'}>{product.inStock ? 'En stock' : 'Rupture'}</DS.Badge>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>{product.cat} · {product.set}</div>
          <h1 className="display-2" style={{ marginBottom: 18 }}>{product.name}</h1>
          {/* PRIX — plus de présence : filet or fin au-dessus + respiration.
              Le filet code discrètement la valeur (l'or = rareté). */}
          <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1.5px solid var(--line)', marginBottom: 22 }}>
            <div style={{ height: 2, width: 34, background: 'var(--yellow-deep)', borderRadius: 2, marginBottom: 14 }} aria-hidden="true"></div>
            <DS.PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" />
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-2)', marginBottom: 28, maxWidth: 520 }}>{product.desc}</p>

          {window.LC151.Cart.isUnique(product.id) && (
            /* SCEAU 1/1 — cachet de rareté doré (fond or lavé, bordure or foncé,
               texte or foncé, mono) plutôt qu'un encadré rouge pâle générique. */
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 15px', marginBottom: 20, background: 'rgba(224,174,0,0.10)', border: '1.5px solid var(--yellow-deep)', borderRadius: 'var(--radius-sm)', fontSize: 13.5, color: 'var(--ink)' }}>
              <span style={{ flexShrink: 0, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--yellow-deep)', padding: '3px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--yellow-deep)', background: 'rgba(224,174,0,0.08)' }}>1 / 1</span>
              <span style={{ color: 'var(--ink-2)' }}><span style={{ fontWeight: 600, color: 'var(--ink)' }}>Pièce unique</span> — une seule édition disponible en boutique.</span>
            </div>
          )}

          <div ref={ctaRef} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            {!window.LC151.Cart.isUnique(product.id) && <DS.QtyStepper value={qty} onChange={setQty} max={Math.min(10, cart.qtyCap(product.id))} />}
            <div style={{ flex: 1 }}>
              <DS.Button className="lc-press" variant="accent" size="lg" block disabled={!product.inStock || lockedUnique} iconLeft={lockedUnique ? '✓' : (added ? '✓' : '＋')} onClick={lockedUnique ? undefined : addToCart}>
                {lockedUnique ? 'Déjà dans le panier (1/1)' : (added ? 'Ajouté au panier' : product.inStock ? 'Ajouter au panier' : 'Indisponible')}
              </DS.Button>
            </div>
            {favBtn(36)}
          </div>
          <DS.Button variant="outline" size="lg" block onClick={() => { Cart.add(product.id, qty); onCart(); }} disabled={!product.inStock}>Acheter maintenant</DS.Button>

          <div style={{ marginTop: 18, padding: '12px 16px', background: 'var(--accent-wash)', border: '1.5px solid var(--accent-soft)', borderRadius: 'var(--radius-sm)', fontSize: 13.5, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--ink)' }}>★</span> Livraison offerte dès {FREE_SHIP} € · expédition protégée sous 48 h
          </div>

          {/* CERTIFICATION « SLAB » — bloc mis en scène, uniquement pour les
              cartes gradées. Panneau navy FIXE (var(--footer-bg) reste sombre
              dans les deux thèmes → l'or ressort), grade en display, organisme
              + mention en or, référence/millésime en mono. Traitement slab doré
              (.lc-graded) + halo doré radial (.lc-stage-lux). */}
          {isGraded && cert && (
            <div className="lc-graded lc-stage-lux" style={{ position: 'relative', marginTop: 32, background: 'var(--footer-bg)', borderRadius: 'var(--radius)', padding: '22px 24px', overflow: 'hidden' }}>
              <div className="lc-line-in" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {/* Emblème — note chiffrée si grade fiable, sinon sceau « certifié »
                    générique (jamais de « — » ni de fausse note fabriquée). */}
                <div style={{ flexShrink: 0, minWidth: 78, textAlign: 'center', padding: '10px 14px', border: '1.5px solid var(--yellow-deep)', borderRadius: 'var(--radius-sm)', background: 'rgba(255,203,5,0.06)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--yellow)', marginBottom: 2 }}>{cert.generic ? 'Certifié' : 'Grade'}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: cert.generic ? 30 : 42, lineHeight: 1, color: '#FFFFFF' }}>{cert.generic ? '✓' : cert.grade}</div>
                </div>
                {/* ORGANISME + NOTE (grade fiable) ou titre générique digne */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, lineHeight: 1.05, color: '#FFFFFF' }}>{cert.generic ? 'Carte certifiée' : cert.org}</div>
                  <div style={{ marginTop: 4, fontSize: 13.5, fontWeight: 600, color: 'var(--yellow)', textTransform: cert.generic ? 'none' : 'capitalize' }}>{cert.generic ? 'Sous coque scellée' : cert.seal}</div>
                  <div style={{ marginTop: 6, height: 2, width: 34, background: 'var(--yellow-deep)', borderRadius: 2 }} aria-hidden="true"></div>
                </div>
              </div>
              {/* Filet or séparateur + méta (référence interne + millésime) en mono.
                  On n'affiche PAS de numéro de certification (aucune donnée réelle). */}
              <div className="lc-line-in" style={{ animationDelay: '0.06s', marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,203,5,0.22)', display: 'flex', flexWrap: 'wrap', gap: '6px 24px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.62)' }}>
                <span><span style={{ color: 'rgba(255,255,255,0.42)' }}>RÉF. </span>{ref}</span>
                {cert.year && <span><span style={{ color: 'rgba(255,255,255,0.42)' }}>MILLÉSIME </span>{cert.year}</span>}
                <span style={{ color: 'var(--yellow)' }}>SOUS COQUE · SCELLÉE</span>
              </div>
            </div>
          )}

          {/* SPECS */}
          <div style={{ marginTop: isGraded ? 16 : 32, border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
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
            {relList.map((p) => <StoreCard key={p.id} product={p.thumb ? { ...p, image: p.thumb } : p} navigate={navigate} />)}
          </div>
        </div>
      </section>

      {/* VUS RÉCEMMENT — store optionnel (window.LC151.Recent), section masquée
          s'il est absent ou s'il n'y a rien à montrer hors produit courant */}
      {recentProducts.length > 0 && (
        <section style={{ borderTop: '1.5px solid var(--line)' }}>
          <div className="container-wide" style={{ padding: '56px 24px 80px' }}>
            <h2 className="display-3" style={{ marginBottom: 26 }}>Vus récemment</h2>
            <div className="lc-grid-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {recentProducts.map((p) => <StoreCard key={p.id} product={p.thumb ? { ...p, image: p.thumb } : p} navigate={navigate} />)}
            </div>
          </div>
        </section>
      )}

      {/* LIGHTBOX plein écran — sous-composant ProductLightbox (piège à focus) */}
      {lightbox && current && (
        <ProductLightbox src={current.src} name={product.name} placeholderSvg={placeholderSvg} onClose={() => setLightbox(false)} />
      )}

      {/* BARRE D'ACHAT STICKY MOBILE — positionnement géré par la classe
          .lc-sticky-cta (+ .on) dans le CSS ; ici uniquement le contenu */}
      {product.inStock && (
        <div className={'lc-sticky-cta' + (stickyOn ? ' on' : '')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
              <DS.PriceTag price={product.price} oldPrice={product.oldPrice} size="sm" />
            </div>
            {favBtn(32)}
            <DS.Button className="lc-press" variant="accent" disabled={lockedUnique} iconLeft={lockedUnique ? '✓' : (added ? '✓' : '＋')} onClick={lockedUnique ? undefined : addToCart}>
              {lockedUnique ? 'Déjà dans le panier (1/1)' : (added ? 'Ajouté au panier' : 'Ajouter au panier')}
            </DS.Button>
          </div>
        </div>
      )}
    </div>
  );
}
Object.assign(window, { Product });
