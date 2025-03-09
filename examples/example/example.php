<div class="example-block layout-<?php echo esc_attr($layout); ?>">
    <div class="content">
        <?php if ($show_title): ?>
            <div class="example-block-titles" zen-repeater="titles">
                <h2 zen-edit="title1">Welcome</h2>
            </div>
        <?php endif; ?>
    
        <div zen-edit="content" zen-type="innerblocks" class="content-text">
            <p>Example content goes here...</p>
        </div>

        <div class="example-block-buttons" zen-repeater="buttons">
            <a zen-edit="button_url" zen-type="link" class="example-block-button">
                <span zen-edit="button_text">Learn More</span>
            </a>
        </div>
    </div>

    <img zen-edit="image" zen-type="image" />
</div>