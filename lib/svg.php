<?php

namespace Mill3WP\Svg;

/**
 * Enable extra allowed mime types
 */
add_filter('upload_mimes', function($mimes) {
    $mimes['svg'] = 'image/svg+xml';
    return $mimes;
});


// Allow SVG
// https://codepen.io/chriscoyier/post/wordpress-4-7-1-svg-upload
add_filter('wp_check_filetype_and_ext', function($data, $file, $filename, $mimes) {

    /*
    global $wp_version;
    if ( $wp_version !== '4.7.1' ) return $data;
    */

    $filetype = wp_check_filetype( $filename, $mimes );

    return [
        'ext' => $filetype['ext'],
        'type' => $filetype['type'],
        'proper_filename' => $data['proper_filename']
    ];

}, 10, 4 );


// Print css code to correctly display SVG in Admin
add_action('admin_head', function() {
    echo '<style type="text/css">
            .attachment-266x266, .thumbnail img {
                width: 100% !important;
                height: auto !important;
            }
        </style>';
});
