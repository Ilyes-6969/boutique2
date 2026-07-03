/* leclub151 — Gestion via WordPress / WooCommerce (application externe au site)
   Interface façon wp-admin : on édite prix, stock, promos et on ajoute des
   produits. Tout est enregistré et synchronisé avec la boutique (démo). */

const WP = {
  dark: '#1d2327', darker: '#101517', blue: '#2271b1', blueDark: '#135e96',
  grey: '#f0f0f1', border: '#c3c4c7', text: '#1d2327', muted: '#50575e',
  woo: '#7f54b3', green: '#00a32a', red: '#d63638', white: '#fff',
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

function useStoreAdmin() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => window.LC151.Store.subscribe(force), []);
  return window.LC151.Store;
}

function WpConnect({ Store, showToast }) {
  const [url, setUrl] = React.useState(Store.getWpUrl());
  const st = Store.wpStatus();
  const connect = () => { Store.setWpUrl(url); showToast(url ? 'Connexion à WordPress…' : 'WordPress déconnecté'); };

  const dot = st.state === 'ok' ? WP.green : st.state === 'error' ? WP.red : st.state === 'loading' ? WP.blue : WP.muted;
  const label = st.state === 'ok' ? `Connecté · ${st.count} produit${st.count > 1 ? 's' : ''} importé${st.count > 1 ? 's' : ''}`
    : st.state === 'loading' ? 'Connexion en cours…'
    : st.state === 'error' ? ('Échec : ' + st.error)
    : 'Non connecté';

  return (
    <div style={{ background: WP.white, border: '1px solid ' + WP.border, borderLeft: '4px solid ' + WP.woo, borderRadius: 4, padding: '14px 16px', marginBottom: 18, boxShadow: '0 1px 1px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 13.5, color: WP.woo }}>Connexion WordPress / WooCommerce</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontSize: 12, color: WP.muted }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }}></span>{label}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://votre-site-wordpress.fr"
          onKeyDown={(e) => { if (e.key === 'Enter') connect(); }}
          style={{ flex: 1, minWidth: 240, padding: '7px 11px', border: '1px solid ' + WP.border, borderRadius: 3, fontSize: 13, fontFamily: WP.mono, outline: 'none', color: WP.text }} />
        <button onClick={connect} style={{ fontFamily: WP.font, fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 3, border: 'none', background: WP.woo, color: '#fff', cursor: 'pointer' }}>Connecter</button>
        {st.state === 'ok' && <button onClick={() => { Store.refreshFromWp(); showToast('Catalogue actualisé'); }} style={{ fontFamily: WP.font, fontSize: 13, padding: '7px 14px', borderRadius: 3, border: '1px solid ' + WP.border, background: '#f6f7f7', color: WP.text, cursor: 'pointer' }}>↻ Actualiser</button>}
      </div>
      <p style={{ fontSize: 12, color: WP.muted, marginTop: 9, lineHeight: 1.55 }}>
        Saisissez l'adresse de votre site WordPress équipé de WooCommerce. Les produits sont lus via l'API publique <span style={{ fontFamily: WP.mono }}>/wp-json/wc/store/v1/products</span> et s'affichent automatiquement sur la boutique. (Le site doit autoriser le CORS pour le domaine de cette vitrine.)
      </p>
    </div>
  );
}

function OrderNotify({ showToast }) {
  const Orders = window.LC151.Orders;
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => Orders.subscribe(force), []);
  const [val, setVal] = React.useState(Orders.getWebhook());
  const isSet = !!Orders.getWebhook();
  const apply = () => { Orders.setWebhook(val); showToast(val ? 'Réception des commandes activée' : 'Réception des commandes désactivée'); };
  return (
    <div style={{ background: WP.white, border: '1px solid ' + WP.border, borderLeft: '4px solid ' + WP.green, borderRadius: 4, padding: '14px 16px', marginBottom: 18, boxShadow: '0 1px 1px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 13.5, color: WP.green }}>Réception des commandes (e-mail)</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontSize: 12, color: WP.muted }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isSet ? WP.green : WP.muted }}></span>{isSet ? 'Activée' : 'Non configurée'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Clé Web3Forms (gratuit) ou URL de webhook"
          onKeyDown={(e) => { if (e.key === 'Enter') apply(); }}
          style={{ flex: 1, minWidth: 240, padding: '7px 11px', border: '1px solid ' + WP.border, borderRadius: 3, fontSize: 13, fontFamily: WP.mono, outline: 'none', color: WP.text }} />
        <button onClick={apply} style={{ fontFamily: WP.font, fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 3, border: 'none', background: WP.green, color: '#fff', cursor: 'pointer' }}>Enregistrer</button>
      </div>
      <p style={{ fontSize: 12, color: WP.muted, marginTop: 9, lineHeight: 1.55 }}>
        Pour recevoir un e-mail à chaque commande : créez une clé gratuite sur <span style={{ fontFamily: WP.mono }}>web3forms.com</span> (saisissez votre e-mail, copiez l'« Access Key » ici). Vous pouvez aussi coller une URL de webhook (Make, Zapier, n8n, ou votre serveur). Sans configuration, les commandes restent enregistrées localement uniquement.
      </p>
    </div>
  );
}

function AdminApp() {
  const Store = useStoreAdmin();
  const { fmt, FILTERS } = window.LC151;
  const products = Store.all();
  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState('all');     // all | instock | oos | promo
  const [toast, setToast] = React.useState('');
  const [adding, setAdding] = React.useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 1600); };

  // Mode connecté : le catalogue vient de WooCommerce. Les overrides locaux
  // (localStorage) ne vivent QUE dans ce navigateur — on le dit clairement et
  // on passe les lignes WooCommerce en lecture seule.
  const wpConnected = Store.wpStatus().state === 'ok';
  // L'URL WordPress n'est connue ici que si elle a été saisie dans « Connexion
  // WordPress » (mode test). Via /api/catalog (chemin normal en production),
  // elle est vide → pas de lien plutôt qu'un lien relatif cassé.
  const wpBase = String(Store.getWpUrl() || '').replace(/\/+$/, '');
  const wpAdminProductsUrl = (wpConnected && wpBase)
    ? wpBase + '/wp-admin/edit.php?post_type=product'
    : '';

  const counts = {
    all: products.length,
    instock: products.filter((p) => p.inStock).length,
    oos: products.filter((p) => !p.inStock).length,
    promo: products.filter((p) => p.oldPrice).length,
  };
  let list = products.filter((p) => {
    if (tab === 'instock' && !p.inStock) return false;
    if (tab === 'oos' && p.inStock) return false;
    if (tab === 'promo' && !p.oldPrice) return false;
    return q === '' || (p.name + ' ' + p.set + ' ' + p.num).toLowerCase().includes(q.toLowerCase());
  });

  const menu = [
    ['⊞', 'Tableau de bord'], ['✎', 'Articles'], ['▣', 'Médias'], ['❏', 'Pages'],
    ['✉', 'Commandes'], ['🛍', 'Produits', true], ['◫', 'Marketing'], ['⚙', 'Réglages'],
  ];

  const tabBtn = (key, label, n) => (
    <button onClick={() => setTab(key)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: WP.font, fontSize: 13, color: tab === key ? WP.text : WP.blue, fontWeight: tab === key ? 600 : 400 }}>
      {label} <span style={{ color: WP.muted }}>({n})</span>
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: WP.grey, fontFamily: WP.font, color: WP.text, display: 'flex', flexDirection: 'column' }}>
      {/* WP ADMIN BAR */}
      <div style={{ height: 34, background: WP.darker, color: '#c3c4c7', display: 'flex', alignItems: 'center', paddingInline: 12, fontSize: 13, gap: 16, position: 'sticky', top: 0, zIndex: 60 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, fontWeight: 700 }}>
            <span style={{ color: '#fff' }}>leclub</span><span style={{ background: '#fff', color: '#161412', padding: '0 4px', borderRadius: 2 }}>151</span>
          </span>
        </span>
        <a href="index.html" style={{ color: '#c3c4c7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>⌂ Voir le site</a>
        <span style={{ marginLeft: 'auto', color: '#a7aaad' }}>Bonjour, leclub151 ▾</span>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* SIDEBAR */}
        <nav style={{ width: 200, background: WP.dark, color: '#f0f0f1', flexShrink: 0, paddingTop: 8 }}>
          {menu.map(([ic, label, active]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', fontSize: 14, cursor: 'pointer',
              background: active ? WP.blue : 'transparent', color: active ? '#fff' : '#c3c4c7', fontWeight: active ? 600 : 400,
              borderLeft: active ? '4px solid #fff' : '4px solid transparent' }}>
              <span style={{ width: 18, fontSize: 14, opacity: active ? 1 : 0.7 }}>{ic}</span>{label}
            </div>
          ))}
          <div style={{ padding: '20px 14px 14px', fontFamily: WP.mono, fontSize: 10, color: '#8c8f94', letterSpacing: '0.04em' }}>
            WooCommerce 9.4 · WordPress 6.7
          </div>
        </nav>

        {/* CONTENT */}
        <main style={{ flex: 1, padding: '22px 30px 60px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 23, fontWeight: 400 }}>Produits</h1>
            {!wpConnected && <button onClick={() => setAdding(true)} style={{ fontFamily: WP.font, fontSize: 13, padding: '4px 10px', borderRadius: 3, border: '1px solid ' + WP.blue, color: WP.blue, background: '#f6f7f7', cursor: 'pointer' }}>Ajouter un produit</button>}
            <span style={{ marginLeft: 'auto', fontFamily: WP.mono, fontSize: 11.5, color: WP.muted }}>{wpConnected ? 'Catalogue WooCommerce · lecture seule ici' : 'Synchronisé avec la boutique · modifications enregistrées'}</span>
          </div>
          <p style={{ fontSize: 13, color: WP.muted, marginBottom: 18 }}>{wpConnected ? 'Le catalogue est lu depuis votre WordPress. Prix, stock et promotions se gèrent dans wp-admin.' : 'Gérez le catalogue WooCommerce : modifiez les prix, le stock et les promotions. Les changements s\'appliquent au site en direct.'}</p>

          {wpConnected && (
            <div style={{ background: '#fcf9e8', border: '1px solid ' + WP.border, borderLeft: '4px solid #dba617', borderRadius: 4, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: WP.text, lineHeight: 1.6, boxShadow: '0 1px 1px rgba(0,0,0,0.04)' }}>
              <strong>Catalogue géré par WooCommerce</strong> — les modifications ci-dessous ne changent QUE cet écran. Gérez prix et stock dans wp-admin.{' '}
              {wpAdminProductsUrl
                ? <a href={wpAdminProductsUrl} target="_blank" rel="noopener noreferrer" style={{ color: WP.blue, fontWeight: 600 }}>Ouvrir la gestion des produits ↗</a>
                : <span style={{ color: WP.muted }}>(renseignez l'URL WordPress dans « Connexion WordPress » pour un lien direct)</span>}
            </div>
          )}

          <WpConnect Store={Store} showToast={showToast} />
          <OrderNotify showToast={showToast} />

          {/* tabs + search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
              {tabBtn('all', 'Tous', counts.all)}<span style={{ color: WP.border }}>|</span>
              {tabBtn('instock', 'En stock', counts.instock)}<span style={{ color: WP.border }}>|</span>
              {tabBtn('oos', 'En rupture', counts.oos)}<span style={{ color: WP.border }}>|</span>
              {tabBtn('promo', 'En promotion', counts.promo)}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher des produits"
                style={{ padding: '5px 10px', border: '1px solid ' + WP.border, borderRadius: 3, fontSize: 13, fontFamily: WP.font, minWidth: 220, outline: 'none', color: WP.text }} />
            </div>
          </div>

          {/* LIST TABLE */}
          <div style={{ background: WP.white, border: '1px solid ' + WP.border, borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 1px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '46px 1.9fr 0.8fr 1fr 1fr 0.9fr 0.5fr', gap: 12, padding: '10px 14px', borderBottom: '1px solid ' + WP.border, background: '#fff', fontSize: 12, fontWeight: 600, color: WP.text, alignItems: 'center' }}>
              <input type="checkbox" disabled style={{ accentColor: WP.blue }} />
              <span>Nom</span><span>SKU</span><span>Stock</span><span>Prix</span><span>Étiquette</span><span></span>
            </div>
            {list.map((p, i) => <WpRow key={p.id} product={p} Store={Store} showToast={showToast} stripe={i % 2 === 1} readOnly={wpConnected && String(p.id).indexOf('wp') === 0} />)}
            {list.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: WP.muted, fontSize: 13.5, lineHeight: 1.7 }}>Aucun produit pour l'instant.<br />Cliquez « Ajouter un produit » ou importez votre catalogue depuis WooCommerce.</div>}
          </div>
          <div style={{ marginTop: 10, fontSize: 12.5, color: WP.muted }}>{list.length} élément{list.length > 1 ? 's' : ''}</div>

          <button onClick={() => { if (confirm('Réinitialiser toutes les modifications de démo ?')) { Store.resetAll(); showToast('Catalogue réinitialisé'); } }}
            style={{ marginTop: 22, fontFamily: WP.font, fontSize: 12.5, color: WP.muted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Réinitialiser le catalogue de démonstration</button>
        </main>
      </div>

      {adding && <WpAddModal Store={Store} onClose={() => setAdding(false)} onDone={(name) => { setAdding(false); showToast(name + ' publié'); }} />}

      {/* TOAST (WP notice) */}
      <div style={{ position: 'fixed', bottom: 22, left: 230, transform: `translateY(${toast ? 0 : 16}px)`, opacity: toast ? 1 : 0, transition: 'all 0.25s ease', pointerEvents: 'none', zIndex: 80, background: WP.white, color: WP.text, padding: '11px 18px', borderRadius: 4, fontSize: 13.5, border: '1px solid ' + WP.border, borderLeft: '4px solid ' + WP.green, boxShadow: '0 4px 14px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: WP.green }}>✓</span> {toast}
      </div>
    </div>
  );
}

function WpRow({ product, Store, showToast, stripe, readOnly }) {
  const [price, setPrice] = React.useState(String(product.price));
  const [old, setOld] = React.useState(product.oldPrice != null ? String(product.oldPrice) : '');
  React.useEffect(() => { setPrice(String(product.price)); }, [product.price]);
  React.useEffect(() => { setOld(product.oldPrice != null ? String(product.oldPrice) : ''); }, [product.oldPrice]);

  const commitPrice = () => { if (readOnly) return; const n = parseFloat(price.replace(',', '.')); if (!isNaN(n) && n !== product.price) { Store.update(product.id, 'price', Math.round(n * 100) / 100); showToast('Prix mis à jour'); } };
  const commitOld = () => {
    if (readOnly) return;
    const v = old.trim();
    if (v === '') { if (product.oldPrice != null) { Store.update(product.id, 'oldPrice', null); showToast('Promo retirée'); } return; }
    const n = parseFloat(v.replace(',', '.')); if (!isNaN(n) && n !== product.oldPrice) { Store.update(product.id, 'oldPrice', Math.round(n * 100) / 100); showToast('Promo mise à jour'); }
  };

  const roHint = readOnly ? 'Produit WooCommerce — gérez-le dans wp-admin' : undefined;
  const inp = { width: '100%', padding: '6px 8px', border: '1px solid ' + WP.border, borderRadius: 3, fontFamily: WP.mono, fontSize: 12.5, color: readOnly ? WP.muted : WP.text, outline: 'none', fontVariantNumeric: 'tabular-nums', background: readOnly ? '#f6f7f7' : '#fff', cursor: readOnly ? 'not-allowed' : 'text' };
  const sku = 'LC151-' + product.id.toUpperCase();
  const curLabel = product.badge ? (product.badge.tone === 'new' ? 'new' : product.badge.tone === 'graded' ? 'graded' : 'sale') : 'none';
  const setBadge = (val) => {
    if (readOnly) return;
    if (val === 'none') Store.update(product.id, 'badge', null);
    else if (val === 'new') Store.update(product.id, 'badge', { tone: 'new', label: 'Nouveau' });
    else if (val === 'graded') Store.update(product.id, 'badge', { tone: 'graded', label: product.badge && product.badge.tone === 'graded' ? product.badge.label : 'PSA 10' });
    else Store.update(product.id, 'badge', { tone: 'sale', label: 'Promo' });
    showToast('Étiquette modifiée');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '46px 1.9fr 0.8fr 1fr 1fr 0.9fr 0.5fr', gap: 12, padding: '12px 14px', borderBottom: '1px solid #f0f0f1', alignItems: 'center', background: stripe ? '#fbfbfc' : '#fff', fontSize: 13 }}>
      <input type="checkbox" style={{ accentColor: WP.blue }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <div style={{ width: 40, height: 40, flexShrink: 0, border: '1px solid ' + WP.border, borderRadius: 3, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 3 }}>
          {product.image ? <img src={product.image} alt="" style={{ maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontWeight: 800, fontSize: 12, color: WP.muted, fontFamily: WP.mono }}>151</span>}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: WP.blue, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name} {Store.isModified(product.id) && <span title="Modifié" style={{ color: WP.woo }}>●</span>}</div>
          <div style={{ fontSize: 11.5, color: WP.muted }}>{product.cat}</div>
        </div>
      </div>
      <span style={{ fontFamily: WP.mono, fontSize: 11.5, color: WP.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sku}</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <button onClick={() => { if (readOnly) return; Store.update(product.id, 'inStock', !product.inStock); }} disabled={readOnly} title={roHint}
          style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px', borderRadius: 3, border: '1px solid', borderColor: product.inStock ? WP.green : WP.red, background: readOnly ? '#f6f7f7' : '#fff', fontSize: 12, fontWeight: 600, color: product.inStock ? WP.green : WP.red, cursor: readOnly ? 'not-allowed' : 'pointer', opacity: readOnly ? 0.75 : 1 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: product.inStock ? WP.green : WP.red }}></span>{product.inStock ? 'En stock' : 'Rupture'}
        </button>
        {Store.isUnique(product.id) && (
          <span title="Carte unique — une seule édition disponible" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: WP.mono, fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: WP.woo, background: '#f3eefb', border: '1px solid ' + WP.woo, borderRadius: 3, padding: '2px 6px' }}>1 ex. · Édition unique</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <input style={inp} value={price} disabled={readOnly} title={roHint} onChange={(e) => setPrice(e.target.value)} onBlur={commitPrice} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
        <input style={{ ...inp, color: readOnly ? WP.muted : (old ? WP.red : WP.muted), fontSize: 11.5 }} value={old} placeholder="prix barré" disabled={readOnly} title={roHint} onChange={(e) => setOld(e.target.value)} onBlur={commitOld} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
      </div>
      <select value={curLabel} disabled={readOnly} title={roHint} onChange={(e) => setBadge(e.target.value)} style={{ padding: '6px 6px', border: '1px solid ' + WP.border, borderRadius: 3, fontSize: 12.5, color: readOnly ? WP.muted : WP.text, background: readOnly ? '#f6f7f7' : '#fff', cursor: readOnly ? 'not-allowed' : 'pointer', width: '100%', fontFamily: WP.font }}>
        <option value="none">— Aucune</option><option value="new">Nouveau</option><option value="sale">Promo</option><option value="graded">Gradée</option>
      </select>
      <div style={{ justifySelf: 'end' }}>
        {!readOnly && Store.isCustom(product.id)
          ? <button onClick={() => { if (confirm('Supprimer ce produit ?')) { Store.remove(product.id); showToast('Produit supprimé'); } }} title="Corbeille" style={{ color: WP.red, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>Corbeille</button>
          : <span title={roHint} style={{ color: WP.border, fontSize: 12 }}>—</span>}
      </div>
    </div>
  );
}

function WpAddModal({ Store, onClose, onDone }) {
  const [name, setName] = React.useState('');
  const [cat, setCat] = React.useState("Carte à l'unité");
  const [type, setType] = React.useState('single');
  const [price, setPrice] = React.useState('');
  const cats = [["Carte à l'unité", 'single'], ['Carte gradée', 'graded'], ['Coffret / scellé', 'sealed'], ['Accessoire', 'accessory']];

  const submit = () => { const n = parseFloat(price.replace(',', '.')); if (!name.trim() || isNaN(n)) return; Store.add({ name: name.trim(), cat, type, price: Math.round(n * 100) / 100 }); onDone(name.trim()); };

  const field = { width: '100%', padding: '8px 10px', border: '1px solid ' + WP.border, borderRadius: 3, fontSize: 14, color: WP.text, outline: 'none', fontFamily: WP.font };
  const lbl = { fontSize: 12.5, fontWeight: 600, color: WP.text, marginBottom: 6, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: WP.font }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}></div>
      <div style={{ position: 'relative', width: 'min(460px, 100%)', background: WP.white, border: '1px solid ' + WP.border, borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid ' + WP.border }}>
          <h3 style={{ fontSize: 17, fontWeight: 600 }}>Ajouter un produit</h3>
          <button onClick={onClose} style={{ fontSize: 18, color: WP.muted, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div><label style={lbl}>Nom du produit</label><input autoFocus style={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Ronflex Holo — Jungle" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={lbl}>Catégorie</label>
              <select style={field} value={cat} onChange={(e) => { const c = cats.find((x) => x[0] === e.target.value); setCat(c[0]); setType(c[1]); }}>
                {cats.map((c) => <option key={c[1]} value={c[0]}>{c[0]}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Prix (€)</label><input style={field} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" /></div>
          </div>
          <div style={{ background: '#f6f7f7', border: '1px solid ' + WP.border, borderLeft: '4px solid ' + WP.woo, borderRadius: 3, padding: '10px 12px', fontSize: 12.5, color: WP.muted }}>
            Le produit sera publié avec une image provisoire « 151 ». Vous pourrez ajouter la photo depuis la fiche produit WooCommerce.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 18px', borderTop: '1px solid ' + WP.border, background: '#f6f7f7' }}>
          <button onClick={onClose} style={{ fontFamily: WP.font, fontSize: 13, padding: '7px 14px', borderRadius: 3, border: '1px solid ' + WP.border, background: '#fff', color: WP.text, cursor: 'pointer' }}>Annuler</button>
          <button onClick={submit} disabled={!name.trim() || price === ''} style={{ fontFamily: WP.font, fontSize: 13, padding: '7px 16px', borderRadius: 3, border: '1px solid ' + WP.blue, background: (!name.trim() || price === '') ? '#7fb0d4' : WP.blue, color: '#fff', cursor: (!name.trim() || price === '') ? 'not-allowed' : 'pointer', fontWeight: 600 }}>Publier</button>
        </div>
      </div>
    </div>
  );
}

// ---- Barrière d'accès : mot de passe vérifié côté serveur (/api/admin-auth) ----
// Sans le bon mot de passe, l'interface d'administration n'est pas rendue.
function AdminGate() {
  const [authed, setAuthed] = React.useState(false);
  const [pwd, setPwd] = React.useState('');
  const [err, setErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    try {
      const t = sessionStorage.getItem('lc151_admin_token');
      if (t && Number(String(t).split('.')[0]) > Date.now()) setAuthed(true);
    } catch (e) {}
  }, []);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (busy) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/admin-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        try { sessionStorage.setItem('lc151_admin_token', j.token); } catch (e2) {}
        setAuthed(true);
      } else {
        setErr(r.status === 401 ? 'Mot de passe incorrect.' : (j.error || 'Connexion impossible.'));
      }
    } catch (e2) { setErr('Erreur réseau.'); }
    setBusy(false);
  };

  if (authed) return <AdminApp />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', background: '#f0f0f1' }}>
      <form onSubmit={submit} style={{ width: 'min(360px, 92%)', background: '#fff', border: '1px solid #dcdcde', borderRadius: 8, padding: '28px 26px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Espace gestion</h1>
        <p style={{ fontSize: 13, color: '#646970', margin: '0 0 18px' }}>Accès réservé. Saisissez le mot de passe.</p>
        <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoFocus placeholder="Mot de passe" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 4, border: '1px solid #8c8f94', fontSize: 14, marginBottom: 12 }} />
        {err && <div style={{ color: '#d63638', fontSize: 12.5, marginBottom: 10 }}>{err}</div>}
        <button type="submit" disabled={busy || !pwd} style={{ width: '100%', padding: '10px', borderRadius: 4, border: 'none', background: '#2271b1', color: '#fff', fontWeight: 600, fontSize: 14, cursor: busy ? 'wait' : 'pointer', opacity: (busy || !pwd) ? 0.7 : 1 }}>{busy ? 'Vérification…' : 'Entrer'}</button>
        <p style={{ fontSize: 11.5, color: '#8c8f94', margin: '14px 0 0', lineHeight: 1.5 }}>Pour une protection forte, active aussi la « Password Protection » de Vercel sur ce déploiement.</p>
      </form>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('admin-root')).render(<AdminGate />);
