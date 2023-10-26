<?php

namespace Mill3WP\GDPR;


// add GDPR Cookies value to Timber's Context
add_filter('timber/context', function($context) {

    // default values
    $consent_analytics = 'granted';
    $consent_ads = 'granted';
    $consent_status = 'pending';
    $consent_user_id = null;

    // get value from cookies
    if( isset($_COOKIE) ) {
        if( isset($_COOKIE['consent_analytics']) ) $consent_analytics = $_COOKIE['consent_analytics'];
        if( isset($_COOKIE['consent_ads']) ) $consent_ads = $_COOKIE['consent_ads'];
        if( isset($_COOKIE['consent_status']) ) $consent_status = $_COOKIE['consent_status'];
        if( isset($_COOKIE['consent_user_id']) ) $consent_user_id = $_COOKIE['consent_user_id'];
    }

    // expose values to Timber's context
    $context['gdpr_consent_analytics'] = $consent_analytics;
    $context['gdpr_consent_ads'] = $consent_ads;
    $context['gdpr_consent_status'] = $consent_status;
    $context['gdpr_consent_user_id'] = $consent_user_id;

    return $context;
});
