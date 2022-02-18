<?php

/**
 * This file is part of Mill3WP theme.
 * 2020 (c) Mill3 Studio
 * @version 0.0.1
 *
 * @since 0.0.1
 *
 */

use Mill3WP\Assets;

//define('GOOGLE_API_KEY', 'YOUR_API_KEY');

/**
 * Set layout's thumbnail in ACF Layout Selector Modal
 */
add_filter('acfe/flexible/thumbnail/layout=YOUR_LAYOUT_NAME', 'acf_flexible_layout_thumbnail', 10, 3);

function acf_flexible_layout_thumbnail($thumbnail, $field, $layout) {
    $filename = $layout['name'];
    $extensions = ['.jpg', '.png', '.gif'];
    $path = '/acf-json/thumbnails/' . $filename;

    foreach($extensions as $extension) {
        if (file_exists(get_theme_file_path($path . $extension))) {
            return get_stylesheet_directory_uri() . $path . $extension;
        }
    }
}

// add_filter('acf/settings/show_admin', 'acf_show_admin', 10, 3);

// function acf_show_admin() {
//     if( null !== THEME_DEV && THEME_DEV === true ) {
//         return true;
//     } else {
//         return false;
//     }
// }


// Set a custom name for collapsed layouts in ACF Flexible Content field
add_filter('acf/fields/flexible_content/layout_title/name=YOUR_LAYOUT_NAME', function($title, $field, $layout, $i) {

    switch($layout['name']) {
        case 'partners_group':
            $name = get_sub_field('name');
            return "{$name} <em>({$title})</em>";
        break;
    }

    return $title;
}, 10, 4);


// Theme colors
add_filter('acf/load_field/name=theme_color', function ($field) {
    $options = get_fields('options');
    //$primary_value = $options['brand_color_primary'] ?? '';

    $field['choices'] = [
        "" => "",
        "white" => "Fond blanc avec texte noir",
        "gray" => "Fond gris avec texte noir",
        "primary" => "Couleur principale (${primary_value})",
        "black" => "Fond noir avec texte blanc",
    ];

    return $field;
});

// Populate select field with Gravity Form entries
add_filter('acf/load_field/name=gravity_form_id', function ($field) {
    // if plugin is not activated, do nothing
    if ( !class_exists('GFAPI') ) return $field;

    $forms = GFAPI::get_forms(true);
    foreach ($forms as $key => $form) {
        $field['choices'][$form['id']] = $form['title'];
    }

    return $field;
});

if( defined('GOOGLE_API_KEY') ) {
    add_action('acf/init', function() { acf_update_setting('google_api_key', GOOGLE_API_KEY); });
}

