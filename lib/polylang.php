<?php

namespace Mill3WP\Polylang;

// expose Polylang's functions to Twig
add_filter('timber/twig/functions', function($functions) {

    if( !function_exists('pll_current_language') ) return $functions;
    
    $functions['pll__'] = ['callable' => 'pll__'];
    $functions['pll_e'] = ['callable' => 'pll_e'];
    $functions['pll_current_language'] = ['callable' => 'pll_current_language'];
    $functions['language_switcher'] = [
        'callable' => function () {
            pll_the_languages(array('show_flags' => 0, 'show_names' => 0));
        }
    ];

    return $functions;
});





// Manage multilang Image Alt Text
if( function_exists('pll_the_languages') ){

    // Add custom Alt Text meta fields to the media file settings
    add_filter('attachment_fields_to_edit', function($form_fields, $post){
        // stop here if attachement is not an image
        if( !wp_attachment_is_image( $post ) ) return $form_fields;

        $languages          = pll_the_languages(array('hide_if_empty' => false, 'hide_current' => false, 'raw' => true));
        $defaultLanguage    = pll_default_language('slug');

        // create a textarea for each languages
        foreach($languages as $slug => $language) {
            // skip translation of default language (will be saved in default _wp_attachment_image_alt post meta)
            if( $slug === $defaultLanguage ) continue;

            $form_fields['alt_text_' . $slug] = array(
                'label' => sprintf('%s <br /><em>(%s)</em>', __('Alternative Text', 'mill3wp'), $language['name'] ),
                'input' => 'textarea',
                'value'  => get_post_meta( $post->ID, 'mill3_image_alt_' . $slug, true ),
            );
        }

        return $form_fields;
    }, 10, 2);

    // Save Alt Text translations in post meta
    add_filter('attachment_fields_to_save', function($post, $attachment) {
        // stop here if attachement is not an image
        if( !wp_attachment_is_image( $post['ID'] ) ) return $post;

        $languages          = pll_the_languages(array('hide_if_empty' => false, 'hide_current' => false, 'raw' => true));
        $defaultLanguage    = pll_default_language('slug');

        // save alt text translations
        foreach($languages as $slug => $language) {
            // skip for default language (saved in default _wp_attachment_image_alt post meta)
            if( $slug === $defaultLanguage ) continue;

            $meta_key = 'mill3_image_alt_' . $slug;
            $key_name = 'alt_text_' . $slug;

            // update/delete post meta
            if( isset( $attachment[$key_name] ) ) update_post_meta( $post['ID'], $meta_key, $attachment[$key_name] );
            else delete_post_meta( $post['ID'], $meta_key );
        }

        return $post;
    }, 10, 2);
    
}
