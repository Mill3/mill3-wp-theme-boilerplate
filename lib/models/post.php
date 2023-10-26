<?php

/**
 * This file is part of Mill3WP boilerplate theme.
 * 2023 (c) Mill3 Studio
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
    private $query;
    
    private function get_query() {
        if( !$this->query ) $this->query = new ArticleQueries();
        return $this->query;
    }

    /**
     * Return a number of posts previous to the current one
     *
     * @return string
     */
    public function previous_posts($limit = 2)
    {
        $this->get_query()->set_limit($limit);
        $this->get_query()->set_exclude([$this->id]);

        return $this->get_query()->get_previous_posts($this->post_date);
    }

}




/**
 * Article post-type queries
 */
class ArticleQueries extends PostQueries\Theme_PostQueries
{
    // set parent extended class $post_type
    public $post_type = "post";

    public function get_previous_posts($date)
    {
        $limit = $this->limit;
        $exclude = $this->exclude;

        $args = array(
            'post_type' => $this->post_type,
            'posts_per_page' => $this->limit,
            'post__not_in' => $this->exclude,
            'date_query' => array(
                array(
                    'before'    => $date,
                    'inclusive' => true,
                ),
            )
        );

        // get all posts
        $posts = self::run_query($args);
        if( $posts ) $posts = $posts->getArrayCopy();

        // if we have less post then requested, find more posts
        if(count($posts) < $limit) {
            // append to this exclude list all previous $posts
            $exclude = array_merge($exclude, wp_list_pluck($posts, 'ID', null));
            $difference_limit =  $limit - count($posts);
            $query = new self($difference_limit);
            $query->set_exclude($exclude);
            $posts = array_merge($posts, $query->get_posts($this->post_type)->getArrayCopy());
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
        new \Twig\TwigFunction('GetRecentArticles', function ($limit = -1, $exclude = []) {
            return (new \Mill3WP\PostQueries\Article\ArticleQueries($limit, 'Timber', $exclude))->get_recent_posts();
        })
    );

    return $twig;
}
