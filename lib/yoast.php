<?php

namespace Mill3WP\Yoast;

function wpseo_canonical($canonical) {
    if(is_post_type_archive()) {
        $post_type = get_queried_object()->name;
        return get_post_type_archive_link($post_type);
    } else {
        return $canonical;
    }
};

add_action('wpseo_canonical', __NAMESPACE__ . '\\wpseo_canonical');
add_action('wpseo_opengraph_url', __NAMESPACE__ . '\\wpseo_canonical');
