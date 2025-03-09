import { MediaUpload, MediaUploadCheck, MediaPlaceholder } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';

const ImageControl = ({ value, onChange, className, isCompact = false, onClose = null }) => {
    const onSelect = (media) => {
        onChange({
            id: media.id,
            url: media.url,
            alt: media.alt || '',
            caption: media.caption?.raw || '',
            size: 'full'
        });
        if (onClose) onClose();
    };

    const removeImage = () => {
        onChange({
            id: 0,
            url: '',
            alt: '',
            caption: '',
            size: 'full'
        });
        if (onClose) onClose();
    };

    if (isCompact) {
        return (
            <div className="zen-image-control-compact">
                <MediaUploadCheck>
                    <MediaUpload
                        onSelect={onSelect}
                        allowedTypes={['image']}
                        value={value?.id}
                        render={({ open }) => (
                            <Button
                                onClick={open}
                                variant="secondary"
                            >
                                Replace
                            </Button>
                        )}
                    />
                </MediaUploadCheck>
                <Button
                    onClick={removeImage}
                    variant="secondary"
                    isDestructive
                >
                    Remove
                </Button>
            </div>
        );
    }

    if (!value?.url) {
        return (
            <MediaPlaceholder
                labels={{ 
                    title: 'Add Image',
                    instructions: 'Upload or select an image'
                }}
                onSelect={onSelect}
                accept="image/*"
                allowedTypes={['image']}
                disableMediaButtons={false}
            />
        );
    }

    return (
        <>
            <img
                src={value.url}
                alt={value.alt}
                className={`${className || ''}`}
                onClick={onClose ? undefined : () => {
                    document.querySelector(`[data-id="${value.id}"]`)?.click();
                }}
                style={onClose ? undefined : { cursor: 'pointer' }}
            />
            {!onClose && (
                <div className="zen-image-control__actions">
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={onSelect}
                            allowedTypes={['image']}
                            value={value.id}
                            render={({ open }) => (
                                <Button
                                    onClick={open}
                                    variant="secondary"
                                >
                                    Replace
                                </Button>
                            )}
                        />
                    </MediaUploadCheck>
                    <Button
                        onClick={removeImage}
                        variant="secondary"
                        isDestructive
                    >
                        Remove
                    </Button>
                </div>
            )}
        </>
    );
};

export default ImageControl;
