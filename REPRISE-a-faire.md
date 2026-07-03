# À reprendre — leclub151 (mémo pour la prochaine session)

_État au 30/06/2026 : le paiement par carte INTÉGRÉ au site (Stripe Payment Element) est **fonctionnel et en ligne**, en mode **test**. L'argent ira sur Qonto une fois en réel._

---

## Ce qui marche déjà
- Parcours client complet : boutique → panier → commande → paiement carte **sur le site** → page « Merci » → « Mes commandes ».
- Stripe branché (clés **test** `sk_test_` / `pk_test_` dans Vercel), reversement prévu vers Qonto.
- Le code ne bouge plus : il reste juste des **réglages** et le passage en réel.

---

## 1. Reçus par e-mail (rapide, à activer quand tu veux)
- **Reçu au CLIENT** : Stripe → ⚙️ Paramètres → « E-mails clients » → activer **« Reçus de paiement réussis »**.
- **Notification à TOI** : créer une clé sur **web3forms.com** → la coller dans **`admin.html`** → bloc « Réception des commandes ».

## 2. Passage en RÉEL (à l'arrivée de la société, ~1 semaine)
1. **Activer** le compte Stripe (SIRET, infos société).
2. Dans Vercel → Environment Variables :
   - `STRIPE_SECRET_KEY` → remplacer par `sk_live_…`
   - `STRIPE_PUBLISHABLE_KEY` → remplacer par `pk_live_…`
3. Stripe → Paramètres → Comptes bancaires → mettre l'**IBAN Qonto** en versement.
4. **Redeploy** sur Vercel.
5. Test réel avec une vraie carte (petit montant) puis remboursement si besoin.

## 3. Finitions avant ouverture
- Pages légales (CGV, mentions légales, confidentialité) avec vraie adresse + infos société.
- Vraie adresse de la boutique (mentions + carte d'accueil).
- Logo `og:image` 1200×630 pour les partages WhatsApp/Facebook.
- Remplacer le **catalogue de démo** par les vrais produits (admin ou WooCommerce).
- (Optionnel) Stock partagé entre tous les visiteurs → via WooCommerce ou logiciel de caisse.

---

## Nouveau depuis le 01/07/2026 : build + sécurité paiement + SEO produits
- Le site a maintenant un **build** (`npm run build`, lancé automatiquement par Vercel) :
  plus de Babel dans le navigateur (pages bien plus rapides), une **page HTML par
  produit** dans `/produits/` (référençables par Google), `sitemap.xml` et `robots.txt`
  générés avec le vrai domaine.
- **Sécurité paiement** : le navigateur n'envoie plus que `{ id, quantité }` ; les prix
  viennent du serveur (`lib/serverCatalog.js` + `lib/catalog-demo.json`, régénéré depuis
  `data.js` à chaque build). Un panier manipulé est refusé. En mode RÉEL (`sk_live_`),
  les cartes de démo ne sont PAS achetables : il faudra brancher WooCommerce
  (variable d'env `WC_STORE_URL`) ou définir `ALLOW_DEMO_CHECKOUT=1` temporairement.
  Conséquence : un produit ajouté via admin.html (qui ne vit que dans TON navigateur)
  ne peut pas être commandé — le vrai catalogue doit passer par `data.js` ou WooCommerce.
- **À faire dans Stripe** : Développeurs → Webhooks → ajouter l'événement
  **`payment_intent.succeeded`** (sinon pas d'e-mail au propriétaire pour les paiements
  intégrés au site).
- Domaine du sitemap : variable d'env **`SITE_URL`** dans Vercel (sinon `https://leclub151.fr`).
- Test local : `npx serve dist -l 5151` puis `node smoke-test.mjs`.

## Backend opérationnel (03/07/2026) : le site est prêt pour WooCommerce
- **Proxy `/api/catalog`** : la boutique lit le catalogue via le serveur du site
  (plus de souci de CORS côté WordPress, prix/stock toujours frais).
- **Pagination partout** : build, serveur de prix et boutique lisent le catalogue
  WooCommerce par pages de 100 — plusieurs centaines de produits sans troncature.
  Et si WooCommerce est injoignable au moment d'un build, le déploiement **échoue
  franchement** au lieu de publier un site sans pages produit (Vercel garde alors
  la version précédente en ligne).
- **Création de commande WooCommerce par le webhook Stripe** : à chaque paiement,
  la commande est écrite dans WooCommerce → le **stock est décrémenté** pour tous
  les visiteurs et le **client reçoit l'e-mail de confirmation** WooCommerce.
- **Variables à créer dans Vercel** au branchement : `WC_STORE_URL` +
  **`WC_CONSUMER_KEY`** / **`WC_CONSUMER_SECRET`** (clé API REST Lecture/Écriture,
  générée dans wp-admin).
- **Le guide complet pour le propriétaire** (hébergement WordPress, création des
  produits et des catégories, clés, stock magasin/TPE Qonto, checklist de
  bascule) : **`GUIDE-WOOCOMMERCE.md`**.
- Admin local (`admin.html`) : une fois WooCommerce connecté, le panneau produits
  passe en **lecture seule** et renvoie vers wp-admin — les modifications locales
  ne changeaient que ton navigateur, jamais le site des visiteurs.

## Rappel technique utile
- Astuce si le site semble « pas à jour » après un push : Vercel/cache. Vérifier dans **Vercel → Deployments** que le **dernier commit** est bien déployé (Ready), sinon re-pousser un petit changement. Côté navigateur : **Ctrl + Maj + R**.
- Détails complets dans **`DEPLOIEMENT-PAIEMENT.md`**.
