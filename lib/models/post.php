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
use Carbon\Carbon;
use Timber;

/**
 * Article post-type Timber\Post extended class
 */
class ArticlePost extends Timber\Post
{
    /**
     * Return a number of posts previous to the current one
     *
     * @return string
     */
    public function previous_posts($limit = -1)
    {
        return $this->query($limit)->get_previous_posts($this->post_date);
    }


    /**
     * Create a ArticleDateQueries auto-excluding $this->id
     *
     * @return class
     */
    private function query($limit = -1)
    {
        $query = new ArticleQueries($limit);
        $query->set_exclude([$this->id]);
        return $query;
    }

}




/**
 * Article post-type queries
 */
class ArticleQueries extends PostQueries\Theme_PostQueries
{
    private static $post_type = "post";

    public function get_previous_posts($date)
    {
        $args = array(
            'post_type' => self::$post_type,
            'post__not_in' => self::$exclude,
            'date_query' => array(
                array(
                    'before'    => $date,
                    'inclusive' => true,
                ),
            ),
            'posts_per_page' => self::$limit,
        );

        // get all posts
        $posts = parent::run_query($args, 'Mill3WP\PostQueries\Article\ArticlePost');

        if(count($posts) < self::$limit) {
            $difference = self::$limit - count($posts);
            $query = new $this($difference);
            $posts = array_merge($posts, $query->get_posts());
        }

        // normalize sorting
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
