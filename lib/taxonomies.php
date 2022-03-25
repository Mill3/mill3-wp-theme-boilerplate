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
        //$this->dummy();
    }


    public function labels($name, $singular_name) {
        $search_items = __('Search', 'mill3wp');
        $all_items = __('All', 'mill3wp');
        $parent_item = __('Parent', 'mill3wp');
        $parent_item_colon = __('Parent :', 'mill3wp');
        $edit_item = __('Modify', 'mill3wp');
        $update_item = __('Modify', 'mill3wp');
        $add_new_item = __('Add', 'mill3wp');
        $new_item_name = __('New', 'mill3wp');

        return array(
            'name' => $name,
            'singular_name' => $singular_name,
            'search_items' => $search_items,
            'all_items' => $all_items,
            'parent_item' => $parent_item,
            'parent_item_colon' => $parent_item_colon,
            'edit_item' => $edit_item,
            'update_item' => $update_item,
            'add_new_item' => $add_new_item,
            'new_item_name' => $new_item_name,
            'menu_name' => $name
        );
    }

    /**
     * Register 'dummies' taxonomy
     *
     * @method dummy
     */
    /*
    public function dummy()
    {
        $taxonomy_name = "dummy";
        $name = __('Dummies', 'mill3wp');
        $singular_name = __('Dummy', 'mill3wp');
        $slug = __("dummies", 'mill3wp');
        $labels = $this->labels($name, $singular_name);

        // register term
        register_taxonomy(
            $taxonomy_name,
            array('post'),
            array(
                'hierarchical' => true,
                'query_var' => true,
                'show_ui' => true,
                'show_in_menu' => true,
                'show_in_nav_menus' => true,
                'show_in_quick_edit' => true,
                'show_admin_column' => true,
                'labels' => $labels,
                // Control the slugs used for this taxonomy
                'rewrite' => array(
                    'slug' => $slug, // This controls the base slug that will display before each term
                    'with_front' => false, // Don't display the category base before
                    'hierarchical' => true // This will allow URL's like "/section/cat-name/cat-slug/"
                )
            )
        );
    }
    */
}
?>
