import { html } from "../utils/dom";
import { on } from "../utils/listener";
import Viewport from "../utils/viewport";

/**
 * Fix VH calculation issue in iOS Safari when scroll is at the top
 *
 * How to use :
 *
 * Init in main application and add the following to a selector
 *
 * .selector {
 *    height: calc(var(--vh) * 100);
 * }
 *
 */

const MobileViewportUnit = (() => {
  const onResize = () => {
    html.style.setProperty("--vh", `${Viewport.height * 0.01}px`);
  };

  const ctx = {
    init: () => {
      onResize();
      on(window, "orientationchange", onResize);
    }
  };

  return ctx;
})();

export default MobileViewportUnit;
