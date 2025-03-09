import { memo } from '@wordpress/element';
import { Editor } from '@tinymce/tinymce-react';
import './wysiwyg-field.scss';

export const WYSIWYGField = memo(({ 
    name, 
    attributes, 
    setAttributes,
    className
}) => {
    const tinymceUrl = `${window.location.origin}/wp-includes/js/tinymce/tinymce.min.js`;

    return (
        <div className={className}>
            <Editor
                tinymceScriptSrc={tinymceUrl}
                value={attributes[name] || ''}
                onEditorChange={(content) => {
                    setAttributes({ [name]: content });
                }}
                init={{
                    height: 100,
                    menubar: false,
                    plugins: 'lists link',
                    toolbar: 'formatselect | bold italic | bullist numlist | link',
                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; line-height: 1.6; }',
                    formats: {
                        alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', classes: 'alignleft' },
                        aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', classes: 'aligncenter' },
                        alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', classes: 'alignright' }
                    },
                    block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4',
                    browser_spellcheck: true,
                    convert_urls: false,
                    entity_encoding: 'raw'
                }}
            />
        </div>
    );
});

export const registerWYSIWYGField = () => {
    return {
        type: 'wysiwyg',
        component: WYSIWYGField
    };
};