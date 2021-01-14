/**
 * TEXT ANIMATION
 *
 * How to use:
 * Add data-module="text-animation" to your HTML element
 * Add data-text-animation="animation-name"
 * Add data-splitting to specify plugin to split text when calling Splitting(). (optional)
 *
 * Optionally add data-scroll and data-splitting="by" to your HTML element.
 * If you omit data-scroll, it will be inserted automatically.
 * If you omit data-splitting, it will be inserted automatically with "chars" value.
 * If you provide them, it will be faster for mobile device.
 *
 * Example:
 * <h2
 *  class="position-relative d-block w-100 vh-50"
 *  data-scroll
 *  data-module="text-animation"
 *  data-splitting="words"
 *  data-text-animation="my-awesome-animation"
 * >
 *  Hello World
 * </h2>
 *
 * Animation is powered by css and triggered by .is-inview class on your HTML element.
 */

import Splitting from "splitting";

import { $$ } from "@utils/dom";
import Module from "../module/Module";

const SELECTOR = "[data-text-animation]";
const DEFAULT_SPLITTING_PLUGIN = "chars";

class TextAnimation extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    init ? this.init() : null;
  }

  get name() {
    return "TextAnimation";
  }

  init() {
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => {
      if (!el.hasAttribute("data-scroll")) el.setAttribute("data-scroll", "");
      if (!el.hasAttribute("data-splitting")) el.setAttribute("data-splitting", DEFAULT_SPLITTING_PLUGIN);

      const plugin = el.dataset.splitting || DEFAULT_SPLITTING_PLUGIN;

      return new Splitting({
        target: el,
        by: plugin
      });
    });
  }
  destroy() {
    this.initialized = false;
    this.items = null;
  }
}

export const instance = new TextAnimation();

export default { instance };
