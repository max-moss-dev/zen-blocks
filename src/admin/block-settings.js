/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';
import { 
    Button,
    Card,
    CardHeader,
    CardBody,
    TabPanel,
    Notice,
    Spinner,
    Panel,
    PanelBody
} from '@wordpress/components';
import { plus } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

/**
 * Internal dependencies
 */
import { getControlAttributeConfig } from '../controls/utils';
import ControlEditor from './components/control-editor';
import ControlTypeModal from './components/control-type-modal';
import BasicSettings from './components/basic-settings';
import BlockSupports from './components/block-supports';

export default function BlockSettings() {
    const [settings, setSettings] = useState({
        title: '',
        description: '',
        icon: '',
        category: 'widgets',
        supports: {},
        attributes: {},
        styles: [],
        keywords: [],
        zenb: {
            jquery: false,
            controls: []
        }
    });
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [blockError, setBlockError] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isAddingControl, setIsAddingControl] = useState(false);
    const controlRefs = useRef([]);

    // Get block name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const blockName = urlParams.get('block');

    useEffect(() => {
        if (blockName) {
            loadSettings();
        }
    }, [blockName]);

    // Add reload warning when there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = __('You have unsaved changes. Are you sure you want to leave?', 'zen-blocks');
                return event.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Reset refs when controls change
    useEffect(() => {
        controlRefs.current = Array.isArray(settings.zenb.controls) ? settings.zenb.controls.map(() => null) : [];
    }, [settings.zenb.controls?.length]);

    const loadSettings = async () => {
        try {
            const response = await apiFetch({
                path: `/zen-blocks/v1/blocks/${blockName}/settings`
            });
            
            if (response) {
                // Convert controls from either location to zenb.controls array
                const controls = Array.isArray(response.zenb?.controls) ? response.zenb.controls :
                    (typeof response.zenb?.controls === 'object' ? 
                        Object.entries(response.zenb.controls).map(([name, control]) => ({
                            ...control,
                            name
                        })) : 
                        []
                    );

                const mappedControls = controls.map(control => {
                    const [, attributeConfig] = getControlAttributeConfig(control.name || '', control);
                    return {
                        ...control,
                        id: control.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        isOpen: false,
                        default: attributeConfig.type === 'number' ? Number(control.default) : control.default
                    };
                });

                setSettings({
                    ...response,
                    zenb: {
                        ...response.zenb,
                        controls: mappedControls
                    }
                });
            }
        } catch (error) {
            console.error('Error loading block settings:', error);
            setBlockError(true);
            setNotice({
                status: 'error',
                message: __('Failed to load block settings.', 'zen-blocks')
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettings = (newSettings) => {
        setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
        setIsDirty(true);
    };

    const handleControlChange = (index, updatedControl) => {
        const newControls = [...settings.zenb.controls];
        newControls[index] = updatedControl;
        updateSettings({ 
            zenb: {
                ...settings.zenb,
                controls: newControls
            }
        });
    };

    const handleControlRename = (index, oldName, newName) => {
        const trimmedNewName = (newName || '').trim();
        const trimmedOldName = (oldName || '').trim();
        
        if (trimmedOldName === trimmedNewName) return;

        const newControls = [...settings.zenb.controls];
        newControls[index] = {
            ...newControls[index],
            name: trimmedNewName
        };
        updateSettings({ 
            zenb: {
                ...settings.zenb,
                controls: newControls
            }
        });
    };

    const addControl = (type) => {
        const newControl = {
            id: Date.now().toString(),
            type,
            name: '',
            label: '',
            isOpen: true,
            options: type === 'select' ? [] : undefined
        };

        const newControls = [...settings.zenb.controls, newControl];
        updateSettings({ 
            zenb: {
                ...settings.zenb,
                controls: newControls
            }
        });
        setIsAddingControl(false);
    };

    const removeControl = (index) => {
        const newControls = settings.zenb.controls.filter((_, i) => i !== index);
        updateSettings({ 
            zenb: {
                ...settings.zenb,
                controls: newControls
            }
        });
    };

    const moveControl = (dragIndex, hoverIndex) => {
        const newControls = [...settings.zenb.controls];
        const dragControl = newControls[dragIndex];
        newControls.splice(dragIndex, 1);
        newControls.splice(hoverIndex, 0, dragControl);
        updateSettings({ 
            zenb: {
                ...settings.zenb,
                controls: newControls
            }
        });
    };

    const onDuplicate = (control) => {
        const newControl = {
            ...control,
            label: control.label + ' Copy',
            name: control.name + '_copy',
            isOpen: true
        };
        const newControls = [...settings.zenb.controls, newControl];
        updateSettings({ 
            zenb: {
                ...settings.zenb,
                controls: newControls
            }
        });
    }

    const handleSave = async () => {
        setIsSaving(true);
        setNotice(null);

        // Validate control names and labels
        const invalidControls = settings.zenb.controls.filter(control => 
            !control.name?.trim() || !control.label?.trim()
        );

        if (invalidControls.length > 0) {
            const missingFields = invalidControls.map(control => {
                const missing = [];
                if (!control.name?.trim()) missing.push('name');
                if (!control.label?.trim()) missing.push('label');
                return `${control.label || control.name || __('New Control', 'zen-blocks')}: ${missing.join(', ')}`;
            });

            setNotice({
                status: 'error',
                message: __('Please fill in all required fields: ', 'zen-blocks') + missingFields.join('; ')
            });
            setIsSaving(false);
            
            // Focus the first invalid control
            const invalidIndex = settings.zenb.controls.findIndex(control => 
                !control.name?.trim() || !control.label?.trim()
            );
            if (invalidIndex >= 0 && controlRefs.current[invalidIndex]) {
                controlRefs.current[invalidIndex].scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        try {
            // Convert controls array to object
            const controlsObject = settings.zenb.controls.reduce((acc, control) => {
                const name = control.name?.trim();
                if (name) {
                    acc[name] = { ...control };
                    delete acc[name].name;
                    delete acc[name].isOpen;
                }
                return acc;
            }, {});

            console.log(settings);

            const response = await apiFetch({
                path: `/zen-blocks/v1/blocks/${blockName}/settings`,
                method: 'POST',
                data: {
                    ...settings,
                    supports: {
                        ...settings.supports,
                    },
                    zenb: {
                        ...settings.zenb,
                        controls: controlsObject
                    }
                }
            });

            if (response) {
                setIsDirty(false);
                setNotice({
                    status: 'success',
                    message: __('Settings saved successfully.', 'zen-blocks')
                });
            }
        } catch (error) {
            console.error('Error saving block settings:', error);
            setNotice({
                status: 'error',
                message: __('Failed to save settings.', 'zen-blocks')
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!blockName) {
        return (
            <Notice status="error" isDismissible={false}>
                {__('No block specified.', 'zen-blocks')}
            </Notice>
        );
    }

    if (isLoading) {
        return <Spinner />;
    }

    if (blockError) {
        return (
            <Notice status="error" isDismissible={false}>
                {__('Block not found or invalid.', 'zen-blocks')}
            </Notice>
        );
    }

    // Inside the BlockSettings component's return statement, wrap the main content with DndProvider
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="zen-blocks-settings wrap">
                <div className="zen-blocks-settings-layout">
                    <div className="zen-blocks-settings-main">
                        {notice && (
                            <Notice
                                status={notice.status}
                                isDismissible={true}
                                onDismiss={() => setNotice(null)}
                            >
                                {notice.message}
                            </Notice>
                        )}
                        <TabPanel
                            className="zen-blocks-tab-panel"
                            tabs={[
                                {
                                    name: 'controls',
                                    title: __('Controls', 'zen-blocks'),
                                    className: 'zen-blocks-tab'
                                },
                                {
                                    name: 'styles',
                                    title: __('Features', 'zen-blocks'),
                                    className: 'zen-blocks-tab'
                                }
                            ]}
                        >
                            {(tab) => (
                                <div className="zen-blocks-tab-content">
                                    {tab.name === 'controls' && (
                                        <>
                                            {settings.zenb.controls.length === 0 ? (
                                                <div
                                                    className="zen-blocks-control-placeholder"
                                                    onClick={() => setIsAddingControl(true)}
                                                >
                                                    <Button
                                                        variant="tertiary"
                                                        icon={plus}
                                                        label={__('Add Control', 'zen-blocks')}
                                                        className="zen-blocks-control-actions-add"
                                                    >
                                                        {__('Add Control', 'zen-blocks')}
                                                    </Button>
                                                </div>
                                            ) : <>
                                                {settings.zenb.controls.map((control, index) => (
                                                    <ControlEditor
                                                        key={control.id}
                                                        ref={el => controlRefs.current[index] = el}
                                                        control={control}
                                                        controlName={control.name}
                                                        onChange={(updatedControl) => handleControlChange(index, updatedControl)}
                                                        onRemove={() => removeControl(index)}
                                                        onRename={(oldName, newName) => handleControlRename(index, oldName, newName)}
                                                        onDuplicate={() => onDuplicate(control)}
                                                        isFirst={index === 0}
                                                        isLast={index === settings.zenb.controls.length - 1}
                                                        index={index}
                                                        moveItem={(dragIndex, hoverIndex) => moveControl(dragIndex, hoverIndex)}
                                                    />
                                                ))}
                                                <div className="zen-blocks-control-actions">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => setIsAddingControl(true)}
                                                        icon={plus}
                                                        label={__('Add Control', 'zen-blocks')}
                                                        className="zen-blocks-control-actions-add"
                                                    >
                                                        {__('Add Control', 'zen-blocks')}
                                                    </Button>
                                                </div>
                                            </>}
                                        </>
                                    )}
                                    {tab.name === 'styles' && (
                                        <BlockSupports
                                            settings={settings}
                                            onChange={(key, value) => {
                                                const newSettings = { ...settings };
                                                const keys = key.split('.');
                                                let current = newSettings;
                                                for (let i = 0; i < keys.length - 1; i++) {
                                                    if (!current[keys[i]]) {
                                                        current[keys[i]] = {};
                                                    }
                                                    current = current[keys[i]];
                                                }
                                                current[keys[keys.length - 1]] = value;
                                                updateSettings(newSettings);
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </TabPanel>
                    </div>
    
                    <div className="zen-blocks-settings-sidebar">
                        <div className="zen-blocks-settings-header">
                            <h2>{settings.title || blockName}</h2>
                            <Button
                                isPrimary
                                onClick={handleSave}
                                isBusy={isSaving}
                                disabled={isSaving || !isDirty}
                            >
                                {isSaving ? __('Saving...', 'zen-blocks') : __('Save Changes', 'zen-blocks')}
                            </Button>
                        </div>
                        <PanelBody initialOpen={true}>
                            <BasicSettings
                                settings={settings}
                                onChange={(key, value) => {
                                    const newSettings = { ...settings };
                                    newSettings[key] = value;
                                    updateSettings(newSettings);
                                }}
                            />
                        </PanelBody>
                    </div>
                </div>
    
                {isAddingControl && (
                    <ControlTypeModal
                        onClose={() => setIsAddingControl(false)}
                        onSelect={addControl}
                    />
                )}
            </div>
        </DndProvider>
    );
}
