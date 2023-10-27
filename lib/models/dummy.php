<?php

/**
 * This file is part of Mill3WP boilerplate theme.
 * 2023 (c) Mill3 Studio
 *
 * @version 0.0.1
 *
 * @since 0.0.1
 *
 */

namespace Mill3WP\Models;

/**
 *
 * Dummy post-type
 *
 */
class DummyPost extends Mill3AbstractPost {}



/**
 *
 * This class handles wp_ajax requests for Dummy
 *
 */
/*
class DummyRequests
{
    private function __construct()
    {
        add_action('wp_ajax_get_all_dummies', [$this, 'get_all']);
        add_action('wp_ajax_nopriv_get_all_dummies', [$this, 'get_all']);
    }

    public function get_all()
    {
        $posts = [];
        foreach (self::$query->all()->posts as $key => $post) {
            $posts[] = $post;
        }

        echo wp_die( json_encode(['posts' => $posts]) );
    }
}

// Create ShowDateRequests instance
new DummyRequests();
*/
