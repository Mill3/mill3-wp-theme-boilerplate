<?php

//
// inject our windowMessenger system only when url param is specified
//
function inject_windowMessenger() {
    if( !isset($_GET["windowMessenger"]) ) return;

    // if referer is not defined, it means the page is not included from a iFrame
    $referer = $_SERVER['HTTP_REFERER'];
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
        console.log(targetOrigin);
    
    
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
    
        // listen for message from parent window
        window.addEventListener("message", onMessage);
        
        // start cross window messaging when page is loaded
        addEventListener("load", start);
    })();
    
    <?php

    // inject our bridge communication system
    $js = ob_get_clean();
    wp_add_inline_script(WEBPACK_DEV_SERVER === true ? 'mill3wp/webpack' : 'mill3wp/js', $js, 'after');
}

add_action('wp_enqueue_scripts', 'inject_windowMessenger', 100);
