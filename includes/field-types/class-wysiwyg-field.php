<?php
/**
 * WYSIWYG Field Type Handler
 *
 * @package ZENB
 * @subpackage FieldTypes
 */

namespace ZENB\FieldTypes;

use DOMElement;

/**
 * Handles WYSIWYG field type operations
 */
class WYSIWYG_Field
{
    /**
     * Get attribute configuration for WYSIWYG fields
     *
     * @param mixed $default Default value
     * @return array Attribute configuration
     */
    public static function getAttributeConfig($default = ''): array
    {
        return [
            'type' => 'string',
            'default' => $default,
            'type_info' => 'wysiwyg'
        ];
    }

    /**
     * Update element value for WYSIWYG fields
     *
     * @param DOMElement $element DOM element to update
     * @param mixed     $value   WYSIWYG content
     * @return void
     */
    public static function updateElementValue(DOMElement $element, $value): void
    {
        // Clear existing content
        while ($element->firstChild) {
            $element->removeChild($element->firstChild);
        }

        if ($value) {
            // Create a fragment to parse HTML content
            $fragment = $element->ownerDocument->createDocumentFragment();
            
            // Ensure proper encoding of special characters
            $encoded_value = html_entity_decode($value, ENT_QUOTES, 'UTF-8');
            
            // Attempt to append the HTML content
            if (@$fragment->appendXML($encoded_value)) {
                $element->appendChild($fragment);
            } else {
                // Fallback: set as text if HTML parsing fails
                $element->textContent = $value;
            }
        }
    }

    /**
     * Handle repeater value for WYSIWYG fields
     *
     * @param DOMElement $element     DOM element to update
     * @param mixed      $field_value WYSIWYG field value
     * @return void
     */
    public static function handleRepeaterValue(DOMElement $element, $field_value): void
    {
        self::updateElementValue($element, $field_value);
    }
} 