<?php
$classes = ['custom-card'];
$classes[] = 'layout-' . ($layout ?? 'stacked');
$classes[] = 'bg-' . ($background_color ?? 'white');
?>
<div class="<?php echo esc_attr(implode(' ', $classes)); ?>">
    <?php if ($show_image): ?>
        <img zen-edit="image" zen-type="image" src="https://placehold.co/600x400/EEE/31343C" alt="" class="<?php echo esc_attr($image_style ?? 'square'); ?>">
    <?php endif; ?>
    <div class="content-wrapper">
        <h2 zen-edit="title">Custom Card Title</h2>
        <div zen-edit="content" zen-type="innerblocks">
            <p>This is a custom card block from our plugin...</p>
        </div>
        <?php if ($show_button && $template->has_value('button_text')): ?>
            <?php 
                $button_classes = ['custom-card-button'];
                $button_classes[] = 'style-' . ($button_style ?? 'primary');
            ?>
            <a zen-edit="button_url" zen-type="link" class="<?php echo esc_attr(implode(' ', $button_classes)); ?>">
                <span zen-edit="button_text" zen-type="text"></span>
            </a>
        <?php endif; ?>
    </div>
</div>
