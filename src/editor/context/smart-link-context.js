import { createContext } from '@wordpress/element';

export const SmartLinkContext = createContext({
    linkValue: { url: '', opensInNewTab: false },
    setLinkValue: () => {}
}); 