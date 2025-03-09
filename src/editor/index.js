import { registerBlockType } from '@wordpress/blocks';
import { 
    useBlockProps, 
    InnerBlocks
} from '@wordpress/block-editor';
import { useState, useEffect, useMemo } from '@wordpress/element';
import { useRepeaterSelection } from './field-types/repeater/use-repeater-selection';
import { isInteractiveTarget } from './utils/interactive-elements';
import { fieldTypes } from './field-types/field-types';
import { Parser, ProcessNodeDefinitions } from 'html-to-react';
import { getBlockIcon } from './utils/icon-utils';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import BlockInspector from './components/editor-inspector';
import { getControlAttributeConfig } from '../controls/utils';
import { registerFormats } from './formats';

import './editor.scss';

// Get blocks data from window variable first
const blocks = window.zenTemplateBlocks || [];
const debugEnabled = window.zenBlocksData.debugEnabled;
registerFormats();

// Register blocks immediately
blocks.forEach(block => {
    const metadata = block.metadata;
    const controls = metadata?.zenb?.controls;
    const supports = metadata?.supports;

    metadata.title = metadata.title || (block.name.charAt(0).toUpperCase() + block.name.slice(1));
    metadata.category = metadata.category || 'zen-blocks';
    metadata.version = metadata.version || '1';
    metadata.supports = metadata.supports || {};
    metadata.supports.customClassName = supports?.customClassName ?? true;
    metadata.supports.anchor = supports?.anchor ?? true;

    metadata.attributes = {
        align: {
            type: 'string',
            default: supports?.defaultAlign || undefined
        },
        ...block.attributes,
        ...(controls && Object.fromEntries(
            Object.entries(controls).map(([name, config]) => 
                getControlAttributeConfig(name, config)
            )
        ))
    };

    registerBlockType(`zen-blocks/${block.name}`, {
        ...metadata,
        edit: (props) => {
            const { attributes, setAttributes, isSelected } = props;
            const controls = metadata?.zenb?.controls;
            const repeaterSelection = useRepeaterSelection(isSelected);

            const blockProps = useBlockProps({
                onClick: (e) => {
                    if (isInteractiveTarget(e.target)) {
                        return;
                    }

                    // Just reset selected item on click
                    repeaterSelection.selectItem(null, -1);
                }
            });
            const [structure, setStructure] = useState(null);
            const [isLoading, setIsLoading] = useState(true);
            const [error, setError] = useState(null);

            // Only fetch when sidebar controls change
            const controlValues = useMemo(() => {
                // Return empty object if no controls to prevent unnecessary loading
                if (!controls) return {};
                
                const controlsOnly = {};
                Object.entries(controls).forEach(([key, config]) => {
                    if (config.type !== 'repeater') {
                        controlsOnly[key] = attributes[key];
                    }
                });
                return controlsOnly;
            }, [controls, ...Object.entries(controls || {})
                .filter(([_, config]) => config.type !== 'repeater')
                .map(([key]) => attributes[key])
            ]);

            // Fetch and parse HTML structure only when layout changes
            useEffect(() => {
                let isMounted = true;
                
                // Only show loading on initial load or template/control changes
                const shouldShowLoading = !structure;
                if (shouldShowLoading) {
                    setIsLoading(true);
                }
                
                const fetchPreview = async () => {
                    const startTime = performance.now();
                    
                    try {
                        let response;
                        let data;

                        // Try admin-ajax first
                        try {
                            response = await fetch(ajaxurl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: new URLSearchParams({
                                    action: 'zen_blocks_preview',
                                    template: block.name,
                                    attributes: JSON.stringify(attributes)
                                })
                            });
                            data = await response.json();
                        } catch (err) {
                            // Fallback to REST API if admin-ajax fails
                            const { html } = await apiFetch({
                                path: 'zen-blocks/v1/preview',
                                method: 'POST',
                                data: {
                                    template: block.name,
                                    attributes
                                }
                            });
                            data = { success: true, data: { html } };
                            response = { ok: true };
                        }

                        if (!response.ok) {
                            throw new Error(data.data || 'Failed to load preview');
                        }

                        if (!isMounted) return;

                        if (data.data?.html) {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(data.data.html.trim(), 'text/html');
                            const content = doc.body.firstElementChild;
                            if (content) {
                                setStructure(content);
                            }
                        } else {
                            throw new Error('Preview returned empty response');
                        }
                        
                        const endTime = performance.now();
                        if (debugEnabled) {
                            console.log(`Preview fetch took ${Math.round(endTime - startTime)}ms`);
                        }
                        
                    } catch (err) {
                        const endTime = performance.now();
                        console.error('Preview error:', err, `(took ${Math.round(endTime - startTime)}ms)`);
                        if (isMounted) {
                            setError(err.message || 'Failed to load preview');
                        }
                    } finally {
                        if (isMounted && shouldShowLoading) {
                            setIsLoading(false);
                        }
                    }
                };

                fetchPreview();
                
                return () => {
                    isMounted = false;
                };
            }, [block.name, JSON.stringify(controlValues)]);

            // Modify RichText focus handler
            const handleRichTextFocus = (name, index) => {
                repeaterSelection.selectItem(name, index);
            };

            const processContent = (structure, attributes, setAttributes, handleRichTextFocus) => {
                const parser = new Parser();
                const processNodeDefinitions = new ProcessNodeDefinitions();

                const processingInstructions = [
                    {
                        // Handle zen-edit fields
                        shouldProcessNode: (node) => node.attribs && node.attribs['zen-edit'],
                        processNode: (node, children) => {
                            const name = node.attribs['zen-edit'];
                            const type = node.attribs['zen-type'] || 'text';
                            const Component = fieldTypes[type]?.component;

                            if (!Component) {
                                return (
                                    <div className="zen-field-type-error">
                                        Unsupported field type: "{type}"
                                    </div>
                                );
                            }

                            const props = {
                                name,
                                attributes,
                                setAttributes,
                                tagName: node.name,
                                identifier: `${name}-${type}`,
                                onFocus: () => handleRichTextFocus(name, -1),
                                className: node.attribs.class
                            };

                            return type === 'link' ? 
                                <Component {...props}>{children}</Component> : 
                                <Component {...props} />;
                        }
                    },
                    {
                        // Handle repeaters
                        shouldProcessNode: (node) => node.attribs && node.attribs['zen-repeater'],
                        processNode: (node) => {
                            const name = node.attribs['zen-repeater'];
                            const RepeaterComponent = fieldTypes.repeater.component;
                            
                            // Get the template node and wrapper class
                            const templateNode = node.children?.find(child => child.type === 'tag');
                            const wrapperClass = node.attribs?.class || '';
                            
                            // Process template HTML
                            const processTemplateNode = (node) => {
                                if (node.type === 'tag') {
                                    const element = `<${node.name}${
                                        Object.entries(node.attribs || {})
                                            .map(([key, value]) => ` ${key}="${value}"`)
                                            .join('')
                                    }>${
                                        node.children 
                                            ? node.children.map(child => processTemplateNode(child)).join('')
                                            : ''
                                    }</${node.name}>`;
                                    return element;
                                }
                                return node.data || '';
                            };

                            const templateHTML = templateNode ? processTemplateNode(templateNode) : '';
                            
                            return (
                                <RepeaterComponent
                                    name={name}
                                    attributes={attributes}
                                    setAttributes={setAttributes}
                                    template={templateHTML}
                                    wrapperClass={wrapperClass}
                                    isBlockSelected={isSelected}
                                    onItemSelect={repeaterSelection}
                                    selectedItem={repeaterSelection.selectedItem}
                                    setSelectedItem={repeaterSelection.selectItem}
                                    handleItemClick={(name, index) => repeaterSelection.selectItem(name, index)}
                                />
                            );
                        }
                    },
                    {
                        // Default processing for all other nodes
                        shouldProcessNode: () => true,
                        processNode: processNodeDefinitions.processDefaultNode
                    }
                ];

                return parser.parseWithInstructions(
                    structure.outerHTML,
                    () => true,
                    processingInstructions
                );
            };

            // Replace the existing processContent call with:
            const content = structure ? processContent(
                structure, 
                attributes, 
                setAttributes,
                handleRichTextFocus
            ) : null;

            return (
                <>
                    <BlockInspector
                        attributes={attributes}
                        setAttributes={setAttributes}
                        block={block}
                    />
                    
                    <div {...blockProps}>
                        {isLoading ? (
                            <div className="zen-block-loading">Loading...</div>
                        ) : error ? (
                            <div className="zen-block-error">Error: {error}</div>
                        ) : (
                            content
                        )}
                    </div>
                </>
            );
        },
        save: () => {
            return <InnerBlocks.Content />;
        }
    });
});

if (debugEnabled) {
    console.log('ZENB: Template blocks registered successfully', blocks);
}
