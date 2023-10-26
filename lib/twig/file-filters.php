<?php

namespace Mill3\Twig;

use Timber\PathHelper;

/**
 *
 * Twig filter : file or image field|is_image
 *
 * To use with ACF file or image fields
 *
 * How to use in twig templates :
 *
 * {% set image = post.get_field('image')|default(null) %}*
 *
 * {% if image|is_image %}
 *   output your image here
 * {% endif %}
 */

class Twig_File_Filters {

    public static function init(): void
    {
        $self = new self();

        \add_filter('timber/twig/filters', [$self, 'add_timber_filters']);
    }


    /**
     * Adds filters to Twig.
     */
    public function add_timber_filters($filters)
    {
        $filters['is_image'] = ['callable' => [$this, 'is_image']];
        $filters['is_json'] = ['callable' => [$this, 'is_json']];
        $filters['is_svg'] = ['callable' => [$this, 'is_svg']];
        $filters['is_video'] = ['callable' => [$this, 'is_video']];

        return $filters;
    }

    private function check_extension($file, $allowed_extensions) {
        $src = wp_get_attachment_url($file->ID);
        $check = wp_check_filetype(PathHelper::basename(strtok($src, "?")), null);

        return in_array($check['ext'], $allowed_extensions);
    }


    /**
     * is_image filter method
     *
     * @param array $file : File array object
     * @return boolean
     */
    public function is_image($file) {
        return $this->check_extension($file, array( 'gif', 'jpg', 'jpeg', 'jpe', 'png', 'webp' ));
    }


    /**
     * is_json filter method
     *
     * @param array $file : File array object
     * @return boolean
     */
    public function is_json($file) {
        return $this->check_extension($file, array('json'));
    }


    /**
     * is_svg filter method
     *
     * @param array $file : File array object
     * @return boolean
     */
    public function is_svg($file) {
        return $this->check_extension($file, array('svg'));
    }


    /**
     * is_video filter method
     *
     * @param array $file : File array object
     * @return boolean
     */
    public function is_video($file) {
        return $this->check_extension($file, array('mp4'));
    }

}

Twig_File_Filters::init();
