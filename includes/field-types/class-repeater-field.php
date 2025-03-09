<?php
/**
 * Repeater Field Type Handler
 *
 * @category WordPress
 * @package  ZENB
 */

namespace ZENB\FieldTypes;

use DOMElement;

/**
 * Handles repeater field type operations
 *
 * @category WordPress
 * @package  ZENB
 */
class Repeater_Field
{
    /**
     * Get attribute configuration for repeater fields
     *
     * @param  array $default Default value
     * @return array Attribute configuration
     */
    public static function getAttributeConfig($default = []): array
    {
        return [
            'type' => 'array',
            'default' => $default
        ];
    }

    /**
     * Update element value for repeater fields
     *
     * @param  DOMElement $element DOM element to update
     * @param  array      $items   Repeater items
     * @return void
     */
    public static function updateElementValue(DOMElement $element, array $items): void
    {
        self::_handleRepeaterItems($element, $items);
    }

    /**
     * Handle repeater items
     *
     * @param  DOMElement $element DOM element to update
     * @param  array      $items   Repeater items
     * @return void
     */
    private static function _handleRepeaterItems(DOMElement $element, array $items): void
    {
        $template = $element->firstElementChild;
        if (!$template) {
            return;
        }

        // Remove zen-repeater attribute but keep the container
        $element->removeAttribute('zen-repeater');

        // Clear existing children
        while ($element->firstChild) {
            $element->removeChild($element->firstChild);
        }

        foreach ($items as $item) {
            $clone = $template->cloneNode(true);
            self::_processRepeaterItem($clone, $item);
            $element->appendChild($clone);
        }
    }

    /**
     * Process individual repeater item
     *
     * @param  DOMElement $element DOM element to process
     * @param  array      $item    Item data
     * @return void
     */
    private static function _processRepeaterItem(DOMElement $element, array $item): void
    {
        // First handle the element itself if it has zen-edit
        if ($element->hasAttribute('zen-edit')) {
            $field = $element->getAttribute('zen-edit');
            $type = $element->getAttribute('zen-type') ?: 'text';
            
            if (isset($item[$field])) {
                switch ($type) {
                    case 'text':
                        Text_Field::handleRepeaterValue($element, $item[$field]);
                        break;
                    case 'image':
                        Image_Field::handleRepeaterValue($element, $item[$field]);
                        break;
                    case 'link':
                        Link_Field::handleRepeaterValue($element, $item[$field]);
                        break;
                    case 'wysiwyg':
                        WYSIWYG_Field::handleRepeaterValue($element, $item[$field]);
                        break;
                }
            }
        }

        // Then process direct children (instead of using getElementsByTagName)
        foreach ($element->childNodes as $child) {
            if ($child instanceof DOMElement) {
                if ($child->hasAttribute('zen-edit')) {
                    $field = $child->getAttribute('zen-edit');
                    $type = $child->getAttribute('zen-type') ?: 'text';
                    
                    if (isset($item[$field])) {
                        switch ($type) {
                            case 'text':
                                Text_Field::handleRepeaterValue($child, $item[$field]);
                                break;
                            case 'image':
                                Image_Field::handleRepeaterValue($child, $item[$field]);
                                break;
                            case 'link':
                                Link_Field::handleRepeaterValue($child, $item[$field]);
                                break;
                        }
                    }
                }
                
                // Recursively process child's children
                self::_processRepeaterItem($child, $item);
            }
        }

        // Clean up attributes after processing
        if ($element->hasAttribute('zen-edit')) {
            $element->removeAttribute('zen-edit');
            $element->removeAttribute('zen-type');
        }
    }
} 