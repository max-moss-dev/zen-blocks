# Zen Blocks

A WordPress plugin for creating Gutenberg blocks using HTML/PHP templates.

## Example blocks

- [Simple](examples/simple/simple.php)
- [Example](examples/example/example.php)
- [Custom card](examples/custom-card/custom-card.php)
- [Features grid](examples/features/features.php)


## Template Types

### Static HTML
```html
<div class="my-block">
    <h2 zen-edit="title">Default Title</h2>
    <img zen-edit="image" zen-type="image" src="" alt="">
    <div zen-edit="content" zen-type="innerblocks">
        <!-- Content will be editable using Gutenberg blocks -->
    </div>
</div>
```

### Dynamic PHP
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
- `image`: Media library integration
- `button`: Link/button elements
- `repeater`: Repeatable content groups
- `innerblocks`: Nested Gutenberg blocks for rich content editing

## Block Configuration

Create a JSON file alongside your template:

```json
{
  "title": "My Block",
  "description": "Block description",
  "icon": "star",
  "controls": {
    "layout": {
      "type": "select",
      "label": "Layout",
      "options": {
        "left": "Left aligned",
        "right": "Right aligned"
      }
    },
    "show_title": {
      "type": "toggle",
      "label": "Show Title"
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

These work in both classic and block themes with appropriate CSS support.

Example:
```json
"supports": {
  "align": ["wide", "full"],
  "color": { "text": true, "background": true },
  "typography": { "fontSize": true },
  "customClassName": true
}
```

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