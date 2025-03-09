import { InnerBlocks } from '@wordpress/block-editor';

// export const InnerBlocksField = ({ 
//     name,
//     attributes,
//     setAttributes,
//     tagName: TagName = 'div',
//     ...props 
// }) => {
//     const innerBlocksProps = useInnerBlocksProps(
//         { 
//             ...props,
//             className: `${props.className || ''} zen-innerblocks-content`
//         },
//         {
//             templateLock: false,
//             renderAppender: InnerBlocks.DefaultBlockAppender
//         }
//     );

//     return <TagName {...innerBlocksProps} />;
// };

export const registerInnerBlocksField = () => ({
    type: 'innerblocks',
    component: InnerBlocks,
    getAttributeConfig: () => ({
        type: 'string',
        default: ''
    })
}); 