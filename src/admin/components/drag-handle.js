/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { dragHandle } from '@wordpress/icons';
import { useDrag, useDrop } from 'react-dnd';
import { useRef, useState, useEffect } from '@wordpress/element';

const DragHandle = ({ index, moveItem, children }) => {
    const ref = useRef(null);
    const [isHandlePressed, setIsHandlePressed] = useState(false);
    
    const [{ isDragging }, drag] = useDrag({
        type: 'CONTROL',
        item: { type: 'CONTROL', index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        }),
        canDrag: () => isHandlePressed
    });

    const [{ handlerId }, drop] = useDrop({
        accept: 'CONTROL',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId()
            };
        },
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Get the DOM element's rectangle
            const hoverBoundingRect = ref.current.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Get mouse position
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) {
                return;
            }

            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            moveItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
        }
    });

    // Handle mouse events for the handle button
    const handleMouseDown = () => setIsHandlePressed(true);
    const handleMouseUp = () => setIsHandlePressed(false);

    // Add global mouse up listener to handle cases where mouse is released outside the button
    useEffect(() => {
        if (isHandlePressed) {
            const handleGlobalMouseUp = () => setIsHandlePressed(false);
            window.addEventListener('mouseup', handleGlobalMouseUp);
            return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
        }
    }, [isHandlePressed]);

    drag(drop(ref));

    return (
        <div
            ref={ref}
            data-handler-id={handlerId}
            className={`zen-blocks-drag-panel ${isDragging ? 'is-dragging' : ''}`}
        >
            <Button
                icon={dragHandle}
                className="zen-blocks-drag-handle"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            />
            {children}
        </div>
    );
};

export default DragHandle;