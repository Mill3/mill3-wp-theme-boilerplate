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
    $css_relative = str_replace(
        '/wp-content/themes/mill3wp/',
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
