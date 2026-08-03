# Brancher le vrai catalogue (WooCommerce) — guide pas à pas

_Ce guide t'accompagne du « site de démo » au « vrai magasin en ligne » : tes produits, ton stock partagé entre le magasin et le site, les commandes qui décomptent le stock toutes seules. Aucune compétence technique requise — chaque étape est un écran à remplir. Compte une demi-journée pour tout faire tranquillement (hors création des fiches produits)._

**Le principe en une phrase :** WordPress + WooCommerce devient ton « arrière-boutique » (produits, prix, stock), et le site CLUB 151 reste ta vitrine — il lit le catalogue tout seul.

---

## ÉTAPE 1 — Héberger WordPress et installer WooCommerce

WordPress a besoin d'un hébergement (un petit serveur loué au mois). Recommandation :

| Hébergeur | Prix | Pourquoi |
|---|---|---|
| **o2switch** (recommandé) | ~5–7 €/mois | Français, support en français, WordPress pré-installable en 1 clic, tout illimité |
| Hostinger | ~3–8 €/mois | Moins cher, interface simple |
| OVH | ~4–8 €/mois | Français, très répandu |

1. Prends l'offre de base (largement suffisante pour quelques centaines de produits).
2. Utilise l'installation **WordPress en 1 clic** proposée par l'hébergeur. Note bien l'adresse de ton WordPress (ex. `https://gestion.club151.fr` ou `https://CLUB 151-gestion.fr`) : c'est elle qu'on appellera **l'adresse WordPress** dans tout le guide.
3. Connecte-toi à **wp-admin** (l'adresse WordPress + `/wp-admin`).
4. **Extensions → Ajouter → cherche « WooCommerce » → Installer → Activer.**
5. Laisse-toi guider par l'assistant WooCommerce : adresse de la boutique, **euros**, **France**, TVA selon ta situation (à valider avec le comptable). Tu peux ignorer les propositions de thème/paiement WooCommerce : **le paiement reste sur le site CLUB 151 via Stripe**, WordPress ne sert qu'à gérer le catalogue.

---

## ÉTAPE 2 — Créer tes produits (IMPORTANT : la nomenclature des catégories)

Dans wp-admin : **Produits → Ajouter**.

Pour chaque produit : le **nom**, le **prix TTC** (champ « Tarif »), une **photo** (bien éclairée, fond neutre), et une courte **description**.

### Les catégories : la règle à respecter absolument

Le site range automatiquement tes produits dans les bons rayons **en lisant le nom de leurs catégories**. Il cherche des mots-clés précis — si le mot-clé n'y est pas, le produit atterrit dans « Cartes à l'unité » par défaut.

| Rayon sur le site | Le nom de la catégorie doit contenir l'un de ces mots |
|---|---|
| **Cartes gradées** | `gradée`, `PSA`, `BGS`, `CGC` |
| **Scellé** | `scellé`, `display`, `booster`, `coffret`, `ETB`, `box`, `boîte` |
| **Accessoires** | `accessoire`, `sleeve`, `protège`, `classeur`, `toploader`, `tapis`, `deck box` |
| **Cartes à l'unité** | tout le reste (aucun mot-clé requis) |

Exemples de catégories qui marchent : « Cartes gradées PSA », « Scellé — Displays », « Accessoires », « Cartes à l'unité ».

**Précommandes :** ajoute au produit une catégorie **ou** une étiquette contenant le mot « **Précommande** » — le site l'affichera dans le rayon Précommandes avec le bon libellé.

### Le stock : à activer sur CHAQUE produit

Dans la fiche produit, onglet **Inventaire** :

1. Coche **« Gérer le stock ? »** et saisis la **quantité** réellement en rayon.
2. Pour chaque **pièce unique** (carte gradée, exemplaire 1/1) : coche aussi **« Vendu individuellement »** — le site empêchera alors d'en mettre deux dans un panier.

> C'est ce réglage qui fait tout le « stock partagé » : chaque commande sur le site décrémente cette quantité, et tu la décrémentes toi-même après une vente en magasin (étape 6).

---

## ÉTAPE 3 — Créer les clés API (pour que le site enregistre les commandes)

Le site a besoin d'une « clé » pour écrire les commandes dans WooCommerce (et donc décrémenter ton stock automatiquement).

1. wp-admin → **WooCommerce → Réglages → Avancé → API REST** → **Ajouter une clé**.
2. Description : `site CLUB 151`. Utilisateur : toi. Autorisations : **Lecture/Écriture**.
3. Clique **Générer une clé API**. WooCommerce affiche une **Consumer key** (`ck_…`) et un **Consumer secret** (`cs_…`).
4. **Copie-les tout de suite dans un endroit sûr** (le secret n'est montré qu'une seule fois). C'est tout — ne les colle jamais ailleurs que dans Vercel (étape 4).

---

## ÉTAPE 4 — Renseigner les variables dans Vercel

Vercel : ton projet → **Settings → Environment Variables**. Le tableau COMPLET (les 3 premières sont les nouvelles) :

| Nom | Valeur | À quoi ça sert |
|---|---|---|
| `WC_STORE_URL` | l'adresse WordPress (ex. `https://gestion.club151.fr`) | Le site lit ton catalogue (prix, stock, photos) |
| `WC_CONSUMER_KEY` | `ck_…` (étape 3) | Créer les commandes dans WooCommerce → stock décrémenté |
| `WC_CONSUMER_SECRET` | `cs_…` (étape 3) | Va avec la clé ci-dessus |
| `STRIPE_SECRET_KEY` | `sk_test_…` puis `sk_live_…` | Encaisser les paiements |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_…` puis `pk_live_…` | Le formulaire de carte sur le site |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | **Obligatoire** — confirme les paiements de façon fiable |
| `WEB3FORMS_KEY` | ta clé web3forms.com | E-mail de notification à TOI à chaque commande |
| `ALLOWED_ORIGINS` | `https://club151.fr,https://www.club151.fr` | Sécurité : seuls tes domaines peuvent appeler le paiement |
| `ADMIN_PASSWORD` | un mot de passe fort | Protège la page admin du site |
| `SITE_URL` | `https://club151.fr` | Domaine de confiance : liens de connexion, redirections Stripe, SEO |
| `SESSION_SECRET` | une longue chaîne aléatoire | Signe les comptes clients (voir ci-dessous) |
| `RESEND_API_KEY` | `re_…` (resend.com) | Envoie les liens de connexion aux clients |
| `MAIL_FROM` | `CLUB 151 <bonjour@club151.fr>` | Expéditeur de ces e-mails |

Génère `SESSION_SECRET` avec cette commande (dans n'importe quel terminal où Node est installé) :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

⚠️ **Resend exige de vérifier ton domaine** (enregistrements DNS chez ton
registrar). Sans ça, les liens de connexion partent en spam — ou pas du tout.
C'est l'étape la plus facile à oublier. Détail complet dans
**`BACKEND-COMPTES.md`**.

Coche **Production** (et Preview si tu veux tester avant). Puis **redéploie** le site (Deployments → ⋯ → Redeploy) pour que tout s'applique.

---

## ÉTAPE 5 — Régénérer les pages produit quand le catalogue change

Le site fabrique **une page Google par produit** au moment du déploiement. Quand tu ajoutes ou modifies des produits dans WooCommerce, il faut donc relancer un déploiement pour que Google voie les nouveautés (la boutique elle-même, prix et stock, est à jour en continu — seules les pages « fiche produit » SEO sont figées au build).

**Le plus simple : un Deploy Hook.**

1. Vercel → ton projet → **Settings → Git → Deploy Hooks** → crée un hook nommé `catalogue` (branche `main`).
2. Vercel te donne une **URL secrète**. Garde-la en favori.
3. Après une session d'ajout/modification de produits, **ouvre cette URL dans ton navigateur** (ou clique le favori) : le site se reconstruit en ~1 minute avec les nouvelles pages.

**Option avancée (automatique) :** wp-admin → WooCommerce → Réglages → Avancé → **Webhooks** → Ajouter : sujet « **Produit mis à jour** », URL de livraison = l'URL du Deploy Hook. Chaque modification de produit relancera un build tout seul. À utiliser avec modération : chaque déclenchement = un build Vercel (si tu modifies 50 produits d'affilée, préfère le clic manuel à la fin).

---

## Si le déploiement échoue sur « WooCommerce injoignable »

Le build fabrique une page Google par produit. S'il n'arrive pas à lire ton
catalogue, il **s'arrête volontairement** plutôt que de publier un site sans
aucune fiche — Vercel garde alors la version précédente, ton site reste en ligne.

Pourquoi cette sévérité : un build interrompu se voit et se relance. Un sitemap
vidé de ses produits, lui, ne se remarque que des semaines plus tard, quand
Google a déjà désindexé les fiches.

**Cause la plus fréquente :** ton hébergeur mutualisé refuse les connexions
venant des serveurs de build (protection anti-robots). Le site, lui, continue de
fonctionner : il lit le catalogue en direct depuis les fonctions serveur, qui
partent d'adresses différentes.

**Que faire, dans l'ordre :**

1. Relance simplement le déploiement — le build réessaie 3 fois, le blocage est
   souvent passager
2. Si ça persiste, appelle le support de ton hébergeur : demande-lui pourquoi
   son serveur refuse les connexions HTTPS venant de l'extérieur vers
   `gestion.club151.fr`
3. **En dernier recours et temporairement**, ajoute dans Vercel la variable
   `ALLOW_BUILD_WITHOUT_CATALOG` = `1`. Le build passera, mais **aucune page
   produit ne sera générée** et le sitemap ne listera aucun produit. À retirer
   dès que l'hébergeur a corrigé.

---

## ÉTAPE 6 — Les ventes en MAGASIN (TPE Qonto)

Ton TPE Qonto encaisse très bien, mais **il n'est relié à rien** : quand tu vends une carte au comptoir, le site ne le sait pas et croit qu'elle est encore disponible.

**La règle d'or : après chaque vente encaissée au TPE, décrémente le stock dans WooCommerce.** Deux façons :

- **L'app mobile WooCommerce** (gratuite, iOS/Android) : connecte-la à ton WordPress une fois, ensuite c'est 10 secondes — produit → stock → −1.
- Ou wp-admin sur l'ordinateur du magasin : Produits → modification rapide → quantité.

> ⚠️ **Encadré légal — caisse certifiée (NF525) :** en France, un commerce assujetti à la TVA qui encaisse des clients particuliers avec un logiciel de caisse doit utiliser un logiciel **certifié NF525**. Le TPE seul + WooCommerce n'est pas un logiciel de caisse ; ta situation exacte (franchise de TVA ou non, tenue de caisse manuelle…) est **à valider avec le comptable**.
>
> À terme, si le volume magasin grossit : **Hiboutik** (logiciel de caisse français, certifié NF525, à partir de gratuit) se synchronise avec WooCommerce — la vente au comptoir décrémenterait alors le stock automatiquement.

---

## ÉTAPE 7 — Les e-mails

Trois e-mails différents, trois réglages :

1. **Confirmation de commande au client** : envoyée automatiquement par WooCommerce dès que le site y enregistre la commande. Personnalise-la dans wp-admin → **WooCommerce → Réglages → E-mails** (logo, couleur, adresse d'expéditeur).
2. **Reçu de paiement au client** : Stripe → **Paramètres → E-mails clients** → coche **« Reçus de paiement réussis »**.
3. **Notification à TOI** : déjà en place via le webhook Stripe + ta clé Web3Forms (variable `WEB3FORMS_KEY`) — un e-mail à chaque paiement.

**Newsletter** (plus tard) : **Brevo** (français, gratuit jusqu'à 300 e-mails/jour) est le bon choix pour annoncer les nouveautés et les sorties. À brancher quand la boutique tourne.

---

## Le retrait en boutique

Quand un client choisit **« Retrait en boutique »** (payé sur place), le site crée
maintenant une **vraie commande WooCommerce**, au statut **« En attente »**.

Tu la retrouves donc dans wp-admin → Commandes, avec un numéro, exactement comme
une commande payée en ligne. Le client la voit aussi dans son compte.

**Pourquoi « En attente » et pas « En préparation » :** WooCommerce ne retire le
stock qu'à partir de « En préparation ». Tant que la commande est en attente,
**aucun stock n'est décompté**. C'est volontaire : n'importe qui peut passer une
commande de retrait sans payer, et sans ce garde-fou il suffirait d'en enchaîner
quelques-unes pour vider ta boutique sur le papier.

**Ton geste :** quand tu prépares réellement la commande et que tu la mets de
côté, passe-la en **« En préparation »** dans wp-admin (ou l'app mobile). C'est
à ce moment que le stock bouge — et c'est toi qui décides.

Ensuite, quand le client est venu la chercher et a payé au comptoir, passe-la en
**« Terminée »**. Le site affichera « Retirée » de son côté.

---

## ÉTAPE 8 — Checklist de bascule finale

À imprimer et cocher dans l'ordre :

- [ ] Tous les produits créés dans WooCommerce (catégories aux bons mots-clés, prix TTC, photos)
- [ ] « Gérer le stock ? » activé partout, « Vendu individuellement » coché sur les pièces uniques
- [ ] Clés API REST créées (Lecture/Écriture) — `ck_…` et `cs_…` copiées
- [ ] Les 13 variables renseignées dans Vercel (tableau de l'étape 4)
- [ ] Domaine vérifié chez Resend (DNS) — sinon aucun lien de connexion n'arrive
- [ ] **Redéploiement** Vercel effectué
- [ ] Le site affiche les vrais produits (et plus la démo)
- [ ] **Test compte client** : demande un lien de connexion, ouvre-le, vérifie que
      « Mes commandes » s'affiche — puis reclique le MÊME lien : il doit être refusé
      (usage unique)
- [ ] **Commande test** en mode test Stripe avec la carte `4242 4242 4242 4242` (date future, CVC `123`)
- [ ] Vérifier dans wp-admin : la commande apparaît dans WooCommerce → Commandes **et le stock a été décrémenté**
- [ ] Vérifier les e-mails : confirmation WooCommerce au client + notification à toi
- [ ] SIRET obtenu → compte Stripe activé
- [ ] Remplacer `sk_test_…`/`pk_test_…` par `sk_live_…`/`pk_live_…` dans Vercel + redéployer
- [ ] Dernier test avec une vraie carte, petit montant (remboursable depuis Stripe)

🎉 À partir de là, le site est un vrai magasin : catalogue réel, stock partagé, paiements sur ton compte Qonto.

---

_Pour la partie Stripe en détail (webhook, clés, IBAN Qonto), voir **`DEPLOIEMENT-PAIEMENT.md`**. Pour la caisse du magasin, voir **`Reco-paiement-caisse-Qonto.md`**._
