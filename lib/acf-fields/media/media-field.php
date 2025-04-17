<?php

// exit if accessed directly
if( ! defined( 'ABSPATH' ) ) exit;


// check if class already exists
if( !class_exists('MILL3_acf_field_media') ) :


    class MILL3_acf_field_media extends acf_field {
        
        
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
            // env
            $this->env = array(
                'url'     => site_url( str_replace( ABSPATH, '', __DIR__ ) ), // URL to the field directory.
                'version' => '1.0', // Replace this with your theme or plugin version constant.
            );

            // vars
            $this->name          = 'media';
            $this->label         = __('Media', 'mill3-acf-media');
            $this->category      = 'Mill3';
            $this->description   = __( 'Uses the native WordPress media picker to upload, or choose file.', 'mill3-acf-media' );
			$this->preview_image = acf_get_url() . '/assets/images/field-type-previews/field-preview-file.png';
            $this->doc_url       = null;

            $this->defaults      = array(
                'show_poster'       => false,
                'show_mobile_video' => false,
                'return_format'     => 'array',
				'library'           => 'all',
				'min_size'          => 0,
				'max_size'          => 0,
				'mime_types'        => '',
			);

			// filters
			add_filter( 'get_media_item_args', array( $this, 'get_media_item_args' ) );
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
            // localize
			acf_localize_text(
				array(
					'Select Media' => __( 'Select Media', 'mill3-acf-media' ),
					'Edit Media'   => __( 'Edit Media', 'mill3-acf-media' ),
					'Update Media' => __( 'Update Media', 'mill3-acf-media' ),

                    'Select Poster' => __( 'Select Poster', 'mill3-acf-media' ),
					'Edit Post'   => __( 'Edit Poster', 'mill3-acf-media' ),
					'Update Poster' => __( 'Update Poster', 'mill3-acf-media' ),

                    'Select mobile Media' => __( 'Select mobile Media', 'mill3-acf-media' ),
					'Edit mobile Media'   => __( 'Edit mobile Media', 'mill3-acf-media' ),
					'Update mobile Media' => __( 'Update mobile Media', 'mill3-acf-media' ),
				)
			);
            
            // vars
            $url     = trailingslashit( $this->env['url'] );
            $version = $this->env['version'];
            
            
            // register & include JS
            wp_register_script('mill3-acf-media', "{$url}assets/js/input.js", array('acf-input'), $version);
            wp_enqueue_script('mill3-acf-media');
            
            // register & include CSS
            wp_register_style('mill3-acf-media', "{$url}assets/css/input.css", array('acf-input'), $version);
            wp_enqueue_style('mill3-acf-media');
        }


        /**
		 * description
		 *
		 * @type    function
		 * @date    27/01/13
		 * @since   3.6.0
		 *
		 * @param   $vars (array)
		 * @return  $vars
		 */
		function get_media_item_args( $vars ) {
			$vars['send'] = true;
			return( $vars );
		}


        /**
		 * Create the HTML interface for your field
		 *
		 * @param   $field - an array holding all the field's data
		 *
		 * @type    action
		 * @since   3.6
		 * @date    23/01/13
		 */
        function render_field( $field ) {
			// enqueue uploader
			acf_enqueue_uploader();

			$div = array(
				'class'           => 'acf-media-uploader',
				'data-library'    => $field['library'],
				'data-mime_types' => $field['mime_types'],
				'data-uploader'   => 'wp'
			);

            // allowed files from field settings
            $files = array('file');
            if( $field['show_poster'] ) $files[] = 'poster';
            if( $field['show_mobile_video'] ) $files[] = 'mobile';

            // file has value?
            if( $field['value'] && $field['value']['file'] ) {
                $attachment = acf_get_attachment( $field['value']['file'] );

                // if file is a video, add classname to $controls
                if( $attachment && $attachment['type'] == 'video' ) $div['class'] .= ' --is-video';
            }

            ?>
            <div <?php echo acf_esc_attrs( $div ); ?>>
            
                <?php acf_hidden_input( array('name' => $field['name'], 'value' => $field['value'], 'data-name' => 'id') ); ?>
                <?php 
                    // create output of each file
                    foreach($files as $file): 
                        
                        $wrapper = array(
                            'class'     => 'file',
                            'data-file' => $file,
                        );

                        $o = array(
                            'icon'     => '',
                            'title'    => '',
                            'url'      => '',
                            'filename' => '',
                            'filesize' => '',
                        );

                        // has value?
                        if( $field['value'] && $field['value'][$file] ) {
                            $attachment = acf_get_attachment( $field['value'][$file] );
                            
                            if( $attachment ) {
                                // has value
                                $wrapper['class'] .= ' has-value';

                                // update
                                $o['icon']     = $attachment['icon'];
                                $o['title']    = $attachment['title'];
                                $o['url']      = $attachment['url'];
                                $o['filename'] = $attachment['filename'];

                                if ( $attachment['filesize'] ) $o['filesize'] = size_format( $attachment['filesize'] );
                            }
                        }
                ?>
                    <div <?php echo acf_esc_attrs( $wrapper ); ?>>
                        <?php if( $file !== 'file' ): ?>
                        <div class="acf-label">
                            <label><?php echo sprintf( esc_html__( '%s\'s %s', 'acf' ), $field['label'], $file); ?></label>
                        </div>
                        <?php endif; ?>

                        <div class="show-if-value file-wrap">
                            <div class="file-icon">
                                <img data-name="icon" src="<?php echo esc_url( $o['icon'] ); ?>" alt=""/>
                            </div>
                            <div class="file-info">
                                <p>
                                    <strong data-name="title"><?php echo esc_html( $o['title'] ); ?></strong>
                                </p>
                                <p>
                                    <strong><?php esc_html_e( 'File name', 'acf' ); ?>:</strong>
                                    <a data-name="filename" href="<?php echo esc_url( $o['url'] ); ?>" target="_blank"><?php echo esc_html( $o['filename'] ); ?></a>
                                </p>
                                <p>
                                    <strong><?php esc_html_e( 'File size', 'acf' ); ?>:</strong>
                                    <span data-name="filesize"><?php echo esc_html( $o['filesize'] ); ?></span>
                                </p>
                            </div>
                            <div class="acf-actions -hover">
                                <a class="acf-icon -pencil dark" data-name="edit" href="#" title="<?php esc_attr_e( 'Edit', 'acf' ); ?>"></a>
                                <a class="acf-icon -cancel dark" data-name="remove" href="#" title="<?php esc_attr_e( 'Remove', 'acf' ); ?>"></a>
                            </div>
                        </div>

                        <div class="hide-if-value">
                            <p><?php esc_html_e( 'No file selected', 'acf' ); ?> <a data-name="add" class="acf-button button" href="#"><?php esc_html_e( 'Add File', 'acf' ); ?></a></p>
                        </div>
                    </div>
                <?php endforeach; ?>

            </div>
            <?php
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
                        'webm' => 'WebM',
                        'riv' => 'Rive'
					)
				)
			);

            acf_render_field_setting(
                $field,
                array(
                    'label'        => __( 'Show poster field ?', 'mill3-acf-media' ),
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
                    'label'        => __( 'Show mobile video field ?', 'mill3-acf-media' ),
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

            acf_render_field_setting(
				$field,
				array(
					'label'        => __( 'Return Value', 'acf' ),
					'instructions' => __( 'Specify the returned value on front end', 'acf' ),
					'type'         => 'radio',
					'name'         => 'return_format',
					'layout'       => 'horizontal',
					'choices'      => array(
						'array' => __( 'File Array', 'acf' ),
						'url'   => __( 'File URL', 'acf' ),
						'id'    => __( 'File ID', 'acf' ),
					),
				)
			);

			acf_render_field_setting(
				$field,
				array(
					'label'        => __( 'Library', 'acf' ),
					'instructions' => __( 'Limit the media library choice', 'acf' ),
					'type'         => 'radio',
					'name'         => 'library',
					'layout'       => 'horizontal',
					'choices'      => array(
						'all'        => __( 'All', 'acf' ),
						'uploadedTo' => __( 'Uploaded to post', 'acf' ),
					),
				)
			);
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
                $field['mime_types'] = implode(',', $field['mime_types']);
            }

            // return
            return $field;
        }


        /**
		 * load_value
		 *
		 * Filters the value loaded from the database.
		 *
		 * @date    16/10/19
		 * @since   5.8.1
		 *
		 * @param   mixed $value   The value loaded from the database.
		 * @param   mixed $post_id The post ID where the value is saved.
		 * @param   array $field   The field settings array.
		 * @return  (array|false)
		 */
		function load_value( $value, $post_id, $field ) {

			// Ensure value is an array.
			if ( $value ) {
				return wp_parse_args(
					$value,
					array(
						'file' => false,
						'poster' => false,
						'mobile' => false,
					)
				);
			}

			// Return default.
			return false;
		}


        /**
		 * This filter is appied to the $value after it is loaded from the db and before it is returned to the template
		 *
		 * @type    filter
		 * @since   3.6
		 * @date    23/01/13
		 *
		 * @param   $value (mixed) the value which was loaded from the database
		 * @param   $post_id (mixed) the post_id from which the value was loaded
		 * @param   $field (array) the field array holding all the field options
		 *
		 * @return  $value (mixed) the modified value
		 */
		function format_value( $value, $post_id, $field ) {
			// bail early if no value
			if ( empty( $value ) || $value === false ) {
				return false;
			}

			// bail early if not array (error message)
			if ( ! is_array( $value ) ) {
				return false;
			}

			// convert to int
			$value = wp_parse_args(
                $value,
                array(
                    'file' => false,
                    'poster' => false,
                    'mobile' => false,
                )
            );

            // bail early if main file doesn't exists 
            if( !$value['file'] ) return false;

            // apply format to each values
            $value = array_map(function($file) use ($field) {
                if ( $field['return_format'] == 'url' ) {
                    return wp_get_attachment_url( $file );
                } elseif ( $field['return_format'] == 'array' ) {
                    return acf_get_attachment( $file );
                }

                return $file;
            }, $value);

			// return
			return $value;
		}


        /**
		 * This filter is appied to the $value before it is updated in the db
		 *
		 * @type    filter
		 * @since   3.6
		 * @date    23/01/13
		 *
		 * @param   $value - the value which will be saved in the database
		 * @param   $post_id - the post_id of which the value will be saved
		 * @param   $field - the field array holding all the field options
		 *
		 * @return  $value - the modified value
		 */
		function update_value( $value, $post_id, $field ) {

			// decode JSON string.
			if ( is_string( $value ) ) {
				$value = json_decode( wp_unslash( $value ), true );
			}

			// Ensure value is an array.
			if ( $value ) {
                foreach(['file', 'poster', 'mobile'] as $file) {
                    if( !$value[$file] ) continue;

                    // Parse value for id.
                    $attachment_id = acf_idval( $value[$file] );

                    // Connect attacment to post.
			        acf_connect_attachment_to_post( $attachment_id, $post_id );

                    // Return id.
                    $value[$file] = $attachment_id;
                }

				return (array) $value;
			}

			// Return default.
			return false;
		}



        /**
		 * Return the schema array for the REST API.
		 *
		 * @param array $field
		 * @return array
		 */
		public function get_rest_schema( array $field ) {
            $schema = parent::get_rest_schema( $field );
			$schema['properties'] = array(
                'file' => array(
                    'type' => array('integer', 'null'),
                    'required' => true,
                ),
                'poster' => array(
                    'type' => array('integer', 'null')
                ),
                'mobile' => array(
                    'type' => array('integer', 'null')
                )
            );

			return $schema;
		}



        /**
		 * Apply basic formatting to prepare the value for default REST output.
		 *
		 * @param mixed          $value
		 * @param string|integer $post_id
		 * @param array          $field
		 * @return mixed
		 */
		public function format_value_for_rest( $value, $post_id, array $field ) {
            if ( ! $value ) {
				return null;
			}

			return acf_format_numerics( $value );
		}
    }

    // initialize
    acf_register_field_type( 'MILL3_acf_field_media' );
endif; // class_exists check

?>
