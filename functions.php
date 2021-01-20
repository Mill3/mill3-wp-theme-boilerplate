<?php

// require __DIR__ . '/vendor/autoload.php';


/**
 * Timber starter-theme
 * https://github.com/timber/starter-theme
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since   Timber 0.1
 */

if (!class_exists('Timber')) {
    add_action('admin_notices', function () {
        echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' .
            esc_url(admin_url('plugins.php#timber')) .
            '">' .
            esc_url(admin_url('plugins.php')) .
            '</a></p></div>';
    });

    add_filter('template_include', function ($template) {
        return get_stylesheet_directory() . '/static/no-timber.html';
    });

    return;
}

/**
 * Sets the directories (inside your theme) to find .twig files
 */
Timber::$dirname = array('templates', 'views');

/**
 * By default, Timber does NOT autoescape values. Want to enable Twig's autoescape?
 * No prob! Just set this value to true
 */
Timber::$autoescape = false;

// include theme custom classes
$includes = [
    'lib/translations.php',
    'lib/acf.php',
    'lib/actions.php',
    'lib/assets.php',
    'lib/barba.php',
    'lib/class-walker-nav-menu-edit.php',
    'lib/customizer.php',
    'lib/editor.php',
    'lib/extra-timber-filters.php',
    'lib/filters.php',
    'lib/gravity-form.php',
    'lib/menu.php',
    'lib/post-functions.php',
    'lib/post-queries.php',
    'lib/post-type.php',
    'lib/setup.php',
    'lib/shortcodes.php',
    'lib/taxonomies.php',
    'lib/taxonomy-queries.php',
    'lib/titles.php',
    'lib/utils.php',
    // model class per post-type
    'lib/models/dummy.php',
];

foreach ($includes as $file) {
    if (!$filepath = locate_template($file)) {
        trigger_error(
            sprintf(__('Error locating %s for inclusion'), $file),
            E_USER_ERROR
        );
    }
    include_once $filepath;
}
unset($file, $filepath);

/**
 * We're going to configure our theme inside of a subclass of Timber\Site
 * You can move this to its own file and include here via php's include("MySite.php")
 */
class StarterSite extends Timber\Site
{
    /** Add timber support. */
    public function __construct()
    {
        add_filter('timber_context', array($this, 'add_to_context'));
        add_filter('get_twig', array($this, 'add_to_twig'));
        add_action('init', array($this, 'register_post_types'));
        add_action('init', array($this, 'register_taxonomies'));
        parent::__construct();
    }

    /** This is where you can register custom post types. */
    public function register_post_types()
    {
        Theme_CustomPostTypes::instance()->run();
    }

    /** This is where you can register custom taxonomies. */
    public function register_taxonomies()
    {
        Theme_CustomTaxonomies::instance()->run();
    }

    /** This is where you add some context
     *
     * @param string $context context['this'] Being the Twig's {{ this }}.
     */
    public function add_to_context($context)
    {
        $context['site'] = $this;
        $context['primary_navigation'] = new Timber\Menu('primary_navigation');
        $context['secondary_navigation'] = new Timber\Menu('secondary_navigation');
        $context['footer_navigation'] = new Timber\Menu('footer_navigation');
        $context['social_links'] = new Timber\Menu('social_links');
        if ( \function_exists('get_fields') ) {
          $context['options'] = get_fields('options');
        }

        return $context;
    }

    /** This is where you can add your own functions to twig.
     *
     * @param string $twig get extension.
     */
    public function add_to_twig($twig)
    {
        $twig->addExtension(new Twig_Extension_StringLoader());
        $twig->addFilter(
          'slugify',
          new Twig_SimpleFilter('slugify', 'filter_slugify')
        );

        $twig->addFilter(
          'lcfirst',
          new Twig_SimpleFilter('lcfirst', 'lcfirst')
        );
        $twig->addFilter(
          'facebook_share',
          new Twig_SimpleFilter('facebook_share', 'filter_facebook_share')
        );

        $twig->addFunction(
          new \Twig\TwigFunction('get_options', function () {
            return get_fields('options');
          })
        );

        // polylang functions
        if (function_exists('pll_current_language')) {
            $twig->addFunction(new Timber\Twig_Function('pll__', 'pll__'));
            $twig->addFunction(new Timber\Twig_Function('pll_e', 'pll_e'));
            $twig->addFunction(new Timber\Twig_Function('pll_current_language', 'pll_current_language'));
            $twig->addFunction(new Timber\Twig_Function('language_switcher', function() {
                pll_the_languages(array('show_flags'=>0,'show_names'=>0));
            }));
        }

        // breadcrumb function
        if ( function_exists('rank_math_the_breadcrumbs') ) {
          $twig->addFunction(new Timber\Twig_Function('breadcrumb', 'rank_math_the_breadcrumbs'));
        } else {
          $twig->addFunction(new Timber\Twig_Function('breadcrumb', function() { return "RankMath plugin is not installed"; } ));
        }

        return $twig;
    }
}

new StarterSite();
