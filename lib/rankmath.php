<?php

namespace Mill3WP\RankMath;
use RankMath\Helper as RankMathHelper;

// expose breadcrumb function to Twig
add_filter('timber/twig/functions', function($functions) {

    $functions['breadcrumb'] = [
        'callable' => function_exists('rank_math_the_breadcrumbs') ?
            'rank_math_the_breadcrumbs' :
            function() { return "RankMath plugin is not installed"; }
    ];

    return $functions;
});

/**
 * Allow changing or removing the Breadcrumb items
 *
 * @param array       $crumbs The crumbs array.
 * @param Breadcrumbs $this   Current breadcrumb object.
 */

add_filter('rank_math/frontend/breadcrumb/items', function ($crumbs, $class) {

        // do nothing with taxonomies
        if( is_tax() || is_tag() || is_category() ) return $crumbs;

        // try to get post_type from archive route
        if (is_archive()) {
            $post_type = get_queried_object();
        }

        // try to get post_type from singular route
        if (is_singular()) {
            $post = get_queried_object();
            $post_type = get_post_type_object(get_post_type($post));
        }

        // search page
        if (is_search()) {
            // translate last items
            $crumbs[count($crumbs) - 1][0] = __('Search for %s', 'mill3wp');
            return $crumbs;
        }

        // when has a post_type, try to modify breadcrumb post-type singular to its name (plural)
        if (isset($post_type)) {
            foreach ($crumbs as $key => $crumb) {
                if ($crumb[0] === $post_type->labels->singular_name) {
                    $crumbs[$key][0] = $post_type->labels->name;
                }
            }
        }

        return $crumbs;
    },
    10,
    2
);


// disable Slack enhanced data output, like "Written by : Author Name" in opengraph meta
add_filter('rank_math/opengraph/slack_enhanced_data', function() {
    return [];
});


// remove useless inline css from frontend
add_action('wp_enqueue_scripts', function() {
    wp_dequeue_style('rank-math-toc-block-style');
}, 100);
