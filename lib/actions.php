<?php

// inject in <head> polylang current language
function hook_inject_current_language($head) {

    if ( ! function_exists('pll_current_language')) return;

    $current_language = pll_current_language();

    ?>
        <script type="text/javascript">
          window.LOCALE = "<?= $current_language ?>";
        </script>
    <?php

    return $head;
}

add_action('wp_head', 'hook_inject_current_language');
