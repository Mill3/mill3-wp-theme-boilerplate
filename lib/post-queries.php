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
     * get_posts for a specific post-type
     *
     * @param string $post_type
     * @return object
     */
    public static function get_posts_by($post_type = 'post', $limit = -1, $exclude = [])
    {
        $args = [
            'post_type' => $post_type,
            'posts_per_page' => $limit,
            'post__not_in' => $exclude,
        ];

        return Timber::get_posts($args);
    }

    /**
     * Get random posts from specific post-type
     *
     * @param string $post_type : Post type
     * @param int $limit : Maximum number of posts to request
     * @param array $exclude : Array of IDs to exclude from results
     * 
     * @return Timber\PostArrayObject
     */
    public static function random_posts($post_type = 'post', $limit = -1, $exclude = [])
    {
        $args = array(
            'post_type' => $post_type,
            'post__not_in' => $exclude,
            'order' => 'ASC',
            'orderby' => 'rand',
            'posts_per_page' => $limit,
        );

        return Timber::get_posts($args);
    }

    /**
     * Search for posts in all post type or specific post-type
     *
     * @param string $s : Search query string
     * @param string $post_type : Post type
     * @param int $limit : Maximum number of posts to request
     * @param array $exclude : Array of IDs to exclude from results
     * 
     * @return Timber\PostArrayObject
     */
    public static function search($s, $post_type = 'any', $limit = -1, $exclude = [])
    {
        $args = [
            's' => $s,
            'post_type' => $post_type,
            'posts_per_page' => $limit,
            'post__not_in' => $exclude,
        ];

        return Timber::get_posts($args);
    }


    /**
     *  Get all recent posts, excluding sticky
     *
     * @return object
     */
    /*
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
    */
}

/*
 * Register Twig functions refering to various model queries
 */

add_filter('timber/twig/functions', function($functions) {

    $functions['get_posts_by'] = ['callable' => [Theme_PostQueries::class, 'get_posts_by']];
    $functions['random_posts'] = ['callable' => [Theme_PostQueries::class, 'random_posts']];
    $functions['search'] = ['callable' => [Theme_PostQueries::class, 'search']];

    return $functions;
});
