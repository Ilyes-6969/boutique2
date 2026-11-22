// CLUB 151 — Renvoie la clé PUBLIABLE Stripe au site (pour le Payment Element)
// ---------------------------------------------------------------------------
// La clé publiable (pk_...) est, par nature, publique : aucun risque à l'exposer.
// On la sert depuis une variable d'environnement pour n'avoir AUCUNE clé en dur
// dans le code (une seule source de vérité, facile à basculer test ↔ live).
// Variable d'environnement Vercel : STRIPE_PUBLISHABLE_KEY = pk_test_... / pk_live_...
// ---------------------------------------------------------------------------

const { applyCors, cardPaymentsClosed } = require('../lib/serverCatalog');

module.exports = function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  res.setHeader('Cache-Control', 'public, max-age=300');
  // cardOpen:false → le site n'affiche pas le formulaire de carte (clés de test
  // en production : voir cardPaymentsClosed dans lib/serverCatalog.js).
  return res.status(200).json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '', cardOpen: !cardPaymentsClosed() });
};
