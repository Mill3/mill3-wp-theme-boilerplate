<?php

namespace Mill3WP\Editor;

use Mill3WP\Assets;

/* ---------------------------------------------------------------------
LOAD EDITOR STYLES
--------------------------------------------------------------------- */
function add_editor_stylesheet()
{
    // Get CSS from assets.json
    $editor_css = Assets\Asset_File_path('editor-style', 'css');

    if(!$editor_css) return;

    $theme_directory_url = parse_url( get_stylesheet_directory_uri(), PHP_URL_PATH );

    $css_relative = str_replace(
        $theme_directory_url,
        '',
        $editor_css
    );

    // clean filename without any params url
    $cleaned_filename = explode('?', $css_relative)[0];

    // WP admin editor expect a relative path to editor file
    // ie: not the full path with 'wp-content/themes/my-themes/...'
    add_editor_style($cleaned_filename);
}

add_action('after_setup_theme', __NAMESPACE__ . '\\add_editor_stylesheet');

/**
 * Enqueue custom Gutenberg script for our theme
 */
function add_gutenberg_scripts() {

    wp_enqueue_script(
        'mill3-blockeditor',
        get_stylesheet_directory_uri() . '/src/js/admin/blockeditor.js',
        array( 'wp-blocks', 'wp-dom' ),
        filemtime( get_stylesheet_directory() . '/src/js/admin/blockeditor.js' ),
        true
    );
}

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\add_gutenberg_scripts' );

/**
 * Enqueue custom MCE plugins
 */
function enqueue_shortcodes_scripts($plugin_array)
{
    $plugin_array["dummy"] = Assets\Asset_File_path('admin-shortcodes', 'js');
    return $plugin_array;
}

// add_filter("mce_external_plugins", __NAMESPACE__ . "\\enqueue_shortcodes_scripts");
