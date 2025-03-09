import { registerImageField } from './image/image-field';
import { registerLinkField } from './link/link-field';
import { registerTextField } from './text/text-field';
import { registerRepeaterField } from './repeater/repeater-field';
import { registerInnerBlocksField } from './innerblocks/innerblocks-field';
import { registerWYSIWYGField } from './wysiwyg/wysiwyg-field';

export const fieldTypes = {
    image: registerImageField(),
    link: registerLinkField(),
    text: registerTextField(),
    repeater: registerRepeaterField(),
    innerblocks: registerInnerBlocksField(),
    wysiwyg: registerWYSIWYGField()
}; 