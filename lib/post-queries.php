<?php

/**
 * This file is part of Mill3WP boilerplate theme.
 * 2023 (c) Mill3 Studio
 * @version 0.2.0
 *
 * @since 0.0.1
 *
 */

namespace Mill3WP\PostQueries;

use Timber;

class Theme_PostQueries
{

    /**
     * set post_type for query
     *
     * @var array
     */
    public $post_type = 'post';

    /**
     * set limit in query
     *
     * @var integer
     */
    public $limit;

    /**
     * set exclude for query
     *
     * @var array
     */
    public $exclude;

    /**
     * set query engine for query
     *
     * @var string
     */
    public $query_engine;

    /**
     * main constructor
     */
    public function __construct($limit = -1, $query_engine = 'Timber', $exclude = [])
    {
        $this->limit = $limit ?? $this->post_per_page();
        $this->query_engine = $query_engine;
        $this->exclude = $this->build_exclude_list($exclude);
    }

    /**
     * get_post for a specific post-type
     *
     * @param string $post_type
     * @return object
     */
    public function get_posts($post_type = 'post')
    {
        $this->set_post_type($post_type);

        $args = [
            'post_type' => $this->post_type,
            'posts_per_page' => $this->limit,
            'post__not_in' => $this->exclude,
        ];

        return $this->run_query($args);
    }

    /**
     * search for posts in all post type or specific post-type
     *
     * @param string $post_type
     * @return object
     */
    public function search($s, $post_type = 'any')
    {
        $this->set_post_type($post_type);

        $args = [
            's' => $s,
            'post_type' => $this->post_type,
            'posts_per_page' => $this->limit,
            'post__not_in' => $this->exclude,
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
            'posts_per_page' => $this->limit,
        ];

        return $this->run_query($args);
    }

    // get per page option from WP settings
    public function post_per_page()
    {
        return get_option('posts_per_page');
    }

    /**
     * Parse list of post ID to exclude depending if parameter is an array or WP_Posts object
     *
     * @param [array] $data
     * @return array
     */
    private function build_exclude_list($data)
    {
        if (is_array($data)) {
            return $data;
        } elseif (is_object($data)) {
            return wp_list_pluck($data, 'ID', null);
        }

        return [];
    }

    /**
     * Main method firing the query
     *
     * @param array $args : WP_Query aguments
     *
     * @param [class] $timber_post_class : A model class extending Timber/Post
     *
     * @return WP_Query
     */
    public function run_query($args = [], $timber_post_class = null)
    {
        if ($this->query_engine == 'Timber') {
            return Timber::get_posts($args, $timber_post_class);
        }

        if ($this->query_engine == 'WP_Query') {
            return new \WP_Query($args);
        }
    }

    /**
     * change $post_type
     *
     * @param string $post_type
     * @return void
     */
    public function set_post_type($post_type)
    {
        $this->post_type = $post_type;
    }

    /**
     * change $limit
     *
     * @param integer $limit
     * @return void
     */
    public function set_limit($limit)
    {
        $this->limit = $limit;
    }

    /**
     * change $exclude
     *
     * @param array $exclude
     * @return void
     */
    public function set_exclude($exclude)
    {
        $this->exclude = $exclude;
    }

    /**
     * change $query_engine
     *
     * @param string $query_engine
     * @return void
     */
    public function set_query_engine($query_engine)
    {
        $this->query_engine = $query_engine;
    }
}

/*
 * Register Twig functions refering to various model queries
 */

add_filter('timber/twig', __NAMESPACE__ . '\\add_to_twig');

function add_to_twig($twig)
{
    $twig->addFunction(
        new \Twig\TwigFunction('get_posts', function ($limit = 10, $post_type = 'post') {
            return (new \Mill3WP\PostQueries\Theme_PostQueries($limit, 'Timber'))->get_posts($post_type);
        })
    );

    $twig->addFunction(
        new \Twig\TwigFunction('search', function ($s, $limit = -1, $post_type = 'any') {
            return (new \Mill3WP\PostQueries\Theme_PostQueries($limit, 'Timber'))->search($s, $post_type);
        })
    );

    return $twig;
}
