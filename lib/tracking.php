<?php

// inject tracking codes in the head section based on ACF options
// this is used for Google Tag Manager and OpenPanel tracking
// it checks if the ACF function exists, if the environment is production,
// and if the specific options are set before injecting the scripts
add_action('wp_head', function() {
    // first check if ACF function exists
    if( !function_exists('get_fields') ) return;

    // if in DEV mode, do not inject tracking codes
    if( defined('THEME_ENV') && THEME_ENV !== 'production' ) return;

    // get all option fields
    $options = get_fields('option');

    // check if google_tag_manager_head exists in options
    if( !empty($options['gtm_code']) ) {
        echo <<<HTML
            <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','{$options['gtm_code']}');</script>
        HTML;
    }

    // check if openpanel_dev exists in options
    if( !empty($options['openpanel_dev']) ) {

        // get current connected user in wp
        $current_user = wp_get_current_user();

        echo <<<HTML
        <script>
            window.op = window.op||function(...args){(window.op.q=window.op.q||[]).push(args);};
            window.op('init', {
                clientId: '{$options['openpanel_dev']}',
                trackScreenViews: true,
                trackOutgoingLinks: true,
                trackAttributes: true,
            });
            </script>
            <script src="https://openpanel.dev/op1.js" defer async></script>
        HTML;

        // if user is connected, identify them
        // this is useful for tracking logged-in users in OpenPanel
        if( isset($current_user->ID) && $current_user->ID > 0 ) {
            echo <<<HTML
            <script>
                window.op('identify', {
                    profileId: 'admin_{$current_user->ID}',
                    email: '{$current_user->user_email}',
                });
            </script>
            HTML;
        }
    }

}, 10);

// inject noscript iframe for Google Tag Manager in the <body> start section in base.twig
add_action('mill3wp_body_start', function() {
    // first check if ACF function exists
    if( !function_exists('get_fields') ) return;

    // if in DEV mode, do not inject tracking codes
    if( defined('THEME_ENV') && THEME_ENV !== 'production' ) return;

    // get all option fields
    $options = get_fields('option');

    // stop here if emptu
    if( empty($options['gtm_code']) ) return;

    echo <<<HTML
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={$options['gtm_code']}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    HTML;
}, 10);
