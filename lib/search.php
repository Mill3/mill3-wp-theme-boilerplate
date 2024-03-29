<?php

namespace Mill3WP\Search;

// create rewrite rules for search page without search query
// make beautiful empty search page url: domain.com/fr/recherche instead of domain.com?s=
//
// IT'S IMPORTANT TO CHANGE URL SLUG IN POLYLANG TRANSLATIONS TO MAKE THIS WORK IN FRENCH
add_action('init', function() {
    add_rewrite_rule('^fr/recherche(/)?$', 'index.php?s=', 'top');
    add_rewrite_rule('^en/search(/)?$', 'index.php?s=', 'top');
});


// modify document title for search
add_filter('document_title_parts', function($title_parts_array) {
    if ( is_search() ) {
        $search_query = get_search_query();

        if( !empty($search_query) ) $title_parts_array['title'] = sprintf(__('Search Results for &#8220;%s&#8221;'), $search_query);
        else $title_parts_array['title'] = __('Search', 'mill3wp');
    }

    return $title_parts_array;
});

// Fix a bug in RankMath that was short-circuiting wp_get_document_title with search results
add_filter('rank_math/frontend/title', function( $title ) {
    if( is_search() ) return '';
    return $title;
});

// enable search results to be filtered by post_type=page
add_filter('pre_get_posts', function($query) {
    if( $query->is_search && !$query->is_admin ) {

        // get post_type from query
        $post_type = $query->get('post_type');

        // if post_type is not set
        if( !$post_type ) {

            // get value from $_GET['post_type']
            $post_type = isset($_GET['post_type']) ? $_GET['post_type'] : null;

            // if value from $_GET is null, set to any
            if( !$post_type ) $post_type = 'any';

            // update query
            $query->set('post_type', $post_type);
        }
    }

    return $query;
});



/*
 * Register Twig functions refering to various model queries
 */

add_filter('timber/twig', __NAMESPACE__ . '\\add_to_twig');

function add_to_twig($twig)
{
    $twig->addFunction(
        new \Twig\TwigFunction('get_search_page_link', function () {
            $search_link = get_search_link();
            $search_query = get_search_query();

            return !empty($search_query) ? str_replace($search_query . '/', '', $search_link) : $search_link;
        })
    );

    return $twig;
}
