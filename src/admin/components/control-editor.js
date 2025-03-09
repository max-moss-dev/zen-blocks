/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { 
    Button,
    TextControl,
    SelectControl,
    PanelBody
} from '@wordpress/components';
import { forwardRef, useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { renderAdminControl } from '../../controls/types';
import { CONTROL_TYPES } from '../../controls/constants';
import ItemActions from './item-actions';
import DragHandle from './drag-handle';
import { getControlOptions } from '../../controls/types';

/**
 * Convert a string to a valid control name
 */
const validateControlName = (name, strict = false) => {
    if (!name) return '';

    // Convert to lowercase
    let validName = name.toLowerCase();

    // If doesn't start with letter, return empty or previous valid value
    if (!/^[a-z]/.test(validName)) {
        return '';
    }

    // Replace invalid characters with underscores
    validName = validName.replace(/[^a-z0-9_]/g, '_');

    // In strict mode, remove trailing underscores
    if (strict) {
        validName = validName.replace(/_+$/, '');
    }

    return validName;
};

const generateControlName = (label) => {
    if (!label) return '';
    
    // Find first letter and start from there
    const match = label.match(/[a-zA-Z]/);
    if (!match) return '';
    
    const validPart = label.slice(match.index);
    return validateControlName(validPart, true);
};

const ControlEditor = forwardRef(({ control = {}, controlName, onChange, onRemove, onRename, onDuplicate, isFirst, isLast, index, moveItem }, ref) => {
    const [localName, setLocalName] = useState(controlName || '');
    const [nameError, setNameError] = useState('');
    const [label, setLabel] = useState(control.label || '');
    const [labelError, setLabelError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setLocalName(controlName || '');
    }, [controlName]);

    useEffect(() => {
        setLabel(control.label || '');
    }, [control.label]);

    const handleChange = (key, value) => {
        // Convert value based on type if it's a default value change
        if (key === 'default' && (control.type === 'number' || control.type === 'range')) {
            value = Number(value);
        }
        
        onChange({
            ...control,
            [key]: value
        });
    };

    const handleLabelChange = (value) => {
        setLabel(value);
        setLabelError(value.trim() ? '' : __('Label is required', 'zen-blocks'));
        handleChange('label', value);
    };

    const handleLabelBlur = () => {
        const trimmedLabel = label.trim();
        setLabelError(trimmedLabel ? '' : __('Label is required', 'zen-blocks'));
        
        // Auto-fill name if empty and we have a label
        if (!localName.trim() && trimmedLabel) {
            const validName = generateControlName(trimmedLabel);
            if (validName) {
                setLocalName(validName);
                setNameError('');
                onRename(controlName, validName);
            }
        }
    };

    const handleNameChange = (value) => {
        const newValue = value || '';
        const validValue = validateControlName(newValue, false);
        setLocalName(validValue);
        setNameError(validValue.trim() ? '' : __('Control name is required', 'zen-blocks'));
    };

    const handleNameBlur = () => {
        const trimmedName = localName.trim();
        setNameError(trimmedName ? '' : __('Control name is required', 'zen-blocks'));
        
        if (trimmedName && trimmedName !== controlName) {
            onRename(controlName, trimmedName);
        }
    };

    const handleSpecificControlChange = (key, ...args) => {
        if (key === 'options') {
            const [action, index, value] = args;
            const newOptions = [...(control.options || [])];

            switch (action) {
                case 'add':
                    newOptions.push({ 
                        key: `option${newOptions.length + 1}`, 
                        value: '' 
                    });
                    break;
                case 'remove':
                    newOptions.splice(index, 1);
                    break;
                case 'move':
                    const newIndex = index + value;
                    if (newIndex >= 0 && newIndex < newOptions.length) {
                        [newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];
                    }
                    break;
                case 'edit':
                    newOptions[index] = value;
                    break;
            }
            
            handleChange('options', newOptions);
        } else {
            handleChange(key, args[0]);
        }
    };

    const getPhpSnippet = () => {
        if (!CONTROL_TYPES || !CONTROL_TYPES.length) {
            return '';
        }
        const varName = localName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
        const type = control.type || 'text';
        const controlType = CONTROL_TYPES.find(t => t.value === type);
        if (!controlType) {
            console.warn(`Control type "${type}" not found`);
            return '';
        }
        return controlType.code(varName);
    };

    const getOutputExample = () => {
        if (!CONTROL_TYPES || !CONTROL_TYPES.length) {
            return '';
        }
        const type = control.type || 'text';
        const controlType = CONTROL_TYPES.find(t => t.value === type);
        if (!controlType) {
            console.warn(`Control type "${type}" not found`);
            return '';
        }
        return controlType.output;
    };

    const copyToClipboard = (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            // For HTTPS or localhost
            navigator.clipboard.writeText(text).catch(() => {
                // Fallback for clipboard write failure
                copyUsingTextArea(text);
            });
        } else {
            // Fallback for HTTP
            copyUsingTextArea(text);
        }
        
        // Show feedback
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const copyUsingTextArea = (text) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Avoid scrolling to bottom
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
        
        document.body.removeChild(textArea);
    };

    return (
        <DragHandle index={index} moveItem={moveItem}>
            <PanelBody
                title={
                    <div 
                        className="zen-blocks-control-header" 
                        data-index={index}
                    >
                        <span>{label || __('New Control', 'zen-blocks')}</span>
                        <ItemActions
                            onRemove={onRemove}
                            onDuplicate={onDuplicate}
                            isFirst={isFirst}
                            isLast={isLast}
                        />
                    </div>
                }
                initialOpen={true}
                opened={control.isOpen}
                onToggle={(isOpen) => onChange({ ...control, isOpen })}
            >
                <div className="zen-blocks-control-editor">
                    <div className="zen-blocks-control-name">
                        <TextControl
                            label={__('Label', 'zen-blocks')}
                            value={label}
                            onChange={handleLabelChange}
                            onBlur={handleLabelBlur}
                            className={labelError ? 'has-error' : ''}
                            help={labelError}
                        />
                        <TextControl
                            label={__('Name', 'zen-blocks')}
                            value={localName}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            className={nameError ? 'has-error' : ''}
                            help={nameError || __('Must start with a letter and contain only lowercase letters, numbers, and underscores', 'zen-blocks')}
                        />
                    </div>
                    
                    <SelectControl
                        label={__('Type', 'zen-blocks')}
                        value={control.type || 'text'}
                        options={CONTROL_TYPES.map((type) => ({
                            label: type.label,
                            value: type.value
                        }))}
                        onChange={(value) => handleChange('type', value)}
                        __nextHasNoMarginBottom
                    />

                    <div className="components-base-control is-optional">
                        {renderAdminControl(
                            control.type,
                            control.default,
                            (value) => handleChange('default', value),
                            {
                                label: __('Default Value', 'zen-blocks'),
                                help: __('Default value for the control', 'zen-blocks'),
                                ...(control.type === 'select' && {
                                    options: control.options || []
                                })
                            }
                        )}
                        {getControlOptions(control.type, control.default, handleSpecificControlChange, control)}
                    </div>

                    <div className="zen-blocks-control-code-snippet">
                        <div className="zen-blocks-control-code-snippet__header">
                            <span>{__('PHP Template Code:', 'zen-blocks')}</span>
                            <Button
                                variant="secondary"
                                icon={isCopied ? "yes" : "clipboard"}
                                label={__('Copy Code', 'zen-blocks')}
                                onClick={() => {
                                    const code = getPhpSnippet();
                                    copyToClipboard(code);
                                }}
                            >
                                {isCopied ? __('Copied!', 'zen-blocks') : __('Copy', 'zen-blocks')}
                            </Button>
                        </div>
                        <pre className="zen-blocks-control-code-snippet__php">
                            {getPhpSnippet()}
                        </pre>
                        <div className="zen-blocks-control-code-snippet__example">
                            <span>{__('Example output:', 'zen-blocks')}</span>
                            <pre>{getOutputExample()}</pre>
                        </div>
                    </div>
                </div>
            </PanelBody>
        </DragHandle>
    );
});

export default ControlEditor;
