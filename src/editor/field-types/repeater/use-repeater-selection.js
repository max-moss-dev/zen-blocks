import { useState, useCallback, useEffect } from '@wordpress/element';

export const useRepeaterSelection = (isBlockSelected) => {
    const [selection, setSelection] = useState({
        repeaterId: null,
        itemId: null,
        isActive: false
    });

    // Clear selection when block loses focus
    useEffect(() => {
        if (!isBlockSelected) {
            setSelection({
                repeaterId: null,
                itemId: null,
                isActive: false
            });
        }
    }, [isBlockSelected]);

    const selectItem = useCallback((repeaterId, itemId) => {
        if (!itemId) return; // Don't select if no itemId provided
        setSelection({
            repeaterId,
            itemId,
            isActive: true
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelection({
            repeaterId: null,
            itemId: null,
            isActive: false
        });
    }, []);

    const isItemSelected = useCallback((repeaterId, itemId) => {
        if (!itemId) return false; // Don't select if no itemId
        return selection.repeaterId === repeaterId && 
               selection.itemId === itemId &&
               selection.isActive;
    }, [selection]);

    const getSelectionIndex = useCallback((repeaterId, items) => {
        if (!selection.itemId || !items?.length) return -1;
        if (selection.repeaterId === repeaterId && selection.isActive) {
            return items.findIndex(item => item.id === selection.itemId);
        }
        return -1;
    }, [selection]);

    const selectNextItem = useCallback((repeaterId, items) => {
        if (!items?.length) return;
        if (selection.repeaterId === repeaterId && selection.isActive && selection.itemId) {
            const currentIndex = items.findIndex(item => item.id === selection.itemId);
            if (currentIndex < items.length - 1 && items[currentIndex + 1].id) {
                setSelection(prev => ({
                    ...prev,
                    itemId: items[currentIndex + 1].id
                }));
            }
        }
    }, [selection]);

    const selectPreviousItem = useCallback((repeaterId, items) => {
        if (!items?.length) return;
        if (selection.repeaterId === repeaterId && selection.isActive && selection.itemId) {
            const currentIndex = items.findIndex(item => item.id === selection.itemId);
            if (currentIndex > 0 && items[currentIndex - 1].id) {
                setSelection(prev => ({
                    ...prev,
                    itemId: items[currentIndex - 1].id
                }));
            }
        }
    }, [selection]);

    return {
        selection,
        selectItem,
        clearSelection,
        isItemSelected,
        getSelectionIndex,
        selectNextItem,
        selectPreviousItem
    };
};
