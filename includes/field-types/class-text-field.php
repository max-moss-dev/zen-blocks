<?php
/**
 * Text Field Type Handler
 *
 * @package ZENB
 * @subpackage FieldTypes
 */

namespace ZENB\FieldTypes;

use DOMElement;

/**
 * Handles text field type operations
 */
class Text_Field
{
    /**
     * Get attribute configuration for text fields
     *
     * @param mixed $default Default value
     * @param string $tag_name Element tag name
     * @return array Attribute configuration
     */
    public static function getAttributeConfig($default = '', $tag_name = 'div'): array
    {
        return [
            'type' => 'string',
            'default' => $default,
            'type_info' => 'text',
            'tag' => $tag_name
        ];
    }

    /**
     * Update element value for text fields
     *
     * @param DOMElement $element DOM element to update
     * @param mixed     $value   Text value
     * @return void
     */
    public static function updateElementValue(DOMElement $element, $value): void
    {
        self::handle_plain_text($element, $value);
    }

    /**
     * Handle plain text content
     *
     * @param DOMElement $element DOM element to update
     * @param string    $value   Plain text content
     * @return void
     */
    private static function handle_plain_text(DOMElement $element, string $value): void
    {
        // Clear existing content
        while ($element->firstChild) {
            $element->removeChild($element->firstChild);
        }

        // Handle potential HTML content
        if (strpos($value, '<') !== false) {
            try {
                $tempDoc = new \DOMDocument();
                $tempDoc->loadHTML(
                    '<?xml encoding="utf-8" ?><div>' . wp_kses_post($value) . '</div>', 
                    LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
                );

                $contentNode = $tempDoc->getElementsByTagName('div')->item(0);
                if ($contentNode && $contentNode->hasChildNodes()) {
                    foreach ($contentNode->childNodes as $childNode) {
                        $importedNode = $element->ownerDocument->importNode($childNode, true);
                        $element->appendChild($importedNode);
                    }
                }
            } catch (\Exception $e) {
                // Fallback to text node if HTML processing fails
                $text = $element->ownerDocument->createTextNode(wp_kses_post($value));
                $element->appendChild($text);
            }
        } else {
            // Plain text without HTML
            $text = $element->ownerDocument->createTextNode($value);
            $element->appendChild($text);
        }
    }

    /**
     * Handle repeater value for text fields
     *
     * @param DOMElement $element     DOM element to update
     * @param string     $field_value Text field value
     * @return void
     */
    public static function handleRepeaterValue(DOMElement $element, string $value): void
    {
        self::updateElementValue($element, $value);
    }
} 