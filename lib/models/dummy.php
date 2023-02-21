<?php

/**
 * This file is part of Mill3WP boilerplate theme.
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

    /**
     * model query instance
     *
     * @var class
     */
    public $query;

    /**
     * extended class constructor, send to parent constructor the $post object
     *
     * @param [type] $post
     */
    public function __construct($post)
    {
        parent::__construct($post);
        $this->query = new DummyQueries();
    }

    /**
     * exeaple of custom method for Timber\Post instance
     *
     * @return string
     */
    public function foo()
    {
        return 'bar';
    }


    /**
     * Run a specific query from DummyQueries() instance
     *
     * @return array
     */
    public function random_dummies($limit) {
        $this->query->set_limit($limit);
        $this->query->set_exclude([$this->id]);
        return $this->query->random();
    }


}



/**
 *
 * This class handles wp_ajax requests for Dummy
 *
 */
class DummyRequests
{
    /**
     * query instance
     *
     * @var class
     */
    public static $query;

    public function __construct()
    {
        self::$query = new \Mill3WP\PostQueries\Dummy\DummyQueries(-1, 'WP_Query');
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
        foreach (self::$query->all()->posts as $key => $post) {
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

    // set parent extended class $post_type
    public $post_type = "dummy";

    public function all()
    {
        $args = [
            'post_type' => $this->post_type,
            'order' => 'ASC',
            'post_status' => 'publish',
            'posts_per_page' => $this->limit,
            'post__not_in' => $this->exclude,
        ];

        return self::run_query($args, 'Mill3WP\PostQueries\Dummy\DummyPost');
    }

    public function random()
    {
        $args = array(
            'post_type' => $this->post_type,
            'post__not_in' => $this->exclude,
            'order' => 'ASC',
            'orderby' => 'rand',
            'posts_per_page' => $this->limit,
        );

        return self::run_query($args, 'Mill3WP\PostQueries\Dummy\DummyPost');
    }

}

/*
 * Register Twig functions refering to various model queries
 */

add_filter('timber/twig', __NAMESPACE__ . '\\add_to_twig');

function add_to_twig($twig)
{

    $twig->addFunction(
        new \Twig\TwigFunction(
            'DummyPost',
            function ($post) {
                return new \Mill3WP\PostQueries\Dummy\DummyPost($post);
            }
        )
    );

    $twig->addFunction(
        new \Twig\TwigFunction('DummyAll', function ($limit = -1) {
            return (new \Mill3WP\PostQueries\Dummy\DummyQueries($limit))->all();
        })
    );



    return $twig;
}
