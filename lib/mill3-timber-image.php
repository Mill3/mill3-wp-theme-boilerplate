<?php

namespace Mill3WP\Image;

use Timber\PathHelper;
use Timber;

class Mill3Image extends Timber\Image
{
    public function img_sizes($size = "full")
    {
        if ($this->is_image()) {
            return wp_get_attachment_image_sizes($this->ID, $size);
        }
    }

    public function srcset($size = 'full')
    {
        if ($this->is_image()) {
            return wp_get_attachment_image_srcset($this->ID, $size);
        }
    }

    /**
     * Overiding Timber\Image is_image() method
     *
     * WP internals wp_check_filetype() method is not working with URL params append to attachement src.
     * strtok() is striping any URL params before validating the file extension
     *
     * @return boolean
     */
    protected function is_image()
    {
        $src = wp_get_attachment_url($this->ID);
        $image_exts = array( 'gif', 'jpg', 'jpeg', 'jpe', 'png', 'webp' );
        $check = wp_check_filetype(PathHelper::basename(strtok($src, "?")), null);
        return in_array($check['ext'], $image_exts);
    }

}
