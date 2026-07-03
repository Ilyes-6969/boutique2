# Activer le vrai paiement (Stripe → Qonto) — guide pas à pas

_Tout le code est déjà écrit. Il te reste à créer ton compte Stripe, coller 3 réglages dans Vercel, et basculer un interrupteur. Compte ~30 min._

---

## Ce qui a été ajouté au projet

| Fichier | Rôle |
|---|---|
| `api/create-checkout-session.js` | Crée la page de paiement Stripe (côté serveur, clé secrète protégée) |
| `api/order-status.js` | Vérifie au retour que le paiement est bien « payé » avant de valider la commande |
| `api/stripe-webhook.js` | Prévient le propriétaire par e-mail à chaque paiement (fiable, même si le client ferme l'onglet) |
| `merci.html` | Page de confirmation après paiement |
| `payments.js` | Branché sur Stripe (interrupteur `provider`) |
| `Checkout.jsx` | Étape paiement adaptée : redirection sécurisée Stripe |
| `package.json` / `vercel.json` | Déclare la dépendance Stripe + config Vercel |

> **Aucune clé secrète n'est dans le site.** Les secrets vivent uniquement dans les variables d'environnement Vercel.

---

## ÉTAPE 0 — Recevoir tes commandes par e-mail (2 min, à faire tout de suite)

Indépendant de Stripe, utile dès maintenant :

1. Va sur **web3forms.com**, saisis ton e-mail → copie l'**Access Key** (gratuit, illimité).
2. Ouvre **`admin.html`** → bloc vert **« Réception des commandes »** → colle la clé → **Enregistrer**.
3. Fini : chaque commande t'arrive par e-mail.

---

## ÉTAPE 1 — Créer le compte Stripe et récupérer la clé secrète

1. Crée un compte sur **stripe.com** (gratuit).
2. Renseigne les infos de ton entreprise (nécessaire pour encaisser en réel).
3. Va dans **Développeurs → Clés API**. Tu y vois deux clés :
   - **Clé publiable** `pk_live_...` (publique)
   - **Clé secrète** `sk_live_...` ← **c'est celle-ci qu'il faut garder secrète**.
4. Pour tester d'abord sans argent réel, active le **Mode test** (interrupteur en haut) et utilise les clés `sk_test_...`.

---

## ÉTAPE 2 — Régler le versement vers ton IBAN Qonto

Dans Stripe : **Paramètres → Comptes bancaires et devises** → ajoute ton **IBAN Qonto** comme compte de versement.
→ Tout l'argent encaissé par Stripe sera viré automatiquement sur **Qonto** (payout tous les 1–2 jours).

---

## ÉTAPE 3 — Ajouter les variables d'environnement dans Vercel

Dans Vercel : ton projet **boutique2** → **Settings → Environment Variables**. Ajoute :

| Nom | Valeur | Obligatoire |
|---|---|---|
| `STRIPE_SECRET_KEY` | ta clé secrète `sk_live_...` (ou `sk_test_...` pour tester) | ✅ oui |
| `STRIPE_PUBLISHABLE_KEY` | ta clé publique `pk_live_...` (ou `pk_test_...`) — sert au formulaire de carte intégré | ✅ oui |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (obtenu à l'étape 4) | ✅ oui — le code refuse de traiter un webhook sans lui |
| `WEB3FORMS_KEY` | ta clé Web3Forms (pour l'e-mail propriétaire fiable) | facultatif |

> `SITE_URL` reste utile : le build s'en sert pour le **sitemap** et les **pages produit** (SEO) — mets-y `https://leclub151.fr`. Pour le paiement lui-même, le site détecte son domaine tout seul : la carte s'affiche **directement dans la fenêtre du site** (Payment Element), sans redirection vers Stripe.

Coche bien **Production** (et Preview si tu veux tester sur les déploiements de test). Puis **redéploie** le site pour qu'elles s'appliquent.

---

## ÉTAPE 4 — Créer le webhook Stripe (fiabilise la notification de commande)

1. Stripe → **Développeurs → Webhooks → Ajouter un point de terminaison**.
2. URL : `https://TON-SITE/api/stripe-webhook`
3. Événements à écouter : **les DEUX** —
   - **`payment_intent.succeeded`** ← c'est LUI que déclenche le paiement intégré au site (Payment Element). Sans lui, aucune notification n'arrive.
   - **`checkout.session.completed`** (utile si un paiement passe par une page Stripe hébergée).
4. Stripe te donne un **« Signing secret »** `whsec_...` → colle-le dans Vercel comme `STRIPE_WEBHOOK_SECRET` (étape 3), puis redéploie. **Cette variable est obligatoire** : sans elle, le serveur rejette les webhooks.

---

## ÉTAPE 5 — Activer le reçu automatique au client

Stripe → **Paramètres → E-mails clients** → active **« Reçus de paiement réussis »**.
→ Le client reçoit automatiquement son reçu par e-mail (rien à coder).

---

## ÉTAPE 6 — Basculer le site en mode paiement réel

Dans **`payments.js`**, tout en haut de `cfg`, change une seule ligne :

```js
provider: 'simulation',   →   provider: 'stripe',
```

Enregistre, commit/push (le site se redéploie sur Vercel).

---

## ÉTAPE 7 — Tester de bout en bout

1. D'abord en **Mode test** (`sk_test_...`). Sur le site, passe une commande, choisis « Livraison standard », clique **Payer**.
2. Sur la page Stripe, utilise la carte de test **`4242 4242 4242 4242`**, date future quelconque, CVC `123`.
3. Tu dois être redirigé vers **`merci.html`** avec « Merci… » + n° de commande.
4. Vérifie : commande visible dans **Mes commandes**, e-mail reçu (Web3Forms), paiement visible dans Stripe.
5. Quand tout est bon, repasse en clés **`sk_live_...`** dans Vercel et redéploie. C'est en production.

> Le **retrait en boutique** reste gratuit et sans carte (réglé sur place) — inchangé.

---

## Ce que Stripe NE gère pas (et la suite)

- **Le stock partagé entre tous les visiteurs** (décrémenté à chaque vente) : il faut une source serveur → **WooCommerce**. Le guide complet pas à pas (hébergement, produits, clés API, variables Vercel, stock magasin) est dans **`GUIDE-WOOCOMMERCE.md`**.
- **La caisse en boutique** : voir `Reco-paiement-caisse-Qonto.md` (Stripe Terminal, ou Hiboutik/Square).

---

## Sécurité — à savoir

- La clé **secrète** Stripe n'est jamais dans le site : uniquement dans Vercel (variables d'env). ✅
- **Les prix sont fixés côté SERVEUR** : le navigateur n'envoie que `{ id, quantité }`, et le montant facturé est recalculé par `lib/serverCatalog.js` (catalogue WooCommerce si `WC_STORE_URL` est configurée, sinon instantané de démo en mode test). Un panier au prix manipulé est refusé. ✅
