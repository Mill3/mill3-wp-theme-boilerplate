<?php

/**
 * Add classNames to body for various site-header state handling
 */

function theme_body_class($classes) {
    global $post;

    // by default, site-header isn't inverted
    $site_header_inverted = FALSE;

    // get site_header_inverted bool from ACF values in global $post
    if( is_singular(['page']) ) $site_header_inverted = get_field('site_header_inverted', $post);

    // invert site-header's color for homepage (activate if required for your project)
    //if ( is_front_page() ) $site_header_inverted = TRUE;

    // add classname to body if site_header_inverted is TRUE
    if ( $site_header_inverted ) $classes[] = '--site-header-inverted';

    return $classes;
}

add_filter( 'body_class', 'theme_body_class', 11, 2);
