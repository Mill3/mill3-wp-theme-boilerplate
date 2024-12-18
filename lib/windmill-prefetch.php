<?php

use Mill3WP\Cache\CacheInstance;

/*
 * WP_AJAX for requesting a list of URLs to prefetch by windmill.js
 */
function windmill_prefetch(): void {
    // create cache key
    $cache = new CacheInstance();
    $cache_key = $cache->cache_key('windmill', 'prefetch');

    // check cache and return if exists
    $cached = $cache->get_cache($cache_key);
    if( $cached ) {
        echo $cached;
        die();
    }

    // if ACF isn't installed, stop here
    if( !\class_exists('ACF') ) {
        $cache->save_cache($cache_key, json_encode(NULL), MONTH_IN_SECONDS);
        echo json_encode(NULL);
        exit;
    }

    // get ACF options page
    $options = function_exists('get_fields') ? get_fields('options') : null;

    // if ACF options page doesn't exist OR prefetching field is empty, stop here
    if( !$options || !$options['prefetching'] ) {
        $cache->save_cache($cache_key, json_encode(NULL), MONTH_IN_SECONDS);
        echo json_encode(NULL);
        exit;
    }

    // get textarea value
    $urls = $options['prefetching'];

    // if textarea value is empty, stop here
    if( count($urls) > 0 ) {
        $cache->save_cache($cache_key, json_encode(NULL), MONTH_IN_SECONDS);
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
    $urls = json_encode($urls);

    // save $urls to cache
    $cache->save_cache($cache_key, $urls, MONTH_IN_SECONDS);

    echo $urls;
    die();
}

// URL: /wp-admin/admin-ajax.php?action=windmill_prefetch
add_action('wp_ajax_windmill_prefetch', __NAMESPACE__ . '\\windmill_prefetch');
add_action('wp_ajax_nopriv_windmill_prefetch', __NAMESPACE__ . '\\windmill_prefetch');


// clear caching when Theme Options are updated
add_action('acf/options_page/save', function($post_id, $menu_slug) {
    if( $menu_slug !== 'theme-options' ) return;

    // create cache key
    $cache = new CacheInstance();
    $cache_key = $cache->cache_key('windmill', 'prefetch');
    $cache->delete_cache($cache_key);

}, 10, 2);
