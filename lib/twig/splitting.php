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
    private static string $WORD_REGEX = '/(<[^>]+>)|([^\s]+)/um';

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
    public function add_timber_filters(array $filters): array
    {
        $filters['splitting'] = ['callable' => [$this, 'splitting']];

        return $filters;
    }

    /**
     * Split text into words
     *
     * @param string $text
     *
     * @param string $type
     *
     * @return string
     */
    public function splitting(string $text, string $type = "words"): string
    {
        $text = trim($text);

        if( $type === "words" ) return $this->splitByWords($text);
        elseif( $type === "wordsMask" ) return $this->splitByWordsMask($text);

        return $text;
    }


    /**
     * Split text into words
     *
     * @param string $text
     *
     * @return string
     */
    private function splitByWords(string $text): string
    {
        $result = preg_replace_callback(Splitting::$WORD_REGEX, function ($matches) {
            // Si le segment correspond à une balise HTML, on le laisse tel quel
            if (!empty($matches[1])) return $matches[1];

            // Sinon, on enveloppe le mot avec un span
            static $wordIndex = 0;
            return '<span class="word" data-word="'.$matches[2].'" style="--index:'.$wordIndex++.'">' . $matches[2] . '</span>';
        }, $text);

        return $result;
    }

    /**
     * Split text into words with mask wrapper
     *
     * @param string $text
     *
     * @return string
     */
    private function splitByWordsMask(string $text) :string
    {
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
