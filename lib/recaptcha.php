<?php

namespace Mill3WP\reCaptcha;

define('reCAPTCHA', false);
define('reCAPTCHA_SITE_KEY', null);
define('reCAPTCHA_SECRET_KEY', null);

if( defined('reCAPTCHA') AND reCAPTCHA === true ) {

    if( defined('reCAPTCHA_SITE_KEY') AND !is_null(reCAPTCHA_SITE_KEY) ) {

        /**
         * Add required assets for Google reCAPTCHA v3
         */
        add_action('wp_enqueue_scripts', function () {
            wp_enqueue_script('recaptcha', 'https://www.google.com/recaptcha/api.js?render='.reCAPTCHA_SITE_KEY, array(), null, true);
            wp_add_inline_script('recaptcha', 'window.reCAPTCHA_SITE_KEY = "'.reCAPTCHA_SITE_KEY.'";', 'before');
        }, 120);

    }

    function validate_reCAPTCHA($token, $action) {
        $url = 'https://www.google.com/recaptcha/api/siteverify?secret='.reCAPTCHA_SECRET_KEY.'&response='.$token;
        $response = file_get_contents($url);
        return json_decode($response);
    }

}
