<?php

// exit if accessed directly
if( ! defined('ABSPATH') ) exit;


// check if class already exists
if( ! class_exists('MILL3_acf_field_graphic_composition') ) :


class MILL3_acf_field_graphic_composition extends \acf_field {
	
	/**
	 * Controls field type visibilty in REST requests.
	 *
	 * @var bool
	 */
	public $show_in_rest = true;

	/**
	 * Environment values relating to the theme or plugin.
	 *
	 * @var array $env Plugin or theme context such as 'url' and 'version'.
	 */
	private $env;


	/**
	 * Constructor.
	 */	
	function __construct() {
		
		/**
		 * Field type reference used in PHP and JS code.
		 *
		 * No spaces. Underscores allowed.
		 */
		$this->name = 'graphic_composition';
		
		/**
		 * Field type label.
		 *
		 * For public-facing UI. May contain spaces.
		 */
		$this->label = __('Graphic Composition', 'mill3-acf-graphic-composition');

        /**
		 * Field type Description.
		 *
		 * For field descriptions. May contain spaces.
		 */
		//$this->description = __('FIELD_DESCRIPTION', 'mill3-acf-graphic-composition');
		
        /**
		 * The category the field appears within in the field type picker.
		 */
		$this->category = 'Mill3';
		
        /**
		 * Defaults for your custom user-facing settings for this field type.
		 */
		$this->defaults = array(
            'editor_modal' => '',
            'editor_width' => 600,
            'editor_height' => 600,
		);


		/**
		 * Strings used in JavaScript code.
		 *
		 * Allows JS strings to be translated in PHP and loaded in JS via:
		 *
		 * ```js
		 * const errorMessage = acf._e("FIELD_NAME", "error");
		 * ```
		 */
		$this->l10n = array(
			//'error'	=> __('Error! Please enter a higher value', 'mill3-acf-graphic-composition'),
		);

		$this->env = array(
			'url'     => site_url( str_replace( ABSPATH, '', __DIR__ ) ), // URL to the field type directory.
			'version' => '1.0', // Replace this with your theme or plugin version constant.
		);

        /**
		 * Field type preview image.
		 *
		 * A preview image for the field type in the picker modal.
		 */
		//$this->preview_image = $this->env['url'] . '/assets/images/field-preview-custom.png';


        // custom actions
        add_filter('acf/field_group/additional_field_settings_tabs', array($this, 'render_field_editor_tabs'));
		

    	parent::__construct();
	}

    /**
     * Create custom Tabs in field's settings
     * 
     * @param array $tabs
     * @return array
     */
    public function render_field_editor_tabs( $tabs ) {
        $tabs['editor'] = 'Editor';

        return $tabs;
    }

    /**
	 * Settings to display when users configure a field of this type.
	 *
	 * These settings appear on the ACF “Edit Field Group” admin page when
	 * setting up the field.
	 *
	 * @param array $field
	 * @return void
	 */
	public function render_field_editor_settings( $field ) {

        // editor_modal
        acf_render_field_setting(
			$field,
			array(
				'label'	=> __( 'Modal Label', 'mill3-acf-graphic-composition' ),
				'type' => 'text',
				'name' => 'editor_modal',
                'placeholder' => __('Open Editor', 'mill3-acf-graphic-composition'),
			)
		);

		// editor_width
		acf_render_field_setting(
			$field,
			array(
				'label' => __( 'Canvas Size', 'mill3-acf-graphic-composition' ),
				'hint' => __( 'Graphic composition ratio on frontend.', 'mill3-acf-graphic-composition' ),
				'type' => 'text',
				'name' => 'editor_width',
				'prepend' => __( 'Width', 'mill3-acf-graphic-composition' ),
				'append' => 'px',
			)
		);

        // editor_height
		acf_render_field_setting(
			$field,
			array(
                'label' => '',
				'type' => 'text',
				'name' => 'editor_height',
				'prepend' => __( 'Height', 'mill3-acf-graphic-composition' ),
				'append' => 'px',
                '_append' => 'editor_width',
			)
		);
	}

    /**
	 * HTML content to show when a publisher edits the field on the edit screen.
	 *
	 * @param array $field The field settings and values.
	 * @return void
	 */
	public function render_field( $field ) {

        $editor_settings = array(
            'width' => $field['editor_width'],
            'height' => $field['editor_height'],
        );

        // Input.
        $input_attrs = array(
            'id' => $field['id'],
            'name' => $field['name'],
            'class' => 'graphic-composition__input',
            'value' => json_encode($editor_settings),
        );

        acf_hidden_input( $input_attrs );

        // Button.
        $btn_attrs = array(
            'class' => 'acf-button button graphic-composition__btnModal',
            'data-id' => $field['id'],
            'data-name' => $field['name'],
            'data-key' => $field['key'],
        );
        
        echo sprintf( '<button %s>%s</button>', acf_esc_attrs( $btn_attrs ), acf_esc_html($field['editor_modal']) );


		// Debug output to show what field data is available.
		//echo '<pre>';
		//print_r( $field );
		//echo '</pre>';
	}

    /**
	 * Enqueues CSS and JavaScript needed by HTML in the render_field() method.
	 *
	 * Callback for admin_enqueue_script.
	 *
	 * @return void
	 */
	public function input_admin_enqueue_scripts() {
		$url     = trailingslashit( $this->env['url'] );
		$version = $this->env['version'];

        wp_register_style('graphic_composition-App', "{$url}build/index.css", array(), $version);
        wp_register_script('graphic_composition-App', "{$url}build/index.js", array('wp-element'), $version, true);
		wp_register_script('graphic_composition', "{$url}assets/js/input.js", array('acf-input', 'graphic_composition-App'), $version, true);

		wp_enqueue_style('graphic_composition-App');
        wp_enqueue_script('graphic_composition-App');
		wp_enqueue_script('graphic_composition');
	}

    /**
     * Add inline HTML 
     */
    public function input_admin_footer() {
        ?>
        <dialog id="GraphicComposition" class="GraphicComposition">
            <h1>Loading...</h1>
        </dialog>
        <?php
    }

    /**
     * This function will translate field settings.
     *
     * @date  8/03/2016
     * @since 5.3.2
     *
     * @param array $field The main field array.
     * @return array
     */
    function translate_field( $field ) {
        $field['editor_modal'] = acf_translate( $field['editor_modal'] );

        return $field;
    }


    // Set field default value without saving them in database
    public function prepare_field( $field ) {
        if ( '' === $field['editor_modal'] ) {
            $field['editor_modal'] = __('Open Editor', 'mill3-acf-graphic-composition');
        }

        return $field;
    }
	
}

endif; // class_exists check

?>
