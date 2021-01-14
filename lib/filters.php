<?php

/**
 * Add classNames to body for various site-header state handling
 */

function theme_body_class($classes) {
    global $post;

    // invert site-header's color for home
    if ( is_front_page() ) {
        $classes[] = 'site-header-inverted';
    }

    return $classes;
}

//add_filter( 'body_class', 'theme_body_class', 11, 2);
