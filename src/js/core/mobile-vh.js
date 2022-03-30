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
 *    height: calc(var(--vh) * 100); // dynamic viewport height
 *    height: calc(var(--lvh) * 100); // large viewport height (without UA Interfaces)
 *    height: calc(var(--svh) * 100); // small viewport height (with UA Interfaces)
 * }
 *
 */

const MobileViewportUnit = (() => {
  let lvh = 0;
  let svh = 0;
  let vh = 0;

  const onResize = () => {
    vh = Viewport.height * 0.01;
    
    // set svh (short viewport height)
    if( !svh ) svh = vh;

    // update lvh (long viewport height) if smaller than viewport height
    if( lvh < vh ) lvh = vh;

    html.style.setProperty("--vh", `${vh}px`);
    html.style.setProperty("--lvh", `${lvh}px`);
    html.style.setProperty("--svh", `${svh}px`);
  };
  const onOrientationChange = () => {
    lvh = 0;
    svh = 0;
  };

  const ctx = {
    init: () => {
      onResize();

      on(window, "orientationchange", onOrientationChange);
      on(window, "resize", onResize);
    }
  };

  return ctx;
})();

export default MobileViewportUnit;
