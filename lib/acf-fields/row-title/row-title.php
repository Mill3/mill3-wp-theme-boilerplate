<?php

// exit if accessed directly
if( ! defined( 'ABSPATH' ) ) exit;


// check if class already exists
if( !class_exists('MILL3_acf_field_row_title') ) :


class MILL3_acf_field_row_title extends acf_field {


	/*
	 *  __construct
	 *
	 *  This function will setup the field type data
	 *
	 *  @type	function
	 *  @date	5/03/2014
	 *  @since	5.0.0
	 *
	 *  @param	n/a
	 *  @return	n/a
	 */

	function __construct( $settings ) {

		/*
		 *  name (string) Single word, no spaces. Underscores allowed
		 */

		$this->name = 'row-title';


		/*
		 *  label (string) Multiple words, can include spaces, visible when selecting a field type
		 */

		$this->label = __('Page builder row title', 'mill3-acf-row-title');


		/*
		 *  category (string) basic | content | choice | relational | jquery | layout | CUSTOM GROUP NAME
		 */

		$this->category = 'Mill3';

        /*
		 *  settings (array) Store plugin settings (url, path, version) as a reference for later use with assets
		 */

		$this->settings = $settings;


		// do not delete!
    	parent::__construct();
	}


	/*
	 *  render_field_settings()
	 *
	 *  Create extra settings for your field. These are visible when editing a field
	 *
	 *  @type	action
	 *  @since	3.6
	 *  @date	23/01/13
	 *
	 *  @param	$field (array) the $field being edited
	 *  @return	n/a
	 */

	function render_field_settings( $field ) {
		// sshhh, silence is golden here;
	}



	/*
	 *  render_field()
	 *
	 *  Create the HTML interface for your field
	 *
	 *  @param	$field (array) the $field being rendered
	 *
	 *  @type	action
	 *  @since	3.6
	 *  @date	23/01/13
	 *
	 *  @param	$field (array) the $field being edited
	 *  @return	n/a
	 */

	function render_field( $field ) {
        // sshhh, silence is golden here;
	}


	/*
	 *  input_admin_enqueue_scripts()
	 *
	 *  This action is called in the admin_enqueue_scripts action on the edit screen where your field is created.
	 *  Use this action to add CSS + JavaScript to assist your render_field() action.
	 *
	 *  @type	action (admin_enqueue_scripts)
	 *  @since	3.6
	 *  @date	23/01/13
	 *
	 *  @param	n/a
	 *  @return	n/a
	 */

	function input_admin_enqueue_scripts() {

		// vars
		$url = $this->settings['url'];
		$version = $this->settings['version'];

		// register & include CSS
		wp_register_style('mill3-acf-row-title', "{$url}assets/css/row-title.css", null, $version);
		wp_enqueue_style('mill3-acf-row-title');

	}

}


// initialize
new MILL3_acf_field_row_title(
    array(
        'version'	=> '1.0.0',
        'url'		=> get_template_directory_uri() . '/lib/acf-fields/row-title/',
        'path'		=> get_template_directory() . '/lib/acf-fields/row-title/'
    )
);


// class_exists check
endif;

?>
