<?php

use Mill3WP\Cache\CacheInstance;

/*
 * return a JSON formatted list of URLs to prefetch by windmill.js
 */
function windmill_prefetch() {
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
    $options = get_fields('options');

    // if ACF options page doesn't exist OR prefetching field is empty, stop here
    if( !$options || !$options['prefetching'] ) {
        $cache->save_cache($cache_key, json_encode(NULL), MONTH_IN_SECONDS);
        echo json_encode(NULL);
        exit;
    }

    // get textarea value
    $urls = $options['prefetching'];

    // if textarea value is empty, stop here
    if( empty($urls) ) {
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

// create rewrite rules per languages
add_filter('generate_rewrite_rules', function($wp_rewrite) {
    $rules = [];

    if( function_exists('pll_languages_list') ) {
        $languages = pll_languages_list(array('hide_empty' => 0, 'fields' => 'slug'));

        foreach($languages as $language) $rules["^$language/windmill-prefetch(/)?$"] = 'index.php?windmill_prefetch=1';
    } else {
        $rules['^windmill-prefetch(/)?$'] = 'index.php?windmill_prefetch=1';
    }

    //$rules = apply_filters( 'taigamotors_rewrite_rules', $rules );
    $wp_rewrite->rules = array_merge( $rules, $wp_rewrite->rules );
});

// define "windmill_prefetch" query variable
add_filter('query_vars', function($query_vars) {
    $query_vars[] = 'windmill_prefetch';

    return $query_vars;
});

// output response for windmill-prefetch permalink
add_action('template_include', function($template) {
    if( get_query_var( 'windmill_prefetch' ) == false || get_query_var( 'windmill_prefetch' ) == '' ) {
        return $template;
    }

    windmill_prefetch();
});

// clear caching when Theme Options are updated
add_action('acf/options_page/save', function($post_id, $menu_slug) {
    if( $menu_slug !== 'theme-options' ) return;

    // create cache key
    $cache = new CacheInstance();
    $cache_key = $cache->cache_key('windmill', 'prefetch');
    $cache->delete_cache($cache_key);

}, 10, 2);
