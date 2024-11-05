<?php

namespace Mill3\Twig;

class Splitting {

    // Regex pour matcher chaque mot en dehors des balises HTML
    // Regex pour capturer les mots avec apostrophes internes, trait d'union et ponctuation terminale, sans la perdre
    private static $WORD_REGEX = '/(<[^>]+>)|(\b[\w\p{L}]+(?:[\'’\-][\w\p{L}]+)*[.,;:!?]?\b|[.,;:!?]+)/u';

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

        return $text;
    }


    private function splitByWords($text) {
        $result = preg_replace_callback(Splitting::$WORD_REGEX, function ($matches) {
            // Si le segment correspond à une balise HTML, on le laisse tel quel
            if (!empty($matches[1])) return $matches[1];
            
            // Sinon, on enveloppe le mot avec un span
            static $wordIndex = 0;
            return '<span class="word" data-word="'.$matches[2].'" style="--index:'.$wordIndex++.'">' . $matches[2] . '</span>';
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
