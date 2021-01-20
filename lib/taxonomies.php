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
     * Register 'dummies' taxonomy
     *
     * @method dummy
     */
    public function dummy()
    {
        $name = __('Dummies');
        $singular_name = __('Dummy');
        $slug = __("dummies");

        // register term
        register_taxonomy(
            'world_locations',
            array('events'),
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
                    'name' => $name,
                    'singular_name' => $singular_name,
                    'search_items' => __('Search'),
                    'all_items' => __('All'),
                    'parent_item' => __('Parent'),
                    'parent_item_colon' => __('Parent :'),
                    'edit_item' => __('Modify'),
                    'update_item' => __('Modify'),
                    'add_new_item' => __('Add'),
                    'new_item_name' => __('New'),
                    'menu_name' => $name
                ),
                // Control the slugs used for this taxonomy
                'rewrite' => array(
                    'slug' => $slug, // This controls the base slug that will display before each term
                    'with_front' => false, // Don't display the category base before
                    'hierarchical' => true // This will allow URL's like "/section/cat-name/cat-slug/"
                )
            )
        );
    }
}
?>
