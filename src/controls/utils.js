/**
 * Get attribute configuration for a control
 * 
 * @param {string} name Control name
 * @param {Object} config Control configuration
 * @returns {Array} [name, attributeConfig]
 */
export const getControlAttributeConfig = (name, config) => {
    if (config.type === 'repeater') {
        return [name, {
            type: 'array',
            default: config.default || []
        }];
    }

    let type = 'string';
    let defaultValue = config.default;

    switch (config.type) {
        case 'boolean':
        case 'toggle':
            type = 'boolean';
            break;
        case 'number':
        case 'range':
            type = 'number';
            break;
        case 'image':
            type = 'object';
            break;
    }

    return [name, {
        type,
        default: defaultValue
    }];
};
