<?php

/**
 * Detect XHR ajax requests
 */
function is_ajax() {
    if ( !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest' ) {
        return true;
    } else {
        return false;
    }
}
