<?php

// exit if accessed directly
if( ! defined( 'ABSPATH' ) ) exit;


/**
 * Registers the ACF field type.
 */
add_action('init', function() {
    if( !function_exists('acf_register_field_type') ) return;

    // load textdomain
    load_plugin_textdomain('mill3-acf-graphic-composition', false, get_template_directory() . '/lib/acf-fields/graphic-composition/lang');

    // include
    require_once __DIR__ . '/graphic-composition.php';

    // register field type
    acf_register_field_type('MILL3_acf_field_graphic_composition');
});
