<?php
/**
 * Plugin Name: CLUB 151 — pont d'authentification
 * Description: Permet au site club151.fr de vérifier un mot de passe client et de déclencher une réinitialisation. Rien d'autre.
 * Version:     1.0.0
 *
 * ---------------------------------------------------------------------------
 * POURQUOI CE FICHIER EXISTE
 * ---------------------------------------------------------------------------
 * L'API REST de WooCommerce sait CRÉER un client avec un mot de passe, mais
 * elle ne sait pas le VÉRIFIER : aucun point d'entrée ne répond à « ce mot de
 * passe est-il le bon ? ». Ce pont comble exactement ce manque, et rien de plus.
 *
 * CE QU'IL NE FAIT PAS, VOLONTAIREMENT :
 *  - il ne stocke aucun mot de passe (WordPress détient le haché, comme avant) ;
 *  - il ne journalise jamais un mot de passe ;
 *  - il n'ouvre aucune session WordPress — la session vit côté site, dans un
 *    cookie signé (lib/session.js).
 *
 * ---------------------------------------------------------------------------
 * INSTALLATION (une seule fois)
 * ---------------------------------------------------------------------------
 * 1. cPanel → Gestionnaire de fichiers → dossier gestion.club151.fr →
 *    wp-content/  →  crée un dossier « mu-plugins » s'il n'existe pas.
 *    (« mu » = must-use : actif d'office, impossible à désactiver par erreur.)
 *
 * 2. Dépose ce fichier dedans :  wp-content/mu-plugins/lc151-auth.php
 *
 * 3. Modifie wp-config.php et ajoute, sous les lignes WP_HOME / WP_SITEURL :
 *
 *        define('LC151_AUTH_SECRET', 'colle-ici-une-longue-chaine-aleatoire');
 *
 *    Génère la chaîne avec :
 *        node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
 *
 * 4. Mets EXACTEMENT la même valeur dans Vercel, variable WP_AUTH_SECRET.
 *
 * Ce secret empêche que ce point d'entrée serve à tester des mots de passe en
 * masse. Sans lui, le pont refuse toute requête.
 * ---------------------------------------------------------------------------
 */

if (!defined('ABSPATH')) {
    exit; // Accès direct au fichier interdit.
}

add_action('rest_api_init', function () {
    register_rest_route('lc151/v1', '/verify', array(
        'methods'             => 'POST',
        'callback'            => 'lc151_verify_password',
        'permission_callback' => 'lc151_check_secret',
    ));
    register_rest_route('lc151/v1', '/reset', array(
        'methods'             => 'POST',
        'callback'            => 'lc151_request_reset',
        'permission_callback' => 'lc151_check_secret',
    ));
});

/**
 * Seul l'appelant qui connaît le secret partagé passe. Comparaison en temps
 * constant (hash_equals) : une comparaison naïve laisserait deviner le secret
 * caractère par caractère en mesurant le temps de réponse.
 */
function lc151_check_secret($request) {
    $expected = defined('LC151_AUTH_SECRET') ? (string) LC151_AUTH_SECRET : '';
    if (strlen($expected) < 32) {
        return false; // Secret absent ou trop court → pont fermé.
    }
    $given = (string) $request->get_header('x-lc151-secret');
    return hash_equals($expected, $given);
}

/**
 * Vérifie un couple e-mail / mot de passe.
 * Renvoie 200 { ok:true, customer_id } ou 401 { ok:false }.
 *
 * La réponse est IDENTIQUE que le compte n'existe pas ou que le mot de passe
 * soit faux : distinguer les deux dirait à un attaquant quelles adresses sont
 * clientes de la boutique.
 */
function lc151_verify_password($request) {
    $email    = sanitize_email((string) $request->get_param('email'));
    $password = (string) $request->get_param('password');

    if (empty($email) || $password === '') {
        return new WP_REST_Response(array('ok' => false), 400);
    }

    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_REST_Response(array('ok' => false), 401);
    }

    // wp_check_password compare au haché stocké par WordPress : le mot de passe
    // en clair ne sort jamais d'ici et n'est jamais écrit nulle part.
    if (!wp_check_password($password, $user->user_pass, $user->ID)) {
        return new WP_REST_Response(array('ok' => false), 401);
    }

    return new WP_REST_Response(array(
        'ok'          => true,
        'customer_id' => (int) $user->ID,
    ), 200);
}

/**
 * Déclenche l'e-mail « mot de passe oublié » de WordPress.
 *
 * Répond TOUJOURS 200, même si l'adresse est inconnue : sinon ce point d'entrée
 * deviendrait un moyen de savoir qui a un compte chez toi.
 */
function lc151_request_reset($request) {
    $email = sanitize_email((string) $request->get_param('email'));

    if (!empty($email)) {
        $user = get_user_by('email', $email);
        if ($user && function_exists('retrieve_password')) {
            // retrieve_password() gère la clé, l'expiration et l'envoi.
            retrieve_password($user->user_login);
        }
    }

    return new WP_REST_Response(array('ok' => true), 200);
}
