<?php

namespace Mill3WP\Filters;
use Timber;

/**
 * Wrap any embeded with a responsive wrapper
 */
function responsive_embed($html, $url, $attr) {
    return $html !== '' ? '<div class="embed-responsive box-widescreen position-relative"><div class="position-absolute t-0 l-0 w-100 h-100">' . filter_embeded_settings($html) . '</div></div>' : '';
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
    $grid_gap = isset($atts['grid_gap']) ? $atts['grid_gap'] :0;
    $grid_gap_mobile = isset($atts['grid_gap_mobile']) ? $atts['grid_gap_mobile'] :0;

    $medias = array_map(function($image){
        // transform array to a WP Post object
        if (is_array($image)) $image = get_post($image['id']);

        return array('image' => $image, 'credit' => $image->post_excerpt);
    }, $posts);

    return Timber::compile('page-builder/pb-row-medias.twig', array(
        'is_preview' => false,
        'slug' => 'pb-row-medias',
        'block' => array(
            'order' => 0,
            'first' => false
        ),
        'fields' => array(
            'medias' => $medias,
            'layout' => 'grid-' . min($columns, 4),
            'format' => $format,
            'grid_gap' => $grid_gap,
            'grid_gap_mobile' => $grid_gap_mobile,
            'fullwidth' => false
        )
    ));
}

add_filter('post_gallery', __NAMESPACE__ . '\\wp_gallery', 10, 3);
