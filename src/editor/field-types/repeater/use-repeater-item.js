import { generateId } from './repeater-field';

export const useRepeaterItem = ({ 
    item, 
    index, 
    items, 
    repeaterName, 
    setAttributes, 
    onSelect 
}) => {
    const handleMoveUp = (e) => {
        if (e) e.stopPropagation();
        if (index === 0) return;
        
        const newItems = [...items];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        
        // First update the items
        setAttributes({ [repeaterName]: newItems });
        
        // Then update selection to the new position of the moved item
        requestAnimationFrame(() => {
            onSelect(repeaterName, item.id);
        });
    };

    const handleMoveDown = (e) => {
        if (e) e.stopPropagation();
        if (index === items.length - 1) return;
        
        const newItems = [...items];
        [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
        
        // First update the items
        setAttributes({ [repeaterName]: newItems });
        
        // Then update selection to the new position of the moved item
        requestAnimationFrame(() => {
            onSelect(repeaterName, item.id);
        });
    };

    const handleClone = (e) => {
        if (e) e.stopPropagation();
        const newItems = [...items];
        const clonedItem = { ...item, id: generateId() }; // Generate new ID for clone
        newItems.splice(index + 1, 0, clonedItem);
        
        // First update the items
        setAttributes({ [repeaterName]: newItems });
        
        // Then select the cloned item
        requestAnimationFrame(() => {
            onSelect(repeaterName, clonedItem.id);
        });
    };

    const handleRemove = (e) => {
        if (e) e.stopPropagation();
        const newItems = [...items];
        newItems.splice(index, 1);
        
        // First update the items
        setAttributes({ [repeaterName]: newItems });
        
        // Then update selection
        requestAnimationFrame(() => {
            if (newItems.length > 0) {
                const newIndex = Math.min(index, newItems.length - 1);
                onSelect(repeaterName, newItems[newIndex].id);
            } else {
                onSelect(repeaterName, null);
            }
        });
    };

    return {
        handleMoveUp,
        handleMoveDown,
        handleClone,
        handleRemove,
        canMoveUp: index > 0,
        canMoveDown: index < items.length - 1
    };
};