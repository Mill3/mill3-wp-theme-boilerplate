<?php

namespace Mill3\Twig;

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

class Twig_Sharing_Filters {

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
        $filters['facebook_share'] = ['callable' => [$this, 'facebook_share']];
        $filters['twitter_share'] = ['callable' => [$this, 'twitter_share']];
        $filters['linkedin_share'] = ['callable' => [$this, 'linkedin_share']];
        $filters['email_share'] = ['callable' => [$this, 'email_share']];

        return $filters;
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

Twig_Sharing_Filters::init();
