<?php

/**
 * This file is part of Mill3WP boilerplate theme.
 * 2023 (c) Mill3 Studio
 *
 * @version 0.0.1
 *
 * @since 0.0.1
 */

namespace Mill3WP\Models;

use Timber;

class Mill3Image extends Timber\Image {


    public function alt(): string {

        // if Polylang isn't installed, return Timber\Image value
        if( !function_exists('pll_the_languages') ) return parent::alt();

        $currentLanguage = pll_current_language('slug');
        $defaultLanguage = pll_default_language('slug');

        // if current language is default language, return Timber\Image value
        if( $currentLanguage === $defaultLanguage ) return parent::alt();

        $alt = $this->meta('mill3_image_alt_' . $currentLanguage);
        return \trim(\wp_strip_all_tags($alt));
    }
}
