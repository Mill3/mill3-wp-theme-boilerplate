<?php

function filter_embeded_settings($iframe, $params = array()) {
    // use preg_match to find iframe src
    preg_match('/src="(.+?)"/', $iframe, $matches);
    $src = $matches[1];
    $language = explode('-', get_bloginfo("language"));
    $language = $language[0];

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
        'widget_referrer' => get_site_url(),
        'hl' => $language,
        'cc_lang_pref' => $language,
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

/**
 * filter_group_by_key function
 *
 * @param [type] $array
 * @param [type] $key
 * @return array
 *
 * Usage :
 *   {% set grouped = array|group_by_key('label') %}
 *   {% for key, group in grouped %}
 *      {{ key }}
 *      {% for item in group %}
 *        {{ item.label }}
 *      {% endfor %}
 *   {% endfor %}
 */
function filter_group_by_key($array, $key) {
    $result = array();
    foreach ($array as $val) {
        $result[$val[$key]][] = $val;
    }
    return $result;
}
