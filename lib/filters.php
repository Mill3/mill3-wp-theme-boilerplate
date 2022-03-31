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


/**
 * Set JPEG quality when saved in media library
 *
 * @return integer
 */
function theme_jpeg_quality() {
    return 90;
}

add_filter( 'jpeg_quality', 'theme_jpeg_quality', 11, 2 );

/**
 * Set big image maximum size threshold
 *
 * @return integer
 */
// function theme_big_image_size_threshold( $threshold, $imagesize, $file, $attachment_id ) {
//     return 5500;
// }

// add_filter( 'big_image_size_threshold', 'theme_big_image_size_threshold', 10, 4 );
