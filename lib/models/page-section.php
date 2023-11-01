<?php

namespace Mill3WP\Models;

use Timber;

/**
 * Show post-type queries
 */

class PageSectionQueries extends Mill3AbstractPost {

    public static function get($slug, $classname = null)
    {
        // set context
        $context = Timber\Timber::context();

        // get post
        $args = array(
            'name' => $slug,
            'post_type' => 'page_section'
        );
        $post = Timber::get_post($args);

        // stop here if none found
        if( !$post ) {
            $context['post'] = null;
            $context['slug'] = $slug;

            $template = "post-type/page-section/page-section-single.twig";
            Timber\Timber::render($template, $context);
        } else {
            $context['post'] = $post;
            $context['classname'] = $classname;

            $template = "post-type/page-section/page-section-single.twig";
            Timber\Timber::render($template, $context);
        }

    }
}


/**
 * Register Twig functions refering to this class
 */

add_filter('timber/twig/functions', function($functions) {
    $functions['PageSection'] = ['callable' => [PageSectionQueries::class, 'get']];
    return $functions;
});
