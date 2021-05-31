<?php

$context = Timber\Timber::get_context();
$context['post'] = get_row(true);
$context['is_preview'] = $is_preview;
$context['stylesheet'] = Mill3WP\Assets\Asset_File_path('acfPreview', 'css');
$context['js'] = Mill3WP\Assets\Asset_File_path('acfPreviewIframe', 'js');

$doc = Timber\Timber::compile("base-acf-preview.twig", $context);

?>
<iframe srcdoc="<?php echo htmlspecialchars($doc, ENT_QUOTES, 'UTF-8', false) ?>" width="100%" frameborder="0"></iframe>
