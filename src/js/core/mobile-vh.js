import { html } from "@utils/dom";
import { on } from "@utils/listener";
import Viewport from "@utils/viewport";

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
