/* CLUB 151 — Pages légales
   Mentions légales · CGV · Politique de confidentialité.
   ⚠️ Gabarit informatif, non contractuel : fais-le valider par un juriste.

   👉 REMPLIS UNE SEULE FOIS l'objet COMPANY ci-dessous : ses valeurs se
      propagent automatiquement aux trois pages. Tout champ laissé vide ('')
      s'affiche surligné « à compléter » pour que rien ne soit oublié. */

const COMPANY = {
  name: '',                 // Raison sociale, ex. "CLUB 151 SAS"
  legalForm: '',            // EI / EURL / SASU…
  capital: '',              // Capital social, ex. "1 000 €"
  siret: '',                // ex. "000 000 000 00000"
  rcs: '',                  // RCS / RM, ex. "Vienne 000 000 000"
  vat: '',                  // TVA intracom., ex. "FR00 000000000"
  address: '',              // ex. "12 rue de la République, 38200 Vienne"
  email: 'contact@leclub151.fr',
  phone: '',                // ex. "04 00 00 00 00"
  director: '',             // Directeur de la publication (Prénom Nom)
  directorRole: '',         // gérant / président…
  host: { name: 'Vercel Inc.', address: '440 N Barranca Ave #4133, Covina, CA 91723, USA', contact: 'vercel.com' },
  mediator: '',             // Médiateur de la consommation (nom + URL)
  jurisdiction: 'Vienne',
  hours: '',                // Horaires boutique, ex. "Mar–Sam · 10h–19h"
  returnCost: 'du client',  // frais de retour : "du client" ou "du vendeur"
};

function LegalPage({ navigate, kind }) {
  const F = ({ children }) => (
    <mark style={{ background: 'var(--accent-wash)', color: 'var(--accent)', padding: '1px 7px', borderRadius: 4, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.86em', letterSpacing: '0.02em' }}>{children}</mark>
  );
  // Affiche la vraie valeur si renseignée, sinon un placeholder surligné.
  const V = ({ v, ph }) => (v ? <span>{v}</span> : <F>{ph}</F>);
  const H = ({ children }) => <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em', margin: '34px 0 12px' }}>{children}</h2>;
  const P = ({ children }) => <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)', margin: '0 0 12px' }}>{children}</p>;
  const LI = ({ children }) => <li style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: 7, paddingLeft: 20, position: 'relative' }}><span style={{ position: 'absolute', left: 2, top: 9, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></span>{children}</li>;
  const UL = ({ children }) => <ul style={{ listStyle: 'none', margin: '0 0 14px', padding: 0 }}>{children}</ul>;

  const meta = {
    mentions: { title: 'Mentions légales', crumb: 'Mentions légales' },
    cgv: { title: 'Conditions générales de vente', crumb: 'CGV' },
    confidentialite: { title: 'Politique de confidentialité', crumb: 'Confidentialité' },
    apropos: { title: 'À propos de CLUB 151', crumb: 'À propos' },
    faq: { title: 'Questions fréquentes', crumb: 'FAQ' },
  }[kind] || { title: 'Informations légales', crumb: 'Légal' };
  const isLegal = kind === 'mentions' || kind === 'cgv' || kind === 'confidentialite';

  return (
    <div>
      <section style={{ borderBottom: '1.5px solid var(--line)', background: 'var(--paper-2)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 34px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
            <a href="index.html">Accueil</a> &nbsp;/&nbsp; {meta.crumb}
          </div>
          <h1 className="display-2">{meta.title}</h1>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 10, fontFamily: 'var(--font-mono)' }}>Dernière mise à jour : <F>JJ/MM/AAAA</F></p>
        </div>
      </section>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '8px 24px 72px' }}>
        {isLegal && !COMPANY.name && (
        <div style={{ background: 'var(--accent-wash)', border: '1.5px solid var(--accent-soft)', borderRadius: 'var(--radius)', padding: '14px 18px', margin: '24px 0 8px', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--ink)' }}>Gabarit à compléter.</strong> Renseigne l'objet <code>COMPANY</code> en haut de <code>Legal.jsx</code> : les champs <F>surlignés</F> se rempliront automatiquement ici. Ce modèle est fourni à titre informatif — fais-le relire par un professionnel du droit avant mise en ligne.
        </div>
        )}

        {kind === 'mentions' && (
          <React.Fragment>
            <H>1. Éditeur du site</H>
            <P>Le site <strong>CLUB 151</strong> est édité par :</P>
            <UL>
              <LI>Raison sociale / nom : <V v={COMPANY.name} ph="Nom de l'entreprise" /></LI>
              <LI>Forme juridique : <V v={COMPANY.legalForm} ph="EI / EURL / SASU…" /> — Capital social : <V v={COMPANY.capital} ph="montant €" /></LI>
              <LI>SIRET : <V v={COMPANY.siret} ph="000 000 000 00000" /> — RCS / RM : <V v={COMPANY.rcs} ph="Ville + n°" /></LI>
              <LI>N° TVA intracommunautaire : <V v={COMPANY.vat} ph="FR00 000000000" /></LI>
              <LI>Siège social : <V v={COMPANY.address} ph="Adresse complète, 38200 Vienne" /></LI>
              <LI>E-mail : <V v={COMPANY.email} ph="contact@leclub151.fr" /> — Téléphone : <V v={COMPANY.phone} ph="04 00 00 00 00" /></LI>
            </UL>
            <H>2. Directeur de la publication</H>
            <P><V v={COMPANY.director} ph="Prénom Nom" />, en qualité de <V v={COMPANY.directorRole} ph="gérant / responsable" />.</P>
            <H>3. Hébergeur</H>
            <P>Le site est hébergé par :</P>
            <UL>
              <LI>Société : <V v={COMPANY.host.name} ph="Nom de l'hébergeur" /></LI>
              <LI>Adresse : <V v={COMPANY.host.address} ph="Adresse de l'hébergeur" /></LI>
              <LI>Contact : <V v={COMPANY.host.contact} ph="Téléphone / site de l'hébergeur" /></LI>
            </UL>
            <H>4. Propriété intellectuelle</H>
            <P>« Pokémon », les noms de personnages, séries et logos sont des marques déposées de Nintendo, Creatures Inc. et GAME FREAK inc. <strong>CLUB 151 n'est ni affilié, ni sponsorisé, ni approuvé par The Pokémon Company.</strong> Les produits proposés sont des articles authentiques revendus dans le cadre de l'épuisement des droits. Les visuels, textes et éléments graphiques propres au site sont la propriété de <V v={COMPANY.name} ph="Nom de l'entreprise" />.</P>
            <H>5. Données personnelles & cookies</H>
            <P>Le traitement des données est décrit dans notre <a href="confidentialite.html" style={{ color: 'var(--accent)', fontWeight: 600 }}>politique de confidentialité</a>.</P>
          </React.Fragment>
        )}

        {kind === 'cgv' && (
          <React.Fragment>
            <H>Article 1 — Objet</H>
            <P>Les présentes conditions générales de vente (CGV) régissent les ventes de cartes et produits Pokémon réalisées sur le site CLUB 151 entre <V v={COMPANY.name} ph="Nom de l'entreprise" /> (le vendeur) et tout acheteur particulier (le client).</P>
            <H>Article 2 — Produits</H>
            <P>Les produits sont des articles <strong>authentiques</strong> (cartes à l'unité, cartes gradées, produits scellés, accessoires). Les cartes à l'unité et gradées sont des <strong>pièces uniques</strong> : une fois vendues, elles ne sont plus disponibles. Les photographies sont les plus fidèles possibles ; de légères variations d'état peuvent exister et sont précisées dans la fiche produit.</P>
            <H>Article 3 — Prix</H>
            <P>Les prix sont indiqués en euros toutes taxes comprises (TTC). <V v={COMPANY.name} ph="Nom de l'entreprise" /> se réserve le droit de modifier ses prix à tout moment ; les produits sont facturés sur la base des tarifs en vigueur au moment de la commande.</P>
            <H>Article 4 — Commande & paiement</H>
            <P>La commande peut être passée avec ou sans compte client (« commande invité »). La création d'un compte client, gratuite, est facultative ; elle permet de suivre ses commandes et d'enregistrer ses adresses de livraison. Le paiement s'effectue par <strong>carte bancaire</strong> (et autres moyens éventuellement proposés), via le prestataire de paiement sécurisé <strong>Stripe</strong> ; aucune donnée de carte n'est conservée par nos soins. La commande est confirmée après validation du paiement. <V v={COMPANY.name} ph="Nom de l'entreprise" /> se réserve le droit d'annuler toute commande en cas de litige de paiement.</P>
            <H>Article 5 — Livraison</H>
            <P>Livraison en France métropolitaine sous 48 h ouvrées, en envoi suivi et protégé. Frais : livraison standard <strong>4,90 €</strong> (2–4 j), point relais <strong>3,90 €</strong> (3–5 j), ou <strong>retrait gratuit</strong> en boutique à Vienne. <strong>Livraison offerte dès 100 €</strong> d'achat. Les délais sont indicatifs.</P>
            <H>Article 6 — Droit de rétractation</H>
            <P>Conformément au Code de la consommation, le client dispose d'un délai de <strong>14 jours</strong> à compter de la réception pour exercer son droit de rétractation, sans avoir à se justifier. Les produits doivent être retournés <strong>non ouverts / scellés et dans leur état d'origine</strong>. Les frais de retour sont à la charge <V v={COMPANY.returnCost} ph="du client / du vendeur" />. Remboursement sous 14 jours après réception du retour.</P>
            <H>Article 7 — Garanties</H>
            <P>Les produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés. L'authenticité de chaque pièce de plus de 100 € est vérifiée avant mise en vente.</P>
            <H>Article 8 — Données personnelles</H>
            <P>Les données sont traitées conformément à notre <a href="confidentialite.html" style={{ color: 'var(--accent)', fontWeight: 600 }}>politique de confidentialité</a> et au RGPD.</P>
            <H>Article 9 — Litiges & droit applicable</H>
            <P>Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action ; le client peut recourir gratuitement à un médiateur de la consommation (<V v={COMPANY.mediator} ph="nom + site du médiateur" />). À défaut, les tribunaux compétents seront ceux du ressort de <V v={COMPANY.jurisdiction} ph="Ville" />.</P>
          </React.Fragment>
        )}

        {kind === 'confidentialite' && (
          <React.Fragment>
            <H>1. Responsable du traitement</H>
            <P>Le responsable du traitement des données est <V v={COMPANY.name} ph="Nom de l'entreprise" />, <V v={COMPANY.address} ph="adresse" />, joignable à <V v={COMPANY.email} ph="contact@leclub151.fr" />.</P>
            <H>2. Données collectées</H>
            <UL>
              <LI>Identité & contact : nom, e-mail, adresse de livraison, téléphone</LI>
              <LI>Commande : produits, montants, historique d'achat</LI>
              <LI>Paiement : géré par notre prestataire <strong>Stripe</strong> (aucune donnée carte stockée par nos soins)</LI>
              <LI>Navigation : cookies, adresse IP, statistiques de visite</LI>
            </UL>
            <H>3. Finalités & base légale</H>
            <UL>
              <LI>Gestion des commandes et du compte client (exécution du contrat)</LI>
              <LI>Service client et alertes produits (consentement)</LI>
              <LI>Obligations comptables et légales (obligation légale)</LI>
              <LI>Amélioration du site et mesure d'audience (intérêt légitime / consentement)</LI>
            </UL>
            <H>4. Durée de conservation</H>
            <P>Les données sont conservées le temps de la relation commerciale puis archivées selon les délais légaux (10 ans pour les pièces comptables et factures), ou jusqu'au retrait du consentement pour les alertes/newsletter.</P>
            <H>5. Destinataires</H>
            <P>Les données ne sont transmises qu'aux prestataires nécessaires (hébergeur, transporteur, prestataire de paiement) et ne sont <strong>jamais revendues</strong>.</P>
            <H>6. Vos droits (RGPD)</H>
            <P>Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Pour les exercer : <V v={COMPANY.email} ph="contact@leclub151.fr" />. Vous pouvez aussi saisir la CNIL (cnil.fr).</P>
            <H>7. Cookies</H>
            <P>Le site utilise des cookies techniques (panier, session) et, sous réserve de votre consentement, des cookies de mesure d'audience. Vous pouvez les gérer à tout moment via le bandeau cookies / les réglages de votre navigateur.</P>
          </React.Fragment>
        )}

        {kind === 'apropos' && (
          <React.Fragment>
            <P style={{ marginTop: 24 }}>CLUB 151 est une boutique de cartes à collectionner installée à <strong>Vienne, en Isère</strong>. Pokémon est notre cœur de métier — du Set de Base de 1999 aux dernières sorties — avec une sélection de cartes à l'unité, de pièces gradées, de produits scellés et d'accessoires.</P>
            <H>Notre métier</H>
            <P>On déniche, on authentifie et on conseille. Chaque carte de valeur passe entre nos mains avant d'être proposée : état, centrage, authenticité. L'idée est simple — que vous achetiez une pièce de collection en confiance, comme si vous étiez au comptoir.</P>
            <H>Nos engagements</H>
            <UL>
              <LI><strong>Authenticité garantie</strong> — chaque pièce de plus de 100 € est vérifiée avant mise en vente.</LI>
              <LI><strong>Expédition protégée</strong> sous 48 h ouvrées, en envoi suivi, ou retrait gratuit en boutique.</LI>
              <LI><strong>Conseil</strong> — débutant ou collectionneur aguerri, on prend le temps de répondre.</LI>
              <LI><strong>Rachat & estimation</strong> de cartes et de collections en boutique.</LI>
            </UL>
            <H>Venez nous voir</H>
            <P>La boutique est ouverte <V v={COMPANY.hours} ph="Mar–Sam · 10h–19h" /> — <V v={COMPANY.address} ph="adresse à compléter, 38200 Vienne" />. Une question, une recherche précise, une collection à estimer ? <a href="index.html#contact" onClick={(e) => { e.preventDefault(); openModal('contact'); }} style={{ color: 'var(--accent)', fontWeight: 600 }}>Écrivez-nous</a> ou passez directement.</P>
            <P style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 18 }}>« Pokémon » est une marque déposée de Nintendo, Creatures Inc. et GAME FREAK inc. CLUB 151 n'est ni affilié ni approuvé par The Pokémon Company.</P>
          </React.Fragment>
        )}

        {kind === 'faq' && (
          <React.Fragment>
            <H>Livraison — quels délais et quels frais ?</H>
            <P>Les commandes sont expédiées sous 48 h ouvrées en envoi suivi et protégé. Livraison standard <strong>4,90 €</strong> (2–4 j), point relais <strong>3,90 €</strong> (3–5 j), ou <strong>retrait gratuit</strong> en boutique à Vienne. La livraison est <strong>offerte dès 100 €</strong> d'achat.</P>
            <H>Vos cartes sont-elles authentiques ?</H>
            <P>Oui. Chaque pièce de valeur est vérifiée avant mise en vente, et les cartes gradées sont vendues sous coque, certifiées (PSA, BGS, CGC). L'état est précisé sur chaque fiche produit.</P>
            <H>Qu'est-ce qu'une « pièce unique » (1/1) ?</H>
            <P>Les cartes à l'unité et gradées sont des exemplaires uniques : une fois vendues, elles ne sont plus disponibles. Elles ne peuvent être ajoutées qu'en un seul exemplaire au panier.</P>
            <H>Puis-je retourner un article ?</H>
            <P>Vous disposez de <strong>14 jours</strong> après réception pour exercer votre droit de rétractation. Les produits scellés doivent être retournés non ouverts et dans leur état d'origine. Voir le détail dans nos <a href="cgv.html" style={{ color: 'var(--accent)', fontWeight: 600 }}>CGV</a>.</P>
            <H>Le paiement est-il sécurisé ?</H>
            <P>Oui. Le paiement est chiffré et géré par un prestataire de paiement ; aucune donnée de carte n'est conservée par nos soins.</P>
            <H>Comment fonctionnent les précommandes ?</H>
            <P>Les produits en précommande sont expédiés à leur date de sortie, indiquée sur la fiche. Vous pouvez activer une <strong>alerte</strong> depuis votre compte pour être prévenu des nouveautés et retours en stock.</P>
            <H>Faut-il un compte pour commander ?</H>
            <P>Non — vous pouvez commander sans compte, en « commande invité ». La création d'un compte client (gratuit) est facultative : elle permet de suivre vos commandes et d'enregistrer vos adresses pour vos prochains achats.</P>
            <H>Une autre question ?</H>
            <P><a href="index.html#contact" onClick={(e) => { e.preventDefault(); openModal('contact'); }} style={{ color: 'var(--accent)', fontWeight: 600 }}>Contactez-nous</a> — on répond sous 24 h.</P>
          </React.Fragment>
        )}

        <div style={{ marginTop: 40, paddingTop: 22, borderTop: '1.5px solid var(--line)', display: 'flex', gap: 16, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
          <a href="mentions-legales.html" style={{ color: kind === 'mentions' ? 'var(--accent)' : 'var(--ink-2)', fontWeight: 600 }}>Mentions légales</a>
          <a href="cgv.html" style={{ color: kind === 'cgv' ? 'var(--accent)' : 'var(--ink-2)', fontWeight: 600 }}>CGV</a>
          <a href="confidentialite.html" style={{ color: kind === 'confidentialite' ? 'var(--accent)' : 'var(--ink-2)', fontWeight: 600 }}>Confidentialité</a>
        </div>
      </section>
    </div>
  );
}
Object.assign(window, { LegalPage });
