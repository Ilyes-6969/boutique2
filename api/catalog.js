// leclub151 — Proxy catalogue public (le navigateur n'appelle JAMAIS WordPress)
// ---------------------------------------------------------------------------
// Le site charge son catalogue via GET /api/catalog : cette fonction relit le
// catalogue WooCommerce côté serveur (lib/serverCatalog — pagination, cache,
// mapping CONTRAT PRODUIT) et le renvoie au navigateur. Avantages :
//   - pas de CORS à ouvrir sur WordPress, URL du WordPress non diffusée ;
//   - cache CDN (s-maxage) : WordPress n'est pas martelé par les visiteurs ;
//   - mêmes ids « wp<ID> » et mêmes prix que le paiement (source de vérité unique).
//
// Réponses :
//   200 { ok:true, products:[...], currency:'EUR' }            (WooCommerce)
//   200 { ok:true, products:[], currency:'EUR', source:'none' } (WC_STORE_URL absent → le site garde sa démo)
//   503 { ok:false, error:'Boutique momentanément indisponible…' } (Woo injoignable, err.code='WC_DOWN')
//
// Variable d'environnement Vercel : WC_STORE_URL (optionnelle).
// ---------------------------------------------------------------------------

const { applyCors, rateLimit, listProducts } = require('../lib/serverCatalog');

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  // Rate-limit léger : le cache CDN absorbe le trafic normal, ceci ne bloque
  // que les rafales anormales d'une même IP.
  if (!rateLimit(req, 'catalog', 60, 5 * 60 * 1000)) {
    return res.status(429).json({ ok: false, error: 'Trop de requêtes — réessayez dans quelques minutes.' });
  }

  try {
    const products = await listProducts(); // null si WC_STORE_URL absent
    // Cache CDN : 60 s frais, puis 5 min de périmé servi pendant la revalidation.
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    if (products === null) {
      // Pas de WooCommerce configuré : le client garde sa logique de démonstration.
      return res.status(200).json({ ok: true, products: [], currency: 'EUR', source: 'none' });
    }
    return res.status(200).json({ ok: true, products: products, currency: 'EUR', source: 'woocommerce' });
  } catch (err) {
    if (err && err.code === 'WC_DOWN') {
      // CONTRAT ERREUR : jamais le message brut, un générique français.
      return res.status(503).json({ ok: false, error: 'Boutique momentanément indisponible, réessayez dans un instant.' });
    }
    console.error('catalog:', String((err && err.message) || err));
    return res.status(500).json({ ok: false, error: 'Boutique momentanément indisponible, réessayez dans un instant.' });
  }
};
