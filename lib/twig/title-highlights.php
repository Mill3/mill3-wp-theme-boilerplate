<?php

namespace Mill3\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

/**
 *
 * Twig filter : string|title_highlights
 *
 * To use with ACF fields group 'title-highlights'
 *
 * How to use in twig templates :
 *
 * {% set title = post.get_field('title')|default(null) %}*
 * {% set title_highlights = post.get_field('title-highlights')|default(null) %}
 *
 * {{ title|title_highlights(title_highlights) }}
 *
 * Output example :
 *
 * 'What <span class="title-highlight marker" style="--highlight-index:0;--color: #FFCFB4;--border-radius: 100px"><span>happy</span></span> teams'
 *
 * @param string $text
 * @param array $replacements
 * @return string
 */

class Twig_Title_Highlights extends AbstractExtension {

    /**
     * Constants
     */
    const CLASSNAME_BASE = 'title-highlight';

    /**
     * array holder for attributes
     *
     * @var array
     */
    private $attributes = [];

    /**
     * array holder for classnames, with default
     *
     * @var array
     */
    private $classnames = [self::CLASSNAME_BASE];

    /**
     * array holder for styles
     *
     * @var array
     */
    private $styles = [];

    /**
     * Twig filter registration
     *
     * @return array
     */
    public function getFilters()
    {
        return [
            new TwigFilter('title_highlights', [$this, 'title_highlights']),
        ];
    }

    /**
     * Main filter method
     *
     * @param string $text
     * @param array $highlights
     * @return string
     */
    public function title_highlights($text, $highlights) {
        if( !$highlights ) return $text;

        $replacements = [];

        // replace highlights with UDID
        // save UDID and highlight output in array for later
        foreach($highlights as $key => $highlight) {
            $udid = '%th-' . uniqid();
            $output = null;
            $word = $highlight['text'];
            $type = $highlight['type'];

            // set classnames
            if ($type) $this->set_classname("--{$type}");

            // set styles
            $this->set_style("--highlight-index: {$key}");

            // get markup for word
            $output = $this->markup_wrapper($word);

            // This will match a dot next to a word, for example : 'bonjour' AND 'bonjour.' should match on the same $highlight value
            // The '/b' modifier for word bondaries matching, 'bonjourno' should NOT match.

            if( str_ends_with($word, '.') ) $re = "/(?:\b{$word})/imu";
            else $re = "/(?:\b{$word}\b)/imu";

            $text = preg_replace($re, $udid, $text, 1);
            array_push($replacements, array('udid' => $udid, 'output' => $output));

            // reset class on loop run
            $this->reset();
        }

        // replace UDIDs by their output
        foreach($replacements as $replacement) {
            $text = str_replace($replacement['udid'], $replacement['output'], $text);
        }

        // return transformed text
        return $text;
    }

    /**
     * append html attributes
     *
     * @param string $value
     * @return void
     */
    private function set_attribute($value) {
        $this->attributes[] = $value;
    }

    /**
     * append a classname
     *
     * @param string $value
     * @return void
     */
    private function set_classname($value) {
        $this->classnames[] = $value;
    }

    /**
     * append style
     *
     * @param string $value
     * @return void
     */
    private function set_style($value) {
        $this->styles[] = $value;
    }

    /**
     * contruct html string for each element
     *
     * @param string $value
     * @return string
     */
    private function markup_wrapper($content) {
        $classnames = join(" ", $this->classnames);
        $styles = join(";", $this->styles);
        $attributes = join(" ", $this->attributes);
        
        return "<span class='title-highlight__word {$classnames}' style='{$styles}' $attributes>{$content}</span>";
    }

    /**
     * reset class objects
     *
     * @return void
     */
    private function reset() {
        $this->attributes = [];
        $this->classnames = [self::CLASSNAME_BASE];
        $this->styles = [];
    }


}
