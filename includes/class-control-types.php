<?php
/**
 * Control Types Configuration
 *
 * @package ZENB
 */

namespace ZENB;

/**
 * Defines available control types and their configurations
 */
class Control_Types {
    /**
     * Get all control types configuration
     *
     * @return array Control types configuration
     */
    public static function get_all(): array {
        return [
            'text' => [
                'label' => __('Text', 'zen-blocks'),
                'description' => __('Single line text input', 'zen-blocks'),
                'data_type' => 'string',
                'code' => 'echo esc_html($%s);',
                'output' => '"Hello World"'
            ],
            'select' => [
                'label' => __('Select', 'zen-blocks'),
                'description' => __('Dropdown select input', 'zen-blocks'),
                'data_type' => 'string',
                'code' => 'echo esc_html($%s);',
                'output' => '"Option 1"'
            ],
            'number' => [
                'label' => __('Number', 'zen-blocks'),
                'description' => __('Numeric input', 'zen-blocks'),
                'data_type' => 'number',
                'code' => 'echo esc_html($%s);',
                'output' => '42'
            ],
            'toggle' => [
                'label' => __('Toggle', 'zen-blocks'),
                'description' => __('Boolean toggle input', 'zen-blocks'),
                'data_type' => 'boolean',
                'code' => 'echo $%s ? "true" : "false";',
                'output' => 'true'
            ],
            'image' => [
                'label' => __('Image', 'zen-blocks'),
                'description' => __('Image upload input', 'zen-blocks'),
                'data_type' => 'string',
                'code' => 'if (!empty($%s["id"])) { echo wp_get_attachment_image($%s["id"], "full"); }',
                'output' => '{"id": 123, "url": "https://example.com/image.jpg"}',
                'process_value' => function($value) {
                    return is_string($value) ? json_decode($value, true) : $value;
                }
            ],
            'range' => [
                'label' => __('Range', 'zen-blocks'),
                'description' => __('Range slider input', 'zen-blocks'),
                'data_type' => 'number',
                'code' => 'echo esc_html($%s);',
                'output' => '50'
            ]
        ];
    }

    /**
     * Get data type for a control type
     *
     * @param string $control_type Control type
     * @return string Data type
     */
    public static function get_data_type($control_type) {
        $types = self::get_all();
        return isset($types[$control_type]) ? $types[$control_type]['data_type'] : 'string';
    }
}
