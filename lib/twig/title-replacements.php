<?php

namespace Mill3\Twig;

use Timber;


/**
 * Twig filter : string|title_replacements
 *
 * To use with ACF fields group 'title-replacements'
 *
 * How to use in twig templates :
 *
 * {% set title = post.get_field('title')|default(null) %}*
 * {% set title_replacements = post.get_field('title-replacements')|default(null) %}
 *
 *
 * {{ title|title_replacements(title_replacements) }}
 *
 * CMS data should look like :
 *
 * 'What did the fox says %s ?'
 *
 * Output example :
 *
 * 'What did the fox says <span class="title-replacement" style="--replacement-index: 1"><img src="..." /></span> ?'
 *
 * @param string $text
 * @param array $replacements
 * @return string
 */


class Twig_Title_Replacements {

    /**
     * array holder for attributes
     *
     * @var array<string>
     */
    private array $attributes = [];

    /**
     * array holder for classnames, with default
     *
     * @var array<string>
     */
    private array $classnames = ['title-replacement'];

    /**
     * array holder for styles
     *
     * @var array<string>
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
    public function add_timber_filters(object $filters): object
    {
        $filters['title_replacements'] = ['callable' => [$this, 'title_replacements']];

        return $filters;
    }

    /**
     * Main filter method
     *
     * @param string $text
     *
     * @param array<array{'type': string, 'image'?: array{'url': string, 'mime_type': string}, 'menu'?: int, 'border_radius'?: int, 'icon'?: string}> $replacements
     *
     * @return string
     */
    public function title_replacements(string $text, array $replacements): string {
        if( $replacements == null ) return $text;

        $total_replacements = substr_count($text, '%s');

        // if total replacements doesn't match array length,
        // return text string non transformed because vsprintf or sprintf would fail
        if ($total_replacements !== count($replacements)) return $text;

        // data array holder
        $data = [];

        // build markup data for each replacement
        foreach ($replacements as $key => $replacement) {
            $type = $replacement['type'];
            $this->set_classname("--{$type}");
            $this->set_style("--replacement-index: {$key}");

            switch ($type) {
                case 'image':
                    $data[] = $this->replacement_image($replacement);
                    break;
                case 'icon':
                    $data[] = $this->replacement_icon($replacement);
                    break;
                case 'menu':
                    $data[] = $this->replacement_menu($replacement);
                    break;
            }
        }

        // validate again
        if ($total_replacements !== count($data)) return $text;

        return vsprintf($text, $data);
    }

    /**
     * Build image replacement
     *
     * @param array{'image'?: array{'url': string, 'mime_type': string}, 'border_radius'?: int} $replacement
     *
     * @return string
     */
    private function replacement_image(array $replacement): string {
        $image = isset($replacement['image']) ? $replacement['image'] : null;
        $border_radius = isset($replacement['border_radius']) ? $replacement['border_radius'] : null;

        if($image) {
            $is_svg = $image['mime_type'] === 'image/svg+xml';

            if($is_svg) {
                // attach SvgPathLength JS module to attributes
                $this->set_attribute("data-module='svg-path-length'");
                $image_system_path = Timber\URLHelper::url_to_file_system($image['url']);
                $img_tag = file_get_contents($image_system_path);
            } else {
                if ($border_radius) $this->set_style("--image-border-radius: {$border_radius}px");
                $img_tag = Timber::compile('partial/image.twig', ['image' => $image]);
            }

            return $this->markup_wrapper($img_tag);
        } else {
            return "[no image]";
        }
    }

    /**
     * Build icon replacement
     *
     * @param array{'icon'?: string} $replacement
     *
     * @return string
     */
    private function replacement_icon(array $replacement): string {
        $icon = isset($replacement['icon']) ? $replacement['icon'] : null;

        if($icon) {
            $image_url = get_stylesheet_directory_uri() . '/src/svg/' . $icon . '.svg';
            $image_system_path = Timber\URLHelper::url_to_file_system($image_url);
            $img_tag = file_get_contents($image_system_path);
            // attach SvgPathLength JS module to attributes
            $this->set_attribute("data-module='svg-path-length'");

            // set icon value as classname
            $this->set_classname("--{$icon}");

            return $this->markup_wrapper($img_tag);
        } else {
            return "[no icon]";
        }
    }

    /**
     * Build menu replacement
     *
     * @param array{'menu'?: int} $replacement
     *
     * @return string
     */
    private function replacement_menu(array $replacement): string {
        $menu = isset($replacement['menu']) ? $replacement['menu'] : null;

        if($menu) {
            $menu_instance = Timber::get_menu($menu);
            $menu_tag = Timber::compile('menu.twig', ['menu' => $menu_instance->items()]);
            return $this->markup_wrapper($menu_tag);
        } else {
            return "[no menu]";
        }
    }

    private function set_attribute(string $value): void {
        $this->attributes[] = $value;
    }

    private function set_classname(string $value): void {
        $this->classnames[] = $value;
    }

    private function set_style(string $value): void {
        $this->styles[] = $value;
    }

    /**
     * contruct html string for each element
     *
     * @param string $content
     * @return string
     */
    private function markup_wrapper(string $content): string {
        $classnames = join(" ", $this->classnames);
        $styles = join(";", $this->styles);
        $attributes = join(" ", $this->attributes);
        return "<span class='{$classnames}' style='{$styles}' $attributes><span class='title-replacement__wrap'>{$content}</span></span>";
    }


}


Twig_Title_Replacements::init();
