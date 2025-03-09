/**
 * WordPress dependencies
 */
import { 
    SelectControl,
    ToggleControl,
    TextControl,
    __experimentalNumberControl as NumberControl,
    RangeControl,
    Button
} from '@wordpress/components';
import { MediaUpload } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { convertOptionsToObject } from './constants';
import ItemActions from '../admin/components/item-actions';

/**
 * Render a control in the block editor
 */
export const renderEditorControl = (name, config, attributes, setAttributes) => {
    switch (config.type) {
        case 'select':
            return (
                <SelectControl
                    key={name}
                    label={config.label}
                    value={attributes[name]}
                    options={Object.entries(convertOptionsToObject(config.options)).map(([value, label]) => ({
                        value,
                        label
                    }))}
                    onChange={value => setAttributes({ [name]: value })}
                    __nextHasNoMarginBottom={true}
                />
            );

        case 'toggle':
            return (
                <ToggleControl
                    key={name}
                    label={config.label}
                    checked={attributes[name]}
                    onChange={value => setAttributes({ [name]: value })}
                    __nextHasNoMarginBottom={true}
                />
            );

        case 'number':
            return (
                <NumberControl
                    key={name}
                    label={config.label}
                    value={attributes[name]}
                    onChange={value => setAttributes({ [name]: value })}
                    __nextHasNoMarginBottom={true}
                />
            );

        case 'range':
            return (
                <RangeControl
                    key={name}
                    label={config.label}
                    value={attributes[name]}
                    onChange={value => setAttributes({ [name]: value })}
                    min={config.min || 0}
                    max={config.max || 100}
                    step={config.step || 1}
                    __nextHasNoMarginBottom={true}
                />
            );

        case 'image':
            const imageData = attributes[name] ? JSON.parse(attributes[name]) : null;
            return (
                <div key={name} className="zen-blocks-image-control">
                    <p className="components-base-control__label">{config.label}</p>
                    <MediaUpload
                        onSelect={media => {
                            const newImageData = {
                                id: media.id,
                                url: media.url
                            };
                            setAttributes({ [name]: JSON.stringify(newImageData) });
                        }}
                        allowedTypes={['image']}
                        value={imageData?.id}
                        render={({ open }) => (
                            <div>
                                {imageData ? (
                                    <div className="zen-blocks-image-preview">
                                        <img src={imageData.url} alt="" />
                                        <div className="zen-blocks-image-actions">
                                            <Button
                                                variant="secondary"
                                                onClick={open}
                                            >
                                                {__('Replace', 'zen-blocks')}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setAttributes({ [name]: '' })}
                                            >
                                                {__('Remove', 'zen-blocks')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        onClick={open}
                                    >
                                        {__('Choose Image', 'zen-blocks')}
                                    </Button>
                                )}
                            </div>
                        )}
                    />
                </div>
            );

        default:
            return (
                <TextControl
                    key={name}
                    label={config.label}
                    value={attributes[name]}
                    onChange={value => setAttributes({ [name]: value })}
                    __nextHasNoMarginBottom={true}
                />
            );
    }
};

/**
 * Render a control in the admin settings
 */
export const renderAdminControl = (type, value, onChange, options = {}) => {
    switch (type) {
        case 'toggle':
            return (
                <ToggleControl
                    checked={value === 'true' || value === true}
                    onChange={onChange}
                    {...options}
                />
            );

        case 'number':
        case 'range':
            return (
                <NumberControl
                    value={value}
                    onChange={onChange}
                    {...options}
                />
            );

        case 'select':
            return (
                <SelectControl
                    value={value}
                    options={(options.options || []).map(opt => ({
                        value: opt.key,
                        label: opt.value
                    }))}
                    onChange={onChange}
                    label={options.label}
                    help={options.help}
                />
            );

        case 'image':
            return (
                <TextControl
                    value={value}
                    onChange={onChange}
                    {...options}
                />
            );

        default:
            return (
                <TextControl
                    value={value}
                    onChange={onChange}
                    {...options}
                />
            );
    }
};

/**
 * Get additional control options based on type
 */
export const getControlOptions = (type, value, onChange, control = {}) => {
    switch (type) {
        case 'range':
            return (
                <>
                    <NumberControl
                        label={__('Min Value', 'zen-blocks')}
                        value={control.min || '0'}
                        onChange={(val) => onChange('min', val)}
                    />
                    <NumberControl
                        label={__('Max Value', 'zen-blocks')}
                        value={control.max || '100'}
                        onChange={(val) => onChange('max', val)}
                    />
                    <NumberControl
                        label={__('Step', 'zen-blocks')}
                        value={control.step || '1'}
                        onChange={(val) => onChange('step', val)}
                    />
                </>
            );

        case 'select':
            const options = Array.isArray(control.options) ? control.options : [];
            return (
                <div className="zen-blocks-control-options">
                    <h4 className="zen-blocks-control-options-label">{__('Options', 'zen-blocks')}</h4>
                    {options.map((option, index) => (
                        <div key={index} className="zen-blocks-control-option">
                            <TextControl
                                label={__('Key', 'zen-blocks')}
                                value={option.key}
                                onChange={(val) => onChange('options', 'edit', index, { ...option, key: val })}
                            />
                            <TextControl
                                label={__('Value', 'zen-blocks')}
                                value={option.value}
                                onChange={(val) => onChange('options', 'edit', index, { ...option, value: val })}
                            />
                            <div className="zen-blocks-control-option-actions">
                                <ItemActions
                                    onMoveUp={() => onChange('options', 'move', index, -1)}
                                    onMoveDown={() => onChange('options', 'move', index, 1)}
                                    onRemove={() => onChange('options', 'remove', index)}
                                    isFirst={index === 0}
                                    isLast={index === options.length - 1}
                                />
                            </div>
                        </div>
                    ))}
                    <Button
                        variant="secondary"
                        onClick={() => onChange('options', 'add')}
                        icon={plus}
                    >
                        {__('Add Option', 'zen-blocks')}
                    </Button>
                </div>
            );

        default:
            return null;
    }
};
