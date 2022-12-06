<?php

namespace Mill3\Twig;

use Twig\Extension\AbstractExtension;
use Timber\PathHelper;
use Twig\TwigFilter;

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

class Twig_File_Filters extends AbstractExtension {

    /**
     * Twig filter registration
     *
     * @return array
     */
    public function getFilters()
    {
        return [
            new TwigFilter('is_image', [$this, 'is_image']),
            new TwigFilter('is_json', [$this, 'is_json']),
            new TwigFilter('is_svg', [$this, 'is_svg']),
            new TwigFilter('is_video', [$this, 'is_video']),
        ];
    }

    private function check_extension($file, $allowed_extensions) {
        $src = wp_get_attachment_url($file['ID']);
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
