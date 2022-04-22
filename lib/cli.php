<?php

namespace Mill3WP\Cli;

use WP_CLI;
use WP_CLI_Command;

defined('ADMIN_ACCOUNT_INVITE_LIST') or define('ADMIN_ACCOUNT_INVITE_LIST', []);

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

    //
    // list of admin account to create
    //
    static private $admin_accounts = ADMIN_ACCOUNT_INVITE_LIST;


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

    /**
     * Create admin users
     *
     * ## EXAMPLES
     *
     *     wp mill3wp create_admins
     *
     * @when before_wp_load
     *
     */

    public function create_admins() {
        \WP_CLI::line('Creating Mill3 admin users');

        /**
         * In wp-config.php, add the following constant :
         *
         *
         * $admin_accounts = ["username", "user@mill3.studio"],["username2", "user2@mill3.studio"]]
         * define('ADMIN_ACCOUNT_INVITE_LIST', $admin_accounts);
         *
         *
         */

        foreach (self::$admin_accounts as $key => $account) {
            \WP_CLI::runcommand("user create {$account[0]} {$account[1]} --role=administrator");
        }
    }

}
