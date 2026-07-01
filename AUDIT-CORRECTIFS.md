# leclub151 — Correctifs appliqués (audit du 30/06/2026)

Récapitulatif des corrections apportées suite à l'audit, et de ce qu'il reste à faire **toi-même** (infos que je ne peux pas inventer).

---

## ⚠️ À FAIRE AVANT DE REDÉPLOYER (sinon ça casse)

1. **Variable `ADMIN_PASSWORD` dans Vercel** (Settings → Environment Variables).
   L'admin (`/admin.html`) demande désormais un mot de passe vérifié côté serveur.
   **Sans cette variable, l'admin renvoie une erreur et devient inaccessible.**
2. **Remplir l'objet `COMPANY` en haut de `Legal.jsx`** (SIRET, adresse, raison
   sociale…). Tant qu'il est vide, les pages légales affichent des champs
   surlignés « à compléter » et le bandeau rouge. Une fois rempli : tout se
   remplit automatiquement et le bandeau disparaît.
3. **Vérifier `PROD_HOSTS` dans `data.js`** (≈ ligne 200) : il doit contenir ton
   vrai domaine. Sur ce domaine, les **produits de démo n'apparaissent plus**
   (normal) ; ils restent visibles en test (localhost / *.vercel.app).

---

## Variables d'environnement Vercel

| Variable | Rôle | Obligatoire |
|---|---|---|
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (`sk_test_…` / `sk_live_…`) | oui |
| `STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe | oui |
| `STRIPE_WEBHOOK_SECRET` | Signature du webhook | oui (webhook) |
| `ADMIN_PASSWORD` | Mot de passe de l'admin | **oui** |
| `WC_STORE_URL` | URL WooCommerce → vrais prix côté serveur | en réel |
| `ALLOWED_ORIGINS` | Domaines autorisés (CORS), séparés par `,` | non (défaut leclub151.fr) |
| `ALLOW_DEMO_CHECKOUT` | `1` pour autoriser l'achat des produits démo | non |
| `SITE_URL` | URL de secours pour le retour de paiement | non |

> En **mode test** (`sk_test_`), les produits de démo restent achetables pour tes
> essais. En **réel** (`sk_live_`) sans WooCommerce, plus rien n'est facturable
> tant que les vrais produits ne sont pas branchés — c'est voulu (sécurité).

---

## 🔴 Sécurité (corrigé)

- **Prix fixé par le serveur.** Le navigateur n'envoie plus que `{id, qty}`. Les
  prix et frais de port sont recalculés côté serveur (`lib/serverCatalog.js`).
  → impossible de payer un article à un prix choisi par le client.
- **Statut « payé » vérifié auprès de Stripe** (`api/payment-status.js` +
  `merci.html`). On ne se fie plus à l'URL ni au localStorage. Le montant affiché
  est celui confirmé par Stripe.
- **Admin protégé par mot de passe** (`api/admin-auth.js` + `Admin.jsx`),
  comparaison à temps constant. *Recommandé en plus :* activer la
  « Password Protection » de Vercel sur le déploiement.
- **Pièces uniques** bornées à 1 exemplaire côté serveur ; **ids inconnus**
  refusés.
- **CORS restreint** au domaine du site (fini le `*`) + **clé d'idempotence**
  sur la création de paiement.

## 🟠 Avant lancement (corrigé / cadré)

- **Produits démo** masqués sur le vrai domaine (`data.js`) et non facturables en
  réel (filet serveur).
- **Pages légales** : infos centralisées dans `COMPANY` (Legal.jsx) ; livraison,
  prestataire Stripe, conservation 10 ans, rétractation 14 j déjà renseignés.
  Reste : tes infos société.

## 🟢 Performance & SEO (corrigé)

- `hero-cards.png` (1,86 Mo) → **`hero-cards.webp` (230 Ko)**, −1,6 Mo.
- `loading="lazy"` + `decoding="async"` sur les cartes catalogue.
- **Cache** des assets + en-têtes de sécurité (`vercel.json`).
- **Domaine** corrigé dans `sitemap.xml` / `robots.txt` (fini `VOTRE-DOMAINE`).
- **Fiches produit** : `title`, méta, `canonical` et **JSON-LD Product/Offer**
  dynamiques (fin du duplicate content).
- **`og:image`** (image de partage 1200×630 générée) + `canonical` sur les pages.
- **preconnect** aux CDN. Chemins `../../` fragiles assainis.
- Contraste du gris `--muted` mis aux normes (AA). Fichiers morts supprimés
  (`storefront.css`, `reveal.js`).

---

## Reste à faire (chantiers non traités ici)

- **Build réel** (supprimer la compilation Babel dans le navigateur) — gros gain
  perf + SEO. Chantier à part.
- **Traduction réelle** des 6 langues (aujourd'hui seul l'habillage est traduit).
- **Commandes stockées côté serveur** (aujourd'hui localStorage).
- **Accessibilité** : labels `htmlFor`, navigation clavier des méga-menus, focus
  des modales.
- **Réconciliation du montant dans le webhook** (moins critique maintenant que le
  prix est fixé côté serveur).
