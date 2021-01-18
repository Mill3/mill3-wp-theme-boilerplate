<?php

namespace Mill3WP\GravityForm;
use Timber;

// change default error message
function change_message( $message, $form ) {
    return "<div class='validation_error'>" . __("We can't process your message. Please review the fields highlighted in red below.", "tdp") . "</div>";
}

add_filter( 'gform_validation_message', __NAMESPACE__ . '\\change_message', 10, 2 );


// replace spinner URL
/*
function spinner_url($image_src, $form) {
    return get_stylesheet_directory_uri() . '/src/images/spinner.gif';
}

add_filter( 'gform_ajax_spinner_url', __NAMESPACE__ . '\\spinner_url', 10, 2 );
*/



// https://docs.gravityforms.com/gform_submit_button/
function form_submit_button( $button, $form ) {
    if( $form['button']['type'] !== 'text' ) return $button;

    $data = array(
        'id' => "gform_submit_button_{$form['id']}",
        'title' => $form['button']['text'],
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
        if( $layout === "pb_row_form" AND $row["gravity_form"] ) {
            gravity_form_enqueue_scripts($row["gravity_form"], true);
        }
    }
}

add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_gf_scripts', 100);


/* Remove jquery.placeholder.js polyfill, because it's 2020 */
function remove_placeholder_polyfill() {
  wp_dequeue_script('gform_placeholder');
}

add_action('gform_enqueue_scripts', __NAMESPACE__ . '\\remove_placeholder_polyfill', 11 );
