<?php

namespace Mill3WP\Assets;

/**
 * Read a JSON file with a manifest for assets
 *
 * @category Manifest
 *
 * @package Assets
 *
 * @author Antoine Girard <antoine@mill3.studio>
 */
class JsonManifest
{
    private $_manifest;

    /**
     * Read a json file with an assets manifest
     *
     * @param [type] $manifest_path : json file path
     */
    public function __construct($manifest_path)
    {
        if (file_exists($manifest_path)) {
            $this->_manifest = json_decode(
                file_get_contents($manifest_path),
                true
            );
        } else {
            $this->_manifest = null;
        }
    }

    /**
     * Return current class manifest content
     *
     * @return array
     */
    public function get()
    {
        return $this->_manifest;
    }
}

/**
 * Return asset filename path from its scope (css/js)
 *
 * @param string $entry : webpack entry name defined in assets.json
 *
 * @param string $type : asset name defined in assets.json
 *
 * @return string
 */
function Asset_File_path($entry = 'src/js/App.js', $include_site_url = true)
{
    $dist_dir = '/dist/';
    $base_uri = $include_site_url ? get_stylesheet_directory_uri() . $dist_dir : $dist_dir;

    $manifest_path = get_template_directory() . $dist_dir . '.vite/manifest.json';
    $manifest = new JsonManifest($manifest_path);

    // has manifest and entry exists
    $has_entry = $manifest->get() && isset($manifest->get()[$entry]);

    if ($has_entry) {
        return $base_uri . $manifest->get()[$entry]['file'];
    } else {
        return null;
    }
}
