<?php

/**
 * This file is part of Mill3WP boilerplate theme.
 * 2023 (c) Mill3 Studio
 *
 * @version 0.0.1
 *
 * @since 0.0.1
 */

namespace Mill3WP\Models;

use Timber;

class Mill3AbstractPost extends Timber\Post {

    /**
     * Return a number of posts previous to the current one
     * 
     * @param int $count : Number of posts to request
     *
     * @return Timber\PostArrayObject
     */
    public function get_previous_posts($count = 2)
    {
        $post_type = $this->type->name;
        $exclude = [ $this->ID ];

        $args = array(
            'post_type' => $post_type,
            'posts_per_page' => $count,
            'post__not_in' => $exclude,
            'date_query' => array(
                array(
                    'before' => array(
                        'year' => $this->date('Y'),
                        'month' => $this->date('m'),
                        'day' => $this->date('d')
                    ),
                    'inclusive' => true,
                ),
            )
        );

        // get posts previous to the current one
        $posts = Timber::get_posts($args);

        // transform PostQuery (ArrayObject) into array
        if( $posts ) $posts = $posts->getArrayCopy();

        // if we have less post then requested, find more posts
        if(count($posts) < $count) {
            // append all previous $posts to exclude list
            $exclude = array_merge($exclude, wp_list_pluck($posts, 'ID', null));

            // calculate how much posts we need to find to meet count
            $difference = $count - count($posts);

            // update query args
            $args['posts_per_page'] = $difference;
            $args['post__not_in'] = $exclude;

            // run query and merge results to output
            $posts = array_merge($posts, Timber::get_posts($args)->getArrayCopy());
        }

        return $posts;
    }

}
