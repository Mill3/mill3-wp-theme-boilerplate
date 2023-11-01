<?php

namespace Mill3WP\PostQueries\PageSection;

// use Mill3WP\PostQueries;
use Timber;

/**
 * Show post-type queries
 */

class PageSectionQueries
{

    public function get($slug, $classname = null)
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
