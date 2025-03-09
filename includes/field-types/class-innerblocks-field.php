<?php
/**
 * InnerBlocks Field Type Handler
 *
 * @package ZENB
 * @subpackage FieldTypes
 */

namespace ZENB\FieldTypes;

use DOMElement;

/**
 * Handles innerblocks field type operations
 */
class InnerBlocks_Field
{
    /**
     * Get attribute configuration for innerblocks fields
     *
     * @param mixed $default Default value
     * @return array Attribute configuration
     */
    public static function getAttributeConfig($default = ''): array
    {
        return [
            'type' => 'string',
            'source' => 'html',
            'default' => $default
        ];
    }

    /**
     * Update element value for innerblocks fields
     *
     * @param DOMElement $element DOM element to update
     * @param mixed     $value   InnerBlocks content
     * @return void
     */
    public static function updateElementValue(DOMElement $element, $value): void
    {
        if (!empty($value)) {
            // Create a document fragment to handle HTML content
            $fragment = $element->ownerDocument->createDocumentFragment();
            @$fragment->appendXML($value);

            // Clear existing content
            while ($element->hasChildNodes()) {
                $element->removeChild($element->firstChild);
            }

            // Append the new content
            $element->appendChild($fragment);
        }
    }
} 