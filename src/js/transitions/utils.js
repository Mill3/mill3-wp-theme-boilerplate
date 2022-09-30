import { getOffset } from "@scroll/utils";
import { rect } from "@utils/dom";
import Viewport from "@utils/viewport";

export const inViewport = (el) => {
  if (!el) return false;

  const bcr = rect(el);
  const offset = getOffset(el) ?? [0, 0];

  const top = bcr.top + offset[0];
  const bottom = bcr.top + bcr.height - offset[1];

  return top < Viewport.height && bottom > 0;
}

export default {
  inViewport,
};
