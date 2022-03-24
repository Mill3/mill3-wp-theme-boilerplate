<?php

// exit if accessed directly
if( ! defined( 'ABSPATH' ) ) exit;


// check if class already exists
if( !class_exists('MILL3_acf_field_spacer') ) :


class MILL3_acf_field_spacer extends acf_field {
	
	
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
		
		$this->name = 'spacer';
		
		
		/*
		 *  label (string) Multiple words, can include spaces, visible when selecting a field type
		 */
		
		$this->label = __('Spacer', 'mill3-acf-spacer');
		
		
		/*
		 *  category (string) basic | content | choice | relational | jquery | layout | CUSTOM GROUP NAME
		 */
		
		$this->category = 'Mill3';
		
		
		/*
		 *  defaults (array) Array of default settings which are merged into the field object. These are used later in settings
		 */
		
		$this->defaults = array(
            'choices' => array(),
			'default_value'	=> '',
            'return_format' => 'value',
		);
		
		
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
		
		// encode choices (convert from array)
        $field['choices']       = acf_encode_choices( $field['choices'] );
        
        // choices
		acf_render_field_setting(
            $field, 
            array(
                'label'			=> __('Choices', 'acf'),
                'instructions'	=> __('Enter each choice on a new line.', 'acf') . '<br /><br />' . __('For more control, you may specify both a value and label like this:', 'acf') . '<br /><br />' . __('red : Red', 'acf'),
                'type'			=> 'textarea',
                'name'			=> 'choices',
		    )
        );

        // default_value
        acf_render_field_setting(
            $field, 
            array(
                'label'			=> __('Default Value', 'acf'),
                'instructions'	=> __('Appears when creating a new post', 'acf'),
                'type'			=> 'text',
                'name'			=> 'default_value',
            )
        );

        // return_format
        acf_render_field_setting(
            $field,
            array(
                'label'        => __('Return Format', 'acf'),
                'instructions' => __('Specify the value returned', 'acf'),
                'type'         => 'select',
                'name'         => 'return_format',
                'choices'      => array(
                    'value' => __('Value', 'acf'),
                    'label' => __('Label', 'acf'),
                    'array' => __('Both (Array)', 'acf'),
                ),
            )
        );

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

        // convert choices to an array
        $choices = acf_get_array( $field['choices'] );
        $values = array_keys($choices);
        $labels = array_values($choices);

        $value = $field['value'];
        $label = $choices[$value];
        $index = array_search($value, $values);

        // vars
        $atts  = array(
            'id' => $field['id'] . '-range', 
            'type' => 'range', 
            'min' => 0, 
            'max' => count($choices) - 1, 
            'step' => 1, 
            'value' => $index
        );

        $keys  = array('class');
        $keys2 = array('readonly', 'disabled', 'required');
        $html  = '';
		
		
		// atts (class="FIELD_CLASSNAME")
        foreach ( $keys as $k ) {
            if ( isset( $field[ $k ] ) ) {
                $atts[ $k ] = $field[ $k ];
            }
        }

        // atts2 (disabled="disabled")
        foreach ( $keys2 as $k ) {
            if ( ! empty( $field[ $k ] ) ) {
                $atts[ $k ] = $k;
            }
        }

        // remove empty atts
        $atts = acf_clean_atts( $atts );

        // prepare JSON
        $json_output = array();
        foreach ( $choices as $k => $v ) {
            array_push($json_output, array('value' => $k, 'label' => $v));
        }

        // open
        $html .= '<div class="mill3-acf-spacer-wrap" data-spacer-choices="'. htmlspecialchars(json_encode($json_output), ENT_QUOTES, 'UTF-8') .'">';

        // hidden
        $html .= acf_get_text_input(
            array(
                'type' => 'hidden',
                'id' => $field['id'],
                'name' => $field['name'],
                'value' => $value,
            )
        );

        // range
        $html .= acf_get_text_input( $atts );

        // label
        $html .= acf_get_text_input(
            array(
                'type'  => 'text',
                'id'    => $atts['id'] . '-label',
                'value' => $label,
                'readonly'  => 'readonly',
            )
        );

        // close
        $html .= '</div>';

        // return
        echo $html;
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
		
		
		// register & include JS
		wp_register_script('mill3-acf-spacer', "{$url}assets/js/input.js", array('acf-input'), $version);
		wp_enqueue_script('mill3-acf-spacer');
		
		
		// register & include CSS
		wp_register_style('mill3-acf-spacer', "{$url}assets/css/input.css", array('acf-input'), $version);
		wp_enqueue_style('mill3-acf-spacer');
		
	}



    /*
     *  update_field()
     *
     *  This filter is appied to the $field before it is saved to the database
     *
     *  @type    filter
     *  @since   3.6
     *  @date    23/01/13
     *
     *  @param   $field - the field array holding all the field options
     *  @param   $post_id - the field group ID (post_type = acf)
     *
     *  @return  $field - the modified field
     */

    function update_field( $field ) {

        // decode choices (convert to array)
        $field['choices'] = acf_decode_choices( $field['choices'] );

        // return
        return $field;
    }
	
	
	/*
	 *  format_value()
	 *
	 *  This filter is appied to the $value after it is loaded from the db and before it is returned to the template
	 *
	 *  @type	filter
	 *  @since	3.6
	 *  @date	23/01/13
	 *
	 *  @param	$value (mixed) the value which was loaded from the database
	 *  @param	$post_id (mixed) the $post_id from which the value was loaded
	 *  @param	$field (array) the field array holding all the field options
	 *
	 *  @return	$value (mixed) the modified value
	 */
	
	function format_value( $value, $post_id, $field ) {
		
		// bail ealry if is empty
        if ( acf_is_empty( $value ) ) {
            return $value;
        }

        // vars
        $label = acf_maybe_get( $field['choices'], $value, $value );
		
		// value
        if ( $field['return_format'] == 'value' ) {

            // do nothing

        // label
        } elseif ( $field['return_format'] == 'label' ) {

            $value = $label;

        // array
        } elseif ( $field['return_format'] == 'array' ) {

            $value = array(
                'value' => $value,
                'label' => $label,
            );

        }

        // return
        return $value;
	}
	

    /*
     *  translate_field
     *
     *  This function will translate field settings
     *
     *  @type    function
     *  @date    8/03/2016
     *  @since   5.3.2
     *
     *  @param   $field (array)
     *  @return  $field
     */

    function translate_field( $field ) {

        // translate
        $field['choices'] = acf_translate( $field['choices'] );

        // return
        return $field;

    }


    /**
     * Return the schema array for the REST API.
     *
     * @param array $field
     * @return array
     */
    public function get_rest_schema( array $field ) {
        /**
         * If a user has defined keys for the select options,
         * we should use the keys for the available options to POST to,
         * since they are what is displayed in GET requests.
         */
        $option_keys = array_diff(
            array_keys( $field['choices'] ),
            array_values( $field['choices'] )
        );

        $schema = array(
            'type'     => array( 'string', 'array', 'null' ),
            'required' => ! empty( $field['required'] ),
            'items'    => array(
                'type' => array( 'string' ),
                'enum' => empty( $option_keys ) ? $field['choices'] : $option_keys,
            ),
        );

        if ( isset( $field['default_value'] ) && '' !== $field['default_value'] ) {
            $schema['default'] = $field['default_value'];
        }

        return $schema;
    }


    /**
     * Validates select fields updated via the REST API.
     *
     * @param bool  $valid
     * @param int   $value
     * @param array $field
     *
     * @return bool|WP_Error
     */
    public function validate_rest_value( $valid, $value, $field ) {
        // rest_validate_request_arg() handles the other types, we just worry about strings.
        if ( is_null( $value ) || is_array( $value ) ) {
            return $valid;
        }

        $option_keys = array_diff(
            array_keys( $field['choices'] ),
            array_values( $field['choices'] )
        );

        $allowed = empty( $option_keys ) ? $field['choices'] : $option_keys;

        if ( ! in_array( $value, $allowed ) ) {
            $param = sprintf( '%s[%s]', $field['prefix'], $field['name'] );
            $data  = array(
                'param' => $param,
                'value' => $value,
            );
            $error = sprintf(
                __( '%1$s is not one of %2$s', 'acf' ),
                $param,
                implode( ', ', $allowed )
            );

            return new WP_Error( 'rest_invalid_param', $error, $data );
        }

        return $valid;
    }
	
}


// initialize
new MILL3_acf_field_spacer(
    array(
        'version'	=> '1.0.0',
        'url'		=> get_template_directory_uri() . '/lib/acf-fields/spacer/',
        'path'		=> get_template_directory() . '/lib/acf-fields/spacer/'
    )
);


// class_exists check
endif;

?>
