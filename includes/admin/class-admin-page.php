<?php
/**
 * Admin Page for Zen Blocks
 *
 * @package ZENB
 */

namespace ZENB;

/**
 * Admin page handler
 */
class Admin_Page {
    /**
     * Blocks API instance
     *
     * @var Blocks_API
     */
    private $_blocks_api;

    /**
     * Constructor
     *
     * @param Blocks_API $blocks_api Blocks API instance
     */
    public function __construct(Blocks_API $blocks_api) {
        $this->_blocks_api = $blocks_api;
    }

    /**
     * Initialize the admin page
     */
    public function init(): void {
        add_action('admin_menu', [$this, 'add_menu_page']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        add_action('load-toplevel_page_zen-blocks-settings', [$this, 'add_help_tabs']);
    }

    /**
     * Add menu page
     */
    public function add_menu_page(): void {
        add_menu_page(
            __('Zen Blocks', 'zen-blocks'),
            __('Zen Blocks', 'zen-blocks'),
            'manage_options',
            'zen-blocks-settings',
            [$this, 'render_admin_page'],
            'dashicons-block-default'
        );
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook): void {
        if ($hook !== 'toplevel_page_zen-blocks-settings') {
            return;
        }

        // Enqueue WordPress dependencies
        wp_enqueue_script('wp-element');
        wp_enqueue_script('wp-components');
        wp_enqueue_script('wp-i18n');
        wp_enqueue_script('wp-api-fetch');

        // Enqueue WordPress Components styles
        wp_enqueue_style('wp-components');

        $script_asset_path = plugin_dir_path(dirname(__DIR__)) . 'build/admin.asset.php';
        $script_asset = file_exists($script_asset_path)
            ? require($script_asset_path)
            : ['dependencies' => [
                'wp-element',
                'wp-components',
                'wp-i18n',
                'wp-api-fetch'
            ], 'version' => filemtime(plugin_dir_path(dirname(__DIR__)) . 'build/admin.js')];

        // Enqueue admin script
        wp_enqueue_script(
            'zen-blocks-admin',
            plugins_url('build/admin.js', dirname(__DIR__)),
            $script_asset['dependencies'],
            $script_asset['version'],
            true
        );

        // Get control types data
        $control_types = \ZENB\Control_Types::get_all();
        
        // Register control types for admin
        wp_localize_script(
            'zen-blocks-admin',
            'zenBlocksControlTypes',
            $control_types
        );

        // Pass configuration data to admin script
        wp_localize_script('zen-blocks-admin', 'zenBlocksConfig', [
            'registerExampleBlocks' => ZENB_REGISTER_EXAMPLE_BLOCKS,
            'adminUI' => ZENB_ADMIN_UI
        ]);

        // Enqueue admin styles
        wp_enqueue_style(
            'zen-blocks-admin',
            plugins_url('build/admin.css', dirname(__DIR__)),
            ['wp-components'],
            $script_asset['version']
        );
    }

    /**
     * Add help tabs
     */
    public function add_help_tabs(): void {
        $screen = get_current_screen();
        
        // Configuration tab
        $screen->add_help_tab([
            'id' => 'zen-blocks-configuration',
            'title' => __('Configuration', 'zen-blocks'),
            'content' => sprintf(
                '<h2>%s</h2><p>%s</p><h3>%s</h3><p><code>%s</code></p><p>%s</p><h3>%s</h3><p><code>%s</code></p><p>%s</p>',
                __('Plugin Configuration', 'zen-blocks'),
                __('To disable developer settings, use these constants in your wp-config.php file:', 'zen-blocks'),
                'ZENB_REGISTER_EXAMPLE_BLOCKS',
                "define('ZENB_REGISTER_EXAMPLE_BLOCKS', false);",
                __('Controls whether the plugin registers example blocks from its examples directory. Disable this in production if you\'re only using your own blocks.', 'zen-blocks'),
                'ZENB_ADMIN_UI',
                "define('ZENB_ADMIN_UI', false);",
                __('Controls the developer settings interface. Disable this in production or when distributing to clients who shouldn\'t modify block settings.', 'zen-blocks')
            )
        ]);
    }

    /**
     * Render admin page
     */
    public function render_admin_page(): void {
        $block = isset($_GET['block']) ? sanitize_text_field($_GET['block']) : null;
        if ($block) {
            echo '<div id="zen-blocks-settings"></div>';
        } else {
            echo '<div id="zen-blocks-admin-root"></div>';
        }
    }
}
