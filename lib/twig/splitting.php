<?php

namespace Mill3\Twig;

class Splitting {

    /**
     * Regex to match each word in paragraph.
     *
     * - Match HTML tag.
     *  OR
     * - Match all following characters until whitespace.
     */
    private static $WORD_REGEX = '/(<[^>]+>)|([^\s<>]+)/um';

    /**
     * Regex to match each character within a word.
     *
     * - Match HTML entity (e.g. &nbsp; &#160; &#xA0;).
     *  OR
     * - Match a single UTF-8 character.
     */
    private static $CHAR_REGEX = '/(&(?:[a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);)|(.)/us';

    public static function init(): void {
        $self = new self();
        \add_filter('timber/twig/filters', [$self, 'add_timber_filters']);
    }

    /**
     * Adds filters to Twig.
     */
    public function add_timber_filters($filters)
    {
        $filters['splitting'] = ['callable' => [$this, 'splitting']];

        return $filters;
    }

    /**
     * Split text into words
     *
     * @param string $text
     * @return string
     */
    public function splitting($text, $type = "words") {
        $text = trim($text);

        if( $type === "words" ) return $this->splitByWords($text);
        elseif( $type === "wordsMask" ) return $this->splitByWordsMask($text);
        elseif( $type === "chars" ) return $this->splitByChars($text);

        return $text;
    }


    private function splitByWords($text) {
        $result = preg_replace_callback(Splitting::$WORD_REGEX, function ($matches) {
            // Si le segment correspond à une balise HTML, on le laisse tel quel
            if (!empty($matches[1])) return $matches[1];
            
            // Sinon, on enveloppe le mot avec un span
            static $wordIndex = 0;
            return '<span class="word" data-word="'.$matches[2].'" style="--word-index:'.$wordIndex++.'">' . $matches[2] . '</span>';
        }, $text);
        
        return $result;
    }
    private function splitByChars($text) {
        $charIndex = 0;
        $wordIndex = 0;

        $result = preg_replace_callback(Splitting::$WORD_REGEX, function ($matches) use (&$charIndex, &$wordIndex) {
            // Leave HTML tags untouched
            if (!empty($matches[1])) return $matches[1];

            $wrapped = preg_replace_callback(Splitting::$CHAR_REGEX, function ($charMatches) use (&$charIndex) {
                $char = !empty($charMatches[1]) ? $charMatches[1] : $charMatches[2];
                if ($char === '&nbsp;') return $char;
                return '<span class="char" data-char="' . htmlspecialchars($char) . '" style="--char-index:' . $charIndex++ . '">' . $char . '</span>';
            }, $matches[2]);

            return '<span class="word" data-word="' . htmlspecialchars($matches[2]) . '" style="--word-index:' . $wordIndex++ . '">' . $wrapped . '</span>';
        }, $text);

        return $result;
    }

    private function splitByWordsMask($text) {
        $result = preg_replace_callback(Splitting::$WORD_REGEX, function ($matches) {
            // Si le segment correspond à une balise HTML, on le laisse tel quel
            if (!empty($matches[1])) return $matches[1];
            
            // Sinon, on enveloppe le mot avec un span
            static $wordIndex = 0;
            return '<span class="word" data-word="'.$matches[2].'" style="--word-index:'.$wordIndex++.'"><span class="wordText">' . $matches[2] . '</span></span>';
        }, $text);
        
        return $result;
    }
}

Splitting::init();
