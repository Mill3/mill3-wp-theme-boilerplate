<?php

/**
 * This file is part of Mill3WP boilerplaye theme.
 * 2020 (c) Mill3 Studio
 *
 * @version 0.0.1
 *
 * @since 0.0.1
 *
 */

namespace Mill3WP\PostQueries\Dummy;

use Mill3WP\PostQueries;
use Timber;

/**
 *
 * Dummy post-type Timber\Post extended class
 *
 */
class DummyPost extends Timber\Post
{
    private static $MY_VAR = 'dummy-var';

    public function foo()
    {
        return 'bar';
    }

    private function query()
    {
        $query = new ShowQueries();

        return $query;
    }
}



/**
 *
 * This class handles wp_ajax requests for Dummy
 *
 */
class DummyRequests
{
    private $query_instance;

    public function __construct($limit = -1, $exclude = null)
    {
        $this->query_instance = new \Mill3WP\PostQueries\Dummy\DummyQueries($limit, $query_engine = 'WP_Query', $exclude);
    }

    public function run()
    {
        $this->add_action();
    }

    private function add_action()
    {
        add_action('wp_ajax_get_all_dummies', [$this, 'get_all']);
        add_action('wp_ajax_nopriv_get_all_dummies', [$this, 'get_all']);

    }

    public function get_all()
    {
        $posts = [];
        foreach ($this->query_instance->all()->posts as $key => $post) {
            $posts[] = $post;
        }

        echo wp_die( json_encode(['posts' => $posts]) );
    }

}

// Create ShowDateRequests instance
(new \Mill3WP\PostQueries\Dummy\DummyRequests())->run();



/**
 *
 * Show post-type queries
 *
 */
class DummyQueries extends PostQueries\Theme_PostQueries
{
    private static $MY_VAR = "value";

    public function all()
    {
        $args = [
            'post_type' => 'dummy',
            'order' => 'ASC',
            'post_status' => 'publish',
            'posts_per_page' => parent::$limit,
            'post__not_in' => parent::$exclude,
        ];

        return parent::run_query($args, 'Mill3WP\PostQueries\Dummy\DummyPost');
    }

}

/*
 * Register Twig functions refering to various model queries
 */

add_filter('timber/twig', __NAMESPACE__ . '\\add_to_twig');

function add_to_twig($twig)
{
    $twig->addFunction(
        new \Twig\TwigFunction('DummyAll', function ($limit = -1) {
            return (new \Mill3WP\PostQueries\Dummy\DummyQueries($limit))->all();
        })
    );



    return $twig;
}
