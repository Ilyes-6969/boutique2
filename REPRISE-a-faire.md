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

**Finitions (22/11, 12 h 30)**
- Noms d'articles : 47 fautes corrigées À L'AFFICHAGE (`lib/noms-affiches.json`), « Pokémon » toujours
  avec son accent. La caisse et WooCommerce gardent leurs noms : à corriger aussi à la source.
- CGV : la clause de médiation ne montre plus de trou surligné ; le NOM du médiateur reste à ajouter
  (`COMPANY.mediator` dans `Legal.jsx`), c'est une obligation légale.
- Choix de langue masqué (`SWITCH_ON` dans `i18n.js`) : seuls le menu et le pied de page étaient traduits.
- Mesure d'audience Vercel éteinte (`ANALYTICS_ON` dans `data.js`) : elle n'est pas activée chez Vercel
  et chaque page demandait un script introuvable.
- Stripe : compte en mode production mais paiements « Suspendu » (vérification en cours chez Stripe).
  Webhooks créés : `club151-site` (réel) et `club151-site-test` (test). Les trois valeurs restent à
  coller dans Vercel une fois le compte validé.

**Contrôle du backend avant mise en ligne (22/11, 13 h)**
- Vérifié sur le site en ligne : montants de paiement (2,99 € → 7,89 € ; 319,99 € → 292,89 €), refus sans
  e-mail, quantité plafonnée au stock, article inconnu refusé, prix envoyé par le navigateur ignoré.
- Vérifié sur le vrai WooCommerce : une ligne de remise négative est acceptée, et une commande créée
  « En attente » envoie « Nouvelle commande » à la boutique et « Commande en attente » au client.
- Corrigé : deux achats identiques du même client dans la journée étaient impossibles (clé
  d'idempotence Stripe partagée). Le numéro LC151-… suit maintenant la commande carte jusqu'à Stripe
  et WooCommerce (`_lc151_ref`).
- Retraits : statut « En attente » (stock réservé, e-mails natifs WooCommerce). ANNULER la commande
  dans WooCommerce si le client ne vient pas : le stock revient tout seul.
- `WEB3FORMS_KEY` est ABSENTE dans Vercel : contact et arrivages passent désormais par une commande
  technique WooCommerce « MESSAGES DU SITE / LC151-BOITE » (ne pas la supprimer).
- Stock corrigé à la main dans WooCommerce sur indication de la boutique : ETB Destinées Radieuses 1,
  ETB Nuit Noire 2, Display Règne Delta 4. À corriger aussi dans la caisse, sinon le prochain import
  remettra les anciennes quantités.

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

## Contrôle anti-fraude — 22/11/2026 (13 h)

Vérifié en ligne : prix envoyé par le navigateur ignoré, quantité négative ou décimale ramenée à 1, mode de livraison inconnu facturé au tarif standard, article inconnu refusé, commandes « payées » créées uniquement par le webhook Stripe signé, suivi de commande = numéro + e-mail, comptes par cookie signé. Côté WooCommerce : aucun moyen de paiement actif (personne ne peut commander en passant directement par gestion.club151.fr), aucun code promo, inscription fermée.

Corrigé dans ce lot :
- **Carte en mode test** : avec les clés Stripe de test, un numéro de carte de test (4242…) suffisait à obtenir l'écran « commande confirmée » sans rien payer. Tant que `STRIPE_SECRET_KEY` commence par `sk_test_` en production, le paiement par carte est fermé (`cardPaymentsClosed`, `/api/stripe-public` renvoie `cardOpen:false`) et le site propose le retrait. Il s'ouvre tout seul dès que les clés réelles sont dans Vercel.
- **Même article sur plusieurs lignes** : contournait le plafond de stock (3 exemplaires acceptés pour 1 en stock). Les lignes sont regroupées avant contrôle.
- **Nom et téléphone** : réduits aux caractères d'un nom / d'un numéro, pour qu'une confirmation de retrait ne puisse pas servir à envoyer un lien à l'adresse d'un tiers.
- **Réservations sans paiement** (lib/vitrine.json) : 20 articles maximum par réservation, 3 réservations en attente maximum par adresse e-mail, et au-delà de 15 réservations en une heure les commandes sont enregistrées sans retirer le stock (la boutique reçoit un message).
- Webhook : un événement Stripe du mode test est ignoré en production.

Ce que le code ne peut pas faire à la place du comptoir :
- Ne remettre un article que sur la foi de WooCommerce : « En cours » = payé par carte ; « En attente » = à encaisser au comptoir. Jamais sur un e-mail ou une capture d'écran.
- La remise de 10 % vaut pour un achat réel de 250 € ou plus : si le client ne prend qu'une partie de sa réservation, recalculer.
- Annuler les réservations non retirées (le stock revient tout seul).

## Aucune réservation, aucune reprise — décision de la boutique, 22/11/2026 (13 h 15)

- **Aucune réservation sur le site.** Une commande n'existe que si elle est payée en ligne par carte, en livraison comme en retrait en boutique. `lib/vitrine.json` → `reservationSansPaiement: false` (le serveur refuse l'ancien retrait sans paiement, HTTP 403) et `data.js` → `PICKUP_UNPAID = false` (le site ne le propose plus). Le retrait payé en ligne passe par Stripe et le webhook, comme une livraison ; le nom et le téléphone du client suivent dans les métadonnées (`cname`, `cphone`).
- **Conséquence tant que Stripe n'est pas ouvert** (clés de test dans Vercel) : personne ne peut commander. La fenêtre de commande affiche « La commande en ligne ouvre très bientôt » avec l'adresse, les horaires et le téléphone du magasin. Tout s'ouvre seul dès que les clés réelles sont dans Vercel.
- **Aucune reprise ni échange.** CGV article 6 et FAQ réécrits ; la mention « Retours sous 14 jours » a disparu de la fenêtre de commande. Pour les commandes payées EN LIGNE, le Code de la consommation impose un délai de rétractation de 14 jours qu'un vendeur ne peut pas supprimer : les CGV le limitent au strict minimum légal (article scellé et intact, frais de renvoi au client, dépréciation déduite pour un produit ouvert). **À faire valider par un juriste ou l'expert-comptable.**
- Les garde-fous des réservations (20 articles, 3 par e-mail, 15 par heure) restent dans le code mais ne servent plus tant que la réservation est fermée.

## Finitions du 22/11/2026 (soir)

- Page 404 refaite aux couleurs du site (blanc, traits fins, logo), liens en chemins absolus.
- CGV article 6 : modèle de formulaire de rétractation ajouté (information obligatoire en vente à distance).
- Message du serveur quand la carte est fermée : ne parle plus de régler sur place.
- Contrôle complet : 15 pages × bureau et mobile, aucune erreur JavaScript, aucun lien interne cassé, aucun débordement, 96 tests.

**Blocage Stripe constaté le 22/11 à 19 h** — statut « Suspendu », tâche « justificatif de l'activité de l'entreprise » en retard : le document envoyé (un fichier nommé identity_document) a été refusé car « les informations du compte ne correspondent pas ». Dans Stripe, la dénomination sociale et le nom commercial sont saisis « SAS » (c'est la forme juridique, pas le nom). À faire par la boutique : mettre la dénomination exacte du Kbis, vérifier que la personne déclarée dirigeant est bien celle du Kbis, puis charger le Kbis (ou l'avis de situation SIRENE) comme justificatif.

## Vérification complète en ligne — 22/11/2026, 19 h 45 à 20 h

Contrôlé sur club151.fr (pas en aperçu) : les 255 adresses du plan du site répondent, avec leur adresse canonique et leur description ; 18 pages ouvertes une à une sur ordinateur et sur mobile, sans débordement ni texte cassé ; 194 images de produits chargées, aucune cassée ; recherche, filtres par rayon et par jeu (22 accessoires, 61 figurines et goodies, 123 Pokémon) ; ajout au panier, quantité plafonnée au stock, remise de 10 % (700 € → 630 €) ; fenêtre de commande fermée proprement ; formulaire « Nous contacter » envoyé depuis la page et retrouvé dans WooCommerce ; suivi de commande ; connexion et création de compte (refus corrects, pont WordPress joignable) ; mode sombre ; page 404 ; en-têtes de sécurité. WooCommerce : 720 produits publiés, aucun sans prix, aucun stock négatif ou incohérent, aucune référence manquante ou en double.

Corrigé à cette occasion : le bandeau cookies et la page confidentialité annonçaient une mesure d'audience qui n'est pas active. Le site ne dépose que des cookies nécessaires : le bandeau devient une simple information (« J'ai compris »). Interrupteur unique `window.LC_ANALYTICS_ON` dans data.js.

Non vérifiable par Claude : l'arrivée réelle des e-mails dans la boîte (seul WooCommerce confirme l'envoi), un vrai paiement par carte (Stripe suspendu), une connexion réussie à un compte client (il faudrait un mot de passe). 19 noms de produits en double viennent de la caisse.
