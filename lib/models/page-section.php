<?php

namespace Mill3WP\PostQueries\PageSection;

use Mill3WP\PostQueries;
use Timber;


/**
 * Show post-type queries
 */

class PageSectionQueries extends PostQueries\Theme_PostQueries
{

    public function get($slug, $classname = null)
    {

        $args = array(
            'name' => $slug,
            'post_type' => 'page_section',
            'posts_per_page' => 1
        );

        $post = self::run_query($args);

        $context = Timber\Timber::context();

        // stop here if none found
        if( !$post ) {
            $context['post'] = null;
            $context['slug'] = $slug;

            $template = "post-type/page-section/page-section-single.twig";
            Timber\Timber::render($template, $context);
        } else {
            $context['post'] = $post[0];
            $context['classname'] = $classname;

            $template = "post-type/page-section/page-section-single.twig";
            Timber\Timber::render($template, $context);
        }

    }
}


/**
 * Register Twig functions refering to various model queries
 */

add_filter('timber/twig', __NAMESPACE__ . '\\add_to_twig');

function add_to_twig($twig)
{
    $twig->addFunction(
        new \Twig\TwigFunction('PageSection', function ($slug = null, $classname = null) {
            return (new \Mill3WP\PostQueries\PageSection\PageSectionQueries())->get($slug, $classname);
        })
    );

    return $twig;
}
