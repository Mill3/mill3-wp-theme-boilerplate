<?php

/*
 * WP_AJAX for requesting a list of URLs to prefetch by windmill.js
 */
function windmill_prefetch() {

    // if ACF isn't installed, stop here
    if( !\class_exists('ACF') ) {
        echo json_encode(NULL);
        exit;
    }

    // get ACF options page
    $options = get_fields('options');

    // if ACF options page doesn't exist OR prefetching field is empty, stop here
    if( !$options || !$options['prefetching'] ) {
        echo json_encode(NULL);
        exit;
    }

    // get textarea value
    $urls = $options['prefetching'];

    // if textarea value is empty, stop here
    if( empty($urls) ) {
        echo json_encode(NULL);
        exit;
    }

    // split each lines into array
    $urls = preg_split('/\r\n|[\r\n]/', $urls);

    // trim each urls
    $urls = array_map(fn($url): string => trim($url), $urls);

    // remove invalid urls
    $urls = array_filter($urls, fn($url): bool => wp_http_validate_url($url) !== false);

    // export to JSON
    echo json_encode($urls);
    die();
}

// URL: /wp-admin/admin-ajax.php?action=windmill_prefetch
add_action('wp_ajax_windmill_prefetch', __NAMESPACE__ . '\\windmill_prefetch');
add_action('wp_ajax_nopriv_windmill_prefetch', __NAMESPACE__ . '\\windmill_prefetch');
