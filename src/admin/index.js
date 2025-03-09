/**
 * WordPress dependencies
 */
import { render } from '@wordpress/element';
import './styles/admin.scss';

/**
 * Internal dependencies
 */
import AdminPage from './admin-page';
import BlockSettings from './block-settings';

// Get the admin container element
const adminContainer = document.getElementById('zen-blocks-admin-root');
const settingsContainer = document.getElementById('zen-blocks-settings');

// Render the appropriate component based on which container exists
if (adminContainer) {
    render(<AdminPage />, adminContainer);
} else if (settingsContainer) {
    render(<BlockSettings />, settingsContainer);
}
