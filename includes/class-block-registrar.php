<?php
/**
 * Block Registrar for Zen Blocks
 *
 * @category WordPress
 * @package  ZENB
 */

namespace ZENB;

use function add_action;
use function register_block_type;
use function plugins_url;
use function wp_register_script;
use function wp_register_style;
use function get_template_directory;
use function get_template_directory_uri;
use function apply_filters;

// Define WP_PLUGIN_DIR if not defined (for testing)
if (!defined('WP_PLUGIN_DIR')) {
    define('WP_PLUGIN_DIR', dirname(dirname(dirname(__DIR__))));
}

/**
 * Handles registration and setup of Gutenberg blocks
 *
 * @category WordPress
 * @package  ZENB
 */
class Block_Registrar
{
    /**
     * Template parser instance
     *
     * @var Template_Parser
     */
    private $_templateParser;

    /**
     * Constructor
     *
     * @param Template_Parser $template_parser Template parser instance
     */
    public function __construct(Template_Parser $template_parser)
    {
        $this->_templateParser = $template_parser;
    }

    /**
     * Initialize block registrar
     *
     * @return void
     */
    public function init()
    {
        add_action('init', [$this, 'registerBlocks']);
        add_action('init', [$this, 'registerBlockCategories']);
    }

    /**
     * Register block categories
     *
     * @return void
     */
    public function registerBlockCategories()
    {
        if (function_exists('register_block_category')) {
            register_block_category('zen-blocks', [
                'title' => __('Zen Blocks', 'zen-blocks'),
                'icon'  => 'wordpress',
            ]);
        } else {
            add_filter('block_categories_all', function($categories) {
                return array_merge(
                    $categories,
                    [
                        [
                            'slug'  => 'zen-blocks',
                            'title' => __('Zen Blocks', 'zen-blocks'),
                            'icon'  => 'wordpress',
                        ],
                    ]
                );
            });
        }
    }

    /**
     * Register blocks
     *
     * @return void
     */
    public function registerBlocks()
    {
        $templates = $this->getTemplates();
        
        foreach ($templates as $template) {
            // $template_data = $this->_templateParser->parse($template);
            $template_name = basename(dirname($template));
            if ($template_name === 'templates' || $template_name === 'blocks') {
                $template_name = basename($template, '.php');
            }
            
            // Get the base directory and URL for assets based on template location
            $template_dir = dirname($template);
            $is_theme_template = strpos($template_dir, get_template_directory()) === 0;
            
            if ($is_theme_template) {
                $base_url = get_template_directory_uri() . substr($template_dir, strlen(get_template_directory()));
            } else {
                // For plugin templates, we need to get the correct plugin URL
                $plugin_dir = WP_PLUGIN_DIR;
                $relative_path = substr($template_dir, strlen($plugin_dir));
                $base_url = plugins_url($relative_path);
            }
            
            // Check for block.json file
            $json_path = dirname($template) . '/' . basename(dirname($template)) . '.json';
            $block_metadata = [];
            if (file_exists($json_path)) {
                $block_metadata = json_decode(file_get_contents($json_path), true);
            }
            
            // Check for assets
            $style_path = $template_dir . '/' . $template_name . '.css';
            $script_path = $template_dir . '/' . $template_name . '.js';
            
            // Register block styles
            if (file_exists($style_path)) {
                $style_url = $base_url . '/' . $template_name . '.css';
                wp_register_style(
                    'zen-blocks-' . $template_name,
                    $style_url,
                    [],
                    filemtime($style_path)
                );
            }

            // Register block scripts
            if (file_exists($script_path)) {
                $script_url = $base_url . '/' . $template_name . '.js';
                $deps = [];

                
                // Add jQuery dependency if enabled in block settings
                if (!empty($block_metadata['zenb']['jquery']) && $block_metadata['zenb']['jquery'] === true) {
                    $deps[] = 'jquery';
                }

                wp_register_script(
                    'zen-blocks-' . $template_name,
                    $script_url,
                    $deps,
                    filemtime($script_path),
                    true
                );
            }

            // Build attributes from template data and controls
            // $attributes = $template_data['attributes'];
            // $attributes = $this->_registerAttributes($attributes, $template_data['metadata']);
            
            $block_args = [
                'apiVersion' => 2,
                // 'attributes' => $attributes,
                'render_callback' => [$this, 'renderTemplateBlock'],
                'editor_script' => 'zen-editor',
                'editor_style' => 'zen-editor',
                'style' => file_exists($style_path) ? 'zen-blocks-' . $template_name : null,
                'script' => file_exists($script_path) ? 'zen-blocks-' . $template_name : null,
            ];

            // Add block metadata if available
            if (!empty($block_metadata)) {
                $block_args = array_merge($block_args, [
                    'title' => $block_metadata['title'] ?? '',
                    'description' => $block_metadata['description'] ?? '',
                    'icon' => $block_metadata['icon'] ?? '',
                    'category' => $block_metadata['category'] ?? 'zen-blocks',
                    'keywords' => $block_metadata['keywords'] ?? [],
                    'supports' => $block_metadata['supports'] ?? [],
                    'example' => $block_metadata['example'] ?? null,
                ]);
            }

            register_block_type('zen-blocks/' . $template_name, $block_args);
        }
    }

    /**
     * Register block attributes
     *
     * @param array $attributes Existing attributes
     * @param array $metadata Block metadata
     * @return array Modified attributes
     */
    private function _registerAttributes($attributes, $metadata)
    {
        if (!empty($metadata['zenb']['controls'])) {
            foreach ($metadata['zenb']['controls'] as $name => $control) {
                if ($control['type'] === 'image') {
                    $attributes[$name] = array(
                        'type' => 'object',
                        'default' => array(
                            'id' => 0,
                            'url' => '',
                            'alt' => '',
                            'caption' => '',
                            'size' => 'full'
                        )
                    );
                }
            }
        }
        return $attributes;
    }

    /**
     * Get templates
     *
     * @return array
     */
    public function getTemplates()
    {
        $template_dir = get_template_directory() . '/zen-blocks';
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
                    
                    if (file_exists($block_file)) {
                        $templates[] = $block_file;
                    }
                }
            }
        }

        return apply_filters('zenb_templates', $templates);
    }

    /**
     * Get template path
     *
     * @param string $template_name Template name
     *
     * @return string
     */
    private function _getTemplatePath($template_name)
    {
        // Get additional block paths from filter
        $block_paths = apply_filters('zenb_block_paths', [get_template_directory() . '/zen-blocks']);

        foreach ($block_paths as $base_path) {
            // Try the new format first (name/name.php)
            $path = $base_path . '/' . $template_name . '/' . $template_name . '.php';
            if (file_exists($path)) {
                return $path;
            }

            // Fallback to old format (name.php)
            $path = $base_path . '/' . $template_name . '.php';
            if (file_exists($path)) {
                return $path;
            }
        }

        return '';
    }

    /**
     * Render template block
     *
     * @param array  $attributes Block attributes
     * @param string $content    Block content
     * @param object $block      Block data
     *
     * @return string
     */
    public function renderTemplateBlock($attributes, $content, $block)
    {
        $template_name = str_replace('zen-blocks/', '', $block->name);
        $template_path = $this->_getTemplatePath($template_name);
        
        if (!$template_path) {
            return '';
        }

        $attributes['innerBlocksContent'] = $content;
        // Get metadata from JSON if exists
        $json_path = dirname($template_path) . '/' . basename(dirname($template_path)) . '.json';
        $metadata = [];
        if (file_exists($json_path)) {
            $metadata = json_decode(file_get_contents($json_path), true);
        }

        // Initialize attributes with defaults from metadata
        $formatted_attributes = [];
        if (!empty($metadata['zenb']['controls'])) {
            foreach ($metadata['zenb']['controls'] as $key => $control) {
                $formatted_attributes[$key] = $attributes[$key] ?? $control['default'] ?? null;
            }
        }

        // Add remaining attributes
        foreach ($attributes as $key => $value) {
            if (is_array($value) || is_object($value)) {
                $formatted_attributes[$key] = $value;
            } else {
                $formatted_attributes[$key] = wp_kses_post($value);
            }
        }

        // Handle default alignment if not set
        if (!isset($formatted_attributes['align']) && !empty($metadata['supports']['defaultAlign'])) {
            $formatted_attributes['align'] = $metadata['supports']['defaultAlign'];
        }

        try {
            return $this->_templateParser->render($template_path, $formatted_attributes);
        } catch (\Exception $e) {
            error_log('Error rendering block: ' . $e->getMessage());
            return '';
        }
    }
} 