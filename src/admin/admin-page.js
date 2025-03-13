/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Spinner, Notice } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

// Helper functions for localStorage
const getStoredNoticeState = (key) => {
    try {
        return localStorage.getItem(`zenblocks_notice_${key}`) === 'hidden';
    } catch (e) {
        return false;
    }
};

const setStoredNoticeState = (key, isHidden) => {
    try {
        localStorage.setItem(`zenblocks_notice_${key}`, isHidden ? 'hidden' : 'visible');
    } catch (e) {
        console.warn('Failed to save notice state to localStorage');
    }
};

export default function AdminPage() {
    const [blocks, setBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showExampleNotice, setShowExampleNotice] = useState(!getStoredNoticeState('example'));
    const [showAdminUINotice, setShowAdminUINotice] = useState(!getStoredNoticeState('adminui'));

    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                const response = await apiFetch({
                    path: '/zen-blocks/v1/blocks',
                    method: 'GET'
                });
                setBlocks(response);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlocks();
    }, []);

    const handleHelpClick = () => {
        window.jQuery('#contextual-help-link').trigger('click');
    };

    const handleDismissExampleNotice = () => {
        setShowExampleNotice(false);
        setStoredNoticeState('example', true);
    };

    const handleDismissAdminUINotice = () => {
        setShowAdminUINotice(false);
        setStoredNoticeState('adminui', true);
    };

    if (isLoading) {
        return <div className="zen-blocks-loading"><Spinner /></div>;
    }

    if (error) {
        return <div className="notice notice-error"><p>{error}</p></div>;
    }

    return (
        <div className="wrap zen-blocks-admin">
            <div className="zen-blocks-admin-header">
                <h1>
                    {__('Zen Blocks', 'zen-blocks')}
                </h1>
                <Button
                    icon="editor-help"
                    onClick={handleHelpClick}
                    className="page-title-action"
                    style={{ marginLeft: '20px' }}
                >
                    {__('Info', 'zen-blocks')}
                </Button>
            </div>

            {/* Configuration Notices */}
            {showExampleNotice && (
                <Notice status="info" isDismissible={true} onRemove={handleDismissExampleNotice}>
                    {window.zenBlocksConfig?.registerExampleBlocks
                        ? __('Example blocks are enabled. Click "Info" above to learn how to disable them.', 'zen-blocks')
                        : __('Example blocks are disabled. Click "Info" above to learn how to enable them.', 'zen-blocks')
                    }
                </Notice>
            )}

            {showAdminUINotice && (
                <Notice status="info" isDismissible={true} onRemove={handleDismissAdminUINotice}>
                    {window.zenBlocksConfig?.adminUI
                        ? __('Developer settings are enabled. Click "Info" above to learn how to disable them.', 'zen-blocks')
                        : __('Developer settings are disabled. Click "Info" above to learn how to enable them.', 'zen-blocks')
                    }
                </Notice>
            )}

            <div className="zen-blocks-admin-content">
                <table className="wp-list-table widefat fixed striped table-view-list">
                    <thead>
                        <tr>
                            <th>{__('Block', 'zen-blocks')}</th>
                            <th>{__('Description', 'zen-blocks')}</th>
                            <th>{__('Actions', 'zen-blocks')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blocks.map((block) => (
                            <tr key={block.name}>
                                <td>
                                    <span className="zen-blocks-admin-block-title">{block.title || block.name}</span>
                                    {block.isExample && (
                                        <span className="zen-blocks-admin-block-badge example">
                                            {__('Example', 'zen-blocks')}
                                        </span>
                                    )}
                                </td>
                                <td>{block.description || '-'}</td>
                                <td>
                                    <Button
                                        variant="secondary"
                                        href={`admin.php?page=zen-blocks-settings&block=${block.name}&_wpnonce=${window.zenBlocksConfig.blockEditNonce}`}
                                    >
                                        {__('Configure', 'zen-blocks')}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {blocks.length === 0 && (
                            <tr>
                                <td colSpan="3">
                                    {__('No blocks found.', 'zen-blocks')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
