<?php 

namespace Mill3WP\Security;


// Content-Security-Policy (CSP) <meta>
add_action('wp_head', function() {
    $base_url = get_site_url();
    $options = get_fields('options');

    $imgs = [$base_url];
    $scripts = [$base_url];
    $fonts = [$base_url];
    $frames = [];
    $forms = [];

    function merge_array_with_options($array, $option) {
        return array_merge($array, explode("\r\n", $option));
    }

    if( WEBPACK_DEV_SERVER === true ) {
        array_push($scripts, "http://localhost:" . $_ENV['WEBPACK_DEV_SERVER_PORT']);
        array_push($fonts, "http://localhost:" . $_ENV['WEBPACK_DEV_SERVER_PORT']);
    }

    if( array_key_exists('csp_img_src', $options) ) $imgs = merge_array_with_options($imgs, $options['csp_img_src']);
    if( array_key_exists('csp_script_src', $options) ) $scripts = merge_array_with_options($scripts, $options['csp_script_src']);
    if( array_key_exists('csp_font_src', $options) ) $fonts = merge_array_with_options($fonts, $options['csp_font_src']);
    if( array_key_exists('csp_frame_src', $options) ) $frames = merge_array_with_options($frames, $options['csp_frame_src']);
    if( array_key_exists('csp_form_src', $options) ) $forms = merge_array_with_options($forms, $options['csp_form_src']);

    $contents = [
        "base-uri 'self' $base_url",
        "img-src 'self' " . implode(" ", $imgs),
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' " . implode(" ", $scripts),
        "object-src 'self'",
        "font-src 'self' " . implode(" ", $fonts),
        "frame-src 'self' " . implode(" ", $frames),
        "form-action 'self' " . implode(" ", $forms),
        "block-all-mixed-content"
    ];

    echo "<meta http-equiv=\"Content-Security-Policy\" content=\"" . implode("; ", $contents) . "\">";
}, 5);


// CSP: frame-ancestors
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
add_filter('wp_headers', function($headers) {
    $headers['Content-Security-Policy'] = "frame-ancestors 'self' https://*.mill3.studio";
    return $headers;
});
