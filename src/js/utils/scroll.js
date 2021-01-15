/*

──────────────────────────────────────────
──────────────────────────────────────────
SCROLL
──────────────────────────────────────────
──────────────────────────────────────────

const scroll = new Scroll(scrollCb);
      scroll.on();  // start listening to window's scroll event
      scroll.off(); // stop listening to window's scroll event
      scroll.run(); // execute object callback

function scrollCb(currentScrollY, delta, event) {
  // do something
}

*/
import { on, off } from "./listener";

const Scroll = (cb) => {
  let tick = false,
    startScrollY = 0,
    event;

  // PRIVATE API
  const gRaf = (e) => {
    event = e;

    if (!tick) {
      requestAnimationFrame(_run);
      tick = true;
    }
  };

  // PUBLIC API
  const _on = () => {
    startScrollY = pageYOffset;
    on(window, "scroll", gRaf);
  };
  const _off = () => {
    off(window, "scroll", gRaf);
  };
  const _run = () => {
    const currentScrollY = pageYOffset,
      delta = -(currentScrollY - startScrollY);

    // Reset start scroll y
    startScrollY = currentScrollY;

    cb(currentScrollY, delta, event);
    tick = false;
  };

  const ctx = {
    on: _on,
    off: _off,
    run: _run,
  };

  return ctx;
};

export default Scroll;
