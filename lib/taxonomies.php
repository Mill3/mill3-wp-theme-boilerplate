<?php

/**
 * Creating a function to create our Custom Taxonomies
 */

class Theme_CustomTaxonomies
{
    /**
     * the theme domain name
     *
     * @var string
     */
    protected $theme_domain = 'mill3wp';

    /**
     * This instance
     *
     * @var object
     */
    private static $instance;

    /**
     * [__construct description]
     *
     * @method __construct
     */
    public function __construct()
    {
        return true;
    }

    /**
     * Public method from instancing the class
     *
     * @method instance
     * @return class
     */
    public static function instance()
    {
        if (!isset(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Main command for class init
     *
     * @method run
     */
    public function run()
    {
        $this->dummy();
    }

    /**
     * Register 'portfolios types' taxonomy
     *
     * @method portfolios_types
     */
    public function dummy()
    {
        // register term
        register_taxonomy(
            'dummy',
            array('posts'),
            array(
                'hierarchical' => true,
                'query_var' => true,
                'show_ui' => true,
                'show_in_menu' => true,
                'show_in_nav_menus' => true,
                'show_in_quick_edit' => true,
                'show_admin_column' => true,
                // This array of options controls the labels displayed in the WordPress Admin UI
                'labels' => array(
                    'name' => _x('Dummy', 'taxonomy general name'),
                    'singular_name' => _x('Dummy', 'taxonomy singular name'),
                    'search_items' => __('Search in formats'),
                    'all_items' => __('All formats'),
                    'parent_item' => __('Parent section'),
                    'parent_item_colon' => __('Type of parent section :'),
                    'edit_item' => __('Modify Dummy'),
                    'update_item' => __('Modify Dummy'),
                    'add_new_item' => __('Add a Dummy'),
                    'new_item_name' => __('New Dummy'),
                    'menu_name' => __('Dummy')
                ),
                // Control the slugs used for this taxonomy
                'rewrite' => array(
                    'slug' => 'dummy', // This controls the base slug that will display before each term (do not add / at the end of you slug)
                    'with_front' => false, // Don't display the category base before
                    'hierarchical' => true // This will allow URL's like "/section/cat-name/cat-slug/"
                )
            )
        );
    }
}
?>
