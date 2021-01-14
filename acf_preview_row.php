<?php

$context = Timber\Timber::get_context();
$context['post'] = get_row(true);
$context['is_preview'] = $is_preview;

$template = "page-builder/{$context['post']['acf_fc_layout']}.twig";

$options = get_fields('options');

// inject brand style as CSS variables
?>
<style type="text/css">
    /* theme colors CSS variables */
    :root {
        --brand-color-primary: <?php echo $options['brand_color_primary'] ?>;
        --brand-color-secondary: <?php echo $options['brand_color_secondary'] ?>;
    }
</style>
<?php

Timber\Timber::render($template, $context);