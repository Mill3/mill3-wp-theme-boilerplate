<?php

// inject in <head> polylang current language
function hook_inject_current_language() {

    // stop here if Polylang is not instlled
    if ( ! function_exists('pll_current_language') ) return $head;

    ?>
    <script type="text/javascript">
        window.LOCALE = "<?= pll_current_language() ?>";
        window.CURRENT_SITE = "<?= get_site_url() ?>";
    </script>
    <?php
}

add_action('wp_head', 'hook_inject_current_language');
