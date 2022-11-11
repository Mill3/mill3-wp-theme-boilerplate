<?php

// exit if accessed directly
if( ! defined( 'ABSPATH' ) ) exit;


add_action('acf/include_field_types', function() {
    // load textdomain
    load_plugin_textdomain( 'mill3-acf-row-title', false, get_template_directory() . '/lib/acf-fields/row-title/lang' );

    // include
    include_once('row-title.php');
});
