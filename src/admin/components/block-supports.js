/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ToggleControl, PanelBody, SelectControl, TextControl, Button } from '@wordpress/components';

const BlockSupports = ({ settings, onChange }) => {
    const handleAlignmentChange = (alignType, isChecked) => {
        const currentAlign = settings.supports?.align || [];
        const newAlign = isChecked 
            ? [...currentAlign, alignType]
            : currentAlign.filter(a => a !== alignType);
        
        if (!isChecked && settings.supports?.defaultAlign === alignType) {
            onChange('supports.defaultAlign', '');
        }
        
        onChange('supports.align', newAlign);
    };

    // Handle nested property changes
    const handleNestedChange = (parentKey, childKey, isChecked) => {
        const currentParent = settings.supports?.[parentKey] || {};
        onChange(`supports.${parentKey}`, {
            ...currentParent,
            [childKey]: isChecked
        });
    };

    // Get available alignment options for the select control
    const getAlignmentOptions = () => {
        const alignments = settings.supports?.align || [];
        const options = [
            { label: __('None', 'zen-blocks'), value: '' }
        ];

        if (alignments.includes('full')) {
            options.push({ label: __('Full Width', 'zen-blocks'), value: 'full' });
        }
        if (alignments.includes('wide')) {
            options.push({ label: __('Wide Width', 'zen-blocks'), value: 'wide' });
        }
        if (alignments.includes('left')) {
            options.push({ label: __('Left', 'zen-blocks'), value: 'left' });
        }
        if (alignments.includes('center')) {
            options.push({ label: __('Center', 'zen-blocks'), value: 'center' });
        }
        if (alignments.includes('right')) {
            options.push({ label: __('Right', 'zen-blocks'), value: 'right' });
        }

        return options;
    };

    return (
        <>
            <PanelBody
                title={__('Basic Features', 'zen-blocks')}
                initialOpen={true}
            >
                <ToggleControl
                    label={__('Anchor Support', 'zen-blocks')}
                    help={__('Allow adding HTML anchors to the block', 'zen-blocks')}
                    checked={settings.supports?.anchor ?? true}
                    onChange={(isChecked) => onChange('supports.anchor', isChecked)}
                />
                <ToggleControl
                    label={__('Custom Class Names', 'zen-blocks')}
                    help={__('Allow adding custom CSS classes to the block', 'zen-blocks')}
                    checked={settings.supports?.customClassName ?? true}
                    onChange={(isChecked) => onChange('supports.customClassName', isChecked)}
                />
                <ToggleControl
                    label={__('Custom Styles', 'zen-blocks')}
                    help={__('Allow adding custom styles to the block', 'zen-blocks')}
                    checked={settings.supports?.styles ?? true}
                    onChange={(isChecked) => onChange('supports.styles', isChecked)}
                />
                <ToggleControl
                    label={__('HTML Editing', 'zen-blocks')}
                    help={__('Allow editing block HTML code', 'zen-blocks')}
                    checked={settings.supports?.html ?? false}
                    onChange={(isChecked) => onChange('supports.html', isChecked)}
                />
            </PanelBody>
            <PanelBody
                title={__('Alignment Options', 'zen-blocks')}
                initialOpen={false}
            >
                <ToggleControl
                    label={__('Full Width', 'zen-blocks')}
                    help={__('Allow the block to be aligned full width', 'zen-blocks')}
                    checked={settings.supports?.align?.includes('full') ?? false}
                    onChange={(isChecked) => handleAlignmentChange('full', isChecked)}
                />
                <ToggleControl
                    label={__('Wide Width', 'zen-blocks')}
                    help={__('Allow the block to be aligned wide width', 'zen-blocks')}
                    checked={settings.supports?.align?.includes('wide') ?? false}
                    onChange={(isChecked) => handleAlignmentChange('wide', isChecked)}
                />
                <ToggleControl
                    label={__('Left Alignment', 'zen-blocks')}
                    help={__('Allow the block to be aligned to the left', 'zen-blocks')}
                    checked={settings.supports?.align?.includes('left') ?? false}
                    onChange={(isChecked) => handleAlignmentChange('left', isChecked)}
                />
                <ToggleControl
                    label={__('Center Alignment', 'zen-blocks')}
                    help={__('Allow the block to be aligned to the center', 'zen-blocks')}
                    checked={settings.supports?.align?.includes('center') ?? false}
                    onChange={(isChecked) => handleAlignmentChange('center', isChecked)}
                />
                <ToggleControl
                    label={__('Right Alignment', 'zen-blocks')}
                    help={__('Allow the block to be aligned to the right', 'zen-blocks')}
                    checked={settings.supports?.align?.includes('right') ?? false}
                    onChange={(isChecked) => handleAlignmentChange('right', isChecked)}
                />

                <SelectControl
                    label={__('Default Alignment', 'zen-blocks')}
                    help={__('Choose the default alignment for this block', 'zen-blocks')}
                    value={settings.supports?.defaultAlign || ''}
                    options={getAlignmentOptions()}
                    onChange={(value) => onChange('supports.defaultAlign', value)}
                    __nextHasNoMarginBottom
                />
            </PanelBody>

            <PanelBody
                title={__('Color Settings', 'zen-blocks')}
                initialOpen={false}
            >
                <ToggleControl
                    label={__('Text Color', 'zen-blocks')}
                    help={__('Allow setting custom text color', 'zen-blocks')}
                    checked={settings.supports?.color?.text ?? false}
                    onChange={(isChecked) => handleNestedChange('color', 'text', isChecked)}
                />
                <ToggleControl
                    label={__('Background Color', 'zen-blocks')}
                    help={__('Allow setting custom background color', 'zen-blocks')}
                    checked={settings.supports?.color?.background ?? false}
                    onChange={(isChecked) => handleNestedChange('color', 'background', isChecked)}
                />
            </PanelBody>

            <PanelBody
                title={__('Typography Settings', 'zen-blocks')}
                initialOpen={false}
            >
                <ToggleControl
                    label={__('Font Size', 'zen-blocks')}
                    help={__('Allow changing font size', 'zen-blocks')}
                    checked={settings.supports?.typography?.fontSize ?? false}
                    onChange={(isChecked) => handleNestedChange('typography', 'fontSize', isChecked)}
                />
                <ToggleControl
                    label={__('Line Height', 'zen-blocks')}
                    help={__('Allow adjusting line height', 'zen-blocks')}
                    checked={settings.supports?.typography?.lineHeight ?? false}
                    onChange={(isChecked) => handleNestedChange('typography', 'lineHeight', isChecked)}
                />
            </PanelBody>

            <PanelBody
                title={__('Spacing Options', 'zen-blocks')}
                initialOpen={false}
            >
                <ToggleControl
                    label={__('Padding', 'zen-blocks')}
                    help={__('Allow adjusting padding', 'zen-blocks')}
                    checked={settings.supports?.spacing?.padding ?? false}
                    onChange={(isChecked) => handleNestedChange('spacing', 'padding', isChecked)}
                />
                <ToggleControl
                    label={__('Margin', 'zen-blocks')}
                    help={__('Allow adjusting margin', 'zen-blocks')}
                    checked={settings.supports?.spacing?.margin ?? false}
                    onChange={(isChecked) => handleNestedChange('spacing', 'margin', isChecked)}
                />
            </PanelBody>

            {settings.supports?.styles && (
                <PanelBody
                    title={__('Block Styles', 'zen-blocks')}
                    initialOpen={false}
                >
                    {settings.styles?.length > 0 ? (
                        settings.styles.map((style, index) => (
                            <div key={index} className="zen-blocks-style-item">
                                <TextControl
                                    label={__('Name', 'zen-blocks')}
                                    value={style.name}
                                    onChange={(value) => {
                                        const newStyles = [...(settings.styles || [])];
                                        newStyles[index] = { ...style, name: value };
                                        onChange('styles', newStyles);
                                    }}
                                    __nextHasNoMarginBottom
                                />
                                <TextControl
                                    label={__('Label', 'zen-blocks')}
                                    value={style.label}
                                    onChange={(value) => {
                                        const newStyles = [...(settings.styles || [])];
                                        newStyles[index] = { ...style, label: value };
                                        onChange('styles', newStyles);
                                    }}
                                    __nextHasNoMarginBottom
                                />
                                <ToggleControl
                                    label={__('Default Style', 'zen-blocks')}
                                    checked={!!style.isDefault}
                                    onChange={(isChecked) => {
                                        const newStyles = [...(settings.styles || [])].map((s, i) => ({
                                            ...s,
                                            isDefault: i === index ? isChecked : false
                                        }));
                                        onChange('styles', newStyles);
                                    }}
                                />
                                <Button
                                    isDestructive
                                    onClick={() => {
                                        const newStyles = [...(settings.styles || [])];
                                        newStyles.splice(index, 1);
                                        onChange('styles', newStyles);
                                    }}
                                >
                                    {__('Remove Style', 'zen-blocks')}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p>{__('No styles defined', 'zen-blocks')}</p>
                    )}
                    <Button
                        isPrimary
                        onClick={() => {
                            const newStyles = [...(settings.styles || []), {
                                name: 'new-style',
                                label: 'New Style',
                                isDefault: false
                            }];
                            onChange('styles', newStyles);
                        }}
                    >
                        {__('Add Style', 'zen-blocks')}
                    </Button>
                </PanelBody>
            )}

            <PanelBody
                title={__('Advanced Features', 'zen-blocks')}
                initialOpen={false}
            >
                <ToggleControl
                    label={__('jQuery Support', 'zen-blocks')}
                    help={__('Enable jQuery for this block', 'zen-blocks')}
                    checked={settings.zenb?.jquery ?? false}
                    onChange={(isChecked) => onChange('zenb.jquery', isChecked)}
                />
            </PanelBody>
        </>
    );
};

export default BlockSupports;
