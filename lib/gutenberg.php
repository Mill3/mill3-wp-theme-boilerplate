<?php

namespace Mill3WP\Gutenberg;


// Remove Gutenberg Block Styles
add_action('wp_print_styles', function() { wp_dequeue_style('wp-block-library'); }, 100);

// Remove inlines SVGs added in footer of frontend (Wordpress 5.9)
// https://github.com/WordPress/gutenberg/issues/38299
add_action('after_setup_theme', function () {
    remove_action('wp_enqueue_scripts', 'wp_enqueue_global_styles');
    remove_action('wp_footer', 'wp_enqueue_global_styles', 1);
}, 10, 0);

// disable autosave globaly
add_action( 'admin_init', function() {
    wp_deregister_script( 'autosave' );
});

// disable Gutenberg features
remove_action( 'enqueue_block_editor_assets', 'wp_enqueue_editor_block_directory_assets' );
add_filter( 'should_load_remote_block_patterns', '__return_false' );
add_filter( 'wp_lazy_loading_enabled', '__return_false' );

add_filter( 'timber/acf-gutenberg-blocks-templates', function () {
    return ['/templates/page-builder'];
});


//
// Add to Gutenberg's sidebar resizable handling capacity
//
/*
function mill3_gutenberg_resizable_sidebar() {
    $current_screen = get_current_screen();
    if( !$current_screen->is_block_editor() ) return;
    
    wp_enqueue_script(
        'mill3-gutenberg-sidebar-js',
        get_stylesheet_directory_uri() . '/src/js/admin/gutenberg-sidebar.js',
        ['jquery-ui-resizable'],
        filemtime( get_stylesheet_directory() . '/src/js/admin/gutenberg-sidebar.js' ),
        true
    );
    wp_enqueue_style( 'mill3-gutenberg-sidebar-jsstyle', get_stylesheet_directory_uri() . '/src/js/admin/gutenberg-sidebar.css');
}

add_action('admin_enqueue_scripts', __NAMESPACE__ . '\\mill3_gutenberg_resizable_sidebar');
*/

//
// Add block editor custom categories
//
add_filter( 'block_categories_all' , function( $categories ) {
    $categories[] = array(
        'slug'  => 'homepage',
        'title' => 'Homepage'
    );
    return $categories;
} );



/*
// Create block patterns in Block Editor
add_action('admin_init', function() {
    $pb_row_text_simple_fields = acf_get_fields('group_633cd462eb3b1');

    function format_data_for_pb_row($fields, $data) {
        $output = array();
        $ignored_field_types = [
            "accordion", 
            "flexible_content", 
            "group", 
            "message", 
            "output", 
            "row-title", 
            "separator", 
            "tab", 
            "table"
        ];

        foreach($fields as $field) {
            // skip to next field if field's type is ignored
            if( in_array($field["type"], $ignored_field_types) ) continue;

            $name = $field["name"];
            $default_value = array_key_exists("default_value", $field) ? $field["default_value"] : "";

            // set field default value & key
            $output[$name] = $field["value"] ?? $default_value;
            $output["_$name"] = $field["key"];

            // populate custom data if provided
            if( array_key_exists($name, $data) ) $output[$name] = $data[$name];
        }

        return $output;
    }

    $pb_row_text_simple_data = array(
        "subtitle" => "My subtitle",
        "title" => "My title",
        "text" => "My text.",
        "text_align" => "center",
        "block_size" => "full",
        "pt" => "40",
        "pb" => "30",
        "activate_md_breakpoint" => "1",
        "pt_md" => "50",
        "pb_md" => "30",
        "pt_lg" => "100",
        "pb_lg" => "80",
        "theme" => "black",
        "theme_boxed" => "boxed"
    );
    
    $serialized_block = serialize_block(array(
        'blockName' => 'acf/pb-row-text-simple',
        'attrs' => array(
            'name' => 'acf/pb-row-text-simple', 
            'data' => format_data_for_pb_row($pb_row_text_simple_fields, $pb_row_text_simple_data)
        ),
        'innerBlocks' => [],
        'innerHTML' => '',
        'innerContent' => []
    ));

    // echo '<pre>';
    // print_r($pb_row_text_simple_fields);
    // echo '</pre>';
    // exit;

    register_block_pattern('mill3wp/my-custom-pattern', ['title' => 'My Custom Pattern', 'description' => 'My description', 'content' => $serialized_block]);
});
*/


// This filter inject in each block context the current block order using a $GLOBAL variable.
// Also calculating if block is first rendered and bool sent to context.
$block_order = 0;
$block_first = $block_first = is_admin() ? false : true;
add_filter( 'timber/acf-gutenberg-blocks-data', function( $context ) {
    $zindex_below = $context['fields']['zindex_below'] ?? false;
    if($zindex_below) {
        $GLOBALS['block_order'] = $GLOBALS['block_order'] - 1;
    } else {
        $GLOBALS['block_order'] = $GLOBALS['block_order'] + 1;
    }
    $context['block']['first'] = $GLOBALS['block_first'];
    $context['block']['order'] = $GLOBALS['block_order'];

    // then set block_first to false from now on if is true
    if($GLOBALS['block_first']) $GLOBALS['block_first'] = false;

    // try to override global $wp_query to enable correct RankMath's breadcrumb
    if( $context['is_preview'] ) {
        global $wp_query;

        $new_wp_query = new \WP_Query(array(
            'p' => $context['post_id'],
            'post_type' => 'any',
        ));

        if( $new_wp_query->found_posts ) $wp_query = $new_wp_query;
    }

    return $context;
} );
