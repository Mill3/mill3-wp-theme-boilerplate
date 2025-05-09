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
        $filters['is_gif'] = ['callable' => [$this, 'is_gif']];
        $filters['is_json'] = ['callable' => [$this, 'is_json']];
        $filters['is_svg'] = ['callable' => [$this, 'is_svg']];
        $filters['is_video'] = ['callable' => [$this, 'is_video']];
        $filters['is_rive'] = ['callable' => [$this, 'is_rive']];
        $filters['video_aspect_ratio'] = ['callable' => [$this, 'video_aspect_ratio']];
        $filters['rive_aspect_ratio'] = ['callable' => [$this, 'rive_aspect_ratio']];

        return $filters;
    }

    private function check_extension($file, $allowed_extensions) {
        // ACF blocks can refers to deleted IDs from media library and returns a boolean instead of array|id, this prevent PHP error
        if(is_bool($file)) return false;

        $ID = is_int($file) ? $file : (array_key_exists('ID', $file) ? $file['ID'] : $file->ID);
        $src = wp_get_attachment_url($ID);
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
     * is_gif filter method
     *
     * @param array $file : File array object
     * @return boolean
     */
    public function is_gif($file) {
        return $this->check_extension($file, array( 'gif' ));
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

    /**
     * is_rive filter method
     *
     * @param array $file : File array object
     * @return boolean
     */
    public function is_rive($file) {
        return $this->check_extension($file, array('riv'));
    }


    /**
     * video_aspect_ratio filter method
     *
     * @param array $file : File array object
     * @return float
     */
    public function video_aspect_ratio($file) {
        if( !$this->is_video($file) ) return 0;

        $meta = wp_get_attachment_metadata($file['ID']);
        $width = intval($meta['width']);
        $height = intval($meta['height']);

        return $width / $height;
    }

    /**
     * rive_aspect_ratio filter method
     *
     * @param array $file : File array object
     * @return float
     */
    public function rive_aspect_ratio($file) {
        if( !$this->is_rive($file) ) return 0;

        $meta = wp_get_attachment_metadata($file['ID']);
        $width = intval(array_key_exists('width', $meta) ? $meta['width'] : 1);
        $height = intval(array_key_exists('height', $meta) ? $meta['height'] : 1);

        return $width / $height;
    }


}

Twig_File_Filters::init();
