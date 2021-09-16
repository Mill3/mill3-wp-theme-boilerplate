<?php

namespace Mill3WP\Editor;

use Mill3WP\Assets;

/* ---------------------------------------------------------------------
LOAD EDITOR STYLES
--------------------------------------------------------------------- */
function add_editor_stylesheet()
{
    // Get CSS from assets.json
    $editor_css = Assets\Asset_File_path('editor-style', 'css');
    $css_relative = str_replace(
        '/wp-content/themes/[YOUR-THEME-NAME]/',
        '',
        $editor_css
    );

    // clean filename without any params url
    $cleaned_filename = explode('?', $css_relative)[0];

    // WP admin editor expect a relative path to editor file
    // ie: not the full path with 'wp-content/themes/my-themes/...'
    add_editor_style($cleaned_filename);
}

add_action('after_setup_theme', __NAMESPACE__ . '\\add_editor_stylesheet');




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
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
            </select>
        </span>
    </script>
    <script type="text/javascript">
        jQuery( document ).ready(function() {
            _.extend( wp.media.galleryDefaults, {
                format: 'square',
                grid_gap: 3
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
