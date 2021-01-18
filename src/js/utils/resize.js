/*

──────────────────────────────────────────
──────────────────────────────────────────
RESIZE & ORIENTATION
──────────────────────────────────────────
──────────────────────────────────────────

const ro = new ResizeOrientation(resize, 100, true);

ro.on();  // start listening to window's resize & orientation change events
ro.off(); // stop listening to window's resize & orientation change events
ro.run(); // execute object callback

function resize(event) {
  // do something
}

*/

import { on, off } from "./listener";
import Throttle from "./throttle";

const ResizeOrientation = (cb, delay = 200, onlyAtEnd = false) => {
  // PRIVATE API
  const gRaf = () => {
    if (!tick) {
      requestAnimationFrame(_run);
      tick = true;
    }
  };
  const getThrottle = (e) => {
    event = e;
    throttle.init();
  };

  let tick, event;
  const throttle = new Throttle({
    cb: gRaf,
    delay,
    onlyAtEnd
  });

  // PUBLIC API
  const _on = () => {
    on(window, "orientationchange", getThrottle);
    on(window, "resize", getThrottle);
  };
  const _off = () => {
    off(window, "orientationchange", getThrottle);
    off(window, "resize", getThrottle);
  };
  const _run = () => {
    cb(event);
    tick = false;
  };
  const _dispose = () => {
    throttle.dispose();
    tick = true;
  };

  const ctx = {
    dispose: _dispose,
    on: _on,
    off: _off,
    run: _run
  };

  return ctx;
};

export default ResizeOrientation;
