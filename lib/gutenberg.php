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
