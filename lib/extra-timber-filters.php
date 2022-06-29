<?php

function filter_embeded_settings($iframe, $params = array()) {
    // use preg_match to find iframe src
    preg_match('/src="(.+?)"/', $iframe, $matches);
    $src = $matches[1];

    // add extra params to iframe src
    $default_params = array(
        'controls' => 1,
        'autopause' => 1,
        'autoplay' => 0,
        'color' => 'ffffff',
        'api' => 1,
        'enablejsapi' => 1,
        'responsive' => 1,
        'playsinline' => 1,
        'origin' => get_site_url(),
    );
    $params = array_merge($default_params, $params);

    $new_src = add_query_arg($params, $src);
    $iframe = str_replace($src, $new_src, $iframe);

    // add extra attributes to iframe html
    $attributes = $params['playsinline'] === 1 ? 'playsinline' : '';

    $iframe = str_replace('></iframe>', ' ' . $attributes . ' scrolling="no"></iframe>', $iframe);
    return $iframe;
}

function filter_slugify($slug) {
    return sanitize_title($slug);
}

function filter_facebook_share($url) {
    return 'https://www.facebook.com/sharer.php?u=' . urlencode($url);
}

function filter_twitter_share($url, $title = NULL, $hashtags = NULL, $via_user =  NULL) {
    $attrs = [];

    if ($url) $attrs[] = 'url=' . urlencode($url);
    if ($title) $attrs[] = 'text=' . urlencode(html_entity_decode($title));
    if ($via_user) $attrs[] = 'via=' . $via_user; // User ID
    if ($hashtags) $attrs[] = 'hashtags=' . $hashtags; // Comma separated list, example : 'tag1,tag2,tag3'

    return 'https://twitter.com/intent/tweet?' . implode('&', $attrs);
}

function filter_linked_share($url) {
    return 'https://www.linkedin.com/sharing/share-offsite/?url=' . urlencode($url);
}

function filter_email_share($url, $subject = NULL) {
    $attrs = [];
    if ($subject) $attrs[] = 'subject=' . rawurlencode(htmlspecialchars_decode($subject));
    if ($url) $attrs[] = 'body=' . urlencode($url);

    return 'mailto:?' . implode('&', $attrs);
}
