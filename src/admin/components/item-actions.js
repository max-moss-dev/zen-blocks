/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ButtonGroup, Button } from '@wordpress/components';
import { arrowUp, arrowDown, trash, copy } from '@wordpress/icons';

const ItemActions = ({ onMoveUp, onMoveDown, onRemove, onDuplicate, isFirst, isLast }) => {
    const handleClick = (callback) => (event) => {
        event.stopPropagation();
        callback();
    };

    return (
        <ButtonGroup className="zen-blocks-item-actions">
            {onMoveUp && <Button
                icon={arrowUp}
                onClick={handleClick(onMoveUp)}
                disabled={isFirst}
                label={__('Move up', 'zen-blocks')}
            />}
            
            {onMoveDown && <Button
                icon={arrowDown}
                onClick={handleClick(onMoveDown)}
                disabled={isLast}
                label={__('Move down', 'zen-blocks')}
            />}
            {onDuplicate && <Button
                icon={copy}
                onClick={handleClick(onDuplicate)}
                label={__('Duplicate', 'zen-blocks')}
            />}
            <Button
                icon={trash}
                onClick={handleClick(onRemove)}
                label={__('Remove', 'zen-blocks')}
                isDestructive
            />
        </ButtonGroup>
    );
};

export default ItemActions;
