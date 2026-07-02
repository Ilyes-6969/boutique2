/* leclub151 — Accueil. Works with an EMPTY catalogue (no demo products).
   When products are added (via WordPress/WooCommerce or the back-office),
   the rayons appear automatically. */

/* Icônes de réassurance en SVG (trait currentColor, même style que Chrome.jsx) :
   rendu identique sur tous les OS, contrairement aux glyphes texte (✓ ⤓ ↺ ◈). */
function ReassureIcon({ name, size = 17 }) {
  const shapes = {
    check: <polyline points="20 6 9 17 4 12"></polyline>,
    truck: <React.Fragment><rect x="1" y="3" width="15" height="13" rx="1"></rect><path d="M16 8h4l3 3v5h-7V8z"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></React.Fragment>,
    retour: <React.Fragment><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></React.Fragment>,
    bouclier: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {shapes[name]}
    </svg>
  );
}

function Home({ navigate }) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const Store = window.LC151.Store;
  const all = Store.all();
  const has = all.length > 0;
  const by = (t) => all.filter((p) => p.type === t);
  const preorders = all.filter((p) => p.preorder);
  const nouveautes = [...new Map(all.filter((p) => (p.badge && p.badge.tone === 'new') || p.type === 'sealed').map((p) => [p.id, p])).values()].slice(0, 8);
  const ventes = [...new Map(['d1', 'd4', 'd5', 'd3', 'd6', 'd8'].map((id) => Store.get(id)).filter(Boolean).map((p) => [p.id, p])).values()];
  const ventesFill = ventes.length ? ventes : all.slice(0, 8);

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1.5px solid var(--line)', background: 'var(--paper)' }}>
        {/* real graded-cards photo, desaturated + faded into the page */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(assets/hero-cards.webp)', backgroundSize: 'cover', backgroundPosition: 'center right', opacity: 0.9, pointerEvents: 'none', animation: 'lcKenburns 22s ease-in-out infinite alternate', transformOrigin: 'center' }}></div>
        {/* gradient scrim: solid paper on the left → transparent on the right, plus a bottom fade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--paper) 0%, var(--paper) 28%, rgba(0,0,0,0) 78%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, var(--paper) 0%, rgba(0,0,0,0) 42%)', pointerEvents: 'none' }}></div>

        <div className="container-wide" style={{ position: 'relative', padding: '76px 24px 80px', minHeight: 420 }}>
          <div className="lc-hero-in" style={{ maxWidth: 560 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(34px, 5vw, 66px)', letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 20 }}>
              Votre boutique<br />Pokémon, à <span style={{ position: 'relative', whiteSpace: 'nowrap', borderBottom: '5px solid var(--yellow)', paddingBottom: 2 }}>Vienne</span>.
            </h1>
            <p style={{ fontSize: 17.5, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 480, marginBottom: 30 }}>
              On déniche, on authentifie et on conseille — du Set de Base aux dernières sorties. Cartes à l'unité, pièces gradées, scellé et accessoires, à retirer en magasin ou livrés chez vous.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <DS.Button variant="accent" size="lg" as="a" href="boutique.html" onClick={(e) => { e.preventDefault(); navigate('catalogue', 'all'); }}>Explorer la boutique</DS.Button>
              <DS.Button variant="outline" size="lg" as="a" href="boutique.html?cat=graded" onClick={(e) => { e.preventDefault(); navigate('catalogue', 'graded'); }}>Cartes gradées</DS.Button>
            </div>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', fontSize: 13.5, color: 'var(--ink-2)' }}>
              {[['check', 'Authentifié'], ['truck', 'Expédié sous 48 h'], ['retour', 'Retours 14 jours']].map(([ic, t]) => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                  <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid var(--yellow)', color: 'var(--yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}><ReassureIcon name={ic} size={14} /></span>
                  <span style={{ fontWeight: 500 }}>{t}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REASSURANCE STRIP */}
      <section style={{ background: 'var(--card)', borderBottom: '1.5px solid var(--line)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 56, padding: '20px 24px' }}>
          {[['check', 'Authentifié', 'Chaque pièce vérifiée'], ['truck', 'Livraison offerte', 'Dès 100 € d’achat'], ['bouclier', 'Paiement sécurisé', 'CB · PayPal · Apple Pay']].map(([ic, t, s]) => (
            <div key={t} className="lc-reassure" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <span className="lc-reassure-ic" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', border: '1.5px solid var(--line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: 'var(--accent)' }}><ReassureIcon name={ic} size={17} /></span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5 }}>{t}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NOS UNIVERS (jeux TCG) */}
      <section className="container-wide" style={{ padding: '40px 24px 8px' }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>Nos univers</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em' }}>Tous vos jeux de cartes</h2>
        </div>
        <div className="lc-cat-tiles" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {[['Pokémon', 'boutique.html', '#FFCB05', 'Le cœur de la boutique', false], ['Disney Lorcana', 'lorcana.html', '#1E63C8', 'Singles & chapitres', true], ['One Piece', 'one-piece.html', '#D8232A', 'Romance Dawn & +', true], ['Magic', 'magic.html', '#E08A2B', 'The Gathering', true], ['Yu-Gi-Oh!', 'yugioh.html', '#6A3FB5', 'Cartes & coffrets', true]].map(([t, href, color, sub, soon]) => (
            <a key={href} href={href}
              style={{ position: 'relative', background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: color }}></span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>{t}</span>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{sub}</span>
              <span style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: soon ? 'var(--muted)' : 'var(--accent)', fontWeight: 600 }}>{soon ? 'Bientôt disponible' : 'Explorer →'}</span>
            </a>
          ))}
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="container-wide" style={{ padding: '48px 24px 8px' }}>
        <div className="lc-cat-tiles" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[["Cartes à l'unité", 'single', 'Du Set de Base à aujourd’hui'], ['Cartes gradées', 'graded', 'PSA · BGS authentifiées'], ['Scellé', 'sealed', 'Displays · ETB · coffrets'], ['Accessoires', 'accessory', 'Sleeves · classeurs · tapis']].map(([t, key, sub]) => (
            <a key={key} href={'boutique.html?cat=' + key} onClick={(e) => { e.preventDefault(); navigate('catalogue', key); }}
              style={{ background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{t}</span>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{sub}</span>
              <span style={{ marginTop: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>Découvrir →</span>
            </a>
          ))}
        </div>
      </section>

      {/* RAYONS (only when products exist) or EMPTY STATE */}
      {has ? (
        <div className="container-wide" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 48 }}>
          <ProductRow eyebrow="Tout juste arrivé" title="Nouveautés" products={nouveautes} navigate={navigate} onSeeAll={() => navigate('catalogue', 'all')} />
          <ProductRow eyebrow="Réservez les prochaines sorties" title="Précommandes" products={preorders} navigate={navigate} onSeeAll={() => navigate('catalogue', 'preorder')} />
          <ProductRow eyebrow="Les préférées des collectionneurs" title="Meilleures ventes" products={ventesFill} navigate={navigate} onSeeAll={() => navigate('catalogue', 'all')} />
        </div>
      ) : (
        <section className="container-wide" style={{ padding: '56px 24px 64px' }}>
          <div style={{ background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '48px 32px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', marginBottom: 12 }}>On garnit les rayons</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 500, margin: '0 auto 24px' }}>
              La boutique en ligne ouvre très bientôt. En attendant, passez nous voir rue de la Juiverie — ou dites-nous la carte que vous cherchez, on l'a souvent en réserve.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <DS.Button variant="accent" type="button" onClick={() => openModal('contact')}>Nous écrire</DS.Button>
              <DS.Button variant="outline" type="button" onClick={() => openModal('newsletter')}>Prévenez-moi du lancement</DS.Button>
            </div>
          </div>
        </section>
      )}

      {/* NOTRE BOUTIQUE À VIENNE */}
      <section className="container-wide" style={{ padding: '8px 24px 16px' }}>
        <div className="lc-shop-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 0, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1.5px solid var(--line)', background: 'var(--card)' }}>
          <div style={{ padding: '36px 36px 38px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}><Pokeball size={14} />Boutique physique</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 12 }}>Retrouvez-nous à Vienne</h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 440, marginBottom: 22 }}>
              Poussez la porte de la boutique pour voir les pièces en vrai, faire estimer vos cartes ou retirer une commande. On adore parler collection.
            </p>
            <div className="lc-addr-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
              {[['Adresse', 'Rue de la Juiverie\n38200 Vienne'], ['Horaires', 'Mar–Sam · 10h–19h\nDimanche · 14h–18h'], ['Téléphone', '04 74 00 00 00'], ['Services', 'Estimation · Retrait\nAchat de collections']].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>{k}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.45, whiteSpace: 'pre-line' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <DS.Button variant="accent" onClick={() => openModal('contact')}>Nous contacter</DS.Button>
              <DS.Button variant="outline" as="a" href="https://maps.google.com/?q=Rue+de+la+Juiverie+Vienne" target="_blank">Itinéraire →</DS.Button>
            </div>
          </div>
          <div style={{ position: 'relative', background: 'var(--header-bg)', minHeight: 340, overflow: 'hidden' }}>
            {/* Carte OpenStreetMap (sans cookie, sans clé). Centrée sur Vienne (38).
                ⚠️ Pour pointer l'adresse exacte de la boutique, ajuste les coordonnées
                « marker » (lat,lon) et le « bbox » ci-dessous. */}
            <iframe
              title="Carte — leclub151 à Vienne"
              src="https://www.openstreetmap.org/export/embed.html?bbox=4.855%2C45.512%2C4.895%2C45.540&layer=mapnik&marker=45.5256%2C4.8745"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            ></iframe>
            {/* Cartouche adresse en surimpression */}
            <div style={{ position: 'absolute', left: 16, bottom: 16, background: 'var(--card)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 9, maxWidth: 'calc(100% - 32px)' }}>
              <Pokeball size={20} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 16 }}>leclub<span style={{ color: 'var(--accent)' }}>151</span></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Vienne · 38</span>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP POLICY BAND */}
      <section style={{ background: 'var(--ink)', color: 'var(--on-ink)' }}>
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '40px 24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em' }}>Passez nous voir — on adore parler cartes</div>
          </div>
          <DS.Button variant="accent" size="lg" type="button" onClick={() => openModal('contact')}>Nous trouver</DS.Button>
        </div>
      </section>
    </div>
  );
}
Object.assign(window, { Home });
