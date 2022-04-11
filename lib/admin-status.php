<?php 

namespace Mill3WP\AdminStatus;


class MILL3_AdminStatus {

    private $post_types = array('post', 'page');
    private $terms = array(
        'a-traduire' => 'À traduire',
        'aide-design' => 'Aide design',
        'copydeck-fr' => 'Copy deck manquant (EN)',
        'copydeck-en' => 'Copy deck manquant (FR)',
        'texte-lorem' => 'Texte en lorem',
        'traductions-manquantes' => 'Traductions manquantes',
    );

    /**
     * [__construct description]
     *
     * @method __construct
     */
    public function __construct() {
        add_action('init', array($this, 'register_taxonomy'));
        add_action('after_switch_theme', array($this, 'create_admin_status_terms'));

        // skip here if we are not on admin pages
        if( !is_admin() ) return;

        // get current user
        $user = wp_get_current_user();

        // if we can't find this user (it should never happen, but just in case), do not show admin_status column
        if( !$user ) return;

        // get user email
        $email = $user->user_email;

        // if email is not defined, do not show admin_status column
        if( !$email ) return;

        // if user email is not from @mill3.studio, do not show admin_status column
        if( !str_ends_with($email, '@mill3.studio') ) return;

        // add admin_status column for post_types we selected
        foreach($this->post_types as $post) {
            add_filter('manage_' . $post . '_posts_columns', array($this, 'register_admin_status_column'), 100, 1);
            add_action('manage_' . $post . '_posts_custom_column', array($this, 'populate_admin_status_column'), 10, 2);
        }

        add_action('admin_head', array($this, 'add_css'));
        add_action('restrict_manage_posts', array($this, 'add_filters'), 100, 2);
        add_action('pre_get_posts', array($this, 'parse_filters_query'));
    }

    // Register 'admin_status' taxonomy
    public function register_taxonomy() {

        $name = __('Admin Status', 'mill3wp');
        $singular_name = __('Admin Status', 'mill3wp');
        $search_items = __('Search', 'mill3wp');
        $all_items = __('All', 'mill3wp');
        $parent_item = __('Parent', 'mill3wp');
        $parent_item_colon = __('Parent :', 'mill3wp');
        $edit_item = __('Modify', 'mill3wp');
        $update_item = __('Modify', 'mill3wp');
        $add_new_item = __('Add', 'mill3wp');
        $new_item_name = __('New', 'mill3wp');

        // register term
        register_taxonomy(
            'admin_status',
            $this->post_types,
            array(
                'hierarchical' => true,
                'query_var' => true,
                'show_ui' => true,
                'show_in_menu' => false,
                'show_in_nav_menus' => false,
                'show_in_quick_edit' => true,
                'show_admin_column' => false,
                'labels' => array(
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
                ),
                'rewrite' => false,
            )
        );
    }

    // Create 'admin_status' terms
    public function create_admin_status_terms() {
        foreach($this->terms as $slug => $label) {
            wp_insert_term($label, 'admin_status', array('slug' => $slug));
        }
    }

    // Add 'admin_status' column in administration
    public function register_admin_status_column( $columns ) {
        $columns['admin_status'] = __('Admin Status', 'mill3wp');
        return $columns;
    }

    // Populate 'admin_status' column with data from post_id
    public function populate_admin_status_column( $column, $post_id ) {
        if( $column !== 'admin_status' ) return;

        $terms = get_the_terms($post_id, 'admin_status');
        if( !$terms ) return;

        echo '<ul class="mill3-admin_status">';

        foreach($terms as $term) {
            echo '<li 
                    class="mill3-admin_status__btn --' . $term->slug . '"
                    aria-label="' . $term->name . '"
                  >
                    <span class="mill3-admin_status__btn__dot" aria-hidden="true"></span>
                    <span class="mill3-admin_status__btn__tooltip" aria-hidden="true">' . $term->name . '</span>
                  </li>';
        }

        echo '</ul>';
    }

    // Add css to style admin_status column
    public function add_css() {
        
        // inject css only for Edit page of selected post-types
        $screen = get_current_screen();
        if( !$screen || $screen->id !== "edit-" . $screen->post_type || !in_array($screen->post_type, $this->post_types) ) return;

        $length = count($this->terms);
        $gap = 10;

        echo '<style>
            .fixed .column-admin_status {
                box-sizing: content-box;
                width: ' . ($length * 8 + $gap * $length - $gap) . 'px !important;
            }

            .mill3-admin_status {
                display: grid;
                grid-template-columns: repeat(' . $length . ', auto);
                grid-gap: ' . $gap . 'px;
                justify-content: start;
            }
            .mill3-admin_status__btn {
                position: relative;
                display: block;
                margin: 0;
                padding: 0;
                width: 8px;
                height: 8px;
                border: none;
            }
            .mill3-admin_status__btn.--a-traduire .mill3-admin_status__btn__dot { background: #ff0000; }
            .mill3-admin_status__btn.--aide-design .mill3-admin_status__btn__dot { background: #00ff00; }
            .mill3-admin_status__btn.--copydeck-fr .mill3-admin_status__btn__dot { background: #0000ff; }
            .mill3-admin_status__btn.--copydeck-en .mill3-admin_status__btn__dot { background: #ffc300; }
            .mill3-admin_status__btn.--texte-lorem .mill3-admin_status__btn__dot { background: #ff00ff; }
            .mill3-admin_status__btn.--traductions-manquantes .mill3-admin_status__btn__dot { background: #00ffff; }

            .mill3-admin_status__btn:hover .mill3-admin_status__btn__tooltip {
                opacity: 1;
            }

            .mill3-admin_status__btn__dot {
                display: block;
                width: 100%;
                height: 100%;
                border-radius: 100%;
                background: black;
            }
            .mill3-admin_status__btn__tooltip {
                position: absolute;
                top: 50%;
                right: calc(100% + 7px);
                display: block;
                color: #000;
                background: #fff;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                font-size: 10px;
                line-height: 1;
                padding: 5px 7px;
                white-space: nowrap;
                opacity: 0;
                transform: translateY(-50%);
                pointer-events: none;
            }
            .mill3-admin_status__btn__tooltip::after {
                content: "";
                position: absolute;
                top: calc(50% - 5px);
                left: 100%;
                width: 0; 
                height: 0;
                border-top: 5px solid transparent;
                border-bottom: 5px solid transparent;
                border-left: 5px solid #fff;
            }
        </style>';
    }

    // Add filter
    public function add_filters($post_type, $which) {
        // add filter only for top bar of selected post-types
        if( $which !== 'top' || !in_array($post_type, $this->post_types) ) return;

        // make sure we are in the edit.php page
        $screen = get_current_screen();
        if( !$screen || $screen->id !== "edit-" . $screen->post_type ) return;

        // get all terms
        $terms = get_terms(array(
            'taxonomy' => 'admin_status',
            'hide_empty' => false,
        ));

        // if terms is empty, stop here
        if( count($terms) < 1 ) return;

        // get current term if is set
        $current_term = isset($_GET['admin-status-filter']) ? $_GET['admin-status-filter'] : null;

        // create <select> field
        echo '<select name="admin-status-filter" id="mill3-admin-status-filter">';
        echo '<option value="0">All Admin Status</option>';

        foreach($terms as $term) {
            echo '<option value="' . $term->term_id . '"' . ($current_term == $term->term_id ? ' selected="selected"' : '') . '>' . $term->name . '</option>';
        }

        echo '</select>';
    }

    // Parse query when admin_status filter is used
    public function parse_filters_query($query) {
        // make sure we are in the main_query
        if( !$query->is_main_query() ) return;

        // make sure we are in the edit.php page
        $screen = get_current_screen();
        if( !$screen || $screen->id !== "edit-" . $screen->post_type || !in_array($screen->post_type, $this->post_types) ) return;

        // if term is not set, stop here
        if( !isset($_GET['admin-status-filter']) ) return;

        // get term ID and sanitize data
        $term_id = sanitize_text_field($_GET['admin-status-filter']);

        // if term is equal to zero, stop here
        if($term_id == 0) return;

        $query->query_vars['tax_query'] = array(array(
            'taxonomy' => 'admin_status',
            'field' => 'id',
            'terms' => array($term_id),
        ));
    }

};

new MILL3_AdminStatus();
