<?php

/**
 * This file is part of TDP WP theme.
 * 2020 (c) Mill3 Studio
 * @version 0.0.1
 *
 * @since 0.0.1
 *
 */

namespace Mill3WP\PostQueries;

use Timber;

class Theme_PostQueries
{
    /**
     * Holds this instance.
     *
     * @var \Theme_PostQueries
     */
    private static $instance;

    // static variables
    public static $post;
    public static $limit;
    public static $orderby;
    public static $exclude;
    public static $query_engine;

    // init class
    public function __construct($limit = -1, $query_engine = 'Timber', $exclude = [])
    {
        self::$limit = $limit ?? $this->post_per_page();
        self::$query_engine = $query_engine;
        self::$exclude = $this->build_exclude_list($exclude);
    }

    /**
     * Create an instance and allows multiple copy of class
     *
     * @param integer $limit
     *
     * @param string  $orderby
     *
     * @param array   $exclude
     *
     * @return instance
     */
    public static function instance(
        $limit = 10,
        $query_engine = 'Timber',
        $exclude = []
    ) {
        global $post;
        self::$post = $post;

        return self::$instance = new self($limit, $query_engine, $exclude);
    }

    public function get_posts($post_type = 'post')
    {
        $args = [
            'post_type' => $post_type,
            'posts_per_page' => self::$limit,
            'post__not_in' => self::$exclude,
        ];

        return $this->run_query($args);
    }

    public function search($s)
    {
        $args = [
            's' => $s,
            'post_type' => 'any',
            'posts_per_page' => self::$limit,
            'post__not_in' => self::$exclude,
        ];

        return $this->run_query($args);
    }

    /**
     *  Get all recent posts, excluding sticky
     *
     * @return object
     */
    public function get_recent_posts($post_type = 'post')
    {
        $sticky = get_option('sticky_posts');

        $args = [
            'post_type' => $post_type,
            'post__not_in' => $sticky,
            'posts_per_page' => self::$limit,
        ];

        return $this->run_query($args);
    }

    // get per page option from WP settings
    public function post_per_page()
    {
        return get_option('posts_per_page');
    }

    public function build_exclude_list($data)
    {
        if (is_array($data)) {
            return $data;
        } elseif (is_object($data)) {
            return wp_list_pluck($data, 'ID', null);
        }

        return [];
    }

    public function run_query($args = [], $timber_post_class = null)
    {
        if (self::$query_engine == 'Timber') {
            return Timber::get_posts($args, $timber_post_class);
        }

        if (self::$query_engine == 'WP_Query') {
            return new \WP_Query($args);
        }
    }
}

/*
 * Register Twig functions refering to various model queries
 */

add_filter('timber/twig', __NAMESPACE__ . '\\add_to_twig');

function add_to_twig($twig)
{
    $twig->addFunction(
        new \Twig\TwigFunction('get_posts', function ($post_type = 'post') {
            $query = new \Mill3WP\PostQueries\Theme_PostQueries();
            return $query->get_posts($post_type);
        })
    );

    $twig->addFunction(
        new \Twig\TwigFunction('search', function ($s, $limit = -1) {
            return (new \Mill3WP\PostQueries\Theme_PostQueries($limit, 'Timber'))->search($s);
        })
    );

    return $twig;
}
