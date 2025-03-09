<?php
/**
 * Link Field Type Handler
 *
 * @package ZENB
 * @subpackage FieldTypes
 */

namespace ZENB\FieldTypes;

use DOMElement;

/**
 * Handles Link field type operations
 */
class Link_Field
{
    /**
     * Get attribute configuration for URL fields
     *
     * @param mixed $default Default value
     * @return array Attribute configuration
     */
    public static function getAttributeConfig($default = ''): array
    {
        if (is_string($default)) {
            $default = array(
                'url' => $default,
                'opensInNewTab' => false
            );
        }

        return [
            'type' => 'object',
            'default' => $default ?: [
                'url' => '',
                'opensInNewTab' => false
            ],
            'type_info' => 'url'
        ];
    }

    /**
     * Update element value for URL fields
     *
     * @param DOMElement $element DOM element to update
     * @param mixed     $value   URL value data
     * @return void
     */
    public static function updateElementValue(DOMElement $element, $value): void
    {
        if (is_string($value)) {
            if (!empty($value)) {
                $element->setAttribute('href', \esc_url($value));
            } else {
                // Convert the anchor to a span element when empty
                self::convertAToSpan($element);
            }
        } elseif (is_array($value) && isset($value['url'])) {
            if (!empty($value['url'])) {
                $element->setAttribute('href', \esc_url($value['url']));
                if (!empty($value['opensInNewTab'])) {
                    $element->setAttribute('target', '_blank');
                    $element->setAttribute('rel', 'noopener noreferrer');
                } else {
                    $element->removeAttribute('target');
                    $element->removeAttribute('rel');
                }
            } else {
                // Convert the anchor to a span element when empty
                self::convertAToSpan($element);
            }
        }
    }

    /**
     * Convert an <a> element to a <span> element.
     *
     * Copies all child nodes and attributes (except href, target, and rel)
     * and replaces the anchor with the new span element.
     *
     * @param DOMElement $element The original <a> element.
     */
    public static function convertAToSpan(DOMElement $element): void
    {
        $document = $element->ownerDocument;
        $span = $document->createElement('span');
        
        // Transfer all child nodes
        while ($element->firstChild) {
            $span->appendChild($element->firstChild);
        }
        
        // Copy attributes except 'href', 'target', and 'rel'
        if ($element->hasAttributes()) {
            foreach ($element->attributes as $attr) {
                if (!in_array($attr->name, ['href', 'target', 'rel'])) {
                    $span->setAttribute($attr->name, $attr->value);
                }
            }
        }
        
        if ($element->parentNode) {
            $element->parentNode->replaceChild($span, $element);
        }
    }

    /**
     * Handle repeater value for URL fields
     *
     * @param DOMElement $element     DOM element to update
     * @param array      $field_value URL field value
     * @return void
     */
    public static function handleRepeaterValue(DOMElement $element, $field_value): void
    {
        // Ensure field_value is an array with expected structure
        if (!is_array($field_value)) {
            $field_value = [
                'text' => $field_value ?: '',
                'url' => '',
                'target' => '',
                'rel' => ''
            ];
        }

        self::updateElementValue($element, $field_value);
    }
} 