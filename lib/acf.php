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

add_filter('acf/settings/show_admin', function() {
    // for development, show ACF admin menu
    if( defined('THEME_DEV') && THEME_DEV === true ) return true;

    // get current user
    $user = wp_get_current_user();

    // if we can't find this user (it should never happen, but just in case), hide ACF admin menu
    if( !$user ) return false;

    // get user email
    $email = $user->user_email;

    // if email is not defined, hide ACF admin menu
    if( !$email ) return false;

    // show ACF admin menu if user email is from @mill3.studio
    // otherwise, hide ACF admin menu
    return str_ends_with($email, '@mill3.studio');
}, 10, 3);



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
add_filter('acf/prepare_field/name=theme_color', function ($field) {
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
add_filter('acf/prepare_field/name=gravity_form_id', function ($field) {
    // if plugin is not activated, do nothing
    if ( !class_exists('GFAPI') ) return $field;

    $forms = GFAPI::get_forms(true);
    foreach ($forms as $key => $form) {
        $field['choices'][$form['id']] = $form['title'];
    }

    return $field;
});

// Populate padding field (pt, pb, pt_lg, pb_lg)
function acf_populate_padding($field) {

    $field['default_value'] = '0';
    $field['choices'] = array(
        '0' => '0px',
        '1' => '5px',
        '2' => '10px',
        '3' => '20px',
        '4' => '30px',
        '5' => '40px',
        '6' => '50px',
        '7' => '60px',
        '8' => '90px',
        '9' => '130px',
        '10' => '200px',
    );

    return $field;
}

add_filter('acf/prepare_field/name=pt', 'acf_populate_padding');
add_filter('acf/prepare_field/name=pb', 'acf_populate_padding');
add_filter('acf/prepare_field/name=pt_lg', 'acf_populate_padding');
add_filter('acf/prepare_field/name=pb_lg', 'acf_populate_padding');

// Populate margin field (mt, mb, mt_lg, mb_lg)
function acf_populate_margin($field) {

    $field['default_value'] = '0';
    $field['choices'] = array(
        '-10' => '-200px',
        '-9' => '-130px',
        '-8' => '-90px',
        '-7' => '-60px',
        '-6' => '-50px',
        '-5' => '-40px',
        '-4' => '-30px',
        '-3' => '-20px',
        '-2' => '-10px',
        '-1' => '-5px',
        '0' => '0px',
        '1' => '5px',
        '2' => '10px',
        '3' => '20px',
        '4' => '30px',
        '5' => '40px',
        '6' => '50px',
        '7' => '60px',
        '8' => '90px',
        '9' => '130px',
        '10' => '200px',
    );

    return $field;
}

add_filter('acf/prepare_field/name=mt', 'acf_populate_margin');
add_filter('acf/prepare_field/name=mb', 'acf_populate_margin');
add_filter('acf/prepare_field/name=mt_lg', 'acf_populate_margin');
add_filter('acf/prepare_field/name=mb_lg', 'acf_populate_margin');

if( defined('GOOGLE_API_KEY') ) {
    add_action('acf/init', function() { acf_update_setting('google_api_key', GOOGLE_API_KEY); });
}

