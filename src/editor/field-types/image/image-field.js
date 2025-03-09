import { Modal } from '@wordpress/components';
import { useState, useEffect, Fragment } from '@wordpress/element';
import ImageControl from './image-control';
import './image-field.scss';

export const ImageField = ({ 
    name, 
    attributes, 
    setAttributes, 
    className,
    identifier
}) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const imageData = attributes[name] || { id: null, url: '', alt: '' };

    useEffect(() => {
        const handleMediaModalClose = () => setModalOpen(false);
        window.addEventListener('wp-media-modal-close', handleMediaModalClose);
        return () => window.removeEventListener('wp-media-modal-close', handleMediaModalClose);
    }, []);

    const handleModalClose = (e) => {
        if (e?.target?.closest('.zen-image-modal-content')) {
            return;
        }
        setModalOpen(false);
    };

    const modalId = `zen-image-modal-${identifier || name}`;

    if (!imageData.url) {
        return (
            <ImageControl 
                value={imageData}
                onChange={(value) => setAttributes({ [name]: value })}
                className={className}
                key={`image-control-${identifier || name}`}
            />
        );
    }

    return (
        <Fragment key={`image-wrapper-${identifier || name}`}>
            <img
                src={imageData.url}
                alt={imageData.alt || ''}
                className={`${className || ''} zen-image`}
                onClick={() => setModalOpen(true)}
            />
            {isModalOpen && (
                <Modal
                    title="Edit image"
                    onRequestClose={handleModalClose}
                    className="zen-image-modal"
                    isDismissible={true}
                    id={modalId}
                >
                    <div className="zen-image-modal-content">
                        <div className="zen-image-preview">
                            <img
                                src={imageData.url}
                                alt={imageData.alt || ''}
                            />
                        </div>
                        <div>
                            <ImageControl
                                value={imageData}
                                onChange={(value) => setAttributes({ [name]: value })}
                                isCompact={true}
                                onClose={() => setModalOpen(false)}
                                key={`modal-control-${identifier || name}`}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </Fragment>
    );
};

export const registerImageField = () => {
    return {
        type: 'image',
        component: ImageField
    };
}; 