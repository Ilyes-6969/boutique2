# Backend — comptes, suivi de commandes, retraits

Ce document couvre **uniquement** les comptes clients et le suivi de commandes.
Le catalogue et le stock sont dans `GUIDE-WOOCOMMERCE.md`, le paiement dans
`DEPLOIEMENT-PAIEMENT.md`.

## Le principe en une phrase

WooCommerce est la source de vérité (clients, commandes, stock) ; le site n'est
qu'une façade, et la connexion se fait **par lien e-mail, sans mot de passe**.

Pourquoi sans mot de passe : aucun secret à hacher, à stocker ou à faire fuiter,
et aucun formulaire « mot de passe oublié » à sécuriser — c'est le vecteur de
prise de compte le plus courant. Le lien prouve la même chose (« je contrôle
cette boîte mail ») pour une fraction du risque.

## Ce qu'il faut configurer

Tout se règle dans **Vercel → Settings → Environment Variables**. Tant qu'une
variable manque, l'endpoint concerné répond « pas encore activé » — jamais une
erreur technique, et jamais un faux succès.

| Variable | Pour quoi | Où la trouver |
|---|---|---|
| `SESSION_SECRET` | Signer les sessions et les liens | À générer, voir ci-dessous |
| `WC_STORE_URL` | Adresse du WordPress | Ton hébergement, en **HTTPS** |
| `WC_CONSUMER_KEY` | Lire/écrire clients + commandes | WooCommerce → Réglages → Avancé → API REST |
| `WC_CONSUMER_SECRET` | idem | idem |
| `RESEND_API_KEY` | Envoyer le lien de connexion | resend.com → API Keys |
| `MAIL_FROM` | Expéditeur, ex. `CLUB 151 <bonjour@club151.fr>` | Domaine à vérifier chez Resend |
| `SITE_URL` | Domaine de confiance des liens | `https://club151.fr` |

Génère le secret de session avec :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Deux points à ne pas rater :

- **`WC_STORE_URL` doit être en HTTPS.** L'authentification WooCommerce envoie
  la clé en clair dans l'en-tête : en HTTP, n'importe qui sur le réseau la lit.
  Le code refuse donc de démarrer en HTTP (sauf `localhost`, pour les tests).
- **Resend exige de vérifier le domaine** (enregistrements DNS SPF/DKIM sur
  `club151.fr`). Sans ça, les liens de connexion partent en spam — ou pas du
  tout. C'est l'étape la plus facile à oublier.

## Les endpoints

| Endpoint | Rôle |
|---|---|
| `POST /api/account/request-link` | Envoie le lien de connexion |
| `GET /api/account/verify?token=` | Ouvre la session, redirige vers `/?connexion=ok` |
| `GET /api/account/me` | Client connecté + adresse |
| `POST /api/account/address` | Met à jour l'adresse |
| `POST /api/account/logout` | Ferme la session |
| `GET /api/orders/mine` | Commandes du client connecté |
| `POST /api/orders/track` | Suivi **sans compte** (n° + e-mail) |

Le suivi invité existe parce que le paiement invité est acté : obliger à créer
un compte après coup, juste pour savoir où en est sa commande, c'est exactement
le moment où un client s'agace.

Deux détails de sécurité qui expliquent des choix visibles à l'usage :

- La demande de lien répond **la même chose que le compte existe ou non**. Une
  réponse différenciée transformerait le site en outil pour savoir qui est
  client de la boutique.
- Le suivi invité exige le numéro **et** l'e-mail. Les numéros de commande se
  suivent : le numéro seul ne prouve rien, il suffirait d'incrémenter pour lire
  la commande du voisin.

## Les retraits en boutique

Une commande « retrait » crée désormais une **vraie commande WooCommerce**, au
statut `pending` (« En attente »).

Ce statut n'est pas un détail : WooCommerce ne décrémente le stock qu'à partir
de « En préparation ». Tant que la commande est en attente, **aucun stock n'est
retiré** — c'est ce qui permet d'accepter des retraits depuis un endpoint non
authentifié sans qu'un inconnu puisse vider la boutique en commandant en boucle.

Ton geste : quand tu prépares réellement la commande, passe-la en **« En
préparation »**. C'est à ce moment que le stock bouge, et c'est toi qui décides.

Les statuts que voit le client s'adaptent au mode de livraison :

| Statut WooCommerce | Retrait | Livraison |
|---|---|---|
| `pending` | En attente de paiement | En attente de paiement |
| `processing` | En préparation | En préparation |
| `on-hold` | **Prête — à retirer en boutique** | En attente |
| `completed` | **Retirée** | **Expédiée** |

Aucune extension WordPress n'est nécessaire : ce sont les statuts natifs, ceux
que tu as déjà sous forme de boutons dans l'admin WooCommerce.

## Tester

```bash
npm test
```

Les tests tournent contre un **simulateur WooCommerce local** : ils vérifient
les sessions, l'usage unique des liens, les clients, les commandes, les retraits
et le suivi invité sans avoir besoin d'un vrai WordPress. Le jour où
`WC_STORE_URL` pointera sur le vrai site, le même code s'exécutera sans
changement.

## Ce qui reste à faire

- **Notifier « commande prête ».** `lib/mailer.js` sait déjà envoyer l'e-mail
  (`sendPickupReady`), mais rien ne le déclenche : il faudra un webhook
  WooCommerce sur le changement de statut, ou l'extension « Order Status
  Control ». Aujourd'hui le client voit le changement en consultant son compte,
  mais n'est pas prévenu.
- **Éprouver contre le vrai WordPress.** Tout est vérifié contre le simulateur,
  ce qui couvre la logique mais pas les surprises d'une vraie installation
  (préfixe des numéros de commande, extensions qui modifient l'API, réglages de
  permaliens). À refaire dès que `WC_STORE_URL` pointera sur le réel.
- **Historique local devenu redondant.** `Orders.add()` (data.js) écrit encore
  chaque commande dans le `localStorage`. C'est utile pour afficher le numéro
  sur l'écran de confirmation, mais cette liste n'est plus lue nulle part :
  « Mes commandes » interroge le serveur. À nettoyer un jour, sans urgence.
