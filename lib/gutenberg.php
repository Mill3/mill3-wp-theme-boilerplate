<?php

namespace Mill3WP\Gutenberg;


// Remove Gutenberg Block Styles
add_action('wp_print_styles', function() { wp_dequeue_style('wp-block-library'); }, 100);

// Remove inlines SVGs added in footer of frontend (Wordpress 5.9)
// https://github.com/WordPress/gutenberg/issues/38299
add_action('after_setup_theme', function () {
    remove_action('wp_enqueue_scripts', 'wp_enqueue_global_styles');
    remove_action('wp_footer', 'wp_enqueue_global_styles', 1);
}, 10, 0);

// disable autosave globaly
add_action( 'admin_init', function() {
    wp_deregister_script( 'autosave' );
});

// disable Gutenberg features
remove_action( 'enqueue_block_editor_assets', 'wp_enqueue_editor_block_directory_assets' );
add_filter( 'should_load_remote_block_patterns', '__return_false' );
add_filter( 'wp_lazy_loading_enabled', '__return_false' );

add_filter( 'timber/acf-gutenberg-blocks-templates', function () {
    return ['/templates/page-builder/'];
});


// This filter inject in each block context the current block order using a $GLOBAL variable.
// Also calculating if block is first rendered and bool sent to context.
$block_order = 0;
add_filter( 'timber/acf-gutenberg-blocks-data', function( $context ) {
    $GLOBALS['block_order'] = $GLOBALS['block_order'] + 1;
    $context['fields']['first'] = $GLOBALS['block_order'] === 1;
    $context['fields']['order'] = $GLOBALS['block_order'];
    return $context;
} );
