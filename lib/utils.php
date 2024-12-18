<?php

namespace Mill3WP\Utils;


/**
 * Detect XHR ajax requests
 */
function is_ajax(): bool {
    if ( !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest' ) {
        return true;
    } else {
        return false;
    }
}



/**
 * Encode image to Base64
 */
function ImageToBase64(string $filepath): string {
    $type = wp_get_image_mime($filepath);
    $data = file_get_contents($filepath);

    $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
    return $base64;
}
