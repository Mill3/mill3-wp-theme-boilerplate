/*

──────────────────────────────────────────
──────────────────────────────────────────
MOUSEMOVE
──────────────────────────────────────────
──────────────────────────────────────────

►►►  element is optional

var mm = new MouseMove({
    element: '#element' (CSS selector OR DOM node),
    cb: mmCb
    type: null || 'touchmove' || 'mousemove'
});

mm.on();  // start listening to mousemove event
mm.off(); // stop listening to mousemove event
mm.run(); // execute object callback

function mmCb(posX, posY, event) {
  // do something
}

*/
import { on, off } from "./listener";
import { $ } from "./dom";
import { mobile } from "./mobile";

const EVENT_TYPE = mobile ? "touchmove" : "mousemove";

const MouseMove = options => {
  const el = $(options.element) || document;
  const cb = options.cb;
  const event_type = options.type || EVENT_TYPE;

  let tick, event;

  // PRIVATE API
  const gRaf = e => {
    event = e;
    if (event.cancelable) event.preventDefault();

    if (!tick) {
      requestAnimationFrame(_run);
      tick = true;
    }
  };

  // PUBLIC API
  const _on = () => {
    on(el, event_type, gRaf);
  };
  const _off = () => {
    off(el, event_type, gRaf);
  };
  const _run = () => {
    if (mobile && event.type === "mousemove") {
      tick = false;
      return;
    }

    const t = mobile ? event.changedTouches[0] : event;

    cb(t["pageX"], t["pageY"], event);
    tick = false;
  };

  const ctx = {
    on: _on,
    off: _off,
    run: _run
  };

  return ctx;
};

export default MouseMove;
