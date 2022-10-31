import { getOffset } from "@scroll/utils";
import { $$, rect } from "@utils/dom";
import Viewport from "@utils/viewport";

export const inViewport = (el) => {
  if (!el) return false;

  const bcr = rect(el);
  const offset = getOffset(el) ?? [0, 0];

  const top = bcr.top + offset[0];
  const bottom = bcr.top + bcr.height - offset[1];

  return top < Viewport.height && bottom > 0;
}

// increment --module-delay css variable to each [data-module-delay] in viewport
export const moduleDelays = (incrementDelay = 100, baseDelay = 0) => {
  let index = 0;

  [ ...$$(`[data-module-delay]`) ].forEach(el => {
    const target = el.classList.contains('pb-row-wrapper') ? el.firstElementChild : el;
    const isInViewport = inViewport(target);

    el.setAttribute('data-module-delay', isInViewport);

    if( isInViewport ) {
      el.style.setProperty("--module-delay", `${index * incrementDelay + baseDelay}ms`);
      index++;
    }
  });
}

export default {
  inViewport,
  moduleDelays,
};
