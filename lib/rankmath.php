<?php

namespace Mill3WP\RankMath;

/**
 * Allow changing or removing the Breadcrumb items
 *
 * @param array       $crumbs The crumbs array.
 * @param Breadcrumbs $this   Current breadcrumb object.
 */

add_filter(
    'rank_math/frontend/breadcrumb/items',
    function ($crumbs, $class) {

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
