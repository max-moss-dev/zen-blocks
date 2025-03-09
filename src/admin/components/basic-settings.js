/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { 
    TextControl,
    TextareaControl,
    SelectControl,
    Button,
    Modal,
    SearchControl,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { Icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */

// List of WordPress Dashicons
const dashicons = [
    'admin-appearance',
    'admin-collapse',
    'admin-comments',
    'admin-customizer',
    'admin-generic',
    'admin-home',
    'admin-links',
    'admin-media',
    'admin-multisite',
    'admin-network',
    'admin-page',
    'admin-plugins',
    'admin-post',
    'admin-settings',
    'admin-site',
    'admin-tools',
    'admin-users',
    'album',
    'align-center',
    'align-left',
    'align-none',
    'align-right',
    'analytics',
    'archive',
    'arrow-down',
    'arrow-left',
    'arrow-right',
    'arrow-up',
    'art',
    'awards',
    'backup',
    'book',
    'calendar',
    'camera',
    'cart',
    'category',
    'chart-area',
    'chart-bar',
    'chart-line',
    'chart-pie',
    'clipboard',
    'clock',
    'cloud',
    'code-standards',
    'color-picker',
    'controls-back',
    'controls-forward',
    'controls-pause',
    'controls-play',
    'controls-repeat',
    'controls-skipback',
    'controls-skipforward',
    'controls-volumeoff',
    'controls-volumeon',
    'dashboard',
    'desktop',
    'dismiss',
    'download',
    'edit',
    'editor-aligncenter',
    'editor-alignleft',
    'editor-alignright',
    'editor-bold',
    'editor-break',
    'editor-code',
    'editor-contract',
    'editor-customchar',
    'editor-expand',
    'editor-help',
    'editor-indent',
    'editor-italic',
    'editor-justify',
    'editor-kitchensink',
    'editor-ltr',
    'editor-ol',
    'editor-outdent',
    'editor-paragraph',
    'editor-paste-text',
    'editor-paste-word',
    'editor-quote',
    'editor-removeformatting',
    'editor-rtl',
    'editor-spellcheck',
    'editor-strikethrough',
    'editor-table',
    'editor-textcolor',
    'editor-ul',
    'editor-underline',
    'editor-unlink',
    'editor-video',
    'email',
    'email-alt',
    'excerpt-view',
    'external',
    'facebook',
    'facebook-alt',
    'feedback',
    'filter',
    'flag',
    'format-aside',
    'format-audio',
    'format-chat',
    'format-gallery',
    'format-image',
    'format-quote',
    'format-status',
    'format-video',
    'forms',
    'googleplus',
    'grid-view',
    'groups',
    'hammer',
    'heart',
    'hidden',
    'id',
    'id-alt',
    'image-crop',
    'image-filter',
    'image-flip-horizontal',
    'image-flip-vertical',
    'image-rotate',
    'image-rotate-left',
    'image-rotate-right',
    'images-alt',
    'images-alt2',
    'index-card',
    'info',
    'leftright',
    'lightbulb',
    'list-view',
    'location',
    'location-alt',
    'lock',
    'marker',
    'media-archive',
    'media-audio',
    'media-code',
    'media-default',
    'media-document',
    'media-interactive',
    'media-spreadsheet',
    'media-text',
    'media-video',
    'megaphone',
    'menu',
    'microphone',
    'migrate',
    'minus',
    'money',
    'move',
    'nametag',
    'networking',
    'no',
    'no-alt',
    'palmtree',
    'performance',
    'phone',
    'playlist-audio',
    'playlist-video',
    'plus',
    'plus-alt',
    'portfolio',
    'post-status',
    'post-trash',
    'pressthis',
    'products',
    'randomize',
    'redo',
    'rss',
    'schedule',
    'screenoptions',
    'search',
    'share',
    'share-alt',
    'share-alt2',
    'shield',
    'shield-alt',
    'slides',
    'smartphone',
    'smiley',
    'sort',
    'sos',
    'star-empty',
    'star-filled',
    'star-half',
    'sticky',
    'store',
    'tablet',
    'tag',
    'tagcloud',
    'testimonial',
    'text',
    'thumbs-down',
    'thumbs-up',
    'translation',
    'trash',
    'twitter',
    'undo',
    'universal-access',
    'universal-access-alt',
    'unlock',
    'update',
    'upload',
    'vault',
    'video-alt',
    'video-alt2',
    'video-alt3',
    'visibility',
    'warning',
    'welcome-add-page',
    'welcome-comments',
    'welcome-learn-more',
    'welcome-view-site',
    'welcome-widgets-menus',
    'welcome-write-blog',
    'wordpress',
    'wordpress-alt',
    'yes'
];

const IconPicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(value);

    const filteredIcons = dashicons.filter(icon => 
        icon.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (icon) => {
        onChange(icon);
        setSelectedIcon(icon);
        setIsOpen(false);
    };

    return (
        <div className="icon-picker">
            <div className="icon-picker__button-container">
                <Button
                    className="icon-picker__button"
                    variant="secondary"
                    onClick={() => setIsOpen(true)}
                >
                    {value ? (
                        <>
                            <span className={`dashicons dashicons-${value}`} />
                            {value}
                        </>
                    ) : __('Select Icon', 'zen-blocks')}
                </Button>
            </div>

            {isOpen && (
                <Modal
                    title={__('Select Icon', 'zen-blocks')}
                    onRequestClose={() => setIsOpen(false)}
                    className="zen-blocks-icon-modal"
                >
                    <div className="icon-picker__search">
                        <SearchControl
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder={__('Search icons...', 'zen-blocks')}
                        />
                    </div>
                    <div className="icon-picker__grid">
                        {filteredIcons.map(icon => (
                            <Button
                                key={icon}
                                className={`icon-picker__item ${selectedIcon === icon ? 'is-selected' : ''}`}
                                onClick={() => handleSelect(icon)}
                            >
                                <span className={`dashicons dashicons-${icon}`} />
                                <span className="icon-picker__item-name">{icon}</span>
                            </Button>
                        ))}
                    </div>
                </Modal>
            )}
        </div>
    );
};

const BasicSettings = ({ settings, onChange }) => {
    const [keywordsInput, setKeywordsInput] = useState('');

    useEffect(() => {
        if (Array.isArray(settings.keywords)) {
            setKeywordsInput(settings.keywords.join(', '));
        }
    }, [settings.keywords]);

    const handleKeywordsChange = (value) => {
        setKeywordsInput(value);
    };

    const handleKeywordsBlur = () => {
        const keywords = keywordsInput.split(',').map(k => k.trim()).filter(Boolean);
        onChange('keywords', keywords);
    };

    return (
        <>
            <TextControl
                label={__('Title', 'zen-blocks')}
                value={settings.title}
                onChange={(value) => onChange('title', value)}
                __nextHasNoMarginBottom={false}
            />
            <TextareaControl
                label={__('Description', 'zen-blocks')}
                value={settings.description}
                onChange={(value) => onChange('description', value)}
                rows={2}
                __nextHasNoMarginBottom={false}
            />
            <TextControl
                label={__('Keywords', 'zen-blocks')}
                help={__('Type keywords separated by commas', 'zen-blocks')}
                value={keywordsInput}
                onChange={handleKeywordsChange}
                onBlur={handleKeywordsBlur}
                __nextHasNoMarginBottom={false}
            />
            <div className="icon-field">
                <label className="components-base-control__label icon-picker__label">
                    {__('Icon', 'zen-blocks')}
                </label>
                <IconPicker
                    value={settings.icon}
                    onChange={(value) => onChange('icon', value)}
                />
                <p className="icon-picker__help">
                    {__('Select a Dashicon for your block', 'zen-blocks')}
                </p>
            </div>
            <SelectControl
                label={__('Category', 'zen-blocks')}
                value={settings.category}
                options={[
                    { label: __('Zen Blocks', 'zen-blocks'), value: 'zen-blocks' },
                    { label: __('Widgets', 'zen-blocks'), value: 'widgets' },
                    { label: __('Text', 'zen-blocks'), value: 'text' },
                    { label: __('Media', 'zen-blocks'), value: 'media' },
                    { label: __('Design', 'zen-blocks'), value: 'design' }
                ]}
                onChange={(value) => onChange('category', value)}
                __nextHasNoMarginBottom={false}
            />
        </>
    );
};

export default BasicSettings;
