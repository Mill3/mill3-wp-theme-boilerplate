/*

──────────────────────────────────────────
──────────────────────────────────────────
WHEEL
──────────────────────────────────────────
──────────────────────────────────────────

const wt = new Wheel(cb);
      wt.on();  // start listening to mouse wheel events
      wt.off(); // stop listening to mouse wheel events

function cb(delta, event) {
  // do something
}

*/
import Browser from "./browser";
import { on, off } from "./listener";

const Wheel = cb => {
  let tick = false,
    event,
    delta;

  // PRIVATE API
  const gRaf = e => {
    event = e;

    if (event.cancelable) event.preventDefault();
    if (!tick) {
      requestAnimationFrame(_run);
      tick = true;
    }
  };
  const onWheel = () => {
    delta = event.wheelDeltaY || event.deltaY * -1;

    // deltamode === 1 -> wheel mouse, not touch pad
    // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
    if (Browser.firefox() && event.deltaMode === 1) delta *= 120;

    getCb();
  };
  const onMouseWheel = () => {
    delta = event.wheelDeltaY ? event.wheelDeltaY : event.wheelDelta;
    getCb();
  };
  const getCb = () => {
    cb(delta, event);
    tick = false;
  };

  // PUBLIC API
  const _on = () => {
    on(document, "mouseWheel", gRaf);
  };
  const _off = () => {
    off(document, "mouseWheel", gRaf);
  };
  const _run = () => {
    if (!event) return;
    const eType = event.type;

    if (eType === "wheel") onWheel();
    else if (eType === "mousewheel") onMouseWheel();
  };

  const ctx = {
    on: _on,
    off: _off
  };

  return ctx;
};

export default Wheel;
