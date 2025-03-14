# Zen Blocks

A WordPress plugin for creating Gutenberg blocks using HTML/PHP templates.

## How to create a custom block

1. **Setup the directory structure**:
   - After activating the plugin, create a `zen-blocks` folder in your theme directory
   - Inside this folder, create a subfolder for your block (e.g., `my-custom-block`)
   - The folder name will be used as the block's slug

2. **Create the template file**:
   - Create a PHP file with the same name as the folder (e.g., `my-custom-block/my-custom-block.php`)
   - Write your HTML/PHP template with special attributes for editable areas (see Requirements section below)
   - Add default content that will appear when the block is first inserted

3. **Configure your block (optional but recommended)**:
   - Create a JSON file with the same name (e.g., `my-custom-block/my-custom-block.json`)
   - Define block properties like title, icon, category, and custom controls
   - See the Block Configuration section below for details

4. **Add styles and scripts (optional)**:
   - Create CSS file with the same name (e.g., `my-custom-block/my-custom-block.css`)
   - Create JS file with the same name (e.g., `my-custom-block/my-custom-block.js`)
   - Style will be automatically enqueued in both editor and frontend, script only on frontend


## Requirements when creating a custom block

1. **Root element**:
   - Wrap all block content in a single parent element (e.g., `<div class="my-custom-block">...</div>`)  
   - This is required for React compatibility and proper block rendering

2. **Editable elements**:
   - Add the `zen-edit` attribute to any element that should be editable
   - Each `zen-edit` value must be unique within the block (e.g., `<h2 zen-edit="title">Default Title</h2>`)  
   - The content inside the element will be used as the default content
   - You can specify the editor type using `zen-type` attribute (e.g., `<div zen-edit="content" zen-type="wysiwyg">Default content</div>`)  
   - By default, `zen-type` is set to `text`

3. **File structure**:
   - Each block must have its own folder and PHP file with matching names
   - Optional files (all with the same base name):
     - `.json`: Block configuration
     - `.css`: Block styles
     - `.js`: Block scripts


## Example blocks

- [Demo Components](examples/demo-components/demo-components.php) - A comprehensive showcase of all available editable components
- [Custom card](examples/custom-card/custom-card.php) - A versatile card component with customizable layout and styling options
- [Greeting](examples/greeting/greeting.php) - A simple dynamic greeting block that displays the current user's name


## Template Example:

```php
<div class="dynamic-block">
    <?php if ($show_title): ?>
        <h2 zen-edit="title">Title</h2>
    <?php endif; ?>
    
    <div zen-repeater="items">
        <div class="item">
            <h3 zen-edit="item_title">Item</h3>
            <p zen-edit="item_text">Description</p>
        </div>
    </div>
</div>
```

## Editable Field Types

- `text` (default): Text editing with formatting
- `wysiwyg`: WYSIWYG editor for rich content
- `image`: Media library integration
- `link`: Link/button elements
- `repeater`: Repeatable content groups
- `innerblocks`: Nested Gutenberg blocks for rich content editing

## Control Types

Zen Blocks provides various control types for block settings:

- `text`: Simple text input field
- `select`: Dropdown selection with options
- `number`: Numeric input field
- `toggle`: Boolean on/off switch
- `image`: Image upload input
- `range`: Numeric slider with min/max values

## Block Configuration

Create a JSON file alongside your template with the same name (e.g., `my-block.php` and `my-block.json`):

```json
{
  "name": "zen-blocks/my-block",
  "title": "My Block",
  "category": "zen-blocks",
  "icon": "star",
  "description": "Block description",
  "keywords": ["example", "block"],
  "version": "1.0.0",
  "supports": {
    "html": true,
    "align": ["wide", "full"],
    "anchor": true,
    "customClassName": true
  },
  "zenb": {
    "controls": {
      "layout": {
        "type": "select",
        "label": "Layout",
        "default": "default",
        "options": [
          {
            "key": "default",
            "value": "Default Layout"
          },
          {
            "key": "alternate",
            "value": "Alternate Layout"
          }
        ]
      },
      "show_title": {
        "type": "toggle",
        "label": "Show Title",
        "default": true
      },
      "background_color": {
        "type": "color",
        "label": "Background Color",
        "default": "#ffffff"
      },
      "columns": {
        "type": "range",
        "label": "Columns",
        "default": 2,
        "min": 1,
        "max": 4,
        "step": 1
      }
    }
  }
}
```

## Block Supports

Zen Blocks supports all standard WordPress block JSON configurations including:

- Core features: customClassName, anchor, html
- Alignment options (align)
- Color settings (text, background, gradients)
- Typography controls (fontSize, lineHeight)
- Spacing options (margin, padding)
- Block styles

## Configuration

The plugin behavior can be customized using WordPress constants in your `wp-config.php`:

```php
// Disable example blocks registration (default: true)
define('ZENB_REGISTER_EXAMPLE_BLOCKS', false);

// Disable admin UI and block configuration interface (default: true)
define('ZENB_ADMIN_UI', false);
```

### ZENB_REGISTER_EXAMPLE_BLOCKS
Controls whether the plugin registers example blocks from its `examples` directory. Disable this in production if you're only using your own blocks.

### ZENB_ADMIN_UI
Controls the developer settings interface. When enabled:
- Provides block configuration interface in wp-admin

Disable this in production or when distributing to clients who shouldn't modify block settings.

## Template Location

Templates can be placed in:
- Theme: `wp-content/themes/your-theme/zen-blocks/`
- Plugin: Via `zenb_block_paths` filter