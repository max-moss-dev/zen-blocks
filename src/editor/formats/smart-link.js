import { useContext } from '@wordpress/element';
import { SmartLinkContext } from '../context/smart-link-context';
import { RichTextToolbarButton } from '@wordpress/block-editor';  
const { registerFormatType } = wp.richText;

const name = 'zen-blocks/smart-link';
const title = 'Link';
const tagName = 'a';
const className = 'zen-smart-link';

export const registerSmartLink = () => {
    registerFormatType(name, {
        title: title,
        tagName: tagName,
        className: className,
        edit: () => {
            const { openLinkControl } = useContext(SmartLinkContext) || {};
            return (
                <RichTextToolbarButton
                    icon="admin-links"
                    title={title}
                    isActive={true}
                    onClick={() => {
                        if (typeof openLinkControl === 'function') {
                            openLinkControl();
                        }
                    }}
                />
            );
        }
    });
}; 