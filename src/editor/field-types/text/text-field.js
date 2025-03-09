import { RichText } from '@wordpress/block-editor';
import { useState, forwardRef, useContext, useRef, useEffect } from '@wordpress/element';

export const TextField = forwardRef(({ 
    name, 
    attributes, 
    setAttributes, 
    tagName = 'div', 
    isRich = false, 
    identifier, 
    onFocus, 
    ...props 
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const localRef = useRef();
    const [isInsideButton, setIsInsideButton] = useState(false);
    
    useEffect(() => {
        if (localRef.current) {
            const parentLink = localRef.current.closest('a[href]');
            setIsInsideButton(!!parentLink);
        }
    }, []);

    const formats = [
        ...(isInsideButton ? ['zen-blocks/smart-link'] : ['core/link']),
        'core/bold',
        'core/italic',
        'core/underline',
        'core/strikethrough',
        'core/text-color',
        'core/subscript',
        'core/superscript',
    ];

    return (
        <RichText
            ref={(node) => {
                localRef.current = node;
                if (typeof ref === 'function') ref(node);
            }}
            identifier={identifier || `${name}-rich-text`}
            tagName={tagName}
            value={attributes[name] || ''}
            onChange={value => setAttributes({ [name]: value })}
            placeholder={`Enter ${name}...`}
            keepPlaceholderOnFocus={true}
            onFocus={() => {
                setIsFocused(true);
                onFocus?.();
            }}
            onBlur={() => setIsFocused(false)}
            allowedFormats={formats}
            withoutInteractiveFormatting={false}
            inlineToolbar={true}
            preserveWhiteSpace={true}
            {...props}
        />
    );
});

export const registerTextField = () => {
    return {
        type: 'text',
        component: TextField
    };
};