<?php

namespace Mill3WP\Polylang;

// expose Polylang's functions to Twig
add_filter('timber/twig/functions', function($functions) {

    if( !function_exists('pll_current_language') ) return $functions;
    
    $functions['pll__'] = ['callable' => 'pll__'];
    $functions['pll_e'] = ['callable' => 'pll_e'];
    $functions['pll_current_language'] = ['callable' => 'pll_current_language'];
    $functions['language_switcher'] = [
        'callable' => function () {
            pll_the_languages(array('show_flags' => 0, 'show_names' => 0));
        }
    ];

    return $functions;
});
