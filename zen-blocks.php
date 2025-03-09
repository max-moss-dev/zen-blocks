<?php
/**
 * Plugin Name: Zen Blocks
 * Description: Create Gutenberg blocks easily
 * Version: 0.1
 * Author: Max Moss
 * License: GPL v2 or later
 * Text Domain: zen-blocks
 *
 * @package ZENB
 */

defined('ABSPATH') || exit;

$plugin_data = get_file_data(__FILE__, [
    'Version' => 'Version',
], 'plugin');

define('ZENB_VERSION', $plugin_data['Version']);
define('ZENB_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ZENB_PLUGIN_URL', plugin_dir_url(__FILE__));

// Define global constants if not already defined
if (!defined('ZENB_REGISTER_EXAMPLE_BLOCKS')) {
    define('ZENB_REGISTER_EXAMPLE_BLOCKS', true);
}

if (!defined('ZENB_ADMIN_UI')) {
    define('ZENB_ADMIN_UI', true);
}

// Debug mode constant
if (!defined('ZENB_DEBUG')) {
    define('ZENB_DEBUG', false);
}

require_once ZENB_PLUGIN_DIR . 'includes/class-autoloader.php';

// Initialize autoloader
ZENB\Autoloader::getInstance();

// Initialize plugin
class Zen_Blocks {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function initialize(): void {
        // Create instances
        $template_parser = new ZENB\Template_Parser();
        $block_registrar = new ZENB\Block_Registrar($template_parser);
        $blocks_api = new ZENB\Blocks_API($template_parser, $block_registrar);
        
        // Initialize core components
        $blocks_api->init();
        $block_registrar->init();

        // Initialize admin UI if enabled
        if (ZENB_ADMIN_UI) {
            $admin_page = new ZENB\Admin_Page($blocks_api);
            $admin_page->init();
        }

        if (ZENB_REGISTER_EXAMPLE_BLOCKS) {
            add_filter('zenb_block_paths', [$this, 'add_block_path']);
        }
    }

    public function add_block_path(array $paths): array {
        $paths[] = ZENB_PLUGIN_DIR . 'examples';
        return $paths;
    }

    public static function activate() {
        flush_rewrite_rules();
    }

    public static function deactivate() {
        flush_rewrite_rules();
    }
}

// Initialize plugin
add_action('plugins_loaded', [Zen_Blocks::get_instance(), 'initialize']);

// Register activation/deactivation hooks
register_activation_hook(__FILE__, [Zen_Blocks::class, 'activate']);
register_deactivation_hook(__FILE__, [Zen_Blocks::class, 'deactivate']);