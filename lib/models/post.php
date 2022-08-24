<?php

/**
 * This file is part of Mill3WP boilerplaye theme.
 * 2020 (c) Mill3 Studio
 *
 * @version 0.0.1
 *
 * @since 0.0.1
 */

namespace Mill3WP\PostQueries\Article;

use Mill3WP\PostQueries;
use Timber;

/**
 * Article post-type Timber\Post extended class
 */
class ArticlePost extends Timber\Post
{

    /**
     * model query instance
     *
     * @var class
     */
    public static $query;

    /**
     * extended class constructor, send to parent constructor the $post object
     *
     * @param [type] $post
     */
    public function __construct($post)
    {
        parent::__construct($post);
        self::$query = new ArticleQueries();
    }

    /**
     * Return a number of posts previous to the current one
     *
     * @return string
     */
    public function previous_posts($limit = -1)
    {
        self::$query->set_limit($limit);
        self::$query->set_exclude([$this->id]);
        return self::$query->get_previous_posts($this->post_date);
    }

}




/**
 * Article post-type queries
 */
class ArticleQueries extends PostQueries\Theme_PostQueries
{
    public static $post_type = "post";

    public function get_previous_posts($date)
    {
        $limit = self::$limit;
        $exclude = self::$exclude;

        $args = array(
            'post_type' => self::$post_type,
            'posts_per_page' => self::$limit,
            'post__not_in' => self::$exclude,
            'date_query' => array(
                array(
                    'before'    => $date,
                    'inclusive' => true,
                ),
            )
        );

        // get all posts
        $posts = self::run_query($args, 'Mill3WP\PostQueries\Article\ArticlePost');

        // if we have less post then requested, find more posts
        if(count($posts) < $limit) {
            $difference_limit = $limit - count($posts);
            $query = new self($difference_limit);
            $query->set_exclude($exclude);
            $posts = array_merge($posts, $query->get_posts());
        }

        return $posts;
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
            'Article',
            function ($post) {
                return new \Mill3WP\PostQueries\Article\ArticlePost($post);
            }
        )
    );

    return $twig;
}
