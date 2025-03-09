import { Popover } from '@wordpress/components';
import { useState, useRef } from '@wordpress/element';
import { __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';
import { SmartLinkContext } from '../../context/smart-link-context';

export const LinkField = ({ 
    name, 
    attributes, 
    setAttributes, 
    children, 
    isParentSelected,
    ...props 
}) => {
    // Helper to check valid URL
    const isValidURL = (url) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    // Lazy initialization: if attributes have a valid URL, use that; otherwise, fall back to props.href if provided.
    const initialLinkValue = (() => {
        if (typeof attributes[name] === 'string' && isValidURL(attributes[name])) {
            return { url: attributes[name], opensInNewTab: false };
        } else if (typeof attributes[name] === 'object' && attributes[name]?.url && isValidURL(attributes[name].url)) {
            return attributes[name];
        }
        if (props.href && isValidURL(props.href)) {
            return { url: props.href, opensInNewTab: false };
        }
        return { url: '', opensInNewTab: false };
    })();
    const [linkValue, setLinkValue] = useState(initialLinkValue);

    const [isLocalSelected, setIsLocalSelected] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const buttonRef = useRef();

    const isSelected = isLocalSelected || isParentSelected;

    const handleBlur = (e) => {

        if (e.relatedTarget?.closest('.zen-button') ||
            e.relatedTarget?.closest('.block-editor-link-control')) {
            return;
        }

        // Don't deselect if clicking the anchor itself
        if (e.relatedTarget === buttonRef.current) {
            return;
        }

        setIsLocalSelected(false);
        setIsPopoverOpen(false);
    };

    // Define a function to open the LinkControl popover immediately.
    const openLinkControl = () => {
         // Set selection state so that ButtonField's popover appears.
         setIsLocalSelected(true);
         setIsPopoverOpen(true);
    };

    return (
        <SmartLinkContext.Provider value={{ linkValue, setLinkValue, openLinkControl }}>
            <>
                <a
                    {...props}
                    className={`${props.className} zen-button`}
                    ref={buttonRef}
                    href={linkValue.url || props.href || '#'}
                    target={linkValue.opensInNewTab ? '_blank' : undefined}
                    onClick={(e) => {
                        e.preventDefault();
                        // if (!isPopoverOpen) {
                        //     setIsLocalSelected(true);
                        //     setIsPopoverOpen(true);
                        // }
                    }}
                    onBlur={handleBlur}
                >
                    {children}
                </a>
                {isSelected && buttonRef.current && (
                    <Popover
                        anchor={buttonRef.current}
                        position="bottom center"
                        onClose={() => setIsLocalSelected(false)}
                    >
                        <LinkControl
                            hasRichPreviews
                            showSuggestions
                            showInitialSuggestions
                            value={linkValue}
                            onChange={(newValue) => {
                                setLinkValue(newValue);
                                setAttributes({ 
                                    [name]: {
                                        url: newValue.url,
                                        opensInNewTab: newValue.opensInNewTab
                                    }
                                });
                            }}
                            settings={[
                                {
                                    id: 'opensInNewTab',
                                    title: 'Open in new tab'
                                }
                            ]}
                            onRemove={() => {
                                const emptyValue = { url: '', opensInNewTab: false };
                                setLinkValue(emptyValue);
                                setAttributes({ [name]: emptyValue });
                                setIsLocalSelected(false);
                            }}
                        />
                    </Popover>
                )}
            </>
        </SmartLinkContext.Provider>
    );
};

export const registerLinkField = () => {
    return {
        type: 'link',
        component: LinkField
    };
}; 