<?php
namespace ZENB;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use WP_REST_Server;

/**
 * Class Blocks_API
 * Handles all block-related operations
 */
class Blocks_API {
    /**
     * Template parser instance
     *
     * @var Template_Parser
     */
    private $_template_parser;

    /**
     * Block registrar instance
     *
     * @var Block_Registrar
     */
    private $_block_registrar;

    /**
     * Constructor
     *
     * @param Template_Parser $template_parser Template parser instance
     * @param Block_Registrar $block_registrar Block registrar instance
     */
    public function __construct(Template_Parser $template_parser, Block_Registrar $block_registrar) {
        $this->_template_parser = $template_parser;
        $this->_block_registrar = $block_registrar;
    }

    /**
     * Initialize the API
     */
    public function init(): void {
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        add_action('wp_ajax_zen_blocks_preview', [$this, 'handle_preview_ajax']);
        
        // Register and enqueue editor script first
        add_action('enqueue_block_editor_assets', [$this, 'register_editor_script'], 9);
        add_action('enqueue_block_editor_assets', [$this, 'register_control_types'], 10);
        add_action('enqueue_block_assets', [$this, 'register_editor_style'], 11);
    }

    /**
     * Register and enqueue editor script
     */
    public function register_editor_style() {
        wp_enqueue_style('zen-editor', ZENB_PLUGIN_URL . 'build/editor.css', [], ZENB_VERSION, 'all');
    }   

    /**
     * Register and enqueue editor script
     */
    public function register_editor_script() {
        // Register editor script
        wp_register_script(
            'zen-editor',
            ZENB_PLUGIN_URL . 'build/editor.js',
            ['wp-rich-text', 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n', 'wp-api-fetch', 'wp-block-editor'],
            ZENB_VERSION,
            true
        );

        // Enqueue editor script
        wp_enqueue_script('zen-editor');
        // Get all templates and their metadata using Block_Registrar's method
        $templates = $this->_block_registrar->getTemplates();
        $blocks = [];

        foreach ($templates as $template) {
            $name = basename($template);
            $name = preg_replace('/\.php$/', '', $name);
            
            $data = $this->_template_parser->parse($template);
            $blocks[] = [
                'name' => $name,
                'attributes' => $data['attributes'],
                'metadata' => $data['metadata']
            ];
        }

        // Localize template blocks data
        wp_localize_script('zen-editor', 'zenTemplateBlocks', $blocks);
        wp_localize_script('zen-editor', 'zenBlocksData', [
            'adminUI' => ZENB_ADMIN_UI,
            'debugEnabled' => ZENB_DEBUG
        ]);

    }



    /**
     * Register control types for JavaScript
     */
    public function register_control_types() {
        // Get control types data
        $control_types = Control_Types::get_all();
        
        // Register control types before the editor script
        wp_localize_script(
            'zen-editor',
            'zenBlocksControlTypes',
            $control_types
        );
    }

    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route('zen-blocks/v1', '/blocks', [
            'methods' => 'GET',
            'callback' => [$this, 'get_blocks_data'],
            'permission_callback' => function() {
                return current_user_can('edit_posts');
            }
        ]);


        register_rest_route('zen-blocks/v1', '/preview', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [$this, 'handle_preview'],
            'permission_callback' => [$this, 'check_preview_permission'],
            'args' => [
                'template' => [
                    'required' => true,
                    'type' => 'string',
                ],
                'attributes' => [
                    'required' => true,
                    'type' => 'object',
                ],
            ],
        ]);

        register_rest_route('zen-blocks/v1', '/blocks/(?P<block_name>[a-zA-Z0-9-]+)/settings', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_settings'],
                'permission_callback' => [$this, 'check_settings_permission'],
                'args' => [
                    'block_name' => [
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field'
                    ]
                ]
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'update_settings'],
                'permission_callback' => [$this, 'check_settings_permission'],
                'args' => [
                    'block_name' => [
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field'
                    ]
                ]
            ]
        ]);
    }

    /**
     * Get blocks data for both editor and admin
     * 
     * @return WP_REST_Response
     */
    public function get_blocks_data() {
        $template_dir = get_template_directory() . '/zen-blocks';
        $examples_dir = \ZENB_PLUGIN_DIR . 'examples';
        $templates = [];

        // Get additional block paths from filter
        $block_paths = apply_filters('zenb_block_paths', [$template_dir]);

        foreach ($block_paths as $path) {
            if (is_dir($path)) {
                // Find all block directories
                $block_dirs = glob($path . '/*', GLOB_ONLYDIR);
                
                foreach ($block_dirs as $dir) {
                    $block_name = basename($dir);
                    $block_file = $dir . '/' . $block_name . '.php';
                    $json_file = $dir . '/' . $block_name . '.json';
                    
                    if (file_exists($block_file)) {
                        $templates[] = [
                            'template' => $block_file,
                            'json' => file_exists($json_file) ? $json_file : null
                        ];
                    }
                }
            }
        }

        // Allow filtering of templates
        $templates = apply_filters('zenb_templates', $templates);
        
        $blocks_data = [];
        foreach ($templates as $template_data) {
            $template = $template_data['template'];
            $json_file = $template_data['json'];
            
            $name = basename(dirname($template));
            $metadata = [];
            
            // Parse block.json if exists
            if ($json_file && file_exists($json_file)) {
                $json_content = file_get_contents($json_file);
                $metadata = json_decode($json_content, true) ?: [];
            }
            
            // Parse PHP template for fallback data
            $template_data = $this->_template_parser->parse($template);
            
            // Merge metadata with fallback values
            $blocks_data[] = [
                'name' => $name,
                'title' => $metadata['title'] ?? $template_data['metadata']['title'] ?? '',
                'description' => $metadata['description'] ?? $template_data['metadata']['description'] ?? '',
                'icon' => $metadata['icon'] ?? null,
                'category' => $metadata['category'] ?? 'zen-blocks',
                'supports' => $metadata['supports'] ?? [],
                'attributes' => $metadata['attributes'] ?? $template_data['attributes'] ?? [],
                'isExample' => strpos($template, $examples_dir) === 0,
                'editorScript' => $metadata['editorScript'] ?? null,
                'editorStyle' => $metadata['editorStyle'] ?? null,
                'style' => $metadata['style'] ?? null
            ];
        }

        return rest_ensure_response($blocks_data);
    }

    /**
     * Check if user has permission to preview blocks
     */
    public function check_preview_permission(): bool {
        return current_user_can('edit_posts');
    }

    /**
     * Check if user has permission to manage block settings
     */
    public function check_settings_permission(): bool {
        return current_user_can('manage_options');
    }

    /**
     * Handle preview request
     */
    public function handle_preview(WP_REST_Request $request): WP_REST_Response|WP_Error {
        $template_name = $request->get_param('template');
        $attributes = $request->get_param('attributes');

        $block_paths = apply_filters('zenb_block_paths', [
            get_template_directory() . '/zen-blocks'
        ]);
        
        $template_path = '';
        foreach ($block_paths as $base_path) {
            $path = $base_path . '/' . $template_name . '/' . $template_name . '.php';
            if (file_exists($path)) {
                $template_path = $path;
                break;
            }

            $path = $base_path . '/' . $template_name . '.php';
            if (file_exists($path)) {
                $template_path = $path;
                break;
            }
        }
        
        if (!$template_path) {
            return new WP_Error(
                'template_not_found',
                'Template not found: ' . $template_name,
                ['status' => 404]
            );
        }

        try {
            $html = $this->_template_parser->renderPreview($template_path, $attributes);
            return new WP_REST_Response(['html' => $html], 200);
        } catch (\Exception $e) {
            return new WP_Error(
                'preview_error',
                $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Handle preview request via admin-ajax
     */
    public function handle_preview_ajax(): void {
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Permission denied', 403);
            return;
        }

        $template_name = $_POST['template'] ?? '';
        $attributes = json_decode(stripslashes($_POST['attributes'] ?? '{}'), true) ?? [];

        $block_paths = apply_filters('zenb_block_paths', [
            get_template_directory() . '/zen-blocks'
        ]);
        
        $template_path = '';
        foreach ($block_paths as $base_path) {
            $path = $base_path . '/' . $template_name . '/' . $template_name . '.php';
            if (file_exists($path)) {
                $template_path = $path;
                break;
            }

            $path = $base_path . '/' . $template_name . '.php';
            if (file_exists($path)) {
                $template_path = $path;
                break;
            }
        }
        
        if (!$template_path) {
            wp_send_json_error('Template not found: ' . $template_name, 404);
            return;
        }

        try {
            $html = $this->_template_parser->renderPreview($template_path, $attributes);
            wp_send_json_success(['html' => $html]);
        } catch (\Exception $e) {
            wp_send_json_error($e->getMessage(), 500);
        }
    }

    /**
     * Get block settings
     */
    public function get_settings(WP_REST_Request $request): WP_REST_Response|WP_Error {
        $block_name = $request->get_param('block_name');
        
        // Get block paths from filter, same as in get_blocks_data
        $block_paths = apply_filters('zenb_block_paths', [
            get_template_directory() . '/zen-blocks'
        ]);

        // First check if block directory exists
        $block_exists = false;
        foreach ($block_paths as $base_path) {
            $block_dir = $base_path . "/{$block_name}";
            if (is_dir($block_dir)) {
                $block_exists = true;
                break;
            }
        }

        if (!$block_exists) {
            return new WP_Error(
                'zen_blocks_invalid_block',
                __('Block does not exist.', 'zen-blocks'),
                ['status' => 404]
            );
        }

        // Now look for settings file
        $settings_file = null;
        foreach ($block_paths as $base_path) {
            $json_file = $base_path . "/{$block_name}/{$block_name}.json";
            if (file_exists($json_file)) {
                $settings_file = $json_file;
                break;
            }
        }

        // If no settings file exists, return empty settings
        if (!$settings_file) {
            return rest_ensure_response([
                'title' => '',
                'description' => '',
                'attributes' => []
            ]);
        }

        $settings = json_decode(file_get_contents($settings_file), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error(
                'zen_blocks_invalid_json',
                __('Invalid JSON in settings file.', 'zen-blocks'),
                ['status' => 500]
            );
        }

        // Ensure we have default empty values for all fields
        $settings = wp_parse_args($settings, [
            'title' => '',
            'description' => '',
            'attributes' => []
        ]);

        return rest_ensure_response($settings);
    }

    /**
     * Update block settings
     */
    public function update_settings(WP_REST_Request $request): WP_REST_Response|WP_Error {
        $block_name = $request->get_param('block_name');
        
        // Get block paths from filter, same as in get_blocks_data
        $block_paths = apply_filters('zenb_block_paths', [
            get_template_directory() . '/zen-blocks'
        ]);

        // First try to find existing settings file
        $settings_file = null;
        foreach ($block_paths as $base_path) {
            $json_file = $base_path . "/{$block_name}/{$block_name}.json";
            if (file_exists($json_file)) {
                $settings_file = $json_file;
                break;
            }
        }

        // If no settings file exists, create one in the first available block directory
        if (!$settings_file) {
            foreach ($block_paths as $base_path) {
                $block_dir = $base_path . "/{$block_name}";
                if (is_dir($block_dir)) {
                    $settings_file = $block_dir . "/{$block_name}.json";
                    break;
                }
            }
        }

        // If still no valid location found
        if (!$settings_file) {
            return new WP_Error(
                'zen_blocks_no_block_dir',
                __('Block directory not found.', 'zen-blocks'),
                ['status' => 404]
            );
        }

        $settings = $request->get_json_params();
        error_log('Settings: ' . print_r($request, true));
        if (!$settings) {
            return new WP_Error(
                'zen_blocks_invalid_json',
                __('Invalid JSON in request body.', 'zen-blocks'),
                ['status' => 400]
            );
        }

        // Ensure we have all required fields
        $settings = wp_parse_args($settings, [
            'title' => '',
            'description' => '',
            'attributes' => []
        ]);

        $result = file_put_contents($settings_file, json_encode($settings, JSON_PRETTY_PRINT));
        if ($result === false) {
            return new WP_Error(
                'zen_blocks_write_error',
                __('Failed to write settings file.', 'zen-blocks'),
                ['status' => 500]
            );
        }

        return rest_ensure_response($settings);
    }
}
