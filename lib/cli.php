<?php

namespace Mill3WP\Cli;

use WP_CLI;
use WP_CLI_Command;

/**
 * Mill3WP CLI commands : install our commons plugins
 */

class Commands extends WP_CLI_Command
{

    //
    // list of plugin to install
    //
    static private $install_plugins_list = [
        'https://mill3-wp-plugins.netlify.app/admin-columns-pro.zip',
        'https://mill3-wp-plugins.netlify.app/advanced-custom-fields-pro.zip',
        'https://mill3-wp-plugins.netlify.app/gravityforms.zip',
        'https://mill3-wp-plugins.netlify.app/wp-migrate-db-pro.zip',
        'https://mill3-wp-plugins.netlify.app/wp-migrate-db-pro-media-files.zip',
        'https://mill3-wp-plugins.netlify.app/polylang-pro.zip',
        'timber-library',
        'acf-extended',
        'seo-by-rank-math',
        'webp-express',
        'classic-editor'
    ];

    /**
     * Install all commons Mill3 plugins.
     *
     * ## EXAMPLES
     *
     *     wp mill3wp plugins
     *
     * @when before_wp_load
     *
     */

    public function plugins() {
        \WP_CLI::line('Installing Mill3WP commons plugins');
        foreach (self::$install_plugins_list as $key => $plugin) {
            \WP_CLI::run_command(array('plugin', 'install', $plugin));
        }
    }


}
