import { BlockControls } from '@wordpress/block-editor';
import { 
    ToolbarGroup, 
    ToolbarButton,
} from '@wordpress/components';
import { Fragment, useEffect, useRef } from '@wordpress/element';
import { trash, chevronLeft, chevronRight, copy } from '@wordpress/icons';
import { memo, useMemo } from '@wordpress/element';
import { Parser, ProcessNodeDefinitions } from 'html-to-react';
import { useRepeaterItem } from './use-repeater-item';
import { fieldTypes } from '../field-types';
import { isInteractiveTarget } from '../../utils/interactive-elements';

export const RepeaterItem = memo(({ 
    template, 
    item, 
    index, 
    repeaterName,
    items,
    setAttributes,
    isSelected,
    onSelect
}) => {
    const firstTextFieldRef = useRef();

    useEffect(() => {
        if (isSelected && firstTextFieldRef.current) {
            firstTextFieldRef.current.focus();
        }
    }, [isSelected]);

    const {
        handleMoveUp,
        handleMoveDown,
        handleClone,
        handleRemove,
        canMoveUp,
        canMoveDown
    } = useRepeaterItem({ item, index, items, repeaterName, setAttributes, onSelect });

    const handleClick = (e) => {
        if (isInteractiveTarget(e.target)) {
            return;
        }

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        onSelect(repeaterName, item.id);
    };

    const processedContent = useMemo(() => {
        if (!template) {
            console.warn('No template provided to RepeaterItem');
            return null;
        }

        const parser = new Parser();
        const processNodeDefinitions = new ProcessNodeDefinitions();
        let isFirstTextField = true;

        const processingInstructions = [
            {
                // Handle editable fields
                shouldProcessNode: (node) => node.attribs && node.attribs['zen-edit'],
                processNode: (node, children) => {
                    const fieldName = node.attribs['zen-edit'];
                    const type = node.attribs['zen-type'] || 'text';
                    const Component = fieldTypes[type]?.component;

                    if (!Component) {
                        return (
                            <div className="zen-field-type-error">
                                Unsupported type: "{type}"
                            </div>
                        );
                    }

                    // Get field value with proper defaults
                    let fieldValue = item[fieldName];
                    const defaultValue = (() => {
                        switch (type) {
                            case 'image':
                                return { id: null, url: '', alt: '' };
                            case 'link':
                                return {
                                    text: '',
                                    url: '',
                                    target: '',
                                    rel: ''
                                };
                            default:
                                return '';
                        }
                    })();

                    const componentProps = {
                        key: `${repeaterName}-${index}-${fieldName}`,
                        name: fieldName,
                        attributes: { [fieldName]: fieldValue || defaultValue },
                        setAttributes: (updates) => {
                            const newItems = [...items];
                            newItems[index] = { ...item, ...updates };
                            setAttributes({ [repeaterName]: newItems });
                        },
                        tagName: node.name,
                        identifier: `${repeaterName}-${index}-${fieldName}`,
                        onFocus: () => onSelect(repeaterName, item.id),
                        className: [
                            'zen-repeater-item',
                            node.attribs?.class || '',
                            isSelected ? 'is-selected' : ''
                        ].filter(Boolean).join(' '),
                        isParentSelected: isSelected,
                        ref: type === 'text' && isFirstTextField ? firstTextFieldRef : undefined
                    };

                    if (type === 'text') {
                        isFirstTextField = false;
                    }

                    return type === 'link' ? 
                        <Component {...componentProps}>{children}</Component> : 
                        <Component {...componentProps} />;
                }
            },
            {
                // Handle root element
                shouldProcessNode: (node) => {
                    return node.type === 'tag' && !node.attribs?.['zen-edit'];
                },
                processNode: (node, children) => {
                    const props = {
                        ...node.attribs,
                        className: [
                            'zen-repeater-item',
                            node.attribs?.class || '',
                            isSelected ? 'is-selected' : ''
                        ].filter(Boolean).join(' '),
                        onClick: handleClick,
                        onFocus: () => onSelect(repeaterName, item.id),
                        tabIndex: 0,
                        role: "button",
                        "aria-selected": isSelected
                    };

                    delete props.class;
                    delete props.style;

                    return React.createElement(
                        node.name,
                        props,
                        children
                    );
                }
            }
        ];

        try {
            const parsedContent = parser.parseWithInstructions(
                template,
                () => true,
                processingInstructions
            );

            return parsedContent;
        } catch (error) {
            console.error('Error processing repeater item:', error);
            return null;
        }
    }, [template, item, index, repeaterName, items, isSelected]);

    if (!processedContent) {
        return null;
    }

    return (
        <Fragment>
            {isSelected && (
                <BlockControls>
                    <ToolbarGroup>
                        <ToolbarButton
                            icon={chevronLeft}
                            label="Move up"
                            onClick={handleMoveUp}
                            disabled={!canMoveUp}
                        />
                        <ToolbarButton
                            icon={chevronRight}
                            label="Move down"
                            onClick={handleMoveDown}
                            disabled={!canMoveDown}
                        />
                        <ToolbarButton
                            icon={copy}
                            label="Clone"
                            onClick={handleClone}
                        />
                        <ToolbarButton
                            icon={trash}
                            label="Remove"
                            onClick={handleRemove}
                            isDestructive
                        />
                    </ToolbarGroup>
                </BlockControls>
            )}
            {processedContent}
        </Fragment>
    );
});