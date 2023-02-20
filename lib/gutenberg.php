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


//
// Add to Gutenberg's sidebar resizable handling capacity
//
function mill3_gutenberg_resizable_sidebar() {
    global $pagenow;
    if($pagenow != 'post.php' ) return;

    wp_enqueue_script(
        'mill3-gutenberg-sidebar-js',
        get_stylesheet_directory_uri() . '/src/js/admin/gutenberg-sidebar.js',
        ['jquery-ui-resizable'],
        filemtime( get_stylesheet_directory() . '/src/js/admin/gutenberg-sidebar.js' ),
        true
    );
    wp_enqueue_style( 'mill3-gutenberg-sidebar-jsstyle', get_stylesheet_directory_uri() . '/src/js/admin/gutenberg-sidebar.css');
}

add_action('admin_enqueue_scripts', __NAMESPACE__ . '\\mill3_gutenberg_resizable_sidebar');


// This filter inject in each block context the current block order using a $GLOBAL variable.
// Also calculating if block is first rendered and bool sent to context.
$block_order = 0;
$block_first = true;
add_filter( 'timber/acf-gutenberg-blocks-data', function( $context ) {
    $zindex_below = $context['fields']['zindex_below'] ?? false;
    if($zindex_below) {
        $GLOBALS['block_order'] = $GLOBALS['block_order'] - 1;
    } else {
        $GLOBALS['block_order'] = $GLOBALS['block_order'] + 1;
    }
    $context['fields']['first'] = $GLOBALS['block_first'];
    $context['fields']['order'] = $GLOBALS['block_order'];

    // then set block_first to false from now on if is true
    if($GLOBALS['block_first']) $GLOBALS['block_first'] = false;

    return $context;
} );
