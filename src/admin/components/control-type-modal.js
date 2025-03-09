/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { 
    Button,
    Modal,
    RadioControl
} from '@wordpress/components';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { CONTROL_TYPES } from '../../controls/constants';

const ControlTypeModal = ({ onClose, onSelect }) => {
    const [selectedType, setSelectedType] = useState(CONTROL_TYPES[0].value);

    return (
        <Modal
            title={__('Select Control Type', 'zen-blocks')}
            onRequestClose={onClose}
            className="zen-blocks-control-type-modal"
        >
            <div className="zen-blocks-control-type-list">
                <RadioControl
                    hideLabelFromVision
                    label={__('Control Type', 'zen-blocks')}
                    selected={selectedType}
                    options={CONTROL_TYPES.map(type => ({
                        value: type.value,
                        label: (
                            <div className="zen-blocks-control-type-option">
                                <div className="zen-blocks-control-type-label">{type.label}</div>
                                <div className="zen-blocks-control-type-description">{type.description}</div>
                            </div>
                        )
                    }))}
                    onChange={setSelectedType}
                />
            </div>
            <div className="zen-blocks-control-type-actions">
                <Button
                    variant="secondary"
                    onClick={onClose}
                >
                    {__('Cancel', 'zen-blocks')}
                </Button>
                <Button
                    variant="primary"
                    onClick={() => onSelect(selectedType)}
                >
                    {__('Add Control', 'zen-blocks')}
                </Button>
            </div>
        </Modal>
    );
};

export default ControlTypeModal;
