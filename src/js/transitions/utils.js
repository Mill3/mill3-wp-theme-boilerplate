import { getOffset } from "@scroll/utils";
import { $$, getBody, rect } from "@utils/dom";
import { getTranslate } from "@utils/transform";
import Viewport from "@utils/viewport";

export const inViewport = (el) => {
  if (!el) return false;

  const bcr = rect(el);
  const offset = getOffset(el) ?? [0, 0];
  const translate = getTranslate(el);

  const top = bcr.top - translate.y + offset[0];
  const bottom = bcr.top - translate.y + bcr.height - offset[1];
  const left = bcr.left - translate.x;
  const right = bcr.left - translate.x + bcr.width;

  return top < Viewport.height && bottom > 0 && left < Viewport.width && right > 0;
}

//-------------------------------------------------------------------------//
// increment --module-delay css variable to each [data-module-delay] in viewport
// you can modify increment value for next element with [data-module-delay-increment="milliseconds"]
// 
// example:
// <div data-scroll data-module-delay data-module-delay-increment="850">
//   <h1>Hello World</h1>
// </div>
//-------------------------------------------------------------------------//
export const moduleDelays = (incrementDelay = 100, baseDelay = 0, target = null) => {
  if( !target ) target = getBody();

  let delay = baseDelay;

  [ ...$$(`[data-module-delay]`, target) ].forEach(el => {
    const isInViewport = inViewport(el);

    // set in-view status & delay
    el.setAttribute('data-module-delay', isInViewport);
    if( isInViewport ) el.style.setProperty("--module-delay", `${delay}ms`);

    // if item is not in viewport, go to next
    if( !isInViewport ) return;

    // increment delay for next item
    delay += el.hasAttribute('data-module-delay-increment') ? parseInt(el.dataset.moduleDelayIncrement) : incrementDelay;
  });
}

export default {
  inViewport,
  moduleDelays,
};
