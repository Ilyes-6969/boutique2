# Encaissement unifié boutique + site, centralisé sur Qonto

_Recommandation — juin 2026_

## Le point de départ

Tu as un compte pro **Qonto**, un **site fait main déployé sur Vercel**, et une **boutique physique** avec besoin de TPE. Tu veux **un seul système de paiement** pour le site et la boutique, **tout qui retombe sur Qonto**, un **logiciel de caisse** (stock + compta), des **frais bas** et de la **simplicité**.

Une chose à savoir d'emblée : **aucun outil unique n'est à la fois le meilleur pour un checkout de site codé à la main ET le meilleur pour une caisse de boutique physique.** Le bon choix dépend donc de quel côté tu veux le moins de compromis. Voici les trois scénarios cohérents, du plus recommandé pour ton cas au plus spécialisé.

---

## ✅ Recommandation principale : Stripe comme rail de paiement unique

**Un seul compte Stripe encaisse le site ET la boutique, et reverse tout sur ton IBAN Qonto.**

Pourquoi c'est le meilleur pour toi :

- **Ton site est codé à la main sur Vercel.** Stripe est LA référence pour ça — `Stripe Checkout` s'intègre en quelques lignes (tu peux me demander de le brancher directement dans ton code). C'est précisément « la meilleure alternative pour ton site internet ».
- **Même système en boutique** via `Stripe Terminal` (lecteur de carte). Donc site + boutique = **un seul tableau de bord, un seul historique, une seule API**. C'est exactement le « un seul et unique moyen de paiement » que tu demandes.
- **Centralisation Qonto** : tu mets ton IBAN Qonto comme compte de versement → tout l'argent atterrit sur Qonto.

Le compromis honnête : **Stripe Terminal est pensé pour les développeurs, pas pour une petite boutique « clé en main »**, et il ne fournit pas de caisse avec gestion de stock prête à l'emploi. Il faut donc lui adjoindre un logiciel de caisse (voir plus bas).

**Frais Stripe (France) :** en ligne 1,5 % + 0,25 € par transaction (cartes EU) ; cartes hors-UE +3,25 %. Versement SEPA vers Qonto 0,35 €.

---

## 🧾 Le logiciel de caisse (obligatoire et conforme)

La **loi anti-fraude TVA** impose une caisse **certifiée NF525** (gestion inviolable des recettes). Pour une boutique (vêtements/articles avec tailles, variantes, stock), les meilleures options certifiées NF525 avec **stock + export compta** :

| Caisse | Pour qui | Points forts |
|---|---|---|
| **Hiboutik** | Commerce de détail / vêtements | NF525, gestion stock + variantes (taille/couleur), pas cher, e-shop intégré |
| **Square** | Boutique « clé en main » | Caisse + TPE + stock dans un seul appareil, très simple |
| **SumUp Caisse Pro** | Écosystème tout-en-un | NF525, stock, rentabilité, lié au TPE SumUp |
| **L'Addition / Tactill** | Commerce + resto | NF525, intuitif, stock |

Toutes exportent vers la compta (et plusieurs se connectent à **Pennylane**, qui se synchronise avec Qonto). Pour une boutique d'articles, **Hiboutik** est le plus adapté côté stock/variantes ; **Square** est le plus simple si tu veux caisse + terminal dans une seule boîte.

---

## Les 2 alternatives selon ta priorité

### Option B — Tout-en-un SumUp (le plus simple, un seul fournisseur)
Si la **boutique physique** est le centre de gravité et que tu veux le moins d'outils possible : **SumUp** fait TPE + Caisse Pro (NF525, stock) + paiement en ligne + e-shop, **un seul fournisseur**, versement sur ton **IBAN Qonto** (1–3 j ouvrés vers un compte externe).
- ➕ Le plus simple, matériel pas cher, caisse + stock + compta inclus, un seul écosystème.
- ➖ Brancher SumUp dans ton checkout Vercel codé main est moins élégant que Stripe (API/widgets ok, mais moins « développeur »). Frais en boutique ~1,75 %.

### Option C — Tout Qonto natif (frais les plus bas + centralisation maximale)
Le plus « centralisé sur Qonto » possible, car **rien ne transite par un tiers** :
- **En boutique** : TPE Qonto (Terminal Pocket avec imprimante, ou Pro de poche) — **0,70 % par transaction (cartes EU)**, sans abonnement ni engagement, argent sur Qonto **dès le lendemain ouvré** et **réconcilié automatiquement**. C'est de loin le moins cher du marché.
- **En ligne** : **liens de paiement Qonto** (propulsés par Mollie) — carte, Apple Pay, virement ; réconciliation auto sur Qonto.
- ➕ Frais imbattables, zéro tiers, compta ultra-propre dans Qonto.
- ➖ **Deux limites réelles** : (1) le TPE Qonto **ne se connecte pas encore à un logiciel de caisse** (pas de catalogue/stock piloté depuis le terminal) ; (2) en ligne ce sont des **liens de paiement**, pas un vrai checkout intégré dans ton panier — bien pour de la vente ponctuelle, plus limité pour une vraie boutique e-commerce.

---

## Comment l'argent se centralise sur Qonto

```
        SITE (Vercel)            BOUTIQUE (TPE)
             │                        │
             └─────────┬──────────────┘
                       │   1 seul processeur
                       ▼
              Stripe  /  SumUp  /  Qonto
                       │
                       ▼
              💳  Compte pro QONTO  💳
                       │
                       ▼
            Compta (Pennylane ↔ Qonto)
```

Dans les trois scénarios, **tout l'argent finit sur Qonto**. La différence : avec **Qonto natif** c'est direct + réconcilié auto ; avec **Stripe/SumUp** c'est un versement (payout) vers ton IBAN Qonto tous les 1–2 jours.

---

## Ma synthèse en une phrase

- **Tu privilégies ton site (codé main) et veux un vrai checkout + un seul rail propre →** **Stripe** (+ caisse Hiboutik ou Square), versé sur Qonto. ⭐ ma reco.
- **Tu privilégies la boutique et veux le plus simple, tout-en-un →** **SumUp** (TPE + Caisse Pro + en ligne), versé sur Qonto.
- **Tu veux les frais les plus bas et zéro tiers, et l'e-commerce reste léger →** **Qonto natif** (TPE 0,70 % + liens de paiement) + une caisse NF525 à part.

---

## Prochaine étape concrète

Dis-moi quel scénario tu retiens et je peux enchaîner tout de suite :
1. **Brancher le paiement dans ton code Vercel** (intégration Stripe Checkout ou SumUp / lien Qonto) — je modifie directement tes fichiers.
2. **Te préparer la configuration de la caisse** choisie (catalogue, stock de départ, export compta).
3. **Paramétrer le versement vers ton IBAN Qonto** (étapes exactes selon le fournisseur).
