<?php 

// exit if accessed directly
if( ! defined( 'ABSPATH' ) ) exit;


add_action('acf/include_field_types', function() {
    // load textdomain
    load_plugin_textdomain( 'mill3-acf-spacer', false, get_template_directory() . '/lib/acf-fields/spacer/lang' ); 

    // include
    include_once('spacer.php');
});
