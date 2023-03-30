<?php

/**
 * Mill3 WP Theme Boilerplate
 * https://github.com/Mill3/mill3-wp-theme-boilerplate
 *
 * @package  Mill3Wp
 * @subpackage  Timber
 */

require __DIR__ . '/vendor/autoload.php';

//
// Define various constants
//
defined('THEME_ENV') or define('THEME_ENV', 'production');
defined('WEBPACK_DEV_SERVER') or define('WEBPACK_DEV_SERVER', THEME_ENV === 'development');
defined('SENTRY_DSN_PHP') or define('SENTRY_DSN_PHP', null);
defined('SENTRY_DSN_JS') or define('SENTRY_DSN_JS', null);
defined('SENTRY_ENV') or define('SENTRY_ENV', null);


//
// Init Sentry.io
//
if (defined('SENTRY_DSN_PHP') && \function_exists('\Sentry\init')) {
    \Sentry\init([
        'dsn' => SENTRY_DSN_PHP,
        'environment' => SENTRY_ENV ? SENTRY_ENV : 'production'
    ]);
    \Sentry\captureLastError();
}

//
// Add theme WP CLI commands.
// note: must be invoked before Timber plugin installation status
//
if (defined('WP_CLI') && WP_CLI) {
    require_once __DIR__ . '/lib/cli.php';
    $commands = new \Mill3WP\Cli\Commands();
    \WP_CLI::add_command('mill3wp', $commands);
}

//
// Handling when Advanced Custom Fields is not installed
//
if (!\class_exists('ACF')) {

    // add notice in admin
    add_action('admin_notices', function () {
        echo '<div class="error"><p>Advanced Custom Field not activated. Make sure you activate the plugin in <a href="' .
            esc_url(admin_url('plugins.php#advanced-custom-fields-pro')) .
            '">' .
            esc_url(admin_url('plugins.php')) .
            '</a></p></div>';
    });

    // fallback method avoiding 500 error when get_field is called from Twig function() method
    if (!is_admin() && !\function_exists('get_field')) {
        function get_field()
        {
            return "ACF not installed.";
        }
    }
}

//
// Handling when Timber is not installed
//

if (!\class_exists('Timber')) {
    add_action('admin_notices', function () {
        echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' .
            esc_url(admin_url('plugins.php#timber')) .
            '">' .
            esc_url(admin_url('plugins.php')) .
            '</a></p></div>';
    });

    add_filter('template_include', function ($template) {
        return get_stylesheet_directory() . '/templates/no-timber.html';
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
    'lib/admin-status.php',
    'lib/assets.php',
    'lib/avatar.php',
    'lib/block-visibility.php',
    'lib/class-walker-nav-menu-edit.php',
    'lib/customizer.php',
    'lib/editor.php',
    'lib/filters.php',
    'lib/gdpr.php',
    'lib/gravity-form.php',
    'lib/gutenberg.php',
    'lib/menu.php',
    'lib/newsletter.php',
    'lib/mill3-timber-image.php',
    'lib/post-functions.php',
    'lib/post-queries.php',
    'lib/post-type.php',
    'lib/rankmath.php',
    'lib/recaptcha.php',
    'lib/search.php',
    'lib/setup.php',
    // twig
    'lib/twig/extra-timber-filters.php',
    'lib/twig/file-filters.php',
    'lib/twig/sharing-filters.php',
    'lib/twig/title-highlights.php',
    'lib/twig/title-replacements.php',
    // 'lib/shortcodes.php',
    'lib/svg.php',
    'lib/taxonomies.php',
    'lib/taxonomy-queries.php',
    'lib/titles.php',
    'lib/utils.php',
    'lib/window-messenger.php',
    // custom field type
    'lib/acf-fields/spacer/index.php',
    'lib/acf-fields/row-title/index.php',
    // model class per post-type
    'lib/models/dummy.php',
    'lib/models/page-section.php',
    'lib/models/post.php'
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
class Mill3WP extends Timber\Site
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

    /** Override Timber\Site\link method :
     *
     *  When Polylang is installed, returns home_url() core function instead of $this->url
     *
     */
    public function link() {
        if( function_exists('pll_current_language') ) {
            return home_url() . "/";
        } else {
            return $this->url;
        }
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

    /**
     * Overide Timber\Site url() method
     * This is for handling polylang home_url() method when its activated
     *
     * @return string
     */
    public function url()
    {
        if (function_exists('pll_home_url')) {
            return pll_home_url();
        } else {
            return $this->url;
        }
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
        $context['THEME_ENV'] = THEME_ENV;
        $context['WEBPACK_DEV_SERVER'] = WEBPACK_DEV_SERVER;
        $context['SENTRY_DSN_PHP'] = SENTRY_DSN_PHP;
        $context['SENTRY_DSN_JS'] = SENTRY_DSN_JS;
        $context['SENTRY_ENV'] = SENTRY_ENV;

        if (\class_exists('ACF')) {
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
        $twig->addExtension(new \Twig_Extension_StringLoader());
        $twig->addExtension(new Mill3\Twig\Twig_File_Filters());
        $twig->addExtension(new Mill3\Twig\Twig_Sharing_Filters());
        $twig->addExtension(new Mill3\Twig\Twig_Title_Highlights());
        $twig->addExtension(new Mill3\Twig\Twig_Title_Replacements());
        $twig->addFilter(new \Timber\Twig_Filter('slugify', 'filter_slugify'));
        $twig->addFilter(new \Timber\Twig_Filter('embeded_settings', 'filter_embeded_settings'));
        $twig->addFilter(new \Timber\Twig_Filter('lcfirst', 'lcfirst'));

        $twig->addFunction(
            new \Twig\TwigFunction('get_context', function () {
                return Timber::get_context();
            })
        );

        $twig->addFunction(
            new \Twig\TwigFunction('get_options', function () {
                return get_fields('options');
            })
        );

        $twig->addFunction(
            new \Twig\TwigFunction(
                'is_menu_item',
                function ($item) {
                    return ($item instanceof Timber\MenuItem);
                }
            )
        );

        $twig->addFunction(
            new Timber\Twig_Function(
                'Mill3Image',
                function ($attachment_id) {
                    return new \Mill3WP\Image\Mill3Image($attachment_id);
                }
            )
        );

        $twig->addFunction(
            new Timber\Twig_Function(
                'MILL3_Fake_Post',
                function ($fields) {
                    return new MILL3FakePost($fields);
                }
            )
        );

        // polylang functions
        if (function_exists('pll_current_language')) {
            $twig->addFunction(new Timber\Twig_Function('pll__', 'pll__'));
            $twig->addFunction(new Timber\Twig_Function('pll_e', 'pll_e'));
            $twig->addFunction(new Timber\Twig_Function('pll_current_language', 'pll_current_language'));
            $twig->addFunction(new Timber\Twig_Function('language_switcher', function () {
                pll_the_languages(array('show_flags' => 0, 'show_names' => 0));
            }));
        }

        // breadcrumb function
        if (function_exists('rank_math_the_breadcrumbs')) {
            $twig->addFunction(new Timber\Twig_Function('breadcrumb', 'rank_math_the_breadcrumbs'));
        } else {
            $twig->addFunction(new Timber\Twig_Function('breadcrumb', function () {
                return "RankMath plugin is not installed";
            }));
        }

        return $twig;
    }
}

new Mill3WP();
