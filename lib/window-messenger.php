<?php

//
// inject our windowMessenger system only when url param is specified
//
function inject_windowMessenger(): void {
    if( !isset($_GET["windowMessenger"]) ) return;

    $referer = $_SERVER['HTTP_REFERER'];

    // save cookie with "wordpress" prefix to prevent caching in WPEngine
    setcookie('wordpress_window_messenger_cache_buster', $referer);

    // if referer is not defined, it means the page is not included from a iFrame
    if( !$referer ) return;

    // remove last / from referer
    $referer = rtrim($referer, '/');

    // if referer isn't localhost, force to mill3.studio
    if( !str_starts_with($referer, 'http://localhost') ) $referer = "https://mill3.studio";

    // hide Locomotive-scroll custom scrollbar
    wp_add_inline_style('mill3wp/css', '.c-scrollbar { visibility: hidden !important; }');

    // javascript
    ob_start();
    ?>

    // old school sandbox
    (function() {
        // if page is not embedded as a iframe, stop here
        if( window === parent ) return;

        var targetOrigin = "<?php echo $referer ?>";
        var tick = null;

        function start() {
            // send scroll maximum value
            parent.postMessage({action: "ready", value: Math.max(0, document.body.scrollHeight - innerHeight)}, targetOrigin);
        }
        function onMessage(event) {
            // sample for limiting event origin domain, leave as is for now
            if( event.origin !== targetOrigin ) return;

            var data = event.data;
            if( !data ) return;

            var action = data.action;
            var value = data.value;

            if( !action ) return;

            switch(action) {
                case "scrollTo":
                    // Emit to SiteScroll a new scroll value, unless the value is the same
                    // - `smooth` param is for Mill3\'s SiteScroll
                    // - `disableLerp` & `duration` params are for Locomotive Scroll
                    if( window._emitter ) window._emitter.emit("SiteScroll.scrollTo", value, { smooth: false, duration: 0, disableLerp: true });

                break;
            }
        }
        function onResize() {
            if( tick ) clearTimeout(tick);

            // wait 300ms after last resize event to update scrollMax
            tick = setTimeout(function() {
                // send scroll maximum value
                parent.postMessage({action: "resized", value: Math.max(0, document.body.scrollHeight - innerHeight)}, targetOrigin);
            }, 300);
        }

        // listen for message from parent window
        window.addEventListener("message", onMessage);
        window.addEventListener("resize", onResize);

        // start cross window messaging when page is loaded
        addEventListener("load", start);
    })();

    <?php

    // inject our bridge communication system
    $js = ob_get_clean();
    wp_add_inline_script(WEBPACK_DEV_SERVER === true ? 'mill3wp/webpack' : 'mill3wp/js', $js, 'after');
}

add_action('wp_enqueue_scripts', 'inject_windowMessenger', 100);
