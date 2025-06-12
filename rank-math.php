<?php

/**
 * Rank Math Polylang Integration
 *
 * This file integrates Rank Math with Polylang, allowing for multilingual SEO management.
 *
 * @package RankMath
 */

add_action(
    'plugins_loaded',
    function() {
        if ( defined( 'RANK_MATH_VERSION' ) && class_exists( 'PLL_Integrations' ) ) {
            require_once __DIR__ . '/lib/rankmath-polylang.php';
            add_action( 'pll_init', array( PLL_Integrations::instance()->rankmath = new PLL_RankMath(), 'init' ) );
        }
    },
    0
);
