<?php

/*
 * WP_AJAX for requesting transitions routes
 */
/*
function action_transitions_routes() {

    $routes = array();

    // query all brands and pages with custom bg-color
    $data = array(
        'post_type' => array('page', 'brand'),
        'meta_key' => 'bg-color',
        'fields' => 'ids'
    );
    $posts = (new \WP_Query($data))->posts;
    
    foreach( $posts as $post) {
        $bg = get_field('bg-color', $post);
        if( !$bg ) continue;
        
        $url = get_permalink($post);
        $regex = str_replace('/', '\/', $url);

        $routes[] = array("regex" => "^{$regex}$", "color" => "{$bg}");
    }

    // export to JSON
    echo json_encode($routes);
    die();
}

add_action( 'wp_ajax_transitions_routes', __NAMESPACE__ . '\\action_transitions_routes');
add_action( 'wp_ajax_nopriv_transitions_routes', __NAMESPACE__ . '\\action_transitions_routes');
*/


/*
 * WP_AJAX for request Open AI Vision from media
 */
function generate_image_alt() {

    if( !defined('OPENAI_API_KEY') ) {
        wp_send_json_error( __('OpenAI API KEY is not defined.', 'mill3wp'), 401 );
        wp_die();
    }

    $mediaID = intval($_POST['mediaID']);

    if( !$mediaID ) {
        wp_send_json_error( __('mediaID is not defined.', 'mill3wp'), 400 );
        wp_die();
    }

    // if attachment isn't an image, stop here
    if( !wp_attachment_is_image( $mediaID ) ) {
        wp_send_json_error( __("Attachment is not an image.", 'mill3wp'), 400 );
        wp_die();
    }

    // get 512x512 image source
    $image_url = wp_get_attachment_image_src($mediaID, 'open-ai-vision');
    if( !$image_url ) {
        wp_send_json_error( __("Invalid image ID.", 'mill3wp'), 400 );
        wp_die();
    }

    // get image path
    $original_image = wp_get_original_image_path($mediaID, true);
    $img_infos = pathinfo($image_url[0]);
    $image_url = pathinfo($original_image, PATHINFO_DIRNAME) . "/" . $img_infos['filename'] . "." . $img_infos["extension"];
    $image_url = \Mill3WP\Utils\ImageToBase64($image_url);

    $lang_slugs = array();
    $lang_names = array();
    $prompt = "";

    if( function_exists('pll_the_languages') ) {
        $languages = pll_the_languages(array('hide_if_empty' => false, 'hide_current' => false, 'raw' => true));
        foreach($languages as $slug => $language) {
            $lang_slugs[] = $slug;
            $lang_names[] = lcfirst($language['name']);
        }

    } else {
        require_once ABSPATH . 'wp-admin/includes/translation-install.php';

        $locale = get_locale();
        $translations = wp_get_available_translations();
        $lang_name = array_key_exists($locale, $translations) ? $translations[$locale]["english_name"] : "English";

        $lang_slugs[] = $locale;
        $lang_names[] = lcfirst( $lang_name );
    }

    if( count($lang_names) > 1 ) {
        $last_lang_name = array_pop($lang_names);
        $lang_names = implode(", ", $lang_names) . " and " . $last_lang_name;
    }
    else $lang_names = implode(", ", $lang_names);

    $prompt = "Return text in " . $lang_names . " formatted with a JSON structure like this {" . implode(", ", $lang_slugs) . "}.";

    $data = array(
        "model" => "gpt-4o-mini",
        "messages" => array(
            array(
                "role" => "user",
                "content" => array(
                    array(
                        "type" => "text", 
                        "text" => "Describe this image in less than 60 words. " . $prompt,
                    ),
                    array(
                        "type" => "image_url",
                        "image_url" => array(
                            "url" => $image_url,
                            "detail" => "low",
                        ),
                    ),
                ),
            ),
        ),
        "response_format" => array("type" => "json_object"),
        "max_tokens" => 300,
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $headers = array();
    $headers[] = 'Content-Type: application/json';
    $headers[] = "Authorization: Bearer " . OPENAI_API_KEY;

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);

    if( curl_errno($ch) ) {
        wp_send_json_error( curl_error($ch), 500 );
        wp_die();
    }

    curl_close($ch);

    $response = json_decode($response, true);
    $output = array(
        "mediaID" => $mediaID,
        "altText" => $response["choices"][0]["message"]["content"],
    );

    wp_send_json($output);
    wp_die();
}

add_action('wp_ajax_mill3_generate_image_alt', __NAMESPACE__ . '\\generate_image_alt');
