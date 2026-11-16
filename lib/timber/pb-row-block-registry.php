<?php
use Timber\Timber;

function mill3_pb_row_register_blocks() {
    // Reuse Timber::$dirname (set in functions.php) instead of hardcoding 'templates' —
    // keeps the glob in sync if the theme's template root ever changes.
    $dirname = is_array( Timber::$dirname ) ? reset( Timber::$dirname ) : Timber::$dirname;
    $pattern = get_theme_file_path( "{$dirname}/page-builder/*/block.json" );
    foreach ( glob( $pattern ) ?: [] as $block_json_path ) {
        register_block_type( dirname( $block_json_path ) );
    }
}
add_action( 'init', 'mill3_pb_row_register_blocks' );

function mill3_pb_row_render_callback( $block, $content = '', $is_preview = false, $post_id = 0, $wp_block = null, $context = array() ) {
    $timber_context = method_exists( 'Timber\Timber', 'context' ) ? Timber::context() : Timber::get_context();
    $slug = str_replace( 'acf/', '', $block['name'] );

    $timber_context['block']      = $block;
    $timber_context['post_id']    = $post_id;
    $timber_context['slug']       = $slug;
    $timber_context['is_preview'] = $is_preview;
    $timber_context['fields']     = get_fields();

    $classes = array_merge(
        array( $slug ),
        isset( $block['className'] ) ? array( $block['className'] ) : array(),
        $is_preview ? array( 'is-preview' ) : array(),
        array( 'align' . $timber_context['block']['align'] )
    );
    $timber_context['classes'] = implode( ' ', $classes );

    if ( ! empty( $block['data']['is_example'] ) ) {
        $timber_context['fields'] = $block['data'];
    }

    $timber_context = apply_filters( 'timber/acf-gutenberg-blocks-data', $timber_context );
    $timber_context = apply_filters( 'timber/acf-gutenberg-blocks-data/' . $slug, $timber_context );
    $timber_context = apply_filters( 'timber/acf-gutenberg-blocks-data/' . $block['id'], $timber_context );

    Timber::render( "page-builder/{$slug}/{$slug}.twig", $timber_context );
}
