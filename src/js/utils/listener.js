/*

──────────────────────────────────────────
──────────────────────────────────────────
Listener
──────────────────────────────────────────
──────────────────────────────────────────

- element: DOM node or CSS selector
- type: Event type (click, mouseover, touchstart, etc..)
- callback: Function

on(element, type, callback);
off(element, type, callback);
once(element, type, callback);

*/

import Browser from "./browser";
import { isUndefined } from "./is";
import { $$ } from "./dom";

const PASSIVE_EVENTS = ["touchmove", "mousemove", "scroll", "mouseWheel", "touchstart", "deviceorientation"];

const getOptions = (type) => (PASSIVE_EVENTS.indexOf(type) === -1 ? false : { passive: false });
const normalizeEventType = (type) => {
  if (type === "mouseWheel") {
    return "onwheel" in document ? "wheel" : !isUndefined(document.onmousewheel) ? "mousewheel" : "DOMMouseScroll";
  } else if (type === "focusOut") {
    return Browser.firefox() ? "blur" : "focusout";
  }

  return type;
};

const listen = (el, action, type, callback, options = {}) => {
  const els = $$(el);
  const t = normalizeEventType(type);
  const o = Object.assign(options, getOptions(type));

  for (let i = 0, n = els.length; i < n; i++) {
    els[i][`${action}EventListener`](t, callback, o);
  }
};

export const on = (el, type, callback, options) => {
  listen(el, "add", type, callback, options);
};

export const off = (el, type, callback, options) => {
  listen(el, "remove", type, callback, options);
};

export const once = (el, type, callback, options) => {
  const cb = (e) => {
    const t = e.currentTarget;

    off(t, type, cb, options);
    callback.call(t, arguments);
  };

  listen(el, "add", type, cb, options);
};

export const trigger = (el, type) => {
  const els = $$(el);
  const t = normalizeEventType(type);

  for (let i = 0, n = els.length; i < n; i++) {
    els[i].dispatchEvent(new Event(t));
  }
};

export default { on, off, once, trigger };
