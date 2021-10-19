<?php

namespace Mill3WP\GravityForm;
use Timber;

// stop here of GravityForm is not installed
if ( ! class_exists('GFCommon') ) return;

// change default error message
function change_message( $message, $form ) {
    return "<div class='validation_error'>" . __("We can't process your message. Please review the fields highlighted in red below.", "mill3wp") . "</div>";
}

add_filter( 'gform_validation_message', __NAMESPACE__ . '\\change_message', 10, 2 );


// replace spinner URL
/*
function spinner_url($image_src, $form) {
    return get_stylesheet_directory_uri() . '/src/images/spinner.gif';
}

add_filter( 'gform_ajax_spinner_url', __NAMESPACE__ . '\\spinner_url', 10, 2 );
*/


// output basic GForm JS, this is necessary for barba.scripts to work propertly
function output_hooks_javascript($head)
{
    \GFCommon::output_hooks_javascript();
    return $head;
}

add_action('wp_head', __NAMESPACE__ . '\\output_hooks_javascript');


// https://docs.gravityforms.com/gform_submit_button/
function form_submit_button( $button, $form ) {
    if( $form['button']['type'] !== 'text' ) return $button;

    $data = array(
        'id' => "gform_submit_button_{$form['id']}",
        'title' => $form['button']['text'],
        'style' => 'cta',
        'classname' => 'gsubmit',
        'attributes' => array('type="submit"')
    );

    return Timber::compile('partial/button.twig', $data);
}

add_filter('gform_submit_button', __NAMESPACE__ . '\\form_submit_button', 10, 2);



/**
 * Check if a pb_row_form.twig is part of this page
 * If so, include gf scripts in wp_head
 */
function enqueue_gf_scripts() {
    global $post;

    try {
        $content_rows = get_field('page_builder', $post);
    } catch (\Throwable $th) {
        $content_rows = null;
    }

    if(!$content_rows) return;

    foreach ($content_rows as $row) {
        if( !array_key_exists("acf_fc_layout", $row) ) continue;

        $layout = $row["acf_fc_layout"];
        if( $layout === "pb_row_form" AND $row["gravity_form_id"] ) {
            gravity_form_enqueue_scripts($row["gravity_form_id"], true);
        }
    }
}

// add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_gf_scripts', 100);


/* Remove jquery.placeholder.js polyfill, because it's 2020 */
function remove_placeholder_polyfill() {
  wp_dequeue_script('gform_placeholder');
}

add_action('gform_enqueue_scripts', __NAMESPACE__ . '\\remove_placeholder_polyfill', 11 );


// Disable legacy CSS for all forms
// https://docs.gravityforms.com/gform_disable_form_legacy_css/
add_filter( 'gform_disable_form_legacy_css', '__return_true' );

// Disable theme CSS for all forms
// https://docs.gravityforms.com/gform_disable_form_theme_css
add_filter( 'gform_disable_form_theme_css', '__return_true' );

// Disable legacy markup for all forms
// https://docs.gravityforms.com/gform_enable_legacy_markup
add_filter( 'gform_enable_legacy_markup', '__return_false' );

// Disabling Automatic Scrolling On All Forms
// https://docs.gravityforms.com/disable-automatic-scroll-form-confirmation/
add_filter( 'gform_confirmation_anchor', '__return_false' );
