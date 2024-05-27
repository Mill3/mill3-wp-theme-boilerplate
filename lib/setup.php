<?php

namespace Mill3WP\Setup;

use Mill3WP\Assets;

/**
 * Theme setup
 */
function setup()
{
    // Make theme available for translation
    load_theme_textdomain('mill3wp', get_template_directory() . '/languages');

    // unregister_block_type('core/heading');

    // Register wp_nav_menu() menus
    // http://codex.wordpress.org/Function_Reference/register_nav_menus
    register_nav_menus([
        'primary_navigation' => __('Main navigation', 'mill3wp'),
        'secondary_navigation' => __('Secondary Navigation', 'mill3wp'),
        'footer_navigation' => __('Footer navigation', 'mill3wp'),
        'social_links' => __('Social network links', 'mill3wp')
    ]);

    // Enable features
    //add_theme_support('post-formats', array('aside', 'gallery'));
    add_theme_support('rank-math-breadcrumbs');
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('menus');
    add_theme_support('editor-styles');
    add_theme_support('editor-color-palette', array(
        array(
            'name'  => 'Black',
            'slug'  => 'black',
            'color' => '#000000',
        ),
        array(
            'name'  => 'White',
            'slug'  => 'white',
            'color' => '#FFFFFF',
        )
        // array(
        //     'name'  => 'Red',
        //     'slug'  => 'red',
        //     'color' => '#863B32',
        // ),
        // array(
        //     'name'  => 'Orange',
        //     'slug'  => 'orange',
        //     'color' => '#E96A35',
        // )
    ));

    // Enable post thumbnails
    // http://codex.wordpress.org/Post_Thumbnails
    // http://codex.wordpress.org/Function_Reference/set_post_thumbnail_size
    // http://codex.wordpress.org/Function_Reference/add_image_size
    add_image_size('pixel', 100);
    add_image_size('small', 576);
    add_image_size('large', 1024);
    add_image_size('largest', 1800);
    add_image_size('largest-retina', 2800);
    add_image_size('full', '');

    // Enable HTML5 markup support
    // http://codex.wordpress.org/Function_Reference/add_theme_support#HTML5
    add_theme_support('html5', array(
        'comment-list',
        'comment-form',
        'search-form',
        'gallery',
        'caption'
    ));

    // Use main stylesheet for visual editor
    // To add custom styles edit /assets/styles/layouts/_tinymce.scss
    add_editor_style(Assets\Asset_File_path('editor-style', 'css'));
}
add_action('after_setup_theme', __NAMESPACE__ . '\\setup');

/**
 * Theme assets
 */
function assets()
{
    // *****
    // external scripts
    // wp_enqueue_script('mill3wp/gmaps', "https://maps.googleapis.com/maps/api/js?key=[key]&libraries=places&language={$language}", null, true, true);
    // *****

    // webpack dev
    if (WEBPACK_DEV_SERVER === true) {
        wp_enqueue_script(
            'mill3wp/webpack',
            "http://localhost:{$_ENV['WEBPACK_DEV_SERVER_PORT']}/js/app.bundle.js",
            null,
            null,
            true
        );
    } else {
        wp_enqueue_style(
            'mill3wp/css',
            Assets\Asset_File_path('style', 'css'),
            false,
            null
        );
        wp_enqueue_script(
            'mill3wp/js',
            Assets\Asset_File_path('app', 'js'),
            [],
            null,
            true
        );
    }

    // inject global Wordpress variables to Javascript
    $wp_endpoints = array(
        'locale' => function_exists('pll_current_language') ? pll_current_language() : get_locale(),
        'current_site' => get_site_url(),
        'admin_ajax' => admin_url('admin-ajax.php'),
        //'rest-api' => get_rest_url(null, 'wp/v2/'),
        //'nonce' => wp_create_nonce('tdp_nonce'),
    );

    wp_add_inline_script(WEBPACK_DEV_SERVER === true ? 'mill3wp/webpack' : 'mill3wp/js', 'window.MILL3WP = '.json_encode($wp_endpoints).';', 'before');

    // remove core scripts and freaking emoji
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    
    wp_deregister_script('wp-polyfill');
    wp_deregister_script('regenerator-runtime');
}

add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\assets', 100);


// Remove wp-embed.min.js
add_action('wp_footer', function(){ wp_deregister_script( 'wp-embed' ); });

// Remove classic-themes.css
add_action('wp_enqueue_scripts', function(){ wp_dequeue_style( 'classic-theme-styles' ); }, 20 );

/*
 * Modify TinyMCE editor to remove H1.
 */
function mill3wp_tiny_mce_remove_unused_formats($init)
{
    // Add block format elements you want to show in dropdown
    $init['block_formats'] =
        'Paragraph=p;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6;Address=address;Pre=pre;Blockquote=blockquote;';
    return $init;
}

add_filter(
    'tiny_mce_before_init',
    __NAMESPACE__ . '\\mill3wp_tiny_mce_remove_unused_formats'
);


/**
 * Filters WordPress' default menu order
 */
function mill3wp_admin_menu_order( $menu_order ) {
    // define your new desired menu positions here
    // for example, move 'upload.php' to position #9 and built-in pages to position #1
    $new_positions = array(
        //'upload.php' => 9,
        'index.php' => 1,
        'edit.php?post_type=page' => 2
    );

    // helper function to move an element inside an array
    function move_element(&$array, $a, $b) {
        $out = array_splice($array, $a, 1);
        array_splice($array, $b, 0, $out);
    }

    // traverse through the new positions and move
    // the items if found in the original menu_positions
    foreach( $new_positions as $value => $new_index ) {
        if( $current_index = array_search( $value, $menu_order ) ) {
            move_element($menu_order, $current_index, $new_index);
        }
    }

    return $menu_order;
};

// Activate 'menu_order' filter
add_filter('custom_menu_order', function() { return true; });

// Change admin menu order
add_filter('menu_order', __NAMESPACE__ . '\\mill3wp_admin_menu_order');


// Set directory for Admin Columns settings
add_filter('acp/storage/file/directory', function() {
  return get_stylesheet_directory() . '/acp-settings';
});

// Remove WP Admin Bar in frontend
add_filter( 'show_admin_bar', '__return_false' );

/**
 * Enable extra allowed mime types
 */
add_filter('upload_mimes', function($mimes) {
    $mimes['json'] = 'application/json';
    return $mimes;
});
