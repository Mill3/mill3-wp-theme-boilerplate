<?php

if( class_exists('ACF_Walker_Nav_Menu_Edit') ) {
    require_once ABSPATH . 'wp-content/plugins/advanced-custom-fields-pro/includes/walkers/class-acf-walker-nav-menu-edit.php';
    class Base_Divider_Walker_Nav_Menu_Edit extends ACF_Walker_Nav_Menu_Edit {}
}
else {
    require_once ABSPATH . 'wp-admin/includes/class-walker-nav-menu-edit.php';
    class Base_Divider_Walker_Nav_Menu_Edit extends Walker_Nav_Menu_Edit {}
}


class Divider_Walker_Nav_Menu_Edit extends Base_Divider_Walker_Nav_Menu_Edit {
    /**
     * Start the element output.
     *
     * @see Walker_Nav_Menu_Edit::start_el()
     *
     * @param string   $output Used to append additional content (passed by reference).
     * @param WP_Post  $item   Menu item data object.
     * @param int      $depth  Depth of menu item. Used for padding.
     * @param stdClass $args   Not used.
     * @param int      $id     Not used.
     */
    public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
    // if not divider, use parent method
    if( $item->title !== '_divider_' ) {
      parent::start_el( $output, $item, $depth, $args, $id );
      return;
    }

        // vars
        $item_output = '';

        $item->label = __('Separator');
        $item->type_label = __('Separator');

        // call parent function
        parent::start_el( $item_output, $item, $depth, $args, $id );

        // inject custom HTML for divider
        $output .= preg_replace(
            array('/menu-item-custom/'),
            array('menu-item-custom menu-item-divider'),
            $item_output
        );
    }
}
