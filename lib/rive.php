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
    //$package_version = $package_data['dependencies']['@rive-app/canvas-lite'];
    //$package_version = $package_data['dependencies']['@rive-app/canvas'];
    $package_version = $package_data['dependencies']['@rive-app/webgl2'];

    // remove version prefix
    $package_version = str_replace('^', '', $package_version);

    // return URL with version
    //return "https://unpkg.com/@rive-app/canvas-lite@{$package_version}/rive.wasm";
    //return "https://unpkg.com/@rive-app/canvas@{$package_version}/rive.wasm";
    return "https://unpkg.com/@rive-app/webgl2@{$package_version}/rive.wasm";
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
 * Extract Rive (.riv) primary artboard dimensions from file by reading binary data
 */
function rive_extract_dimensions($file) {
    if( !$file || !file_exists($file) ) return null;

    $data = file_get_contents($file);
    if( $data === false ) return null;

    include_once 'rive-reader.php';

    $reader = new RiveBinaryReader( $data );
    $header = RiveRuntimeHeader::read($reader);
    $rive = RiveFile::read($reader, $header);

    if( !$rive ) return null;

    $artboard = $rive->artboard;
    if( !$artboard || !$artboard->width || !$artboard->height ) return null;

    return [
        'width' => $artboard->width,
        'height' => $artboard->height,
    ];
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
