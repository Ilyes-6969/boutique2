# À reprendre — CLUB 151 (mémo pour la prochaine session)

## Mise en service — état au 22/11/2026

**Fait dans le code**
- Aucune commande sans e-mail valide : refus côté site ET côté serveur (carte et retrait).
- Confirmation au client : carte → e-mail WooCommerce « commande en cours » + reçu Stripe ;
  retrait → note client WooCommerce envoyée par e-mail (`lib/wooCustomers.js`, `sendPickupConfirmation`).
  Le courrier part du WordPress (o2switch), aucun service d'envoi en plus.
- Retrait : l'adresse postale n'est plus demandée. `lib/vitrine.json` → `retraitReserveLeStock`
  (false = le stock ne bouge pas tant que la boutique ne valide pas ; true = réservé dès la commande).
- Sécurité : l'API n'accepte que les pages du site (plus tout `*.vercel.app`), 3 commandes
  retrait par heure et par adresse, réponses client jamais en cache, React vérifié par
  empreinte (SRI), en-têtes renforcés (`vercel.json`), admin et API hors moteurs de recherche.
- Sitemap et liens canoniques : toujours `https://club151.fr` en production (ils pointaient
  vers `boutique2-lac.vercel.app`).
- Formulaire de commande sur mobile : les champs ne débordent plus de l'écran.

**À faire par la boutique pour encaisser en réel (Vercel → Settings → Environment Variables, Production)**
1. `STRIPE_SECRET_KEY` = clé secrète réelle (`sk_live_…`).
2. `STRIPE_PUBLISHABLE_KEY` = clé publique réelle (`pk_live_…`).
3. `STRIPE_WEBHOOK_SECRET` = secret du webhook réel (`whsec_…`). **Absent aujourd'hui** :
   `/api/stripe-webhook` répond 500, donc un paiement ne crée ni commande ni alerte.
   Stripe (mode réel) → Développeurs → Webhooks → ajouter `https://club151.fr/api/stripe-webhook`,
   événement `payment_intent.succeeded`.
4. Redéployer (Deployments → Redeploy), puis une vraie commande de test à petit prix.
- `ADMIN_PASSWORD` est absent aussi : la page `/admin.html` reste fermée tant qu'il n'est pas défini.

**Ajouts du 22/11 (midi)**
- Habillage de Noël TEMPORAIRE : guirlande sous l'en-tête, phrase du bandeau, rangée
  « Idées cadeaux de Noël » sur l'accueil. Dates dans `data.js` (`SEASONS`) : du 22/11 au
  26/12/2026 inclus, puis tout disparaît sans rien toucher. Arrêter plus tôt : avancer `until`.
- `SITE_URL` vaut encore `https://boutique2-lac.vercel.app` dans Vercel : le build l'ignore
  désormais en production (sitemap et fiches sur club151.fr). À corriger ou supprimer dans Vercel.
- gestion.club151.fr : déjà en mode « Bientôt disponible » pour les visiteurs ; ajouté
  « ne pas indexer ce site » (Réglages → Lecture). Le catalogue du site n'est pas touché.

**Tarifs (22/11, midi)**
- Plus AUCUNE livraison offerte : 4,90 € pour toute commande expédiée, retrait en boutique gratuit.
- Remise automatique de 10 % sur les articles dès 250 € d'articles (livraison et retrait).
  Réglage : `DISCOUNT` dans `lib/serverCatalog.js` (serveur, fait foi) ET `data.js` (affichage) —
  changer les deux. La remise est portée sur la commande WooCommerce (ligne de frais négative).
- Corrigé : le panier ouvert directement pouvait rester à « 0,00 € » (abonnement au catalogue).

**À décider / vérifier**
- Expéditeur des e-mails WooCommerce : aujourd'hui `boutiqueclub151@gmail.com` (risque de spam,
  le courrier ne part pas de Gmail). Le domaine club151.fr autorise déjà le serveur (SPF o2switch).
- La boîte `contact@club151.fr`, affichée sur le site, doit exister chez o2switch.
- Médiateur de la consommation à ajouter aux CGV.

## Point du 21/11/2026 — site aligné sur la vraie boutique

**Fait dans le code**
- Vraies coordonnées partout, depuis une source unique (`data.js` → `LC151.SHOP`) :
  28 rue Juiverie, horaires de la fiche Google (mar–sam 10h–19h, dim 14h–18h),
  téléphone, Instagram, carte centrée sur la boutique, fiche Google `Store` (JSON-LD)
  générée au build.
- Pages légales remplies avec les données du registre (SAS Club151, SIRET
  108 168 311 00018, RCS Vienne, TVA FR78 108168311, capital 1 010 €, président).
- Le site ne se présente plus comme « boutique Pokémon » seule : TCG, mangas,
  objets de collection, rachat, tournois. Restes de l'ancienne marque
  (« leclub151 ») et messages « ouvre bientôt » supprimés.
- Catalogue multi-jeux : champ `game` lu dans les catégories/étiquettes Woo, pages
  Lorcana / One Piece / Magic / Yu-Gi-Oh! alimentées automatiquement, nouveau rayon
  « Mangas & collection » (voir `GUIDE-WOOCOMMERCE.md`, étape 2).

**Constaté en ligne**
- WooCommerce est branché (`gestion.club151.fr`) mais **0 produit publié** : la
  boutique en ligne est vide tant que le fichier d'import n'est pas chargé dans wp-admin.

**Catalogue : import de la caisse prêt (21/11/2026, soir)**
- Export Rezomatic du 21/11 converti : 1 296 articles → 720 en ligne, 576 brouillons
  (484 ruptures, 53 stocks négatifs, 39 à vérifier). Script : `outils/import-rezomatic/`,
  mode d'emploi : `GUIDE-WOOCOMMERCE.md`, étape 2 bis.
- ORDRE À RESPECTER : déployer cette version du site AVANT d'importer. L'ancienne
  version en ligne ne connaît pas le rayon « Mangas & collection » : peluches et
  figurines y apparaîtraient comme des « cartes à l'unité ».
- La fiche produit n'affirme plus rien qu'on ne sait pas : fini le « Near Mint »
  automatique sur toutes les cartes et le « Neuf » sur tous les accessoires.
- Corrigé au passage : « Toute la boutique » ne montrait que les produits étiquetés
  Pokémon (boutique.html forçait `game = 'pokemon'`).

**Refonte (21/11/2026, soir) — étape 1 faite dans le code**
- Bandeau d'annonce en haut, logo complet dans l'en-tête.
- Menu PAR JEU (Pokémon, One Piece, Lorcana, Magic, Yu-Gi-Oh!, Autres TCG), sous-menus
  générés depuis le catalogue réel (rayons en ligne + nombre de produits). Autres TCG
  reconnus : Riftbound, Naruto, Dragon Ball, Kayou, Rise.
- Nouvel accueil : grande bannière « magasin » (prête pour les photos : `LC151.SHOP.photos`
  dans `data.js`), raccourcis magasin / tournois / Instagram, univers avec compteurs,
  rangées de produits réels, bloc évènements, magasin, newsletter.
- Vignettes sans photo : pictogramme neutre par rayon (les cartes gardent la tuile « 151 »).
- HABILLAGE « TRAIT FIN » (demande d'Ilyes : des lignes fines, moins « IA ») : page blanche,
  structure au trait d'un pixel, angles nets, plus d'ombres ni d'effets au défilement ;
  titres en Poppins léger, plus de police « machine à écrire » ni de petites capitales ;
  produits en grille « pochettes » (traits partagés, comme une page de classeur).
  Jetons dans `tokens/*.css`, grilles et filet dans le dernier bloc de `storefront2.css`.
  Repris à la main : en-tête, menu, accueil, carte produit, catalogue, haut de fiche produit,
  pied de page. Le reste (panier, commande, fenêtres, pages légales) suit via les jetons.
- RESTE POUR L'ÉTAPE 2 : les photos du magasin (bannière + ambiance du site), puis
  l'habillage général (couleurs, matières) calé sur le lieu.

**Il manque encore (à fournir par toi)**
- Le **médiateur de la consommation** (nom + site) → `COMPANY.mediator` dans
  `Legal.jsx`. Obligatoire avant la première vente en ligne ; la CGV l'affiche
  surligné tant qu'il est vide.
- Des **photos de la boutique** (façade, intérieur) : aucune n'est sur le site.
- Confirmer que la boîte **contact@club151.fr** existe et est relevée.

---

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
- Domaine du sitemap : variable d'env **`SITE_URL`** dans Vercel (sinon `https://club151.fr`).
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

## État du lien WordPress ↔ site (contrôlé de l'extérieur le 21/11/2026, 20h55)
- **Catalogue : relié.** `club151.fr/api/catalog` renvoie les **720 articles publiés**
  de `gestion.club151.fr` (7 pages de 100 + 20). Prix identiques à la caisse sur
  3 articles contrôlés (2,99 / 3,99 / 5,99 €).
- **Clés WooCommerce : présentes dans Vercel** (`/api/orders/mine` répond
  `loggedIn:false` au lieu du 503 « pas encore activé »), `SESSION_SECRET` aussi.
  Le module `lc151/v1` (mu-plugin) est installé sur le WordPress.
- **Non prouvé de l'extérieur :** que la clé a bien le droit d'écriture. Seul un
  achat de test le montre (commande dans WooCommerce → Commandes, stock −1), puis
  passer la commande en « Annulée » pour rendre le stock.
- **Stripe : encore en mode test** (`pk_test_`) → aucun paiement réel possible.
- **Site construit avant l'import :** `sitemap.xml` = 11 pages, 0 fiche produit.
  Un redéploiement génère les fiches. La version en ligne (ancienne) range les 61
  peluches / figurines / goodies avec les cartes à l'unité et n'a pas les menus
  par jeu : c'est la nouvelle version (non poussée, accès GitHub refusé) qui corrige.

## Vitrine du site et photos (21/11/2026, soir)
- **Ce que le site montre** se règle dans **`lib/vitrine.json`**, sans toucher à
  WooCommerce ni à la caisse : `prixMinCartes` (300 → les cartes moins chères ne
  sont ni affichées ni achetables), `masquer` (codes article retirés un par un ;
  « Display Bundle 2.5 » y est : ce produit n'existe pas), `seulement` (si la
  liste est remplie, le site ne montre QUE ces codes article).
- **Photos produits** : `assets/produits/<code article>.webp`, utilisées quand
  l'article n'a pas d'image dans WooCommerce. Après ajout ou remplacement :
  `node outils/photos/manifeste.mjs`. 22 photos fournies par la boutique.
- Plus aucune mention « dernier exemplaire », « plus que N » ou « pièce unique »
  sur les cartes produit, la fiche et le panier (demande de la boutique).
- **Mise en ligne** : Claude n'a pas accès au dépôt (compte GitHub relié =
  `ilyesbnc`, dépôt sur `Ilyes-6969`). Les commits passent par le dossier
  `boutique` du PC, puis **Push origin** dans GitHub Desktop.

## Rappel technique utile
- Astuce si le site semble « pas à jour » après un push : Vercel/cache. Vérifier dans **Vercel → Deployments** que le **dernier commit** est bien déployé (Ready), sinon re-pousser un petit changement. Côté navigateur : **Ctrl + Maj + R**.
- Détails complets dans **`DEPLOIEMENT-PAIEMENT.md`**.
