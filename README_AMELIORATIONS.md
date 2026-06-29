# leclub151 — Améliorations apportées au site

_Mise à jour du 30 juin 2026._

Ce document récapitule ce qui a été modifié et les **2 choses qui te restent à faire**.

---

## 1. Ce qui a changé

### Paiement « prêt à brancher » (préparé, pas encore actif)
- Nouveau fichier **`payments.js`** : une couche de paiement isolée. Aujourd'hui en mode `simulation` (comme avant, aucun débit réel). Demain, pour activer un vrai paiement, **un seul fichier à changer**.
- Le tunnel de commande (`Checkout.jsx`) appelle désormais cette couche au lieu d'avoir le code en dur. Le bouton affiche un état « Traitement… » pendant le paiement.
- Objectif visé : **un seul moyen de paiement** pour le site et la boutique, **reversé sur Qonto** (voir `Reco-paiement-caisse-Qonto.md`).

### Réception des commandes (le trou le plus important — corrigé)
- Avant : une commande passée par un client restait **dans le navigateur du client** → tu ne la voyais jamais.
- Maintenant : chaque commande peut t'être **envoyée par e-mail** automatiquement. À activer dans l'admin (voir §2).

### SEO & partage social
- Ajout sur chaque page : `description`, `Open Graph` (Facebook), `Twitter Card`, `theme-color`, balise `robots`.
- Page d'accueil : données structurées **JSON-LD** (Google comprend que c'est une boutique à Vienne) + un contenu de secours `noscript` (lisible sans JavaScript / par les robots).
- Panier et admin passés en `noindex` (ne doivent pas remonter dans Google).

### Performance
- React passé des versions **« development » → « production »** sur toutes les pages : chargement plus léger et plus rapide, sans messages d'avertissement.

---

## 2. ✅ Ce qu'il te reste à faire

### A. Activer la réception des commandes par e-mail (5 min, gratuit)
1. Va sur **web3forms.com**, saisis ton e-mail → tu reçois une **« Access Key »** (gratuit, illimité).
2. Ouvre **`admin.html`** → bloc vert **« Réception des commandes »** → colle la clé → **Enregistrer**.
3. C'est tout : chaque nouvelle commande t'arrive par e-mail.

> Tu peux aussi coller une **URL de webhook** (Make, Zapier, n8n, ou ton serveur) au lieu de la clé Web3Forms.

### B. Brancher le vrai paiement (quand tu veux — on le fera ensemble)
Tout est prêt dans **`payments.js`**. Pour Stripe (recommandé pour ce site) :
1. Créer une fonction serveur Vercel `/api/create-checkout-session` (avec la clé **secrète** Stripe — jamais dans le site).
2. Dans `payments.js` : passer `provider: 'simulation'` → `'stripe'`, renseigner la clé **publique** `pk_live_...`, et décommenter la fonction `stripe()` (déjà esquissée).
3. Régler le **virement Stripe vers ton IBAN Qonto**.

Les variantes **Qonto (lien de paiement)** et **SumUp** sont aussi prévues dans le fichier.

---

## 3. Détails utiles / limites connues
- Le site compile encore le React **dans le navigateur** (Babel). C'est pratique mais pas optimal ; une future « vraie build » (Vite/Next.js) le rendrait encore plus rapide et 100 % référençable. Chantier optionnel, à part.
- Pour de meilleurs aperçus lors d'un partage (Facebook/WhatsApp), ajoute une **image** `og:image` (logo 1200×630) — à fournir.
- Pense à compléter une **adresse postale réelle** (mentions légales + JSON-LD) et le **contenu des pages légales** (CGV, confidentialité, mentions) avant l'ouverture.
- Stock : il peut être synchronisé avec WooCommerce ou ton futur logiciel de caisse (déjà câblé dans l'admin → « Connexion WordPress »).

## 4. Fichiers modifiés
`payments.js` (nouveau), `Checkout.jsx`, `data.js`, `Admin.jsx`, et les 12 pages `.html` (méta + React production).
