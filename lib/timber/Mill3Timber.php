<?php

namespace Mill3WP\Timber;

use Timber;

/*
  This class serves as a replacement for the Timber class, overriding here any built-in Timber methods that need to be customized.
*/

class Mill3Timber extends Timber\Timber {

    /**
     * Gets the global context.
     *
     * The context always contains the global context with the following variables:
     *
     * - `site` – An instance of `Timber\Site`.
     * - `request` - An instance of `Timber\Request`.
     * - `theme` - An instance of `Timber\Theme`.
     * - `user` - An instance of `Timber\User`.
     * - `http_host` - The HTTP host.
     * - `wp_title` - Title retrieved for the currently displayed page, retrieved through
     * `wp_title()`.
     * - `body_class` - The body class retrieved through `get_body_class()`.
     *
     * The global context will be cached, which means that you can call this function again without
     * losing performance.
     *
     * In addition to that, the context will contain template contexts depending on which template
     * is being displayed. For archive templates, a `posts` variable will be present that will
     * contain a collection of `Timber\Post` objects for the default query. For singular templates,
     * a `post` variable will be present that that contains a `Timber\Post` object of the `$post`
     * global.
     *
     * @api
     * @since 2.0.0
     *
     * @param array $extra Any extra data to merge in. Overrides whatever is already there for this
     *                     call only. In other words, the underlying context data is immutable and
     *                     unaffected by passing this param.
     *
     * @return array An array of context variables that is used to pass into Twig templates through
     *               a render or compile function.
     */
    public static function context(array $extra = [])
    {
        $context = self::context_global();
        // die();

        if (\is_singular()) {
            $post = Timber\Timber::get_post();

            if( $post ) {
                $post->setup();
            }

            // NOTE: this also handles the is_front_page() case.
            $context['post'] = $post;
        } elseif (\is_home()) {
            $post = Timber\Timber::get_post();

            // When no page_on_front is set, there’s no post we can set up.
            if ($post) {
                $post->setup();
            }

            $context['post'] = $post;
            $context['posts'] = Timber\Timber::get_posts();
        } elseif (\is_category() || \is_tag() || \is_tax()) {
            $context['term'] = Timber\Timber::get_term();
            $context['posts'] = Timber\Timber::get_posts();
        } elseif (\is_search()) {
            $context['posts'] = Timber\Timber::get_posts();
            $context['search_query'] = \get_search_query();
        } elseif (\is_author()) {
            $context['author'] = Timber\Timber::get_user(\get_query_var('author'));
            $context['posts'] = Timber\Timber::get_posts();
        } elseif (\is_archive()) {
            $context['posts'] = Timber\Timber::get_posts();
        }

        return \array_merge($context, $extra);
    }

}
