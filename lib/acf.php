<?php

/**
 * This file is part of Mill3WP theme.
 * 2023 (c) Mill3 Studio
 * @version 0.0.1
 *
 * @since 0.0.1
 *
 */

use Mill3WP\Assets;
use Mill3WP\Timber\Mill3Timber;
/**
 * ACF block example for Gutenberg
 *
 * Function will scan /acf-json/thumbnails/ directory and search for images matching the block slug value
 *
 * Instructions :
 *
 * in directory /acf-json/thumbnails/, add images ending with numbers
 *
 * - /acf-json/thumbnails/pb-row-slug.png
 * - /acf-json/thumbnails/pb-row-other-slug-1.png
 * - /acf-json/thumbnails/pb-row-other-slug-2.png
 * - /acf-json/thumbnails/pb-row-other-slug-3.png
 *
 * Function will display each found image on top of each other through an html string output
 */

function acf_block_example($slug)
{
    $path = '/acf-json/thumbnails/';
    $base_dir = get_theme_file_path($path);
    $files = scandir($base_dir);
    $theme_directory = get_stylesheet_directory_uri() . $path;
    $html = [];

    //
    // regex matches pattern : pb-row-{slug}.jpg, pb-row-{slug}-01.png, pb-row-{slug}-1.jpg, pb-row-{slug}-99.webp
    //
    $re = "/{$slug}(|-[0-9]?[0-9]).(jpg|jpeg|webp|png)/imu";
    $matches = preg_grep($re, $files);

    foreach ($matches as $match) {
        $html[] = "<p><img src='{$theme_directory}{$match}' alt='{$slug}' style='width: 100%; height: auto;'></p>";
    }

    if (count($html) > 0) {
        return implode("", $html);
    } else {
        return __("No preview availaible", "mill3wp");
    }
}

/**
 * ACF block preview
 *
 * loads an iframe containing a block-editor block row. The iFrame loads our theme CSS & JS modules
 *
 */

function acf_block_preview($content)
{
    global $post;

    $context = Mill3Timber::context();
    $context['post'] = Mill3Timber::get_post($post);
    $context['stylesheet'] = Mill3WP\Assets\Asset_File_path('acfPreview', 'css');
    $context['js'] = Mill3WP\Assets\Asset_File_path('acfPreviewIframe', 'js');
    $context['content'] = $content;
    $context['is_preview'] = true;

    $doc = Mill3Timber::compile("base-acf-preview.twig", $context);
    echo '<iframe srcdoc="' . htmlspecialchars($doc, ENT_QUOTES, 'UTF-8', true) . '" style="pointer-events: none;" width="100%" frameborder="0" scrolling="no"></iframe>';
}

/**
 * Set stripe animations type image selector in cloned field
 */

//add_filter('acfe/load_field/name=image_selector_field', 'acfe_image_selector_field_sample', 10, 3);

// function acfe_image_selector_field_sample($field)
// {
//     if ($field['type'] !== 'acfe_image_selector') return $field;

//     $base_path = '/acf-json/fields-images/';

//     $choices = [
//         'horizontal' => get_stylesheet_directory_uri() . $base_path . 'stripe-animations-horizontal.jpg',
//         'horizontal-alternate' => get_stylesheet_directory_uri() . $base_path . 'stripe-animations-horizontal-alternate.jpg',
//         'inverted-with-pluses' => get_stylesheet_directory_uri() . $base_path . 'stripe-animations-inverted-with-pluses.jpg',
//         'vertical' => get_stylesheet_directory_uri() . $base_path . 'stripe-animations-vertical.jpg'
//     ];

//     $field['choices'] = $choices;

//     return $field;
// }


//define('GOOGLE_API_KEY', 'YOUR_API_KEY');

/**
 * Set layout's thumbnail in ACF Layout Selector Modal
 */
add_filter('acfe/flexible/thumbnail/layout=pb_row_spacer', 'acf_flexible_layout_thumbnail', 10, 3);

function acf_flexible_layout_thumbnail($thumbnail, $field, $layout)
{
    $filename = $layout['name'];
    $extensions = ['.jpg', '.png', '.gif'];
    $path = '/acf-json/thumbnails/' . $filename;

    foreach ($extensions as $extension) {
        if (file_exists(get_theme_file_path($path . $extension))) {
            return get_stylesheet_directory_uri() . $path . $extension;
        }
    }
}

add_filter('acf/settings/show_admin', function () {
    // for development, show ACF admin menu
    if (defined('THEME_ENV') && THEME_ENV !== 'production') return true;

    // get current user
    $user = wp_get_current_user();

    // if we can't find this user (it should never happen, but just in case), hide ACF admin menu
    if (!$user) return false;

    // get user email
    $email = $user->user_email;

    // if email is not defined, hide ACF admin menu
    if (!$email) return false;

    // show ACF admin menu if user email is from @mill3.studio
    // otherwise, hide ACF admin menu
    return str_ends_with($email, '@mill3.studio');
}, 10, 3);


// Set a custom name for collapsed layouts in ACF Flexible Content field
// add_filter('acf/fields/flexible_content/layout_title/name=YOUR_LAYOUT_NAME', function ($title, $field, $layout, $i) {
//     switch ($layout['name']) {
//         case 'partners_group':
//             $name = get_sub_field('name');
//             return "{$name} <em>({$title})</em>";
//             break;
//     }
//     return $title;
// }, 10, 4);


/*
 * https://www.advancedcustomfields.com/resources/acf-render_field/
 */
add_action('acf/render_field/name=post_slug', function ($field) {
    global $post;
    $slug = $post->post_name;
    if (!$slug) return;
    echo "<input value='{$slug}' readonly style='border: 1px solid #000; border-radius: 2px; padding: 0.5rem; width: 100%;' />";
    echo "<h4 style='font-weight: 400;'>How to use in your twig template :</h4>";
    echo "<pre>{{ PageSection('{$slug}') }}</pre>";
});


// Theme colors
add_filter('acf/prepare_field/name=theme_color', function ($field) {
    $options = get_fields('options');
    //$primary_value = $options['brand_color_primary'] ?? '';

    $field['choices'] = [
        "" => "",
        "white" => "Fond blanc avec texte noir",
        "gray" => "Fond gris avec texte noir",
        "primary" => "Couleur principale ({$primary_value})",
        "black" => "Fond noir avec texte blanc",
    ];

    return $field;
});


// sync GTM across all languages
if( function_exists('pll_the_languages') ){
    add_filter('acf/save_post', function($post_id) {
        $screen = get_current_screen();

        // if we save theme_options
        if( strpos($screen->id, 'theme-options') != true ) return;

        $fields = get_fields($post_id);
        $value = $fields['gtm_code'];

        // if value is empty, stop here
        if( empty($value) ) return;

        $namespace          = 'options';
        $languages          = pll_the_languages(array('hide_if_empty' => false, 'hide_current' => false, 'raw' => true));
        $currentLanguage    = pll_current_language('slug');
        $defaultLanguage    = pll_default_language('slug');

        foreach($languages as $slug => $language) {
            if( $slug === $currentLanguage ) continue;

            $optionPageID = $slug === $defaultLanguage ? $namespace : sprintf('%s_%s', $namespace, str_replace('-', '_', $language['locale']));


            // there is a bug in ACF that always return 'options' in current language even if you specifically set post_id to a translation of your chosing
            // this filter self-destruct after being executed once
            // it return a non-modified value
            add_filter('acf/pre_load_post_id', function($value, $post_id) {
                remove_filter( current_filter(), __FUNCTION__ );
                return $post_id;
            }, 10, 2);

            // update translated field
            update_field('gtm_code', $value, $optionPageID);
        }
    }, 20);
}


// Populate select field with Gravity Form entries
function afc_populate_gravity_form_id($field) {
    // if plugin is not activated, do nothing
    if (!class_exists('GFAPI')) return $field;

    $forms = GFAPI::get_forms(true);
    foreach ($forms as $key => $form) {
        $field['choices'][$form['id']] = $form['title'];
    }

    return $field;
}

add_filter('acf/prepare_field/name=gravity_form_id', 'afc_populate_gravity_form_id');
add_filter('acf/prepare_field/name=application_gravity_form_id', 'afc_populate_gravity_form_id');

// Populate padding field (pt, pb, pt_lg, pb_lg)
function acf_populate_padding($field)
{

    $field['choices'] = array(
        "0" => "0px",
        "5" => "5px",
        "10" => "10px",
        "20" => "20px",
        "30" => "30px",
        "40" => "40px",
        "50" => "50px",
        "60" => "60px",
        "70" => "70px",
        "80" => "80px",
        "90" => "90px",
        "100" => "100px",
        "110" => "110px",
        "120" => "120px",
        "130" => "130px",
        "140" => "140px",
        "150" => "150px",
        "160" => "160px",
        "170" => "170px",
        "180" => "180px",
        "190" => "190px",
        "200" => "200px"
    );

    return $field;
}

add_filter('acf/prepare_field/name=pt', 'acf_populate_padding');
add_filter('acf/prepare_field/name=pb', 'acf_populate_padding');
add_filter('acf/prepare_field/name=pt_md', 'acf_populate_padding');
add_filter('acf/prepare_field/name=pb_md', 'acf_populate_padding');
add_filter('acf/prepare_field/name=pt_lg', 'acf_populate_padding');
add_filter('acf/prepare_field/name=pb_lg', 'acf_populate_padding');

// Populate margin field (mt, mb, mt_lg, mb_lg)
function acf_populate_margin($field)
{

    $field['choices'] = array(
        "-200" => "-200px",
        "-190" => "-190px",
        "-180" => "-180px",
        "-170" => "-170px",
        "-160" => "-160px",
        "-150" => "-150px",
        "-140" => "-140px",
        "-130" => "-130px",
        "-120" => "-120px",
        "-110" => "-110px",
        "-100" => "-100px",
        "-90" => "-90px",
        "-80" => "-80px",
        "-70" => "-70px",
        "-60" => "-60px",
        "-50" => "-50px",
        "-40" => "-40px",
        "-30" => "-30px",
        "-20" => "-20px",
        "-10" => "-10px",
        "-5" => "-5px",
        "0" => "0px",
        "5" => "5px",
        "10" => "10px",
        "20" => "20px",
        "30" => "30px",
        "40" => "40px",
        "50" => "50px",
        "60" => "60px",
        "70" => "70px",
        "80" => "80px",
        "90" => "90px",
        "100" => "100px",
        "110" => "110px",
        "120" => "120px",
        "130" => "130px",
        "140" => "140px",
        "150" => "150px",
        "160" => "160px",
        "170" => "170px",
        "180" => "180px",
        "190" => "190px",
        "200" => "200px"
    );

    return $field;
}

add_filter('acf/prepare_field/name=mt', 'acf_populate_margin');
add_filter('acf/prepare_field/name=mb', 'acf_populate_margin');
add_filter('acf/prepare_field/name=mt_md', 'acf_populate_margin');
add_filter('acf/prepare_field/name=mb_md', 'acf_populate_margin');
add_filter('acf/prepare_field/name=mt_lg', 'acf_populate_margin');
add_filter('acf/prepare_field/name=mb_lg', 'acf_populate_margin');

// Populate grid-gap field (grid_gap, grid_gap_mobile)
function acf_populate_grid_gap($field)
{

    $field['choices'] = array(
        "0" => "0px",
        "5" => "5px",
        "10" => "10px",
        "12" => "12px",
        "15" => "15px",
        "20" => "20px",
        "30" => "30px"
    );

    return $field;
}

add_filter('acf/prepare_field/name=grid_gap', 'acf_populate_grid_gap');
add_filter('acf/prepare_field/name=grid_gap_mobile', 'acf_populate_grid_gap');


if (defined('GOOGLE_API_KEY')) {
    add_action('acf/init', function () {
        acf_update_setting('google_api_key', GOOGLE_API_KEY);
    });
}
