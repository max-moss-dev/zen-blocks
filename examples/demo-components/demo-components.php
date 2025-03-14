<div class="demo-components-block layout-<?php echo esc_attr($layout); ?>">
    <div class="demo-header">
        <h2 zen-edit="header_title">Demo Components Block</h2>
        <div zen-edit="header_description" zen-type="wysiwyg">
            <p>This block demonstrates all available editable components in Zen Blocks.</p>
        </div>
    </div>

    <div class="demo-section text-section">
        <h3>Text Field Demo</h3>
        <p zen-edit="simple_text">This is a simple text field that can be edited.</p>
    </div>

    <div class="demo-section wysiwyg-section">
        <h3>WYSIWYG Field Demo</h3>
        <div zen-edit="rich_content" zen-type="wysiwyg">
            <p>This is a <strong>WYSIWYG</strong> field with <em>rich formatting</em> options.</p>
            <ul>
                <li>List item 1</li>
                <li>List item 2</li>
            </ul>
        </div>
    </div>

    <div class="demo-section image-section">
        <h3>Image Field Demo</h3>
        <div class="image-container">
            <img zen-edit="demo_image" zen-type="image" src="" alt="Demo image" />
        </div>
    </div>

    <div class="demo-section link-section">
        <h3>Link Field Demo</h3>
        <a zen-edit="demo_link" zen-type="link" class="demo-button">
            <span zen-edit="button_text">Click Me</span>
        </a>
    </div>

    <div class="demo-section repeater-section">
        <h3>Repeater Field Demo</h3>
        <div class="feature-items" zen-repeater="features">
            <div class="feature-item">
                <h4 zen-edit="feature_title">Feature Title</h4>
                <p zen-edit="feature_description">Feature description goes here.</p>
                <img zen-edit="feature_icon" zen-type="image" src="" alt="Feature icon" />
            </div>
        </div>
    </div>

    <div class="demo-section innerblocks-section">
        <h3>InnerBlocks Field Demo</h3>
        <div zen-edit="inner_content" zen-type="innerblocks" class="inner-blocks-container">
            <p>Add any Gutenberg blocks here...</p>
        </div>
    </div>

    <?php if ($show_advanced): ?>
    <div class="demo-section advanced-section">
        <h3>Advanced Options Demo</h3>
        <div class="color-demo" style="background-color: <?php echo esc_attr($background_color); ?>">
            <p>Background color control demo</p>
        </div>
        
        <div class="columns-demo columns-<?php echo esc_attr($columns_count); ?>">
            <?php for ($i = 1; $i <= $columns_count; $i++): ?>
            <div class="column">Column <?php echo $i; ?></div>
            <?php endfor; ?>
        </div>
    </div>
    <?php endif; ?>
</div>