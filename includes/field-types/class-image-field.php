<?php
/**
 * Image Field Type Handler
 *
 * @package ZENB
 * @subpackage FieldTypes
 */

namespace ZENB\FieldTypes;

use DOMElement;

if (!class_exists('ZENB\\FieldTypes\\Image_Field')) {
    class Image_Field 
    {
        /**
         * Get attribute configuration for image fields
         *
         * @param mixed $default Default value
         * @return array Attribute configuration
         */
        public static function getAttributeConfig($default = []): array
        {
            return [
                'type' => 'object',
                'default' => $default
            ];
        }

        /**
         * Update element value for image fields
         *
         * @param DOMElement $element DOM element to update
         * @param array     $value   Image value data
         * @return void
         */
        public static function updateElementValue(DOMElement $element, $value): void 
        {
            if (!empty($value['url'])) {
                // If we have a new value, use it
                $element->setAttribute('src', \esc_url($value['url']));
                $element->setAttribute('alt', \esc_attr($value['alt'] ?? ''));
            } else if (!$element->hasAttribute('src')) {
                // Only remove the element if it doesn't have a default src
                if ($element->parentNode) {
                    $element->parentNode->removeChild($element);
                }
            }
        }

        /**
         * Handle repeater value for image fields
         *
         * @param DOMElement $element     DOM element to update
         * @param array      $field_value Image field value
         * @return void
         */
        public static function handleRepeaterValue(DOMElement $element, $value): void 
        {
            self::updateElementValue($element, $value);
        }
    }
} 