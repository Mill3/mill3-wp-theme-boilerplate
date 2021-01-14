<?php

namespace Mill3WP\Barba;


function barba_namespace() {
    global $post;

    if( is_front_page() ) return 'home';
    else if( is_home() ) return 'archive';
    else if( is_singular() ) {
        if( is_single() ) return get_post_type();
        if( is_page() ) {
            $template = get_page_template_slug();

            if( $template ) return 'page-'.substr($template, 0, -4);
            else return 'page';
        }

        return 'post';
    }
    else if( is_tax() ) return 'taxonomy-'.get_query_var('taxonomy');
    else if( is_archive() ) return 'archive-'.get_post_type();
    else if( is_search() ) return 'search';
    else if( is_404() ) return 'error404';

    return null;
};
