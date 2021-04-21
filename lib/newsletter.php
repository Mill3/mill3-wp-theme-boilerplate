<?php

namespace Mill3WP\Newsletter;

function newsletter_form() {
    // Default response holder
    $response = array(
        'success' => true,
        'message' => __('Thanks', 'mill3wp'),
    );
    $error_fields = array();

    // Default form values
    $email = NULL;


    // WP-Nonce security to prevent attacks like CSRF
    // read more: https://codex.wordpress.org/Function_Reference/wp_nonce_field
    if( !isset($_POST['newsletter_form_nonce']) || !wp_verify_nonce($_POST['newsletter_form_nonce'], 'newsletter_form_nonce') ) {
        $response['success'] = FALSE;
        $response['message'] = __('Your data are invalid. Please try again.', 'mill3wp');
    }

    // run reCAPTCHA validation if enabled
    if( defined('reCAPTCHA') AND reCAPTCHA === true ) {

        // If post failed WP-Nonce security, skip reCAPTCHA validation
        if( $response['success'] === TRUE ) {

            // if reCAPTCHA token exist, run validation
            if( isset( $_POST['reCAPTCHA'] ) ) {
                $token = $_POST['reCAPTCHA'];
                $reCAPTCHA = \Mill3WP\reCaptcha\validate_reCAPTCHA($token, 'newsletter');

                // if reCAPTCHA validation failed
                if( !$reCAPTCHA || $reCAPTCHA->success !== true || $reCAPTCHA->score < 0.5 || $reCAPTCHA->action !== 'newsletter' ) {
                    $response['success'] = FALSE;
                }
            }
            else $response['success'] = FALSE;

            // if reCAPTCHA validation failed at one step or another, show error message
            if( $response['success'] !== TRUE ) $response['message'] = __('You are a robot.', 'mill3wp');
        }
    }

    // If post failed WP-Nonce security, skip fields validation
    if( $response['success'] === TRUE ) {
        $email = isset( $_POST['email'] ) ? sanitize_email( $_POST['email'] ) : NULL;

        // Validate Email field
        if( is_null($email) || empty($email) ) {
        	$response['success'] = false;
        	$response['message'] = __('Your email is required', 'mill3wp');
        }
        else if( !is_email($email) ) {
            $response['success'] = false;
            $response['message'] = __('Your email is not valid', 'mill3wp');
        }
    }

    // If form is valid
    if( $response['success'] === TRUE AND locate_template('vendors/mailchimp/MailChimp.php', TRUE, TRUE) ) {

        // create MailChimp API instance
        $mailchimp = new \DrewM\MailChimp\MailChimp('YOUR-API-KEY');
        $user_hash = \DrewM\MailChimp\MailChimp::subscriberHash($email);
        $list_id = null;//'6b865e7b3f';

        try {
            $data = [
                'email_address' => $email,
                'status'        => 'subscribed'
            ];

            // add language if Polylang is installed
            if( function_exists('pll_current_language') ) $data['language'] = pll_current_language();

            // add or update a list member
            $result = $mailchimp->put("lists/{$list_id}/members/{$user_hash}", $data);

            // if subscription failed, show error message
            if( !$mailchimp->success() ) {
                $response['success'] = false;
                $response['message'] = $mailchimp->getLastError();
            }
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = $mailchimp->getLastError();
        }
    }

    // Return JSON response
    wp_send_json($response);
    die();
}

add_action( 'wp_ajax_newsletter_form', __NAMESPACE__ . '\\newsletter_form' );
add_action( 'wp_ajax_nopriv_newsletter_form', __NAMESPACE__ . '\\newsletter_form' );


// Useful to find your ListID
// http://localhost:20090/wp-admin/admin-ajax.php?action=newsletter_form_debug
/*
add_action( 'wp_ajax_newsletter_form_debug', function() {
    // load lib
    locate_template('vendors/mailchimp/MailChimp.php', TRUE, TRUE);

    $mailchimp = new \DrewM\MailChimp\MailChimp('YOUR-API-KEY');
    $result = $mailchimp->get('lists');

    echo '<pre>';
    print_r($result);
    echo '</pre>';

    wp_die();
});
*/
