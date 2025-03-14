<?php
$classes = ['custom-card'];
$classes[] = 'layout-' . ($layout ?? 'stacked');
$classes[] = 'bg-' . ($background_color ?? 'white');
?>
<div class="<?php echo esc_attr(implode(' ', $classes)); ?>">
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
