<?php

/*
 * Custom action to inject code at the beginning of the <body> tag
 */
function mill3wp_body_start() {
    do_action('mill3wp_body_start');
}


/*
 * Change the login logo image
 */

function mill3wp_admin_login_logo()
{
?>
    <style type="text/css">
        #login h1 a,
        .login h1 a {
            background-image: url(<?php echo get_stylesheet_directory_uri(); ?>/logo-login.png);
            width: 100%;
            height: auto;
            aspect-ratio: 111/32;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center center;
        }
    </style>
<?php
}

add_action('login_enqueue_scripts', 'mill3wp_admin_login_logo');

/*
 * Change the login logo URL
 */
function mill3wp_admin_login_logo_url() {
    return home_url();
}
add_filter( 'login_headerurl', 'mill3wp_admin_login_logo_url' );

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
