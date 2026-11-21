/* CLUB 151 — Accueil (refonte nov. 2026 : le magasin d'abord, entrée par jeu,
   rangées de produits réels). Fonctionne aussi avec un catalogue VIDE : les
   rangées laissent alors la place à un message, sans faux produit. */

function Home({ navigate }) {
  const DS = window.ADITCGDesignSystem_df75b7;
  // useStore() s'abonne au Store : les rayons se re-rendent à l'arrivée du
  // catalogue (/api/catalog résout souvent APRÈS le montage React) au lieu
  // de rester figés à vide.
  const Store = useStore();
  const all = Store.all();
  const has = all.length > 0;
  const by = (t) => all.filter((p) => p.type === t);
  const preorders = all.filter((p) => p.preorder);
  // Coordonnées du magasin : source unique (data.js → LC151.SHOP).
  const SHOP = (window.LC151 && window.LC151.SHOP) || {};
  const shopAddr = SHOP.street ? SHOP.street + '\n' + SHOP.zip + ' ' + SHOP.city : 'Vienne (38200)';
  const shopHours = (SHOP.hours || []).map(([d, h]) => d + ' · ' + h).join('\n');
  const instagram = ((SHOP.socials || []).find(([n]) => n === 'Instagram') || [])[1] || '';
  // Carte : cadrage serré autour de la boutique (±0,004° de longitude).
  const geo = SHOP.geo || { lat: 45.5256, lon: 4.8745 };
  const mapSrc = 'https://www.openstreetmap.org/export/embed.html?bbox='
    + [geo.lon - 0.004, geo.lat - 0.0025, geo.lon + 0.004, geo.lat + 0.0025].map((n) => n.toFixed(5)).join('%2C')
    + '&layer=mapnik&marker=' + geo.lat.toFixed(5) + '%2C' + geo.lon.toFixed(5);

  // ---------- REFONTE : accueil « boutique » ----------
  // Bannière : les photos du magasin (LC151.SHOP.photos) quand il y en a,
  // sinon le visuel de cartes. Plusieurs photos = diaporama (5 s, pause au survol).
  const heroImgs = (SHOP.photos && SHOP.photos.length) ? SHOP.photos : ['assets/hero-cards.webp'];
  const [slide, setSlide] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => {
    if (heroImgs.length < 2 || paused) return undefined;
    const id = setInterval(() => setSlide((n) => (n + 1) % heroImgs.length), 5000);
    return () => clearInterval(id);
  }, [heroImgs.length, paused]);

  const GAMES = (window.LC151 && window.LC151.GAMES) || {};
  const gameUrl = (window.LC151 && window.LC151.gameUrl) || ((g) => '/boutique.html?game=' + g);
  const countGame = (g) => all.filter((p) => p.game === g).length;
  const OTHER_GAMES = ['riftbound', 'naruto', 'dragonball', 'kayou', 'rise'];
  const othersCount = OTHER_GAMES.reduce((n, g) => n + countGame(g), 0);
  // Tuile « Autres TCG » : mène au plus fourni de ces jeux (le menu liste les autres).
  const bestOther = OTHER_GAMES.map((g) => [g, countGame(g)]).sort((a, b) => b[1] - a[1])[0];
  const otherUrl = bestOther && bestOther[1] ? gameUrl(bestOther[0]) : '/boutique.html';
  const wpNum = (p) => parseInt(String(p.id).replace(/\D/g, ''), 10) || 0;
  const top = (list, n) => list.slice(0, n || 12);
  const byPrice = (list) => [...list].sort((a, b) => b.price - a.price);
  // Rangées de l'accueil — uniquement des produits réels du catalogue.
  const rowNew = top([...all].sort((a, b) => wpNum(b) - wpNum(a)));
  const rowSealed = top(byPrice(by('sealed')).filter((p) => p.price >= 20));
  const rowBoosters = top(all.filter((p) => p.type === 'sealed' && /booster|blister/i.test(p.cat || '')).sort((a, b) => a.price - b.price));
  const rowSingles = top(byPrice(by('single')));
  const rowGraded = top(byPrice(by('graded')));
  const rowGoodies = top(byPrice(by('goodies')));
  // ---------- HABILLAGE « TRAIT FIN » ----------
  // La page est blanche ; ce sont des traits d'un pixel qui la structurent, comme
  // les pochettes d'un classeur. Chaque trait sépare deux choses réelles (deux
  // rayons, deux infos, deux produits) — aucun n'est décoratif. Titres en Poppins
  // léger, pas de sur-titres en capitales, pas de flèches, pas d'animation.
  const line = '1px solid var(--line)';
  const h2 = { fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(22px, 2.6vw, 30px)', letterSpacing: '-0.02em', lineHeight: 1.15 };
  const link = { fontSize: 14.5, fontWeight: 500, color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4, textDecorationThickness: 1 };
  const factLabel = { fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 };
  const factValue = { fontSize: 15, fontWeight: 500, lineHeight: 1.45, whiteSpace: 'pre-line' };
  const games = [['pokemon', 'Pokémon'], ['onepiece', 'One Piece'], ['lorcana', 'Lorcana'], ['magic', 'Magic'], ['yugioh', 'Yu-Gi-Oh!'], [null, 'Autres TCG']];
  const facts = [
    ['Adresse', shopAddr],
    ...(shopHours ? [['Horaires', shopHours.replace(/ · /g, ' : ') + '\nFermé le lundi']] : []),
    ...((SHOP.phone || '').trim() ? [['Téléphone', SHOP.phone]] : []),
  ];

  return (
    <div>
      {/* 1. OUVERTURE — le magasin : un titre, la fiche (adresse, horaires, téléphone), le visuel */}
      <section style={{ borderBottom: line }}>
        <div className="container-wide lc-open" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)', gap: 0, padding: 0 }}>
          <div className="lc-open-text" style={{ padding: '56px 48px 0 24px', display: 'flex', flexDirection: 'column', borderRight: line }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(33px, 4vw, 54px)', letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: 20 }}>
              Cartes à collectionner,<br />à Vienne.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 500, marginBottom: 28 }}>
              Pokémon, One Piece, Lorcana, Magic, Yu-Gi-Oh! À voir en magasin, à retirer sur place ou livré chez vous.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
              <DS.Button variant="primary" size="lg" as="a" href={has ? '/boutique.html?tri=nouveau' : '/boutique.html'}>{has ? 'Voir les nouveautés' : 'Voir la boutique'}</DS.Button>
              <DS.Button variant="outline" size="lg" as="a" href="#la-boutique">Venir au magasin</DS.Button>
            </div>
            {/* la fiche du magasin : trois colonnes séparées par un trait */}
            <div className="lc-facts" style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(' + facts.length + ', 1fr)', borderTop: line, marginLeft: -24, marginRight: -48 }}>
              {facts.map(([k, v], n) => (
                <div key={k} style={{ padding: '18px 24px 22px', borderLeft: n ? line : 'none' }}>
                  <div style={factLabel}>{k}</div>
                  <div style={factValue}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="lc-open-visual" style={{ position: 'relative', minHeight: 460, background: 'var(--paper-2)', overflow: 'hidden' }}
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {heroImgs.map((src, k) => (
              <div key={src} aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'url(' + src + ')', backgroundSize: 'cover', backgroundPosition: 'center', opacity: k === slide ? 1 : 0, transition: 'opacity 0.6s ease' }}></div>
            ))}
            {heroImgs.length > 1 && (
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center', gap: 6 }}>
                {heroImgs.map((src, k) => (
                  <button key={src} type="button" aria-label={'Photo ' + (k + 1) + ' sur ' + heroImgs.length} aria-current={k === slide ? 'true' : undefined} onClick={() => setSlide(k)}
                    style={{ width: 22, height: 2, background: k === slide ? '#fff' : 'rgba(255,255,255,0.5)' }}></button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. LES JEUX — une rangée réglée : le nom, et ce qu'il y a réellement en ligne */}
      <section style={{ borderBottom: line }}>
        <div className="container-wide lc-games" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', padding: 0 }}>
          {games.map(([g, label], n) => {
            const count = g ? countGame(g) : othersCount;
            return (
              <a key={label} href={g ? gameUrl(g) : otherUrl} className="lc-cell-link" style={{ padding: '22px 24px 24px', borderLeft: n ? line : 'none', display: 'block' }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 20, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{label}</span>
                <span style={{ display: 'block', fontSize: 13.5, color: 'var(--muted)', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{count ? count + ' produit' + (count > 1 ? 's' : '') : 'bientôt en ligne'}</span>
              </a>
            );
          })}
        </div>
      </section>

      {/* 3. LES RANGÉES DE PRODUITS (catalogue réel) ou l'état vide */}
      {has ? (
        <div className="container-wide" style={{ padding: '44px 24px 56px', display: 'flex', flexDirection: 'column', gap: 52 }}>
          <ProductRow title="Nouveautés" products={rowNew} navigate={navigate} onSeeAll={() => { window.location.href = '/boutique.html?tri=nouveau'; }} />
          <ProductRow title="Précommandes" products={preorders} navigate={navigate} onSeeAll={() => navigate('catalogue', 'preorder')} />
          <ProductRow title="Displays, ETB et coffrets" products={rowSealed} navigate={navigate} onSeeAll={() => navigate('catalogue', 'sealed')} />
          <ProductRow title="Boosters et blisters" products={rowBoosters} navigate={navigate} onSeeAll={() => navigate('catalogue', 'sealed')} />
          <ProductRow title="Cartes à l'unité" products={rowSingles} navigate={navigate} onSeeAll={() => navigate('catalogue', 'single')} />
          <ProductRow title="Cartes gradées" products={rowGraded} navigate={navigate} onSeeAll={() => navigate('catalogue', 'graded')} />
          <ProductRow title="Figurines, peluches et goodies" products={rowGoodies} navigate={navigate} onSeeAll={() => navigate('catalogue', 'goodies')} />
        </div>
      ) : (
        <section className="container-wide" style={{ padding: '56px 24px 64px' }}>
          <h2 style={{ ...h2, marginBottom: 12 }}>Le catalogue en ligne arrive</h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 560, marginBottom: 22 }}>
            En attendant, tout se passe en magasin{SHOP.street ? ', au ' + SHOP.street : ''}. Vous cherchez une carte précise ? Écrivez-nous, on regarde si on l'a.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <DS.Button variant="primary" type="button" onClick={() => openModal('contact')}>Nous écrire</DS.Button>
            <DS.Button variant="outline" type="button" onClick={() => openModal('newsletter')}>Être prévenu de la mise en ligne</DS.Button>
          </div>
        </section>
      )}

      {/* 4. TOURNOIS — une ligne, entre deux traits */}
      <section id="evenements" style={{ borderTop: line, borderBottom: line, scrollMarginTop: 140 }}>
        <div className="container-wide lc-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 32, padding: '34px 24px' }}>
          <div>
            <h2 style={{ ...h2, marginBottom: 8 }}>Des tournois chaque semaine, en magasin</h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 560 }}>
              Le programme (jeu, date, inscription) est annoncé sur notre Instagram.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {instagram && <DS.Button variant="outline" as="a" href={instagram} target="_blank" rel="noopener noreferrer">Voir le programme</DS.Button>}
          </div>
        </div>
      </section>

      {/* 5. LE MAGASIN — la fiche complète à gauche, la carte à droite */}
      <section id="la-boutique" style={{ borderBottom: line, scrollMarginTop: 140 }}>
        <div className="container-wide lc-open" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)', padding: 0 }}>
          <div className="lc-open-text" style={{ padding: '44px 48px 44px 24px', borderRight: line }}>
            <h2 style={{ ...h2, marginBottom: 10 }}>Le magasin</h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 460, marginBottom: 26 }}>
              Voir les pièces en vrai, faire estimer ou racheter vos cartes, jouer un tournoi, retirer une commande.
            </p>
            <dl style={{ margin: '0 0 28px', borderTop: line }}>
              {[...facts, ['Sur place', 'Rachat et estimation de cartes\nTournois chaque semaine\nRetrait des commandes passées en ligne']].map(([k, v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px minmax(0, 1fr)', gap: 16, padding: '13px 0', borderBottom: line }}>
                  <dt style={{ fontSize: 13.5, color: 'var(--muted)' }}>{k}</dt>
                  <dd style={{ margin: 0, fontSize: 15, fontWeight: 500, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{v}</dd>
                </div>
              ))}
            </dl>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <DS.Button variant="primary" as="a" href={SHOP.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Club151+Vienne'} target="_blank" rel="noopener noreferrer">Itinéraire</DS.Button>
              <DS.Button variant="outline" onClick={() => openModal('contact')}>Nous écrire</DS.Button>
            </div>
          </div>
          <div style={{ position: 'relative', minHeight: 360, background: 'var(--paper-2)' }}>
            {/* Carte OpenStreetMap (sans cookie, sans clé), centrée sur le magasin :
                coordonnées dans data.js (LC151.SHOP.geo). */}
            <iframe title={'Carte : CLUB 151, ' + (SHOP.street || 'Vienne')} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}></iframe>
          </div>
        </div>
      </section>

      {/* 6. LETTRE D'INFORMATION */}
      <section>
        <div className="container-wide lc-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 32, padding: '34px 24px 40px' }}>
          <div>
            <h2 style={{ ...h2, marginBottom: 6 }}>Les arrivages par e-mail</h2>
            <p style={{ fontSize: 15.5, color: 'var(--ink-2)' }}>Nouvelles sorties, précommandes et dates de tournois.</p>
          </div>
          <DS.Button variant="outline" type="button" onClick={() => openModal('newsletter')}>S'inscrire</DS.Button>
        </div>
      </section>

    </div>
  );
}
Object.assign(window, { Home });
