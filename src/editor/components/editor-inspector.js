/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, Button } from '@wordpress/components';
import './editor-inspector.scss';

/**
 * Internal dependencies
 */
import { renderEditorControl } from '../../controls/types';

const BlockInspector = ({ block, attributes, setAttributes }) => {
    const controls = block?.metadata?.zenb?.controls;

    return (
        <>
            {controls && Object.keys(controls).length > 0 && (
                <InspectorControls>
                    <PanelBody title={__('Settings', 'zen-blocks')}>
                        {Object.entries(controls).map(([name, config]) => {
                            if (config.type === 'repeater') return null;
                            return renderEditorControl(name, config, attributes, setAttributes);
                        })}
                    </PanelBody>
                </InspectorControls>
            )}
            {window.zenBlocksData?.adminUI && (
                <InspectorControls>
                    <PanelBody
                        title={__('Developer Settings', 'zen-blocks')}
                        initialOpen={false}
                    >
                        <Button
                            variant="secondary"
                            href={`admin.php?page=zen-blocks-settings&block=${block.name}`}
                            target="_blank"
                            style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}
                            icon="admin-generic"
                        >
                            {__('Configure Block', 'zen-blocks')}
                        </Button>
                    </PanelBody>
                </InspectorControls>
            )}
        </>
    );
};

export default BlockInspector;
