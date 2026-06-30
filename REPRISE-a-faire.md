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

## Rappel technique utile
- Astuce si le site semble « pas à jour » après un push : Vercel/cache. Vérifier dans **Vercel → Deployments** que le **dernier commit** est bien déployé (Ready), sinon re-pousser un petit changement. Côté navigateur : **Ctrl + Maj + R**.
- Détails complets dans **`DEPLOIEMENT-PAIEMENT.md`**.
