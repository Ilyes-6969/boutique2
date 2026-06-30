// leclub151 — Renvoie la clé PUBLIABLE Stripe au site (pour le Payment Element)
// ---------------------------------------------------------------------------
// La clé publiable (pk_...) est, par nature, publique : aucun risque à l'exposer.
// On la sert depuis une variable d'environnement pour n'avoir AUCUNE clé en dur
// dans le code (une seule source de vérité, facile à basculer test ↔ live).
// Variable d'environnement Vercel : STRIPE_PUBLISHABLE_KEY = pk_test_... / pk_live_...
// ---------------------------------------------------------------------------

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' });
};
