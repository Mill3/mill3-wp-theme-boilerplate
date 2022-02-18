/*

──────────────────────────────────────────
──────────────────────────────────────────
WHEEL & TOUCH
──────────────────────────────────────────
──────────────────────────────────────────

const wt = WheelTouch(wtCb);
      wt.on();  // start listening to mouse wheel & touch move events
      wt.off(); // stop listening to mouse wheel & touch move events

function wtCb(delta, type, event) {
  // do something
}

type → 'scroll' or 'touch'

*/
import Browser from "./browser";
import { on, off } from "./listener";

const WheelTouch = (cb) => {
  let tick = false,
    event,
    type,
    delta,
    startY;

  // PRIVATE API
  const gRaf = (e) => {
    event = e;

    if (event.cancelable && event.type !== "touchend") event.preventDefault();
    if (!tick) {
      requestAnimationFrame(_run);
      tick = true;
    }
  };
  const onWheel = () => {
    type = "scroll";
    delta = event.wheelDeltaY || event.deltaY * -1;

    // deltamode === 1 -> wheel mouse, not touch pad
    // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
    if (Browser.firefox() && event.deltaMode === 1) delta *= 120;

    getCb();
  };
  const onMouseWheel = () => {
    type = "scroll";
    delta = event.wheelDeltaY ? event.wheelDeltaY : event.wheelDelta;

    getCb();
  };
  const onTouchStart = (e) => {
    startY = e.targetTouches[0].pageY;
    delta = 0;
  };
  const onTouchMove = () => {
    const y = event.targetTouches[0].pageY;

    type = "touch";
    delta = y - startY;
    startY = y;

    getCb();
  };
  const onTouchEnd = () => {
    type = "touch";
    delta = 0;

    getCb();
  };
  const getCb = () => {
    cb(delta, type, event);
    tick = false;
  };

  // PUBLIC API
  const _on = () => {
    on(document, "mouseWheel", gRaf);
    on(document, "touchstart", onTouchStart);
    on(document, "touchmove", gRaf);
    on(document, "touchend", gRaf, { passive: true });
  };
  const _off = () => {
    off(document, "mouseWheel", gRaf);
    off(document, "touchstart", onTouchStart);
    off(document, "touchmove", gRaf);
    off(document, "touchend", gRaf, { passive: true });
  };
  const _run = () => {
    if (!event) return;
    const eType = event.type;

    if (eType === "wheel") onWheel();
    else if (eType === "mousewheel") onMouseWheel();
    else if (eType === "touchmove") onTouchMove();
    else if (eType === "touchend") onTouchEnd();
  };

  const ctx = {
    on: _on,
    off: _off
  };

  return ctx;
};

export default WheelTouch;
