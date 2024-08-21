<?php

/*
 * WP_AJAX for requesting transitions routes
 */
/*
function action_transitions_routes() {

    $routes = array();

    // query all brands and pages with custom bg-color
    $data = array(
        'post_type' => array('page', 'brand'),
        'meta_key' => 'bg-color',
        'fields' => 'ids'
    );
    $posts = (new \WP_Query($data))->posts;
    
    foreach( $posts as $post) {
        $bg = get_field('bg-color', $post);
        if( !$bg ) continue;
        
        $url = get_permalink($post);
        $regex = str_replace('/', '\/', $url);

        $routes[] = array("regex" => "^{$regex}$", "color" => "{$bg}");
    }

    // export to JSON
    echo json_encode($routes);
    die();
}

add_action( 'wp_ajax_transitions_routes', __NAMESPACE__ . '\\action_transitions_routes');
add_action( 'wp_ajax_nopriv_transitions_routes', __NAMESPACE__ . '\\action_transitions_routes');
*/
