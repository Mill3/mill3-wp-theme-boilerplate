<?php

// inject in <head> polylang current language
function hook_inject_current_language($head) {

    // stop here if Polylang is not instlled
    if ( ! function_exists('pll_current_language') ) return $head;

    $current_language = pll_current_language();

    ?>
        <script type="text/javascript">
          window.LOCALE = "<?= $current_language ?>";
        </script>
    <?php

    return $head;
}

add_action('wp_head', 'hook_inject_current_language');

//
// inject in footer our windowMessenger system only when url param is specified
//
function hook_inject_windowMessenger() {
    if( !isset($_GET["windowMessenger"]) ) return;
    include_once 'window-messenger.php';
}

add_action('wp_footer', 'hook_inject_windowMessenger');
