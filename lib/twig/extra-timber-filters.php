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

function filter_line_breaks($text, $replacement = '') {
    return str_replace(array("\r\n"), $replacement, $text);
}

function filter_split_line_breaks($text) {
    return explode("\r\n", $text);
}
