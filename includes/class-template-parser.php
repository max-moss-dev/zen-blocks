<?php
/**
 * Template Parser for Zen Blocks
 * 
 * @package ZENB
 */

namespace ZENB;

use DOMDocument;
use DOMElement;
use ZENB\FieldTypes\Image_Field;
use ZENB\FieldTypes\Text_Field;
use ZENB\FieldTypes\Repeater_Field;
use ZENB\FieldTypes\Link_Field;
use ZENB\FieldTypes\InnerBlocks_Field;
use ZENB\FieldTypes\WYSIWYG_Field;
use ZENB\Control_Types;

/**
 * Handles parsing of block templates
 */
class Template_Parser
{
    private $_template_html = '';
    private $_block_metadata = array();
    private $_attributes = array();

    /**
     * Constructor
     */
    public function __construct() {
    }

    /**
     * Parse template file
     *
     * @param string $template_path Path to template file
     * @return array Template data
     */
    public function parse($template_path)
    {
        if (!\file_exists($template_path)) {
            throw new \Exception("Template file not found: $template_path");
        }
        
        try {
            $this->_loadTemplate($template_path);

            $dom = new DOMDocument('1.0', 'UTF-8');
            \libxml_use_internal_errors(true);
            $dom->loadHTML('<?xml encoding="UTF-8"?>' . $this->_template_html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            \libxml_clear_errors();
            
            $attributes = array();
            $elements = $dom->getElementsByTagName('*');

            // First find repeaters
            foreach ($elements as $element) {
                if ($element instanceof DOMElement && $element->hasAttribute('zen-repeater')) {
                    $field_name = $element->getAttribute('zen-repeater');
                    $attributes[$field_name] = [
                        'type' => 'array',
                        'default' => []
                    ];
                }
            }

            // Then handle regular editable fields
            foreach ($elements as $element) {
                if ($element instanceof DOMElement && $element->hasAttribute('zen-edit')) {
                    $field_name = $element->getAttribute('zen-edit');
                    $field_type = $element->getAttribute('zen-type') ?: 'text';
                    
                    $default_content = $this->_getElementContent($element, $field_type);
                    
                    $attributes[$field_name] = $this->_getAttributeConfig(
                        $field_type,
                        $default_content,
                        $field_name,
                        $element
                    );
                }
            }

            // Finally add any additional controls
            if (!empty($this->_block_metadata['zenb']['controls'])) {
                foreach ($this->_block_metadata['zenb']['controls'] as $key => $control) {
                    // Skip if already defined by template
                    if (!isset($attributes[$key])) {
                        $attributes[$key] = [
                            'type' => $this->_getControlType($control['type']),
                            'default' => isset($control['default']) ? $control['default'] : ''
                        ];
                    }
                }
            }

            return array(
                'attributes' => $attributes,
                'metadata' => $this->_block_metadata
            );
        } catch (\Exception $e) {
            error_log("Zen Blocks template parse error: " . $e->getMessage());
            return [
                'attributes' => [],
                'metadata' => ['error' => $e->getMessage()]
            ];
        }
    }

    /**
     * Load template file
     *
     * @param string $template_path Path to template file
     */
    private function _loadTemplate($template_path)
    {
        if (\pathinfo($template_path, PATHINFO_EXTENSION) === 'php') {
            // Try to load metadata from JSON first
            $json_path = \dirname($template_path) . '/' . \basename($template_path, '.php') . '.json';
            if (\file_exists($json_path)) {
                $json_content = \file_get_contents($json_path);
                $this->_block_metadata = \json_decode($json_content, true);
            } else {
                // Fallback to PHP metadata
                \ob_start();
                $zen = array(
                    'title' => '',
                    'description' => '',
                    'icon' => ''
                );
                
                // Include the template to get metadata
                include $template_path;
                $this->_block_metadata = isset($zen) ? $zen : array();
                \ob_end_clean();
            }
            
            // Now load template with default values for controls
            \ob_start();
            if (!empty($this->_block_metadata['zenb']['controls'])) {
                foreach ($this->_block_metadata['zenb']['controls'] as $key => $control) {
                    $$key = $control['default'] ?? null;
                }
            }
            $template = $this;
            include $template_path;
            $this->_template_html = \ob_get_clean();
        } else {
            $this->_template_html = \file_get_contents($template_path);
            $this->_block_metadata = array(
                'title' => '',
                'description' => '',
                'icon' => ''
            );
        }
    }

    /**
     * Get element content based on type
     *
     * @param DOMElement $element Element to get content from
     * @param string $type Content type
     * @return mixed
     */
    private function _getElementContent($element, $type)
    {
        switch ($type) {
            case 'image':
                return array(
                    'url' => $element->getAttribute('src') ?? '',
                    'id' => null,
                    'alt' => $element->getAttribute('alt') ?? '',
                    'caption' => $element->getAttribute('caption') ?? '',
                    'size' => $element->getAttribute('size') ?? 'full'
                );
            case 'link':
                $href = $element->getAttribute('href');
                return $href ? $href : \trim($element->textContent);
            default:
                return \trim($element->textContent);
        }
    }

    private function _getAttributeConfig($type, $default = '', $field_name = '', $element = null)
    {
        switch ($type) {
            case 'innerblocks':
                return InnerBlocks_Field::getAttributeConfig($default);
            case 'image':
                return Image_Field::getAttributeConfig($default);
            case 'link':
                return Link_Field::getAttributeConfig($default);
            case 'wysiwyg':
                return WYSIWYG_Field::getAttributeConfig($default);
            default:
                return Text_Field::getAttributeConfig($default, $element->tagName);
        }
    }

    /**
     * Transform attribute keys to be PHP-friendly variable names
     * 
     * @param array $attributes Original attributes array
     * @return array Array with transformed keys and original attributes
     */
    private function _transformAttributes(array $attributes): array 
    {
        $transformed_attributes = array();
        foreach ($attributes as $key => $value) {
            $new_key = str_replace(['-', ' '], '_', $key);
            $transformed_attributes[$new_key] = $value;
        }
        return $transformed_attributes;
    }

    /**
     * Process control values before passing to template
     *
     * @param array $attributes Block attributes
     * @return array Processed attributes
     */
    public function process_control_values($attributes) 
    {
        if (empty($this->_block_metadata['zenb']['controls'])) {
            return $attributes;
        }

        $control_types = Control_Types::get_all();
        foreach ($this->_block_metadata['zenb']['controls'] as $key => $control) {
            // For image fields, ensure we always have a value
            if ($control['type'] === 'image') {
                if (!isset($attributes[$key]) || empty($attributes[$key])) {
                    $attributes[$key] = ['url' => '', 'alt' => '', 'id' => null, 'caption' => '', 'size' => 'full'];
                } else if (isset($control_types[$control['type']]['process_value'])) {
                    $attributes[$key] = $control_types[$control['type']]['process_value']($attributes[$key]);
                }
            }
            // For other fields, process only if they exist
            else if (isset($attributes[$key]) && isset($control_types[$control['type']]['process_value'])) {
                $attributes[$key] = $control_types[$control['type']]['process_value']($attributes[$key]);
            }
        }

        return $attributes;
    }

    /**
     * Check if an attribute has value or we're in admin
     * 
     * TODO: Make it work with Rest API
     * 
     * @param string $name Attribute name
     * @return bool True if attribute has value or in admin
     */
    public function has_value(string $name): bool 
    {
        return !empty($this->_attributes[$name]) || is_admin();
    }

    /**
     * Render template
     *
     * @param string $template_path Path to template file
     * @param array $attributes Template attributes
     * @return string Rendered template
     */
    public function render($template_path, $attributes = array())
    {
        try {
            // Load block metadata before processing values
            $this->_loadTemplate($template_path);
            
            ob_start();
            $processed_attributes = $this->process_control_values($attributes);
            $this->_attributes = $this->_transformAttributes($processed_attributes);
            
            extract($this->_attributes);
            $template = $this;
            include $template_path;
            $html = ob_get_clean();

            $dom = new \DOMDocument();
            libxml_use_internal_errors(true);
            $dom->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            libxml_clear_errors();

            // Get the root element to apply block-level attributes
            $root = $dom->documentElement;
            if ($root instanceof \DOMElement) {
                // Handle alignment
                if (!empty($processed_attributes['align'])) {
                    $classes = $root->getAttribute('class');
                    $alignClass = 'align' . $processed_attributes['align'];
                    $root->setAttribute('class', trim($classes . ' ' . $alignClass));
                }

                // Handle custom classes
                if (!empty($processed_attributes['className'])) {
                    $classes = $root->getAttribute('class');
                    $root->setAttribute('class', trim($classes . ' ' . $processed_attributes['className']));
                }

                // Handle anchor
                if (!empty($processed_attributes['anchor'])) {
                    $root->setAttribute('id', $processed_attributes['anchor']);
                }

                // Handle core block features
                $core_features = $this->_handleCoreFeatures($root, $processed_attributes);
                if (!empty($core_features['classes'])) {
                    $classes = $root->getAttribute('class');
                    $root->setAttribute('class', trim($classes . ' ' . implode(' ', $core_features['classes'])));
                }
                
                // Only set style attribute if there are actual styles
                if (!empty($core_features['styles'])) {
                    $root->setAttribute('style', implode('; ', $core_features['styles']) . ';');
                }
            }

            // First handle repeaters
            $elements = $dom->getElementsByTagName('*');
            foreach ($elements as $element) {
                if ($element instanceof \DOMElement && $element->hasAttribute('zen-repeater')) {
                    $field = $element->getAttribute('zen-repeater');
                    if (!empty($processed_attributes[$field])) {
                        $this->_handleRepeater($element, $processed_attributes[$field]);
                    }
                }
            }

            // Then handle regular fields and cleanup
            foreach ($elements as $element) {
                if ($element instanceof \DOMElement && $element->hasAttribute('zen-edit')) {
                    $field = $element->getAttribute('zen-edit');
                    $type = $element->getAttribute('zen-type') ?: 'text';
                    
                    if ($type === 'innerblocks' && !empty($processed_attributes['innerBlocksContent'])) {
                        $this->_updateElementValue($element, $processed_attributes['innerBlocksContent'], $type);
                    } else if ($type === 'image') {
                        $this->_updateElementValue($element, $processed_attributes[$field] ?? [], $type);
                    } else if ($type === 'link') {
                        $this->_updateElementValue($element, $processed_attributes[$field] ?? '', $type);
                    } else if (!empty($processed_attributes[$field])) {
                        $this->_updateElementValue($element, $processed_attributes[$field], $type);
                    }
                }
            }

            // Clean up attributes
            foreach ($elements as $element) {
                if ($element instanceof \DOMElement) {
                    $element->removeAttribute('zen-edit');
                    $element->removeAttribute('zen-type');
                    $element->removeAttribute('zen-repeater');
                }
            }

            $html = $dom->saveHTML();
            return html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        } catch (\Exception $e) {
            error_log('Template render error: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * Render template preview
     *
     * @param string $template_path Path to template file
     * @param array $attributes Template attributes
     * @return string Rendered template preview
     */
    public function renderPreview($template_path, $attributes)
    {
        try {
            // Load block metadata before processing values
            $this->_loadTemplate($template_path);
            
            ob_start();
            $processed_attributes = $this->process_control_values($attributes);
            $transformed_attributes = $this->_transformAttributes($processed_attributes);
            extract($transformed_attributes);
            $template = $this;
            include $template_path;
            return ob_get_clean();
        } catch (\Exception $e) {
            error_log('Template preview error: ' . $e->getMessage());
            return '';
        }
    }

    private function _updateElementValue(DOMElement $element, $value, string $type): void 
    {
        switch ($type) {
            case 'innerblocks':
                InnerBlocks_Field::updateElementValue($element, $value);
                break;
            case 'image':
                Image_Field::updateElementValue($element, $value);
                break;
            case 'link':
                Link_Field::updateElementValue($element, $value);
                break;
            case 'wysiwyg':
                WYSIWYG_Field::updateElementValue($element, $value);
                break;
            default:
                Text_Field::updateElementValue($element, $value);
        }
    }

    private function _handleRepeater(DOMElement $container, array $items): void 
    {
        Repeater_Field::updateElementValue($container, $items);
    }

    private function _getControlType($control_type) {
        return Control_Types::get_data_type($control_type);
    }

    /**
     * Handle WordPress core block features
     * 
     * @param DOMElement $element Element to apply features to
     * @param array $attributes Block attributes
     * @return array Array containing styles and classes
     */
    private function _handleCoreFeatures($element, $attributes) {
        $styles = [];
        $classes = explode(' ', $element->getAttribute('class') ?: '');
        $existing_style = $element->getAttribute('style');
        if ($existing_style) {
            $styles[] = rtrim($existing_style, ';');
        }

        // Handle core color classes
        if (!empty($attributes['backgroundColor'])) {
            $classes[] = 'has-' . $attributes['backgroundColor'] . '-background-color';
        }
        if (!empty($attributes['textColor'])) {
            $classes[] = 'has-' . $attributes['textColor'] . '-color';
        }

        // Handle core font size
        if (!empty($attributes['fontSize'])) {
            $classes[] = 'has-' . $attributes['fontSize'] . '-font-size';
        }

        // Handle all style attributes
        if (!empty($attributes['style'])) {
            // Handle colors
            if (!empty($attributes['style']['color'])) {
                $color_data = $attributes['style']['color'];
                
                // Text color
                if (!empty($color_data['text'])) {
                    if (preg_match('/^var:preset\|color\|(.+)$/', $color_data['text'], $matches)) {
                        $classes[] = 'has-' . $matches[1] . '-color';
                    } else {
                        $styles[] = 'color: ' . $color_data['text'];
                    }
                }
                
                // Background color
                if (!empty($color_data['background'])) {
                    if (preg_match('/^var:preset\|color\|(.+)$/', $color_data['background'], $matches)) {
                        $classes[] = 'has-' . $matches[1] . '-background-color';
                    } else {
                        $styles[] = 'background-color: ' . $color_data['background'];
                    }
                }
            }

            // Handle element styles (like link colors)
            if (!empty($attributes['style']['elements'])) {
                $elements = $attributes['style']['elements'];
                
                // Handle link colors
                if (!empty($elements['link']['color']['text'])) {
                    $link_color = $elements['link']['color']['text'];
                    if (preg_match('/^var:preset\|color\|(.+)$/', $link_color, $matches)) {
                        // Add CSS custom property for link color
                        $styles[] = '--wp--style--color--link: var(--wp--preset--color--' . $matches[1] . ')';
                    } else {
                        $styles[] = '--wp--style--color--link: ' . $link_color;
                    }
                }
            }

            // Handle typography
            if (!empty($attributes['style']['typography'])) {
                $typography = $attributes['style']['typography'];
                
                if (!empty($typography['fontSize'])) {
                    if (preg_match('/^var:preset\|font-size\|(.+)$/', $typography['fontSize'], $matches)) {
                        $classes[] = 'has-' . $matches[1] . '-font-size';
                    } else {
                        $styles[] = 'font-size: ' . $typography['fontSize'];
                    }
                }
                
                if (!empty($typography['lineHeight'])) {
                    $styles[] = 'line-height: ' . $typography['lineHeight'];
                }
            }

            // Handle spacing
            if (!empty($attributes['style']['spacing'])) {
                $spacing = $attributes['style']['spacing'];
                
                // Handle padding
                if (!empty($spacing['padding'])) {
                    if (is_array($spacing['padding'])) {
                        foreach (['top', 'right', 'bottom', 'left'] as $side) {
                            if (isset($spacing['padding'][$side])) {
                                $val = $spacing['padding'][$side];
                                if (preg_match('/^var:preset\|spacing\|(.+)$/', $val, $matches)) {
                                    $styles[] = sprintf('padding-%s: var(--wp--preset--spacing--%s)', $side, $matches[1]);
                                } else {
                                    $styles[] = sprintf('padding-%s: %s', $side, $val);
                                }
                            }
                        }
                    } else {
                        if (preg_match('/^var:preset\|spacing\|(.+)$/', $spacing['padding'], $matches)) {
                            $styles[] = 'padding: var(--wp--preset--spacing--' . $matches[1] . ')';
                        } else {
                            $styles[] = 'padding: ' . $spacing['padding'];
                        }
                    }
                }
                
                // Handle margin
                if (!empty($spacing['margin'])) {
                    if (is_array($spacing['margin'])) {
                        foreach (['top', 'right', 'bottom', 'left'] as $side) {
                            if (isset($spacing['margin'][$side])) {
                                $val = $spacing['margin'][$side];
                                if (preg_match('/^var:preset\|spacing\|(.+)$/', $val, $matches)) {
                                    $styles[] = sprintf('margin-%s: var(--wp--preset--spacing--%s)', $side, $matches[1]);
                                } else {
                                    $styles[] = sprintf('margin-%s: %s', $side, $val);
                                }
                            }
                        }
                    } else {
                        if (preg_match('/^var:preset\|spacing\|(.+)$/', $spacing['margin'], $matches)) {
                            $styles[] = 'margin: var(--wp--preset--spacing--' . $matches[1] . ')';
                        } else {
                            $styles[] = 'margin: ' . $spacing['margin'];
                        }
                    }
                }
            }
        }

        return [
            'styles' => array_filter($styles),
            'classes' => array_unique(array_filter($classes))
        ];
    }
}
