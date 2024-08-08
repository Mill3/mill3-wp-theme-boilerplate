<?php

namespace Mill3WP\Sentry;

use Mill3WP\Assets;


// Insert sentry.js
add_action('wp_enqueue_scripts', function() {
    if( WEBPACK_DEV_SERVER === true || !defined('SENTRY_DSN_JS') || empty(SENTRY_DSN_JS) ) return;

    wp_enqueue_script(
        'mill3wp/js-sentry',
        Assets\Asset_File_path('sentry', 'js'),
        [],
        null,
        ['strategy' => 'async', 'in_footer' => false]
    );
    
}, 90);


// Links Preconnect
add_action('wp_head', function() {
    if( WEBPACK_DEV_SERVER === true || !defined('SENTRY_DSN_JS') || empty(SENTRY_DSN_JS) ) return;

    preg_match('/(https:\/\/)([^@]+)@([^\/]+\/)(\d+)/', SENTRY_DSN_JS, $matches);
    $url = $matches[1] . $matches[3];

    echo '<link rel="preconnect" href="' . $url . '" crossorigin>';    
}, 5);
