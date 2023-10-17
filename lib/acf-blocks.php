<?php

/**
 * This file is part of Mill3WP theme.
 * 2023 (c) Mill3 Studio
 * @version 0.0.1
 *
 * @since 0.0.1
 *
 */


/**
 * ACF block callback method registered in blocks.json
 *
 * @param object $block
 * @param string $content
 * @param boolean $is_preview
 * @param int $post_id
 * @return string
 */
function acf_block_render_callback($block, $content = '', $is_preview = false, $post_id = null) {
    return Mill3_ACF_Blocks::render_callback($block, $content, $is_preview, $post_id);
}


/**
 * Check if class exists before redefining it
 */
if ( ! class_exists( 'Mill3_ACF_Blocks' ) ) {

    /**
     * Class Mill3_ACF_Blocks, handles ACF blocks registration and rendering
     *
     * Note : this class has many static objects and methods because 'render_callback' is called statically from block.json instructions
     *
     */

    class Mill3_ACF_Blocks {

        // holds the order of the block rendering each time render_callback is called
        public static $order = 0;

        // holds the first block rendering state
        public static $first = true;

        public function __construct() {
            if ( is_callable( 'add_action' )
                && is_callable( 'acf_register_block_type' )
                && class_exists( 'Timber' )
            ) {
                add_action( 'acf/init', [ $this, 'register_blocks' ] );
            } elseif ( is_callable( 'add_action' ) ) {
                add_action(
                    'admin_notices',
                    function() {
                        echo '<div class="error"><p>Timber ACF WP Blocks requires Timber and ACF.';
                        echo 'Check if the plugins or libraries are installed and activated.</p></div>';
                    }
                );
            }
        }

        /**
         * Register all blocks found in templates/blocks directory
         *
         * - blocks are registered using the directory name as block name
         * - block directory should include a block.json file
         * - block directory should include a pb-row-[name].twig file
         * - registered blocks will appear in ACF fields editor
         *
         * @return void
         */
        public function register_blocks() {
            $blocks_directory = new \DirectoryIterator( \locate_template( "templates/blocks" ) );
            foreach ( $blocks_directory as $directory ) {
                if ( $directory->isDot() ) continue;

                // try to register block if it's a directory
                if( $directory->isDir() ) {
                    // get all files in directory
                    $files = new \DirectoryIterator( $directory->getPathname() );
                    foreach ($files as $file) {
                        if ( $file->isDot() ) continue;
                        // register block if block.json file is found
                        if($file->getFilename() === "block.json") {
                            register_block_type( $directory->getPathname() );
                        }
                    }
                }
            }
        }

        /**
         * render_callback : this method is called through block.json instructions under 'acf : { renderCallback : func_cb_here }'
         *
         * A global function is registered on top of this file to enable calls this method statically outside of this class
         *
         * @param object $block
         * @param string $content
         * @param boolean $is_preview
         * @param int $post_id
         * @return string
         */
        static function render_callback($block, $content = "", $is_preview = false, $post_id = null) {
            // Context compatibility.
            if ( method_exists( 'Timber', 'context' ) ) {
                $context = Timber::context();
            } else {
                $context = Timber::get_context();
            }

            // extract acf/pb-row-name from block data
            $slug = explode('/', $block['name'])[1];

            // get all ACF fields for block
            $fields = \get_fields();

            $context['first']      = self::is_first();
            $context['order']      = self::set_order(!$fields['zindex_below']);
            $context['block']      = $block;
            $context['post_id']    = $post_id;
            $context['slug']       = $slug;
            $context['is_preview'] = $is_preview;
            $context['fields']     = $fields;

            // find Twig template file, example : templates/blocks/pb-row-foobar/pb-row-foobar.twig
            $template = locate_template( "templates/blocks/{$slug}/{$slug}.twig" );

            if($template) {
                return Timber::render( [$template], $context );
            } else {
                $template_warning = Timber::compile_string( '<pre>No twig template found for block {{ slug }}.</pre>', $context );
                echo $template_warning;
            }
        }

        // check if current block is the first rendered, then invert state to false for the rest of class instance lifespan
        public static function is_first() {
            if(self::$first) {
                self::$first = false;
                return true;
            } else {
                return false;
            }
        }

        // increment/decrement block rendering order, value can be decremented because of field 'zindex_below'
        public static function set_order($increment = true) {
            return $increment ? self::$order++ : self::$order--;
        }
    }

}

// init class
if ( is_callable( 'add_action' ) ) {
    add_action(
        'after_setup_theme',
        function() {
            new Mill3_ACF_Blocks();
        }
    );
}

