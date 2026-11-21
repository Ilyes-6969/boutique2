/* CLUB 151 — Catalogue (boutique grid + filters) */

/* Normalisation accents/casse — même logique que lcNormalize de Chrome.jsx
   (SearchBox) : les liens du méga-menu pré-remplissent q avec des libellés
   accentués (« Écarlate & Violet »…), le filtre doit matcher comme le header. */
function catNormalize(s) {
  const str = String(s || '').toLowerCase();
  try { return str.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { return str; }
}

// Icône favori « marque-page » partagée (Chrome.jsx, chargé avant) — repli discret.
const FavRibbon = window.FavRibbon || function () { return null; };

function Catalogue({ navigate, initialFilter, initialQuery, initialGame, initialRayon, initialSort }) {
  const DS = window.ADITCGDesignSystem_df75b7;
  const { PRODUCTS, FILTERS } = window.LC151;
  const CHIPS = [...FILTERS, { key: 'preorder', label: 'Précommande' }];
  const [filter, setFilter] = React.useState(initialFilter || 'all');
  const [query, setQuery] = React.useState(initialQuery || '');
  const [sort, setSort] = React.useState(initialSort || 'feat');
  // Rayon précis = catégorie WooCommerce exacte (« Scellé — ETB »…), posé par le menu (?rayon=).
  const [rayon, setRayon] = React.useState(initialRayon || '');
  // Pagination d'affichage : la grille rend 48 produits, puis « Afficher plus »
  // (le catalogue WooCommerce peut compter plusieurs centaines de produits).
  const PAGE_SIZE = 48;
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  // game = null → toute la boutique (boutique.html). Sur une page de jeu
  // (lorcana.html, one-piece.html…), on ne montre que les produits de CE jeu,
  // reconnus à leurs catégories/étiquettes WooCommerce (champ `game` du contrat
  // produit). Tant qu'un jeu n'a aucun produit en ligne, sa page l'annonce
  // honnêtement (« pas encore en ligne ») au lieu d'afficher un rayon vide.
  const GAMES = Object.assign({}, window.LC151.GAMES, { onepiece: 'One Piece Card Game' });
  const game = GAMES[initialGame] ? initialGame : null;   // jeu inconnu (?game=xyz) → toute la boutique
  const SHOP = (window.LC151 && window.LC151.SHOP) || {};

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
  const GAME_POOL = game ? PRODUCTS.filter((p) => p.game === game) : PRODUCTS;
  const POOL = rayon ? GAME_POOL.filter((p) => p.cat === rayon) : GAME_POOL;
  const comingSoon = !!game && !loading && !errored && GAME_POOL.length === 0;
  // Identifiant WooCommerce numérique (« wp123 » → 123) : le plus grand = le dernier créé.
  const wpNum = (p) => parseInt(String(p.id).replace(/\D/g, ''), 10) || 0;
  // Respiration : plus d'air entre les rangées qu'entre les colonnes — la grille
  // « respire » verticalement sans écarter les cartes horizontalement.
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 0 };
  // onglet de filtre : un mot, souligné d'un trait fin quand il est actif
  const tab = (on) => ({ padding: '11px 0', fontSize: 14.5, fontWeight: on ? 600 : 500, color: on ? 'var(--ink)' : 'var(--ink-2)', boxShadow: on ? 'inset 0 -1px 0 var(--ink)' : 'none', background: 'none', whiteSpace: 'nowrap', cursor: 'pointer' });
  const stateBox = { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '72px 24px' };
  // Pastille icône partagée des états (aucun résultat / erreur) — même traitement
  // que le rayon « bientôt disponible » (rond var(--accent-wash)), pour l'homogénéité.
  const stateIcon = (glyph) => (
    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-wash)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 18 }}>{glyph}</div>
  );

  const q = catNormalize(query.trim());
  let list = comingSoon ? [] : filter === 'favs'
    ? POOL.filter((p) => favIds.indexOf(p.id) !== -1)
    : POOL.filter((p) => filter === 'all' ? true : filter === 'preorder' ? p.preorder : p.type === filter);
  if (q) list = list.filter((p) => catNormalize((p.name || '') + ' ' + (p.set || '') + ' ' + (p.num || '') + ' ' + (p.cat || '')).includes(q));
  if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  if (sort === 'new') list = [...list].sort((a, b) => wpNum(b) - wpNum(a));
  const visible = list.slice(0, visibleCount);
  const hiddenCount = list.length - visible.length;
  // Grille : miniature (thumb) si le catalogue en fournit une, sinon l'image
  // pleine taille — sans toucher StoreCard (Chrome.jsx), qui lit product.image.
  const gridProduct = (p) => (p.thumb ? { ...p, image: p.thumb } : p);

  return (
    <div>
      {/* PAGE HEAD */}
      <section style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="container-wide" style={{ padding: '36px 24px 30px' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>Accueil</a> &nbsp;/&nbsp; {game ? GAMES[game] : 'Boutique'}
          </div>
          <h1 className="display-2" style={{ marginBottom: 8 }}>{query.trim() ? 'Recherche : ' + query.trim() : game ? GAMES[game] : (sort === 'new' && !rayon ? 'Nouveautés' : 'La boutique')}</h1>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', maxWidth: 560 }}>
            {query.trim()
              ? <span>Articles dont le nom ou le rayon contient «&nbsp;{query.trim()}&nbsp;». <a href="#" onClick={(e) => { e.preventDefault(); setQuery(''); }} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>Effacer la recherche</a></span>
              : comingSoon
              ? 'Le rayon ' + GAMES[game] + ' n’est pas encore en ligne. Passez en boutique ou écrivez-nous pour connaître les disponibilités.'
              : game
              ? 'Tout ce que nous avons en ' + GAMES[game] + ', à retirer au magasin ou livré chez vous.'
              : "Cartes à l'unité, cartes gradées, scellé, accessoires, figurines et goodies, tous jeux confondus."}
          </p>
        </div>
      </section>

      {/* TOOLBAR (masquée sur les rayons « bientôt disponibles ») */}
      {!comingSoon && (
      <div className="lc-cat-toolbar" style={{ position: 'sticky', top: 114, zIndex: 30, background: 'var(--card)', borderBottom: '1px solid var(--line)' }}>
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', columnGap: 22, rowGap: 0, flexWrap: 'wrap' }}>
            {/* Filtres = de simples mots ; l'actif porte un trait fin dessous. */}
            {CHIPS.filter((f) => f.key === 'all' || f.key === filter || POOL.some((p) => f.key === 'preorder' ? p.preorder : p.type === f.key)).map((f) => <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)} style={tab(filter === f.key)}>{f.label}</button>)}
            {/* Rayon précis choisi dans le menu : un filtre qu'on retire d'un clic. */}
            {rayon && <button type="button" onClick={() => setRayon('')} title="Retirer ce filtre" style={{ ...tab(true), display: 'inline-flex', alignItems: 'center', gap: 7 }}>{rayon.replace(/^Scellé — /, '')}<svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true"><path d="M2 2l6 6M8 2l-6 6"></path></svg></button>}
            {showFavChip && <button type="button" aria-pressed={filter === 'favs'} onClick={() => setFilter('favs')} style={{ ...tab(filter === 'favs'), display: 'inline-flex', alignItems: 'center', gap: 6 }}><FavRibbon caught={true} size={12} />Ma collection</button>}
          </div>
          {/* Groupe tri : séparateur discret + compteur mis en valeur + select stylé. */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{loading ? '…' : list.length + ' produit' + (list.length > 1 ? 's' : '')}</span>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>
      </div>
      )}

      {/* GRID */}
      <section className="container-wide" style={{ padding: '0 24px 80px' }}>
        {loading ? (
          <div className="lc-pockets" style={gridStyle} aria-busy="true" aria-label="Chargement du catalogue">
            {/* ~16 squelettes : remplit la 1re page visible pour éviter le saut de mise en page à l'arrivée du catalogue. */}
            {Array.from({ length: 16 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
          </div>
        ) : errored ? (
          <div style={stateBox} role="alert">
            {stateIcon('!')}
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 18, marginBottom: 6 }}>Catalogue momentanément indisponible</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16, maxWidth: 440 }}>Le catalogue est momentanément indisponible. Réessayez dans un instant.</p>
            <DS.Button variant="outline" onClick={() => Store.refreshFromWp()}>Réessayer</DS.Button>
          </div>
        ) : comingSoon ? (
          <div style={stateBox}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-wash)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 18 }}>★</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 24, letterSpacing: '-0.02em', marginBottom: 8 }}>{GAMES[game]} : bientôt en ligne</div>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: 480, marginBottom: 22, lineHeight: 1.6 }}>
              Ce rayon n'est pas encore ouvert sur le site. Pour savoir ce qu'on a en {GAMES[game]}, passez nous voir{SHOP.street ? ' au ' + SHOP.street + ', à ' + SHOP.city : ' en boutique'} ou écrivez-nous — et laissez votre e-mail pour être prévenu de la mise en ligne.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <DS.Button variant="accent" onClick={() => openModal('newsletter')}>Être prévenu</DS.Button>
              <DS.Button variant="outline" onClick={() => openModal('contact')}>Nous écrire</DS.Button>
              <DS.Button variant="outline" onClick={() => navigate('catalogue', 'all')}>Voir toute la boutique</DS.Button>
            </div>
          </div>
        ) : list.length === 0 ? (
          q ? (
            /* Recherche active sans résultat (ex. sous-lien du méga-menu) :
               sortie propre vers le rayon complet plutôt qu'une grille vide. */
            <div style={stateBox}>
              {stateIcon('⌕')}
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 18, marginBottom: 6 }}>Aucun résultat pour «&nbsp;{query.trim()}&nbsp;» dans ce rayon</div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16, maxWidth: 440 }}>Essayez un autre terme, ou parcourez l'ensemble du rayon.</p>
              <DS.Button variant="outline" onClick={() => setQuery('')}>Voir tout le rayon</DS.Button>
            </div>
          ) : filter === 'favs' ? (
            <div style={stateBox}>
              <div style={{ marginBottom: 16, opacity: 0.9 }}><FavRibbon caught={true} size={40} /></div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 18, marginBottom: 6 }}>Votre collection est vide</div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 440 }}>Cliquez le marque-page d'une carte pour la retrouver ici.</p>
            </div>
          ) : (
          <div style={stateBox}>
            {stateIcon('★')}
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 18, marginBottom: 6 }}>Aucun produit pour le moment</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 440 }}>Les rayons se remplissent — revenez très vite !</p>
          </div>
          )
        ) : (
          <React.Fragment>
            <div className="lc-pockets" style={gridStyle}>
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
/* ChipShell — enveloppe pilulée qui porte la micro-ombre du chip ACTIF, pour le
   détacher des inactifs sans réécrire le style interne de DS.Tag. On rend
   TOUJOURS le même wrapper span (type d'élément stable) : basculer entre
   `children` brut et un span remonterait DS.Tag (qui garde un useState de hover),
   cassant sa transition. Seule l'ombre varie selon l'état actif. */
function ChipShell({ active, children }) {
  return <span style={{ display: 'inline-flex', borderRadius: 'var(--radius-pill)', boxShadow: active ? 'var(--shadow-xs)' : 'none' }}>{children}</span>;
}

/* SortSelect — <select> de tri habillé : chevron OS masqué (appearance:none) et
   remplacé par une flèche dessinée, radius pilulé cohérent avec les chips, bordure
   qui s'appuie au survol. Reste un vrai <select> natif (accessibilité clavier). */
function SortSelect({ value, onChange }) {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const strong = hover || focus;
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Trier les produits"
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', padding: '9px 34px 9px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid ' + (strong ? 'var(--ink)' : 'var(--line-strong)'), background: 'var(--card)', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer', outline: 'none', transition: 'border-color var(--dur-fast) var(--ease-out)' }}>
        <option value="feat">En vedette</option>
        <option value="new">Nouveautés</option>
        <option value="price-asc">Prix croissant</option>
        <option value="price-desc">Prix décroissant</option>
      </select>
      {/* Chevron dessiné (le natif est masqué par appearance:none). */}
      <span aria-hidden="true" style={{ position: 'absolute', right: 13, top: '50%', width: 8, height: 8, borderRight: '1px solid ' + (strong ? 'var(--ink)' : 'var(--muted)'), borderBottom: '1px solid ' + (strong ? 'var(--ink)' : 'var(--muted)'), transform: 'translateY(-70%) rotate(45deg)', pointerEvents: 'none', transition: 'border-color var(--dur-fast) var(--ease-out)' }}></span>
    </div>
  );
}

/* SkeletonCard — squelette FIDÈLE à l'anatomie de StoreCard (Chrome.jsx) :
   fantôme de badge (coin haut-gauche), eyebrow catégorie, titre 2 lignes,
   ligne prix mono courte, pastille stock (point + libellé), bouton d'ajout.
   Les proportions (aspect 1/1, padding 14/16/16, hauteurs) épousent la vraie
   carte pour éviter le saut de mise en page au remplacement. L'entrée est
   décalée par index (lc-line-in, active seulement sous no-preference). */
function SkeletonCard({ index = 0 }) {
  const bar = (w, h, mt, extra) => <div style={{ width: w, height: h, marginTop: mt, borderRadius: 6, background: 'var(--line)', ...extra }}></div>;
  // Entrée décalée (lc-line-in) portée par le wrapper — le pouls (lcPulse) est
  // sur la carte interne pour ne pas écraser l'animation d'entrée (le shorthand
  // `animation` inline l'emporterait sur la classe). L'entrée reste inactive
  // sous prefers-reduced-motion (déclarée seulement en no-preference).
  return (
    <div className="lc-line-in" style={{ animationDelay: (index * 45) + 'ms' }}>
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)', animation: 'lcPulse 1.3s ease-in-out infinite' }}>
        {/* Zone image + fantôme de badge (coin haut-gauche, comme StoreCard). */}
        <div style={{ position: 'relative', aspectRatio: '1 / 1', background: 'var(--paper-2)' }}>
          <div style={{ position: 'absolute', top: 12, left: 12, width: 48, height: 20, borderRadius: 'var(--radius-pill)', background: 'var(--line)' }}></div>
        </div>
        {/* Corps : eyebrow, titre 2 lignes, prix mono court, pastille stock, bouton. */}
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
          {bar('38%', 10, 0)}
          <div style={{ minHeight: 40, marginTop: 5 }}>{bar('88%', 14, 0)}{bar('60%', 14, 7)}</div>
          {bar('34%', 17, 4)}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--line-strong)', flex: 'none' }}></span>
            {bar('52%', 9, 0)}
          </div>
          {bar('100%', 42, 12, { borderRadius: 'var(--radius-sm)' })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Catalogue, SkeletonCard });
