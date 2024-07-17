<?php

namespace Mill3WP\MediaGallery;

use Mill3WP\Utils;


/**
 * Set up new fields in the gallery module.
 *
 * @return void
 */
function additional_gallery_settings()
{
?>
    <script type="text/html" id="tmpl-custom-gallery-setting">
        <span class="setting">
            <label for="gallery-settings-format" class="name">Format des médias</label>
            <select id="gallery-settings-format" name="format" data-setting="format">
                <option value="portrait">Portrait (3:4)</option>
                <option value="photography">Portrait (4:6)</option>
                <option value="square">Carré (1:1)</option>
                <option value="landscape">Paysage (4:3)</option>
                <option value="postal-card">Paysage (6:4)</option>
                <option value="half-square">Paysage rectangulaire (2:1)</option>
                <option value="widescreen">Panorama (16:9)</option>
            </select>
        </span>
        <span class="setting">
            <label for="gallery-settings-grid_gap" class="name">Espace entre les médias</label>
            <select id="gallery-settings-grid_gap" name="grid_gap" data-setting="grid_gap">
                <option value="0">0</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="60">60</option>
                <option value="70">70</option>
                <option value="80">80</option>
                <option value="90">90</option>
                <option value="100">100</option>
                <option value="110">110</option>
                <option value="120">120</option>
                <option value="130">130</option>
                <option value="140">140</option>
                <option value="150">150</option>
                <option value="160">160</option>
                <option value="170">170</option>
                <option value="180">180</option>
                <option value="190">190</option>
                <option value="200">200</option>

            </select>
        </span>
        <span class="setting">
            <label for="gallery-settings-grid_gap_mobile" class="name">Espace entre les médias (mobile)</label>
            <select id="gallery-settings-grid_gap_mobile" name="grid_gap_mobile" data-setting="grid_gap_mobile">
                <option value="0">0</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="60">60</option>
                <option value="70">70</option>
                <option value="80">80</option>
                <option value="90">90</option>
                <option value="100">100</option>
                <option value="110">110</option>
                <option value="120">120</option>
                <option value="130">130</option>
                <option value="140">140</option>
                <option value="150">150</option>
                <option value="160">160</option>
                <option value="170">170</option>
                <option value="180">180</option>
                <option value="190">190</option>
                <option value="200">200</option>
            </select>
        </span>
    </script>
    <script type="text/javascript">
        jQuery( document ).ready(function() {
            _.extend( wp.media.galleryDefaults, {
                format: 'square',
                grid_gap: 0,
                grid_gap_mobile: 0
            });

            wp.media.view.Settings.Gallery = wp.media.view.Settings.Gallery.extend({
                template: function( view ) {
                    return wp.media.template('gallery-settings')(view)
                        + wp.media.template('custom-gallery-setting')(view);
                }
            });
        });
    </script>
<?php
}
add_action('print_media_templates', __NAMESPACE__ . '\\additional_gallery_settings');



/**
 * Send request to OpenAI to generate Alt Text from image
 * 
 * @return void
 */

function ai_alt_text()
{
?>
    <style>
        .mill3-generate-alt-button {
            padding: 10px 9px 8px;
            margin-bottom: 4px;
            border: 1px solid #069de3;
            border-radius: 2px;
            color: #069de3;
            background: #dcedf7;
            text-align: left;
            cursor: pointer;
            transition-property: color, border-color, background;
            transition-duration: 200ms;
            transition-timing-function: color .2s ease-in-out;
        }
        .mill3-generate-alt-button:hover {
            background: #c5e1f2;
        }
        .mill3-generate-alt-button.failed {
            color: #fff;
            border-color: #ee6a5e;
            background: #ee6a5e;
            pointer-events: none;
        }
    </style>
    
    <script type="text/javascript">
        jQuery( document ).ready(function() {

            //const isTwoColumn = true;

            const getTemplate = function(template, view, isTwoColumn = false) {
                const html = wp.media.template(template)(view);
                const dom = document.createElement('div');
                dom.innerHTML = html;

                if ( !dom.querySelector('#alt-text-description') ) return html;

                const generateAltTextButton = '<button class="mill3-generate-alt-button" data-two-column="' + isTwoColumn + '"><?php echo __('Generate Alt with AI', 'mill3wp') ?></button><br />'

                // Add it to the beginning of #alt-text-description, along with a line break.
                const altText = dom.querySelector('#alt-text-description');
                altText.innerHTML = generateAltTextButton + altText.innerHTML;

                return dom.innerHTML;
            };
            const generateAltTextForImage = function(event) {
                if( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                // get media ID
                const model = this.model;
                const mediaID = model.attributes.id;

                if( !mediaID ) return;

                const generateAltTextButton = event.currentTarget;
                const generateButtonText = generateAltTextButton.innerHTML;

                // Disable the button while generating alt text
                generateAltTextButton.disabled = true;
                generateAltTextButton.innerHTML = "<?php echo __( 'Generating…', 'mill3wp' ) ?>";
                
                altTextGenerator(mediaID)
                    .then(function(response) {
                        // if response is not for this media, stop here
                        if( response.mediaID != mediaID ) return;

                        // Successfully generated alt text, now update and save the alt text field
                        const altText = response.altText;
                        model.set('alt', altText);

                        // save if avaiable
                        if( model.save ) model.save();
                
                        const altTextField = document.querySelector('#attachment-details-two-column-alt-text');
                        const altTextFieldTwoColumns = document.querySelector('#attachment-details-two-column-alt-text');

                        // update textfields
                        if( altTextField ) altTextField.value = altText;
                        if( altTextFieldTwoColumns ) altTextField.value = altText;

                        // reset button default label
                        generateAltTextButton.innerHTML = generateButtonText;
                    })
                    .catch(function(error) {
                        console.error(error);

                        // Update the button to show failure
                        generateAltTextButton.classList.add('failed');
                        generateAltTextButton.innerHTML = "<?php echo __('Failed', 'mill3wp') ?>";

                        // Wait 3 seconds then reset button to original state
                        setTimeout( function() {
                            generateAltTextButton.classList.remove('failed');
                            generateAltTextButton.innerHTML = generateButtonText;
                        }, 3000 );
                    })
                    .finally(function() {
                        // Re-enable the button after operation
                        generateAltTextButton.disabled = false;
                    });
            };
            const altTextGenerator = function(mediaID) {
                return new Promise(function(resolve, reject) {
                    const url  = "<?php echo admin_url('admin-ajax.php') ?>";
                    const data = new FormData();
                          data.append('action', 'mill3_generate_image_alt');
                          data.append('mediaID', mediaID);
                    
                    const options = { method: 'post', body: data };

                    fetch(url, options)
                        .then(function(response) {
                            if( !response.ok ) throw new Error(response.status);
                            else return response.json();
                        })
                        .then(function(response) { resolve(response); })
                        .catch(function(error) { reject(error); });
                });
            };

            const events = Object.assign(wp.media.view.ImageDetails.prototype.events, { 'click .mill3-generate-alt-button': generateAltTextForImage });

            // Two Column Attchment Details modal. Add Generate Button in Media library Grid mode.
            wp.media.view.Attachment.Details.TwoColumn = wp.media.view.Attachment.Details.TwoColumn.extend({
                template: function( view ) {
                    //return getTemplate( isTwoColumn ? 'attachment-details-two-column' : 'image-details', view, true );
                    return getTemplate( 'attachment-details-two-column', view, true );
                },
                events: events
            });

            // Attachment Details modal. Add Generate Button in Block Editor Attachment details modal.
            wp.media.view.Attachment.Details = wp.media.view.Attachment.Details.extend({
                template: function(view) { return getTemplate('attachment-details', view); },
                events: events
            });
        });
    </script>
<?
}

if( defined('OPENAI_API_KEY') ) add_action('print_media_templates', __NAMESPACE__ . '\\ai_alt_text');



/*
* WP_AJAX for request Open AI Vision from media
*/
function generate_image_alt() {

    if( !defined('OPENAI_API_KEY') ) {
        wp_send_json_error( __('OpenAI API KEY is not defined.', 'mill3wp'), 401 );
        wp_die();
    }

    // get media ID
    $mediaID = intval($_POST['mediaID']);
    //$mediaID = 143;

    if( !$mediaID ) {
        wp_send_json_error( __('mediaID is not defined.', 'mill3wp'), 400 );
        wp_die();
    }

    // get 512x512 image source
    $image_url = wp_get_attachment_image_src($mediaID, 'open-ai-vision');
    if( !$image_url ) {
        wp_send_json_error( __("Invalid image ID.", 'mill3wp'), 400 );
        wp_die();
    }

    // get image path
    $original_image = wp_get_original_image_path($mediaID, true);
    $img_infos = pathinfo($image_url[0]);
    $image_url = pathinfo($original_image, PATHINFO_DIRNAME) . "/" . $img_infos['filename'] . "." . $img_infos["extension"];
    $image_url = \Mill3WP\Utils\ImageToBase64($image_url);

    $data = array(
        "model" => "gpt-4o",
        "messages" => array(
            array(
                "role" => "user",
                "content" => array(
                    array(
                        "type" => "text", 
                        "text" => "What’s in this image?",
                    ),
                    array(
                        "type" => "image_url",
                        "image_url" => array(
                            "url" => $image_url,
                            "detail" => "low",
                        ),
                    ),
                ),
            ),
        ),
        "max_tokens" => 300,
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $headers = array();
    $headers[] = 'Content-Type: application/json';
    $headers[] = "Authorization: Bearer " . OPENAI_API_KEY;

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);

    if( curl_errno($ch) ) {
        wp_send_json_error( curl_error($ch), 500 );
        wp_die();
    }

    curl_close($ch);

    $response = json_decode($response, true);
    $output = array(
        "mediaID" => $mediaID,
        "altText" => $response["choices"][0]["message"]["content"],
    );

    wp_send_json($output);
    wp_die();
}

add_action('wp_ajax_mill3_generate_image_alt', __NAMESPACE__ . '\\generate_image_alt');
add_action('wp_ajax_nopriv_mill3_generate_image_alt', __NAMESPACE__ . '\\generate_image_alt');
