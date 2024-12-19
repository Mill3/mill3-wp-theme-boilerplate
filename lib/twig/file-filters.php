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
     *
     * @param array<string, mixed> $filters
     *
     * @return array<string, mixed>
     *
     */
    public function add_timber_filters($filters): array
    {
        $filters['is_image'] = ['callable' => [$this, 'is_image']];
        $filters['is_json'] = ['callable' => [$this, 'is_json']];
        $filters['is_svg'] = ['callable' => [$this, 'is_svg']];
        $filters['is_video'] = ['callable' => [$this, 'is_video']];
        $filters['video_aspect_ratio'] = ['callable' => [$this, 'video_aspect_ratio']];

        return $filters;
    }

    /**
     * Check if file is an image.
     *
     * @param mixed $file File data, can be:
     *                    - An array with file information.
     *                    - An integer (file ID).
     *                    - A boolean (if the file is deleted).
     * @param string[] $allowed_extensions Array of allowed file extensions.
     *
     * @return bool True if the file extension is allowed, false otherwise.
     */
    private function check_extension(mixed $file, array $allowed_extensions): bool
    {
        // ACF blocks can refer to deleted IDs from the media library and return a boolean.
        if (is_bool($file)) {
            return false;
        }

        $ID = is_int($file) ? $file : (array_key_exists('ID', $file) ? $file['ID'] : $file->ID);
        $src = wp_get_attachment_url($ID);
        $check = wp_check_filetype(PathHelper::basename(strtok($src, "?")), null);

        return in_array($check['ext'], $allowed_extensions);
    }


    /**
     * is_image filter method
     *
     * @param object $file : File array object
     *
     * @return boolean
     */
    public function is_image(object $file): bool
    {
        return $this->check_extension($file, array( 'gif', 'jpg', 'jpeg', 'jpe', 'png', 'webp' ));
    }


    /**
     * is_json filter method
     *
     * @param object $file : File array object
     * @return boolean
     */
    public function is_json(object $file): bool
    {
        return $this->check_extension($file, array('json'));
    }


    /**
     * is_svg filter method
     *
     * @param object $file : File array object
     * @return boolean
     */
    public function is_svg(object $file): bool
    {
        return $this->check_extension($file, array('svg'));
    }


    /**
     * is_video filter method
     *
     * @param object $file : File array object
     * @return boolean
     */
    public function is_video(object $file): bool
    {
        return $this->check_extension($file, array('mp4'));
    }


    /**
     * video_aspect_ratio filter method
     *
     * @param object $file : File array object
     *
     * @return float
     */
    public function video_aspect_ratio(object $file): float
    {
        if( !$this->is_video($file) ) return 0;

        $meta = wp_get_attachment_metadata($file['ID']);
        $width = intval($meta['width']);
        $height = intval($meta['height']);

        return $width / $height;
    }

}

Twig_File_Filters::init();
