/* leclub151 — Pages légales (gabarits à compléter)
   Mentions légales · CGV · Politique de confidentialité.
   Les champs [À COMPLÉTER] sont surlignés — remplace-les par tes infos réelles.
   ⚠️ Gabarit informatif, non contractuel : fais-le valider par un juriste. */

function LegalPage({ navigate, kind }) {
  const F = ({ children }) => (
    <mark style={{ background: 'var(--accent-wash)', color: 'var(--accent)', padding: '1px 7px', borderRadius: 4, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.86em', letterSpacing: '0.02em' }}>{children}</mark>
  );
  const H = ({ children }) => <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em', margin: '34px 0 12px' }}>{children}</h2>;
  const P = ({ children }) => <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)', margin: '0 0 12px' }}>{children}</p>;
  const LI = ({ children }) => <li style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: 7, paddingLeft: 20, position: 'relative' }}><span style={{ position: 'absolute', left: 2, top: 9, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></span>{children}</li>;
  const UL = ({ children }) => <ul style={{ listStyle: 'none', margin: '0 0 14px', padding: 0 }}>{children}</ul>;

  const meta = {
    mentions: { title: 'Mentions légales', crumb: 'Mentions légales' },
    cgv: { title: 'Conditions générales de vente', crumb: 'CGV' },
    confidentialite: { title: 'Politique de confidentialité', crumb: 'Confidentialité' },
  }[kind] || { title: 'Informations légales', crumb: 'Légal' };

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
        <div style={{ background: 'var(--accent-wash)', border: '1.5px solid var(--accent-soft)', borderRadius: 'var(--radius)', padding: '14px 18px', margin: '24px 0 8px', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--ink)' }}>Gabarit à compléter.</strong> Remplace chaque champ <F>surligné</F> par tes informations réelles. Ce modèle est fourni à titre informatif — fais-le relire par un professionnel du droit avant mise en ligne.
        </div>

        {kind === 'mentions' && (
          <React.Fragment>
            <H>1. Éditeur du site</H>
            <P>Le site <strong>leclub151</strong> est édité par :</P>
            <UL>
              <LI>Raison sociale / nom : <F>Nom de l'entreprise</F></LI>
              <LI>Forme juridique : <F>EI / EURL / SASU…</F> — Capital social : <F>montant €</F></LI>
              <LI>SIRET : <F>000 000 000 00000</F> — RCS / RM : <F>Ville + n°</F></LI>
              <LI>N° TVA intracommunautaire : <F>FR00 000000000</F></LI>
              <LI>Siège social : <F>Adresse complète, 38200 Vienne</F></LI>
              <LI>E-mail : <F>contact@leclub151.fr</F> — Téléphone : <F>04 00 00 00 00</F></LI>
            </UL>
            <H>2. Directeur de la publication</H>
            <P><F>Prénom Nom</F>, en qualité de <F>gérant / responsable</F>.</P>
            <H>3. Hébergeur</H>
            <P>Le site est hébergé par :</P>
            <UL>
              <LI>Société : <F>Nom de l'hébergeur</F></LI>
              <LI>Adresse : <F>Adresse de l'hébergeur</F></LI>
              <LI>Téléphone : <F>Téléphone de l'hébergeur</F></LI>
            </UL>
            <H>4. Propriété intellectuelle</H>
            <P>« Pokémon », les noms de personnages, séries et logos sont des marques déposées de Nintendo, Creatures Inc. et GAME FREAK inc. <strong>leclub151 n'est ni affilié, ni sponsorisé, ni approuvé par The Pokémon Company.</strong> Les produits proposés sont des articles authentiques revendus dans le cadre de l'épuisement des droits. Les visuels, textes et éléments graphiques propres au site sont la propriété de <F>Nom de l'entreprise</F>.</P>
            <H>5. Données personnelles & cookies</H>
            <P>Le traitement des données est décrit dans notre <a href="confidentialite.html" style={{ color: 'var(--accent)', fontWeight: 600 }}>politique de confidentialité</a>.</P>
          </React.Fragment>
        )}

        {kind === 'cgv' && (
          <React.Fragment>
            <H>Article 1 — Objet</H>
            <P>Les présentes conditions générales de vente (CGV) régissent les ventes de cartes et produits Pokémon réalisées sur le site leclub151 entre <F>Nom de l'entreprise</F> (le vendeur) et tout acheteur particulier (le client).</P>
            <H>Article 2 — Produits</H>
            <P>Les produits sont des articles <strong>authentiques</strong> (cartes à l'unité, cartes gradées, produits scellés, accessoires). Les cartes à l'unité et gradées sont des <strong>pièces uniques</strong> : une fois vendues, elles ne sont plus disponibles. Les photographies sont les plus fidèles possibles ; de légères variations d'état peuvent exister et sont précisées dans la fiche produit.</P>
            <H>Article 3 — Prix</H>
            <P>Les prix sont indiqués en euros toutes taxes comprises (TTC). <F>Nom de l'entreprise</F> se réserve le droit de modifier ses prix à tout moment ; les produits sont facturés sur la base des tarifs en vigueur au moment de la commande.</P>
            <H>Article 4 — Commande & paiement</H>
            <P>La création d'un compte client est requise pour commander. Le paiement s'effectue par <F>CB, PayPal, … via Stripe/WooCommerce</F>. La commande est confirmée après validation du paiement. <F>Nom de l'entreprise</F> se réserve le droit d'annuler toute commande en cas de litige de paiement.</P>
            <H>Article 5 — Livraison</H>
            <P>Livraison en France <F>(et/ou international)</F> sous <F>48 h ouvrées</F>, en envoi suivi et protégé. Frais : standard <F>4,90 €</F> (offert dès 100 €), point relais <F>3,90 €</F>, ou retrait gratuit en boutique à Vienne. Les délais sont indicatifs.</P>
            <H>Article 6 — Droit de rétractation</H>
            <P>Conformément au Code de la consommation, le client dispose d'un délai de <strong>14 jours</strong> à compter de la réception pour exercer son droit de rétractation, sans avoir à se justifier. Les produits doivent être retournés <strong>non ouverts / scellés et dans leur état d'origine</strong>. Les frais de retour sont à la charge <F>du client / du vendeur</F>. Remboursement sous 14 jours après réception du retour.</P>
            <H>Article 7 — Garanties</H>
            <P>Les produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés. L'authenticité de chaque pièce de plus de 100 € est vérifiée avant mise en vente.</P>
            <H>Article 8 — Données personnelles</H>
            <P>Les données sont traitées conformément à notre <a href="confidentialite.html" style={{ color: 'var(--accent)', fontWeight: 600 }}>politique de confidentialité</a> et au RGPD.</P>
            <H>Article 9 — Litiges & droit applicable</H>
            <P>Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action ; le client peut recourir à un médiateur de la consommation (<F>nom du médiateur</F>). À défaut, les tribunaux compétents seront ceux du ressort de <F>Ville</F>.</P>
          </React.Fragment>
        )}

        {kind === 'confidentialite' && (
          <React.Fragment>
            <H>1. Responsable du traitement</H>
            <P>Le responsable du traitement des données est <F>Nom de l'entreprise</F>, <F>adresse</F>, joignable à <F>contact@leclub151.fr</F>.</P>
            <H>2. Données collectées</H>
            <UL>
              <LI>Identité & contact : nom, e-mail, adresse de livraison, téléphone</LI>
              <LI>Commande : produits, montants, historique d'achat</LI>
              <LI>Paiement : géré par notre prestataire <F>Stripe / WooCommerce Payments</F> (aucune donnée carte stockée par nos soins)</LI>
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
            <P>Les données sont conservées le temps de la relation commerciale puis archivées selon les délais légaux (ex. <F>10 ans</F> pour les factures), ou jusqu'au retrait du consentement pour les alertes/newsletter.</P>
            <H>5. Destinataires</H>
            <P>Les données ne sont transmises qu'aux prestataires nécessaires (hébergeur, transporteur, prestataire de paiement) et ne sont <strong>jamais revendues</strong>.</P>
            <H>6. Vos droits (RGPD)</H>
            <P>Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Pour les exercer : <F>contact@leclub151.fr</F>. Vous pouvez aussi saisir la CNIL (cnil.fr).</P>
            <H>7. Cookies</H>
            <P>Le site utilise des cookies techniques (panier, session) et, sous réserve de votre consentement, des cookies de mesure d'audience. Vous pouvez les gérer à tout moment via le bandeau cookies / les réglages de votre navigateur.</P>
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
