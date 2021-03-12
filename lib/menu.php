<?php

namespace Mill3WP\Menu;





/**
 * Add a divider meta box in menu editor
 *
 * @param object $object The meta box object
 * @link https://developer.wordpress.org/reference/functions/add_meta_box/
 */
function divider_menu_meta_box( $object ) {
    add_meta_box('custom-menu-metabox', __( 'Separator' ), __NAMESPACE__ . '\\divider_meta_box_html', 'nav-menus', 'side', 'low');
    return $object;
}

/**
 * Output Divider meta box
 */
function divider_meta_box_html() {
    global $_nav_menu_placeholder, $nav_menu_selected_id;

    $_nav_menu_placeholder = 0 > $_nav_menu_placeholder ? $_nav_menu_placeholder - 1 : -1;

    ?>
    <div class="dividerdiv" id="dividerdiv">
        <input type="hidden" value="divider" name="menu-item[<?php echo $_nav_menu_placeholder; ?>][menu-item-type]" />
        <input type="hidden" value="#" name="menu-item[<?php echo $_nav_menu_placeholder; ?>][menu-item-url]" />
        <input type="hidden" value="-" name="menu-item[<?php echo $_nav_menu_placeholder; ?>][menu-item-title]" />

        <p class="button-controls wp-clearfix">
            <span class="add-to-menu">
                <input type="submit"<?php wp_nav_menu_disabled_check( $nav_menu_selected_id ); ?> class="button right" value="<?php esc_attr_e( 'Add to Menu' ); ?>" name="add-divider" />
                <span class="spinner"></span>
            </span>
        </p>

    </div><!-- /.customlinkdiv -->

    <script type="text/javascript">
        (function($) {
            function attachDividerListener() {
                var dividerDiv = document.querySelector('#dividerdiv');
                var button = dividerDiv.querySelector('.button');

                button.addEventListener('click', addDivider);
            }
            function addDivider() {
                var dividerDiv = document.querySelector('#dividerdiv');
                var spinner = dividerDiv.querySelector('.spinner');
                var api = window.wpNavMenu;

                // Show the Ajax spinner.
                spinner.classList.add( 'is-active' );

                // add divider to menu
                api.addLinkToMenu('#', '_divider_', api.addMenuItemToBottom, function() {
                    // Remove the Ajax spinner.
                    spinner.classList.remove( 'is-active' );
                });
            }

            $(document).ready(attachDividerListener);
        })(jQuery);
    </script>

    <style type="text/css">
        .menu-item-divider .menu-item-bar {
            margin-top: 30px;
        }
        .menu-item-divider.menu-item-edit-inactive .menu-item-bar,
        .menu-item-divider.menu-item-edit-active .menu-item-settings {
            margin-bottom: 30px;
        }
        .menu-item-divider.menu-item-edit-inactive .menu-item-bar .menu-item-handle {
            background-color: transparent;
            border: none;
            box-shadow: none;
        }
        .menu-item-divider.menu-item-edit-inactive .menu-item-bar .menu-item-handle::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 10px;
            right: 35px;
            height: 1px;
            background: #ddd;
        }
        .menu-item-divider .menu-item-settings .field-css-classes {
            width: 390px;
        }
        .menu-item-divider.menu-item-edit-inactive .menu-item-bar .item-title,
        .menu-item-divider.menu-item-edit-inactive .menu-item-bar .item-type {
            visibility: hidden;
        }

        .menu-item-divider .menu-item-settings .field-url,
        .menu-item-divider .menu-item-settings .field-url + .description,
        .menu-item-divider .menu-item-settings .field-title-attribute,
        .menu-item-divider .menu-item-settings .field-link-target,
        .menu-item-divider .menu-item-settings .field-xfn,
        .menu-item-divider .menu-item-settings .field-description {
            display: none;
        }
    </style>
    <?php
}

/**
 * Use our custom walker to display dividers in menu editor
 */
function filter_wp_edit_nav_menu_walker($walker_nav_menu_edit, $post_menu) {
    $filepath = locate_template('lib/class-walker-nav-menu-edit.php');
    require_once $filepath;

    return 'Divider_Walker_Nav_Menu_Edit';
}

add_filter('nav_menu_meta_box_object', __NAMESPACE__ . '\\divider_menu_meta_box', 10, 1);
add_filter('wp_edit_nav_menu_walker', __NAMESPACE__ . '\\filter_wp_edit_nav_menu_walker', 10, 2);




/* 
 * Customize Menu Item Classes
 *
 * @param array $classes, current menu classes
 * @param object $item, current menu item
 * @param object $args, menu arguments
 * @return array $classes
 */
function menu_item_classes( $classes, $item, $args ) {   
    $is_ancestor = false;

    // if menu-item is a post-type archive
    if( $item->type === 'post_type_archive' ) {
        $post_type = $item->object;        

        // if current page is from this post-type
        if( is_singular($post_type) ) $is_ancestor = true;
        // if current page is a taxonomy archive
        else if( is_tax() ) {
            // get taxonomy's associated post-types
            $taxonomy = get_taxonomy( get_query_var('taxonomy') );

            // if this post-type is associated with this taxonomy, set as ancestor
            if( in_array($post_type, $taxonomy->object_type) ) $is_ancestor = true;
        }
    }
    // if menu-item is a post, page or custom post
    else if( $item->type === 'post_type' ) {
        // if menu-item is Posts page
        if( $item->object_id == get_option('page_for_posts')) {
            // if is a post, a category archive or tag archive, set as ancestor
            if( is_singular('post') || is_category() || is_tag() ) $is_ancestor = true;
        }
    }

    if( $is_ancestor ) $classes[] = 'current-menu-ancestor';
	return array_unique( $classes );
}
add_filter('nav_menu_css_class', __NAMESPACE__ . '\\menu_item_classes', 10, 3);
