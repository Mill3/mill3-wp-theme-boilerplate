<?php

namespace Mill3WP\rive;

function get_rive_wasm_href()
{
    // get package.json content
    $package_json = file_get_contents(get_template_directory() . '/package.json');

    // return if no package.json
    if (!$package_json) return null;

    // decode package.json content
    $package_data = json_decode($package_json, true);

    // find rive package version in package.json
    $package_version = $package_data['dependencies']['@rive-app/canvas-lite'];

    // remove version prefix
    $package_version = str_replace('^', '', $package_version);

    // return URL with version
    return "https://unpkg.com/@rive-app/canvas-lite@{$package_version}/rive.wasm";
}

function head_inject_rive_wasm()
{
    $href = get_rive_wasm_href();
    if (!$href) return;

    echo "<link name='rive-wasm' href='{$href}' rel='preload' as='fetch' crossOrigin='anonymous' />";
}

add_filter('wp_head', __NAMESPACE__ . '\head_inject_rive_wasm', 10, 1);



/**
 * Enable Rive (.riv) uploading
 */
add_filter('upload_mimes', function ($mimes) {
    $mimes['riv'] = 'application/riv';
    return $mimes;
});

/**
 * Extract Rive (.riv) dimension and attach to attachment metadata
 */

add_filter('wp_generate_attachment_metadata', function ($metadata, $attachment_id) {
    $file = get_attached_file($attachment_id);
    $pathinfo = pathinfo($file);

    // skip if metadata is already set
    if (isset($metadata['width']) && isset($metadata['height'])) {
        return $metadata;
    }

    if ($pathinfo['extension'] == 'riv') {
        $dimensions = rive_extract_dimensions($file);

        if ($dimensions) {
            $metadata['width'] = $dimensions['width'];
            $metadata['height'] = $dimensions['height'];
        }
    }

    return $metadata;
}, 10, 2);


/**
 * Extract Rive (.riv) artboard dimensions from file by reading binary data
 *
 * - width and height are stored as float values in the file
 * - width property ID is 7
 * - height property ID is 8
 *
 * Specs taken from https://github.com/rive-app/rive-runtime/blob/main/dev/defs/layout_component.json
 *
 */
function rive_extract_dimensions($file)
{
    $widhts = [];
    $heights = [];

    // Some extracted width/height values are extremely small or large number, like 1.401298464324817e-45 or 1.7014118346046923e+38
    // we need to filter out these values and only keep values between 1 and 10000 as a safe range
    $minvalue = 1;
    $maxValue = 10000;

    // Open the file
    $file = fopen($file, 'r');

    if (!$file) {
        return null;
    }

    // Read the first 4 bytes and check if it's 'RIVE'
    $byte = fread($file, 4);
    if ($byte !== 'RIVE') {
        return null;
    }

    // Read the next byte (TOC)
    $byte = fread($file, 1);

    // Read all objects until the returned byte is 0, which should be the last property
    while (!feof($file)) {
        // Advance the byte by 1
        $byte = fread($file, 1);

        if (!$byte) {
            break;  // Exit if end of file or empty byte
        }

        // Grab the property type
        $property = ord($byte);  // Convert the byte to an integer

        // Next 4 bytes are the property value
        if ($property == 7) { // width
            $value = unpack('f', fread($file, 4))[1]; // Read 4 bytes as a float
            if($value >= $minvalue && $value <= $maxValue) $widhts[] = intval($value); // only keep values between 1 and 10000
        } elseif ($property == 8) { // height
            $value = unpack('f', fread($file, 4))[1]; // Read 4 bytes as a float
            if($value >= $minvalue && $value <= $maxValue) $heights[] = intval($value); // only keep values between 1 and 10000
        }
    }

    // make sure all values are rounded integers
    $widhts = array_map('round', $widhts);
    $heights = array_map('round', $heights);

    // make sure all values are positive integers
    $widhts = array_map('abs', $widhts);
    $heights = array_map('abs', $heights);

    // sort all values descending
    rsort($widhts, SORT_NUMERIC);
    rsort($heights, SORT_NUMERIC);

    // Close the file
    fclose($file);

    // pick the first value of each array, only both arrays have values
    if (isset($widhts[0]) && isset($heights[0])) {
        return [
            'width' => $widhts[0],
            'height' => $heights[0]
        ];
    } else {
        return null;
    }
}

add_filter('timber/twig', __NAMESPACE__ . '\\add_to_twig');

function add_to_twig($twig)
{
    $twig->addFunction(
        new \Twig\TwigFunction('Rive', function ($postID) {
            $post = get_post($postID);
            if(!$post) return null;

            $post_meta = wp_get_attachment_metadata($post->ID);
            $post = (object) array_merge((array) $post, (array) $post_meta);
            return $post;
        })
    );

    return $twig;
}
