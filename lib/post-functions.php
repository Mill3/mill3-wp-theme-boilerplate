<?php

namespace Mill3WP\Filters;
use Timber;

/**
 * Wrap any embeded with a responsive wrapper
 */
function responsive_embed($html, $url, $attr) {
    return $html !== '' ? '<div class="embed-responsive box box-widescreen"><div class="box-content">' . filter_embeded_settings($html) . '</div></div>' : '';
}

add_filter('embed_oembed_html', __NAMESPACE__ . '\\responsive_embed', 10, 3);
//add_filter('oembed_result', __NAMESPACE__ . '\\responsive_embed', 10, 3);




/**
 * build custom markup for WP native gallery
 *
 * @method wp_gallery
 * @param  string                 $output [description]
 * @param  [type]                 $atts   [description]
 */
function wp_gallery($output, $atts, $instance)
{
    // get all gallery shortcode posts
    $posts = get_posts(array('include' => $atts['ids'], 'orderby' => $atts['orderby'], 'post_type' => 'attachment'));
    $columns = isset($atts['columns']) ? $atts['columns'] : 3;
    $format = isset($atts['format']) ? $atts['format'] : 'square';
    $grid_gap = isset($atts['grid_gap']) ? $atts['grid_gap'] : 3;

    $medias = array_map(function($image){
        // transform array to a WP Post object
        if (is_array($image)) {
            $image = get_post($image['id']);
        }

        return array(
            'image' => $image->ID,
            'credit' => $image->post_excerpt,
            'post' => $image
        );
    }, $posts);

    return Timber::compile('page-builder/pb_row_medias.twig', array(
        'post' => array(
            'medias' => $medias,
            'layout' => 'grid-' . min($columns, 4),
            'format' => $format,
            'grid_gap' => $grid_gap,
            'fullwidth' => true,
            'color_theme' => 'theme-default'
        ),
        'is_shortcode' => true
    ));
}

add_filter('post_gallery', __NAMESPACE__ . '\\wp_gallery', 10, 3);
