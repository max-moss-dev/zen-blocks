import { createElement } from '@wordpress/element';
import { blockDefault } from '@wordpress/icons';

/**
 * Parse SVG string to object representation
 * 
 * @param {string} svgString SVG string to parse
 * @returns {Object|null} Parsed SVG object or null if invalid
 */
export const parseSVG = (svgString) => {
    const div = document.createElement('div');
    div.innerHTML = svgString;
    const svg = div.querySelector('svg');
    
    if (!svg) return null;

    const props = {};
    Array.from(svg.attributes).forEach(attr => {
        props[attr.name === 'class' ? 'className' : attr.name] = attr.value;
    });

    return {
        tag: 'svg',
        props,
        children: Array.from(svg.childNodes).map(node => {
            if (node.nodeType === 3) return null; // Skip text nodes
            const childProps = {};
            Array.from(node.attributes || []).forEach(attr => {
                childProps[attr.name === 'class' ? 'className' : attr.name] = attr.value;
            });
            return {
                tag: node.tagName,
                props: childProps
            };
        }).filter(Boolean)
    };
};

/**
 * Get block icon from icon name or SVG string
 * 
 * @param {string} iconName Icon name or SVG string
 * @returns {string|Object} Icon component or dashicon class name
 */
export const getBlockIcon = (iconName) => {
    if (!iconName) return blockDefault;

    if (iconName.includes('<svg')) {
        const svgData = parseSVG(iconName);
        if (svgData) {
            return createElement(
                svgData.tag,
                svgData.props,
                svgData.children.map((child, i) => 
                    createElement(child.tag, { ...child.props, key: i })
                )
            );
        }
    } else {
        return iconName;
    }
};
