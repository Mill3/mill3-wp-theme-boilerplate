<?php

namespace Mill3\Twig;

use Twig\Extension\AbstractExtension;
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

class Twig_Sharing_Filters extends AbstractExtension {

    /**
     * Twig filter registration
     *
     * @return array
     */
    public function getFilters()
    {
        return [
            new TwigFilter('facebook_share', [$this, 'facebook_share']),
            new TwigFilter('twitter_share', [$this, 'twitter_share']),
            new TwigFilter('linkedin_share', [$this, 'linkedin_share']),
            new TwigFilter('email_share', [$this, 'email_share']),
        ];
    }

    /**
     * facebook_share filter method
     *
     * @param string $url : URL to share
     * @return string
     */
    public function facebook_share($url) {
        return 'https://www.facebook.com/sharer.php?u=' . urlencode($url);
    }

    /**
     * twitter_share filter method
     *
     * @param string $url : URL to share
     * @param string $url : Tweet's title (optional)
     * @param string $hastags : Comma separated list, example : 'tag1,tag2,tag3' (optional)
     * @param string $via_user : User ID (optional)
     * @return string
     */
    public function twitter_share($url, $title = NULL, $hashtags = NULL, $via_user =  NULL) {
        $attrs = [];
    
        if ($url) $attrs[] = 'url=' . urlencode($url);
        if ($title) $attrs[] = 'text=' . urlencode(html_entity_decode($title));
        if ($via_user) $attrs[] = 'via=' . $via_user; // User ID
        if ($hashtags) $attrs[] = 'hashtags=' . $hashtags; // Comma separated list, example : 'tag1,tag2,tag3'
    
        return 'https://twitter.com/intent/tweet?' . implode('&', $attrs);
    }

    /**
     * linkedin_share filter method
     *
     * @param string $url : URL to share
     * @return string
     */
    public function linkedin_share($url) {
        return 'https://www.linkedin.com/sharing/share-offsite/?url=' . urlencode($url);
    }
    
    /**
     * email_share filter method
     *
     * @param string $url : URL to share
     * @param string $subject : Email's subject (optional)
     * @return string
     */
    public function email_share($url, $subject = NULL) {
        $attrs = [];
        if ($subject) $attrs[] = 'subject=' . rawurlencode(htmlspecialchars_decode($subject));
        if ($url) $attrs[] = 'body=' . urlencode($url);
    
        return 'mailto:?' . implode('&', $attrs);
    }

}
