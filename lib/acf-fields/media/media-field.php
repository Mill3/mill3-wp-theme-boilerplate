<?php

// exit if accessed directly
if( ! defined( 'ABSPATH' ) ) exit;


// check if class already exists
if( !class_exists('MILL3_acf_field_media') ) :


    class MILL3_acf_field_media extends acf_field_file {
        
        
        /**
         * This function will setup the field type data
         *
         * @type    function
         * @date    5/03/2014
         * @since   5.0.0
         *
         * @param   n/a
         * @return  n/a
         */
        function initialize() {
            parent::initialize();

            // vars
            $this->name          = 'media';
            $this->label         = __('Media', 'mill3-acf-media');
            $this->category      = 'Mill3';
            $this->description   = __( 'Uses the native WordPress media picker to upload, or choose file.', 'mill3-acf-media' );
            //$this->defaults['mime_types'] = '';
            $this->defaults['show_poster'] = false;
            $this->defaults['show_mobile_video'] = false;
        }

        /**
		 * Create extra options for your field. This is rendered when editing a field.
		 * The value of $field['name'] can be used (like bellow) to save extra data to the $field
		 *
		 * @type    action
		 * @since   3.6
		 * @date    23/01/13
		 *
		 * @param   $field  - an array holding all the field's data
		 */
		function render_field_settings( $field ) {
            // transform mime_types from comma separated string to array
            $field['mime_types'] = acf_get_array( $field['mime_types'], ',' );

			acf_render_field_setting(
				$field,
				array(
					'label' => __( 'Allowed File Types', 'acf' ),
					//'hint' => __( 'Comma separated list. Leave blank for all types', 'acf' ),
					'type' => 'checkbox',
					'name' => 'mime_types',
                    'layout' => 'horizontal',
                    'choices' => array(
						'jpg' => 'JPG',
						'png' => 'PNG',
						'gif' => 'GIF',
						'svg' => 'SVG',
						'webp' => 'WebP',
						'mp4' => 'MP4',
                        'riv' => 'Rive'
					)
				)
			);

            acf_render_field_setting(
                $field,
                array(
                    'label'        => __( 'Show poster field ?', 'acf' ),
                    'instructions' => __( 'Allow user to upload poster image for video.', 'mill3-acf-media' ),
                    'type'         => 'true_false',
                    'name'         => 'show_poster',
                    'ui'           => 1,
                    'conditions'   => array(
						'field'    => 'mime_types',
						'operator' => '==',
						'value'    => 'mp4',
					),
                )
            );

            acf_render_field_setting(
                $field,
                array(
                    'label'        => __( 'Show mobile video field ?', 'acf' ),
                    'instructions' => __( 'Allow user to upload a smaller video for mobile.', 'mill3-acf-media' ),
                    'type'         => 'true_false',
                    'name'         => 'show_mobile_video',
                    'ui'           => 1,
                    'conditions'   => array(
						'field'    => 'mime_types',
						'operator' => '==',
						'value'    => 'mp4',
					),
                )
            );

            parent::render_field_settings( $field );
		}


        /**
		 * Renders the field settings used in the "Validation" tab.
		 *
		 * @since 6.0
		 *
		 * @param array $field The field settings array.
		 * @return void
		 */
		function render_field_validation_settings( $field ) {
			// Clear numeric settings.
			$clear = array(
				'min_size',
				'max_size',
			);

			foreach ( $clear as $k ) {
				if ( empty( $field[ $k ] ) ) {
					$field[ $k ] = '';
				}
			}

			acf_render_field_setting(
				$field,
				array(
					'label'        => __( 'Minimum', 'acf' ),
					'instructions' => __( 'Restrict which files can be uploaded', 'acf' ),
					'type'         => 'text',
					'name'         => 'min_size',
					'prepend'      => __( 'File size', 'acf' ),
					'append'       => 'MB',
				)
			);

			acf_render_field_setting(
				$field,
				array(
					'label'        => __( 'Maximum', 'acf' ),
					'instructions' => __( 'Restrict which files can be uploaded', 'acf' ),
					'type'         => 'text',
					'name'         => 'max_size',
					'prepend'      => __( 'File size', 'acf' ),
					'append'       => 'MB',
				)
			);
		}


        /**
         *  This filter is appied to the $field before it is saved to the database.
         *
         *  @type    filter
         *  @date    23/01/13
         *  @since   3.6
         *
         *  @param   $field - the field array holding all the field options
         *  @return  $field - the modified field
         */

        function update_field( $field ) {
            // transform mime_types array to comma separated string
            if( is_array( $field['mime_types'] ) ) {
                $mime_types['mime_types'] = implode(',', $field['mime_types']);
            }

            // return
            return $field;
        }
    }

    // initialize
    acf_register_field_type( 'MILL3_acf_field_media' );
endif; // class_exists check

?>
