/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Get control types from PHP
 */
const controlTypes = window.zenBlocksControlTypes || {};


/**
 * Transform PHP control types to JavaScript format
 */
export const CONTROL_TYPES = Object.entries(controlTypes).map(([type, config]) => {
    return {
        value: type,
        label: config.label || type,
        description: config.description || '',
        code: (name) => {
            if (typeof config.code !== 'string') {
                console.warn(`Invalid code for control type "${type}":`, config.code);
                return '';
            }
            return config.code.replaceAll('%s', name);
        },
        output: config.output || '',
        data_type: config.data_type || 'string'
    };
});

// Ensure we always have at least one control type
if (!CONTROL_TYPES.length) {
    const defaultType = {
        value: 'text',
        label: __('Text', 'zen-blocks'),
        description: __('Single line text input', 'zen-blocks'),
        code: (name) => `echo esc_html($${name});`,
        output: '"Hello World"',
        data_type: 'string'
    };
    CONTROL_TYPES.push(defaultType);
}

/**
 * Convert options from array format to object format for backward compatibility
 */
export const convertOptionsToObject = (options) => {
    if (!options) return {};
    if (!Array.isArray(options)) return options;
    return options.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
    }, {});
};
