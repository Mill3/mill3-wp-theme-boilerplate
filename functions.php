<?php

/**
 * Mill3 WP Theme Boilerplate
 * https://github.com/Mill3/mill3-wp-theme-boilerplate
 *
 * @package  Mill3Wp
 * @subpackage  Timber
 */

require __DIR__ . '/vendor/autoload.php';

// Initialize Timber.
Timber\Timber::init();

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
        'environment' => SENTRY_ENV ? SENTRY_ENV : 'production',
        'error_types' => E_ERROR & ~E_WARNING & ~E_NOTICE
    ]);
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

/**
 * Sets the directories (inside your theme) to find .twig files
 */
Timber::$dirname = array('templates');

// include theme custom classes
$includes = [
    'lib/acf.php',
    'lib/actions.php',
    'lib/admin-status.php',
    'lib/assets.php',
    'lib/avatar.php',
    'lib/block-visibility.php',
    'lib/class-walker-nav-menu-edit.php',
    'lib/editor.php',
    'lib/filters.php',
    'lib/gdpr.php',
    'lib/gravity-form.php',
    'lib/gutenberg.php',
    'lib/media-gallery.php',
    'lib/menu.php',
    'lib/newsletter.php',
    'lib/polylang.php',
    'lib/post-functions.php',
    'lib/post-queries.php',
    'lib/post-type.php',
    'lib/rankmath.php',
    'lib/recaptcha.php',
    'lib/search.php',
    'lib/sentry.php',
    'lib/setup.php',
    'lib/shortcodes.php',
    'lib/svg.php',
    'lib/taxonomies.php',
    'lib/taxonomy-queries.php',
    'lib/utils.php',
    'lib/windmill-prefetch.php',
    'lib/window-messenger.php',
    // twig
    'lib/twig/extra-timber-filters.php',
    'lib/twig/file-filters.php',
    'lib/twig/sharing-filters.php',
    'lib/twig/title-highlights.php',
    'lib/twig/title-replacements.php',
    // custom field type
    'lib/acf-fields/spacer/index.php',
    'lib/acf-fields/row-title/index.php',
    // model class per post-type
    'lib/models/abstract-post.php',
    'lib/models/image.php',
    'lib/models/page-section.php',
    'lib/models/post.php',
    'lib/models/post-class-map.php'
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
    /* Add timber support. */
    public function __construct()
    {
        add_action('init', array($this, 'register_post_types'));
        add_action('init', array($this, 'register_taxonomies'));
        add_filter('timber/context', array($this, 'add_to_context'));
        add_filter('timber/twig/filters', array($this, 'add_filters'));
        add_filter('timber/twig/functions', array($this, 'add_functions'));

        parent::__construct();
    }

    /**
     * Override Timber\Site\link method :
     * When Polylang is installed, returns home_url() core function instead of $this->url
     *
     * @return string
     */
    public function link(): string
    {
        if( function_exists('pll_current_language') ) {
            return home_url() . "/";
        } else {
            return $this->url;
        }
	}

    /**
     * Overide Timber\Site url() method
     * This is for handling polylang home_url() method when its activated
     *
     * @return string
     */
    public function url(): string
    {
        if (function_exists('pll_home_url')) {
            return pll_home_url();
        } else {
            return $this->url;
        }
    }

    /**
     * This is where you can register custom post types.
     */
    public function register_post_types(): void
    {
        Theme_CustomPostTypes::instance()->run();
    }

    /**
     * This is where you can register custom taxonomies.
     */
    public function register_taxonomies(): void
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
        $context['site_navigation'] = Timber::get_menu('site_navigation');
        $context['header_navigation'] = Timber::get_menu('header_navigation');
        $context['footer_navigation'] = Timber::get_menu('footer_navigation');
        $context['social_links'] = Timber::get_menu('social_links');

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

    /**
     * This is where you can add your custom functions to Twig.
     *
     * @param string $functions : Array of available functions in Twig.
     */
    public function add_filters($filters)
    {
        // alias of sanitize
        $filters['slugify'] = $filters['sanitize'];

        $filters['embeded_settings'] = ['callable' => 'filter_embeded_settings'];
        $filters['group_by_key'] = ['callable' => 'filter_group_by_key'];

        return $filters;
    }

    /**
     * This is where you can add your custom functions to Twig.
     *
     * @param string $functions : Array of available functions in Twig.
     */
    public function add_functions($functions)
    {
        $functions['get_context'] = ['callable' => function () { return Timber::context(); }];
        $functions['get_options'] = ['callable' => function () { return get_fields('options'); }];
        $functions['is_menu_item'] = ['callable' => function ($item) { return ($item instanceof Timber\MenuItem); }];

        return $functions;
    }
}

new Mill3WP();
