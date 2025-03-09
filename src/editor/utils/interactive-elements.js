export const isInteractiveTarget = (target) => {
    return !!(
        target.closest('[contenteditable="true"]') ||
        target.closest('.block-editor-rich-text__editable') ||
        target.closest('.block-editor-block-toolbar') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('img') ||
        target.closest('.block-editor-link-control')
    );
};
