// CLUB 151 — Authentification de l'espace de gestion (/admin.html)
// ---------------------------------------------------------------------------
// Vérifie un mot de passe CÔTÉ SERVEUR (jamais dans le code public). Le mot de
// passe est stocké dans la variable d'environnement Vercel ADMIN_PASSWORD.
//
// ⚠️ Important : les écritures de l'admin (prix/stock) restent côté navigateur
// (localStorage / WooCommerce). Cette barrière empêche l'accès casual à
// l'interface ; pour une protection forte, active EN PLUS la « Password
// Protection » de Vercel sur le déploiement (Settings → Deployment Protection).
//
// Variable d'environnement Vercel : ADMIN_PASSWORD = ton-mot-de-passe
// ---------------------------------------------------------------------------

const crypto = require('crypto');
const { applyCors, rateLimit } = require('../lib/serverCatalog');

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Bucket dédié, volontairement strict : 5 requêtes / 15 min / IP (anti brute-force).
  if (!rateLimit(req, 'admin-auth', 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Trop de tentatives — réessayez plus tard.' });
  }

  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected) {
    return res.status(500).json({ error: "ADMIN_PASSWORD non défini (variable d'environnement Vercel)." });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const given = String(body.password || '');
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!ok) return res.status(401).json({ ok: false });

    // Jeton de session signé (HMAC) — simple marqueur d'accès, validité 12 h.
    const exp = Date.now() + 12 * 3600 * 1000;
    const sig = crypto.createHmac('sha256', expected).update('admin' + exp).digest('hex').slice(0, 32);
    return res.status(200).json({ ok: true, token: exp + '.' + sig });
  } catch (e) {
    return res.status(400).json({ error: String((e && e.message) || e) });
  }
};
