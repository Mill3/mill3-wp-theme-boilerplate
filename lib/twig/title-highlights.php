<?php

namespace Mill3\Twig;

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

class Twig_Title_Highlights {

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
        $filters['title_highlights'] = ['callable' => [$this, 'title_highlights']];

        return $filters;
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
            $match_type = $highlight['match_type'];

            // set classnames
            if (isset($type)) {
                foreach ($type as $_type) {
                    $this->set_classname("--{$_type}");
                }
            }

            // set styles
            $this->set_style("--highlight-index: {$key}");

            // get markup for word
            $output = $this->markup_wrapper($word);

            // set regex based on match type
            $re = $this->determine_regex($match_type, $word);

            // replace word with the generated UDID
            $text = preg_replace($re, $udid, $text, 1);

            // save UDID and output
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
     * Decide which regex to use for matching words
     *
     * @param string $match_type (exact|loose)
     * @param string $word
     * @return string regex
     */
    private function determine_regex($match_type = 'exact', $word = "") {
        // set possible match types
        $modes = ['exact' => null, 'loose' => null];

        // making sure match_type is valid
        if (!in_array($match_type, array_keys($modes))) {
            $match_type = 'exact';
        }

        // preg_quote() will escape special characters like . \ + * ? [ ^ ] $ ( ) { } = ! < > | : - #
        // https://www.php.net/manual/en/function.preg-quote.php
        $word = preg_quote($word);

        // escape / (which is not escape by preg_quote)
        $word = str_replace("/", "\/", $word);

        //
        // The following regex should matches words by boundaries, including special characters
        //
        // Examples with sentence : the quick brown fox (jumps) over the lazy dog.
        //
        // "(jumps)" = match
        // "fox (jumps)" = match
        // "dog." = match
        // "ox (jumps)" = does *not* match
        // "brown fo" = does *not* match
        //
        // Tester here : https://regex101.com/r/8NYRHg/1
        //
        $modes['exact'] = "/(?<!\w){$word}(?!\w)/imu";


        //
        // The following regex should matches words loosely, without boundaries
        //
        // Examples with sentence : the quick brown fox (jumps) over the lazy dog.
        //
        // "bro" = match (word part)
        // "brown" = match
        // "dog" = match (word with end punctuation)
        // "over the l" = match (part of a sentence)
        //
        $modes['loose'] = "/(?:{$word})/imu";

        // return regex
        return $modes[$match_type];
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


Twig_Title_Highlights::init();
