/* leclub151 — i18n léger. Traduit le "chrome" présent sur toutes les pages
   (bandeau, navigation, footer, réassurance). Le choix persiste et déclenche
   un re-rendu via l'événement 'lc151:lang'. Le corps produit (descriptions,
   fiches) reste géré côté contenu (WordPress/WPML en production). */
(function () {
  var DICT = {
    fr: {
      ann_free: 'Livraison offerte dès 100 € · Authentification garantie',
      ann_contact: 'Nous contacter', ann_login: 'Connexion',
      search_ph: 'Rechercher une carte, une série, un coffret…', ok: 'OK',
      nav_home: 'Accueil', nav_single: "Cartes à l'unité", nav_graded: 'Cartes gradées',
      nav_sealed: 'Scellé', nav_accessory: 'Accessoires', nav_preorder: 'Précommande', nav_catalogue: 'Toute la boutique',
      h_cart: 'Panier', h_account: 'Mon compte',
      f_buy: 'Acheter', f_house: 'La maison', f_account: 'Compte',
      f_displays: 'Displays scellés', f_preorders: 'Précommandes',
      f_boutique: 'La boutique', f_auth: 'Authentification', f_about: 'À propos', f_news: 'Actualités', f_events: 'Évènements',
      f_orders: 'Mes commandes', f_addresses: 'Mes adresses', f_alerts: 'Mes alertes',
      f_desc: 'La boutique des collectionneurs Pokémon, à Vienne. On déniche, on authentifie et on conseille.',
      f_copyright: '© 2026 leclub151. Tous droits réservés.',
      f_cookies: 'Utilisation des cookies', f_terms: "Conditions d'utilisation", f_privacy: 'Politique de confidentialité',
      f_soon: 'Disponible prochainement',
      r_auth_t: 'Authentification garantie', r_auth_s: 'Chaque pièce vérifiée',
      r_ship_t: 'Livraison offerte', r_ship_s: 'Dès 100 € d’achat',
      r_pay_t: 'Paiement sécurisé', r_pay_s: 'CB · PayPal · Apple Pay',
    },
    en: {
      ann_free: 'Free shipping over €100 · Authenticity guaranteed',
      ann_contact: 'Contact us', ann_login: 'Sign in',
      search_ph: 'Search a card, a set, a box…', ok: 'GO',
      nav_home: 'Home', nav_single: 'Single cards', nav_graded: 'Graded cards',
      nav_sealed: 'Sealed', nav_accessory: 'Accessories', nav_preorder: 'Pre-order', nav_catalogue: 'Shop all',
      h_cart: 'Cart', h_account: 'My account',
      f_buy: 'Shop', f_house: 'The shop', f_account: 'Account',
      f_displays: 'Sealed displays', f_preorders: 'Pre-orders',
      f_boutique: 'Our store', f_auth: 'Authentication', f_about: 'About', f_news: 'News', f_events: 'Events',
      f_orders: 'My orders', f_addresses: 'My addresses', f_alerts: 'My alerts',
      f_desc: 'The Pokémon collectors’ shop in Vienne, France. We source, authenticate and advise.',
      f_copyright: '© 2026 leclub151. All rights reserved.',
      f_cookies: 'Cookie usage', f_terms: 'Terms of use', f_privacy: 'Privacy policy',
      f_soon: 'Coming soon',
      r_auth_t: 'Authenticity guaranteed', r_auth_s: 'Every item verified',
      r_ship_t: 'Free shipping', r_ship_s: 'On orders over €100',
      r_pay_t: 'Secure payment', r_pay_s: 'Card · PayPal · Apple Pay',
    },
    es: {
      ann_free: 'Envío gratis desde 100 € · Autenticidad garantizada',
      ann_contact: 'Contáctanos', ann_login: 'Iniciar sesión',
      search_ph: 'Buscar una carta, una serie, una caja…', ok: 'IR',
      nav_home: 'Inicio', nav_single: 'Cartas sueltas', nav_graded: 'Cartas gradadas',
      nav_sealed: 'Sellado', nav_accessory: 'Accesorios', nav_preorder: 'Reserva', nav_catalogue: 'Toda la tienda',
      h_cart: 'Cesta', h_account: 'Mi cuenta',
      f_buy: 'Comprar', f_house: 'La tienda', f_account: 'Cuenta',
      f_displays: 'Displays sellados', f_preorders: 'Reservas',
      f_boutique: 'Nuestra tienda', f_auth: 'Autenticación', f_about: 'Quiénes somos', f_news: 'Noticias', f_events: 'Eventos',
      f_orders: 'Mis pedidos', f_addresses: 'Mis direcciones', f_alerts: 'Mis alertas',
      f_desc: 'La tienda de coleccionistas Pokémon en Vienne, Francia. Buscamos, autentificamos y asesoramos.',
      f_copyright: '© 2026 leclub151. Todos los derechos reservados.',
      f_cookies: 'Uso de cookies', f_terms: 'Condiciones de uso', f_privacy: 'Política de privacidad',
      f_soon: 'Próximamente',
      r_auth_t: 'Autenticidad garantizada', r_auth_s: 'Cada pieza verificada',
      r_ship_t: 'Envío gratis', r_ship_s: 'Desde 100 € de compra',
      r_pay_t: 'Pago seguro', r_pay_s: 'Tarjeta · PayPal · Apple Pay',
    },
    de: {
      ann_free: 'Kostenloser Versand ab 100 € · Echtheit garantiert',
      ann_contact: 'Kontakt', ann_login: 'Anmelden',
      search_ph: 'Karte, Serie oder Box suchen…', ok: 'LOS',
      nav_home: 'Start', nav_single: 'Einzelkarten', nav_graded: 'Gegradete Karten',
      nav_sealed: 'Versiegelt', nav_accessory: 'Zubehör', nav_preorder: 'Vorbestellung', nav_catalogue: 'Ganzer Shop',
      h_cart: 'Warenkorb', h_account: 'Mein Konto',
      f_buy: 'Kaufen', f_house: 'Der Laden', f_account: 'Konto',
      f_displays: 'Versiegelte Displays', f_preorders: 'Vorbestellungen',
      f_boutique: 'Unser Laden', f_auth: 'Authentifizierung', f_about: 'Über uns', f_news: 'Neuigkeiten', f_events: 'Events',
      f_orders: 'Meine Bestellungen', f_addresses: 'Meine Adressen', f_alerts: 'Meine Alerts',
      f_desc: 'Der Pokémon-Sammlerladen in Vienne, Frankreich. Wir beschaffen, prüfen und beraten.',
      f_copyright: '© 2026 leclub151. Alle Rechte vorbehalten.',
      f_cookies: 'Cookie-Nutzung', f_terms: 'Nutzungsbedingungen', f_privacy: 'Datenschutz',
      f_soon: 'Demnächst',
      r_auth_t: 'Echtheit garantiert', r_auth_s: 'Jedes Stück geprüft',
      r_ship_t: 'Kostenloser Versand', r_ship_s: 'Ab 100 € Bestellwert',
      r_pay_t: 'Sichere Zahlung', r_pay_s: 'Karte · PayPal · Apple Pay',
    },
    it: {
      ann_free: 'Spedizione gratis da 100 € · Autenticità garantita',
      ann_contact: 'Contattaci', ann_login: 'Accedi',
      search_ph: 'Cerca una carta, un set, una box…', ok: 'VAI',
      nav_home: 'Home', nav_single: 'Carte singole', nav_graded: 'Carte gradate',
      nav_sealed: 'Sigillato', nav_accessory: 'Accessori', nav_preorder: 'Preordine', nav_catalogue: 'Tutto lo shop',
      h_cart: 'Carrello', h_account: 'Il mio account',
      f_buy: 'Acquista', f_house: 'Il negozio', f_account: 'Account',
      f_displays: 'Display sigillati', f_preorders: 'Preordini',
      f_boutique: 'Il negozio', f_auth: 'Autenticazione', f_about: 'Chi siamo', f_news: 'Novità', f_events: 'Eventi',
      f_orders: 'I miei ordini', f_addresses: 'I miei indirizzi', f_alerts: 'I miei avvisi',
      f_desc: 'Il negozio per collezionisti Pokémon a Vienne, Francia. Cerchiamo, autentichiamo e consigliamo.',
      f_copyright: '© 2026 leclub151. Tutti i diritti riservati.',
      f_cookies: 'Uso dei cookie', f_terms: 'Condizioni d’uso', f_privacy: 'Informativa sulla privacy',
      f_soon: 'Prossimamente',
      r_auth_t: 'Autenticità garantita', r_auth_s: 'Ogni pezzo verificato',
      r_ship_t: 'Spedizione gratuita', r_ship_s: 'Da 100 € di spesa',
      r_pay_t: 'Pagamento sicuro', r_pay_s: 'Carta · PayPal · Apple Pay',
    },
    nl: {
      ann_free: 'Gratis verzending vanaf €100 · Echtheid gegarandeerd',
      ann_contact: 'Contact', ann_login: 'Inloggen',
      search_ph: 'Zoek een kaart, set of box…', ok: 'GA',
      nav_home: 'Home', nav_single: 'Losse kaarten', nav_graded: 'Graded kaarten',
      nav_sealed: 'Verzegeld', nav_accessory: 'Accessoires', nav_preorder: 'Pre-order', nav_catalogue: 'Hele shop',
      h_cart: 'Winkelwagen', h_account: 'Mijn account',
      f_buy: 'Kopen', f_house: 'De winkel', f_account: 'Account',
      f_displays: 'Verzegelde displays', f_preorders: 'Pre-orders',
      f_boutique: 'Onze winkel', f_auth: 'Authenticatie', f_about: 'Over ons', f_news: 'Nieuws', f_events: 'Evenementen',
      f_orders: 'Mijn bestellingen', f_addresses: 'Mijn adressen', f_alerts: 'Mijn meldingen',
      f_desc: 'De Pokémon-verzamelwinkel in Vienne, Frankrijk. Wij zoeken, verifiëren en adviseren.',
      f_copyright: '© 2026 leclub151. Alle rechten voorbehouden.',
      f_cookies: 'Cookiegebruik', f_terms: 'Gebruiksvoorwaarden', f_privacy: 'Privacybeleid',
      f_soon: 'Binnenkort',
      r_auth_t: 'Echtheid gegarandeerd', r_auth_s: 'Elk stuk geverifieerd',
      r_ship_t: 'Gratis verzending', r_ship_s: 'Vanaf €100 besteld',
      r_pay_t: 'Veilig betalen', r_pay_s: 'Kaart · PayPal · Apple Pay',
    },
  };

  function getLang() {
    try { return localStorage.getItem('lc151_lang') || 'fr'; } catch (e) { return 'fr'; }
  }
  function setLang(code) {
    if (!DICT[code]) return;
    try { localStorage.setItem('lc151_lang', code); } catch (e) {}
    document.documentElement.setAttribute('lang', code);
    window.dispatchEvent(new CustomEvent('lc151:lang', { detail: code }));
  }
  function t(key) {
    var lang = getLang();
    return (DICT[lang] && DICT[lang][key]) || DICT.fr[key] || key;
  }
  // apply saved lang attribute on load
  try { document.documentElement.setAttribute('lang', getLang()); } catch (e) {}

  window.lcI18n = { DICT: DICT, t: t, getLang: getLang, setLang: setLang, langs: [['fr','Français','🇫🇷'],['en','English','🇬🇧'],['es','Español','🇪🇸'],['de','Deutsch','🇩🇪'],['it','Italiano','🇮🇹'],['nl','Nederlands','🇳🇱']] };
})();
