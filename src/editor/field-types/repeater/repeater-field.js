import { Button, Popover } from '@wordpress/components';
import { RepeaterItem } from './repeater-item';
import { memo, useRef, useEffect } from '@wordpress/element';
import './repeater-field.scss';

// Simple UUID generator
export const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const RepeaterField = memo(({ 
    name, 
    attributes, 
    setAttributes, 
    template,
    wrapperClass,
    onItemSelect
}) => {
    const items = attributes[name] || [];
    const containerRef = useRef();

    // Ensure all items have IDs
    useEffect(() => {
        if (items.some(item => !item.id)) {
            const itemsWithIds = items.map(item => ({
                ...item,
                id: item.id || generateId()
            }));
            setAttributes({
                [name]: itemsWithIds
            });
        }
    }, []); // Run once on mount

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        const currentIndex = onItemSelect.getSelectionIndex(name, items);
        if (currentIndex === -1) return;

        switch (e.key) {
            case 'ArrowUp':
                if (currentIndex > 0) {
                    e.preventDefault();
                    onItemSelect.selectPreviousItem(name, items);
                }
                break;
            case 'ArrowDown':
                if (currentIndex < items.length - 1) {
                    e.preventDefault();
                    onItemSelect.selectNextItem(name, items);
                }
                break;
            case 'Escape':
                onItemSelect.clearSelection();
                break;
        }
    };

    const handleAddItem = () => {
        // Create empty item with default values
        const newItem = {
            id: generateId(), // Use our UUID generator
        };
        
        // Parse template to find editable fields
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = template;
        
        // Find all editable elements
        const editableElements = tempDiv.querySelectorAll('[zen-edit]');
        
        // Set default values for each field
        editableElements.forEach(el => {
            const fieldName = el.getAttribute('zen-edit');
            const fieldType = el.getAttribute('zen-type') || 'text';
            
            // Set appropriate default value based on field type
            switch (fieldType) {
                case 'image':
                    newItem[fieldName] = { id: null, url: '', alt: '' };
                    break;
                case 'link':
                    newItem[fieldName] = {
                        text: '',
                        url: '',
                        target: '',
                        rel: ''
                    };
                    break;
                default:
                    newItem[fieldName] = '';
            }
        });

        // Update attributes with new item
        setAttributes({
            [name]: [...items, newItem]
        });

        // Select the new item
        onItemSelect.selectItem(name, newItem.id);
    };

    return (
        <>
            <div 
                ref={containerRef}
                className={`zen-repeater block-editor-block-list__layout ${wrapperClass}`}
                onKeyDown={handleKeyDown}
            >
                {items.map((item, index) => (
                    <RepeaterItem
                        key={item.id || index} // Use item.id as key if available
                        template={template}
                        item={item}
                        index={index}
                        repeaterName={name}
                        items={items}
                        setAttributes={setAttributes}
                        isSelected={onItemSelect.isItemSelected(name, item.id)}
                        onSelect={() => onItemSelect.selectItem(name, item.id)}
                    />
                ))}
                <Button 
                    className="zen-repeater-add"
                    onClick={handleAddItem}
                    icon="plus"
                >
                    {`Add ${name}`}
                </Button>
            </div>
            {onItemSelect.selection.repeaterId === name && (
                <Popover.Slot />
            )}
        </>
    );
});

export const registerRepeaterField = () => {
    return {
        type: 'repeater',
        component: RepeaterField
    };
}; 