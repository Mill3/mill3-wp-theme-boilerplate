<script>

/**
 *
 * global handler for window.postMessage() browser messaging system
 *
 * Use case :
 *
 * Remote site aaa.com has an iframe including this site, remote site wants to send a message here :
 *
 * const frame = document.querySelector('#iframe');
 * frame.contentWindow.postMessage({ 'action': 'scrollTo', 'value': 100 }, "*")
 *
 * This site receives the message and act on it. Message must include 2 objects: action, value
 *
 * Implement below any possible message handling beyond the default use case presented here
 *
 */

class windowMessenger {
  constructor() {
    this._ready = false;
    this._messageHandler = this._messageHandler.bind(this);
    this.init();
  }

  init() {
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener("message", this._messageHandler, false);
  }

  start() {
    this._ready = true;
    console.warn(`windowMessenger is ready, this page can receive postMessage event!`);
  }

  _messageHandler(event) {
    const { action, value } = event.data;

    // sample for limiting event origin domain, leave as is for now
    // if (event.origin !== "http://mill3.studio/") return;

    // stop here if no action or value are defined in event
    if (!action || !value) return;

    // stop here if we have no Emitter
    if(!window.MILL3_EMITTER) {
      console.warn(`MILL3_EMITTER not detected, windowMessenger instance can't continue :(`);
      return;
    }

    switch (action) {
      //
      // handles : `scrollTo` message event
      // return  : current scrollY and window maxScroll value through a 'callback' postMessage send back to original event.source window
      //
      case "scrollTo":
        // block any calls until windmill is ready
        if(!SINGLETON._ready) return;

        // emit to SiteScroll a new scroll value, unless the value is the same
        if(window.scrollY !== value) MILL3_EMITTER.emit("SiteScroll.scrollTo", value, { smooth: false });

        // stop here if even has no source
        if(!event.source) return;

        // send back a message to event.source (might be silent on the other end)
        event.source.postMessage(
          {
            action: "scrollUpdate",
            value: {
              scrollY: window.scrollY,
              scrollYMax: Math.max(0, document.body.scrollHeight - innerHeight)
            }
          },
          "*"
        );
        break;
    }
  }
}

const SINGLETON = new windowMessenger();

addEventListener('DOMContentLoaded', (event) => {
    SINGLETON.start();
});

</script>

<style>
/* hide Locomotive-scroll custom scroll-bar element */
.c-scrollbar { visibility: hidden !important; }
</style>
