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

    if(!$editor_css) return;

    $theme_directory_url = parse_url( get_stylesheet_directory_uri(), PHP_URL_PATH );

    $css_relative = str_replace(
        $theme_directory_url,
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
 * Enqueue custom Gutenberg script for our theme
 */
function add_gutenberg_scripts() {

    wp_enqueue_script(
        'mill3-blockeditor',
        get_stylesheet_directory_uri() . '/src/js/admin/blockeditor.js',
        array( 'wp-blocks', 'wp-dom' ),
        filemtime( get_stylesheet_directory() . '/src/js/admin/blockeditor.js' ),
        true
    );
}

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\add_gutenberg_scripts' );

/**
 * Enqueue custom MCE plugins
 */
function enqueue_shortcodes_scripts($plugin_array)
{
    $plugin_array["dummy"] = Assets\Asset_File_path('admin-shortcodes', 'js');
    return $plugin_array;
}

// add_filter("mce_external_plugins", __NAMESPACE__ . "\\enqueue_shortcodes_scripts");



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
