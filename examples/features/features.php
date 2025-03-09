<div class="features-block columns-<?php echo esc_attr($columns); ?> spacing-<?php echo esc_attr($spacing); ?>">
    <div class="features-grid" zen-repeater="features">
        <div class="feature">
            <div class="image-wrapper style-<?php echo esc_attr($image_style); ?>">
                <img zen-edit="image" zen-type="image" />
            </div>
            <h3 zen-edit="title">Feature Title</h3>
            <div zen-edit="text" zen-type="wysiwyg">
                <p>Feature description</p>
            </div>
        </div>
    </div>
</div> 