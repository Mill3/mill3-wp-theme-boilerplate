/*
──────────────────────────────────────────
──────────────────────────────────────────
Viewport
──────────────────────────────────────────
──────────────────────────────────────────
const windowHeight = Viewport.height;
*/

const Viewport = {
  get width() {
    return innerWidth;
  },

  get height() {
    return innerHeight;
  },

  get devicePixelRatio() {
    return devicePixelRatio || 1;
  },

  get x() {
    return pageXOffset;
  },

  get y() {
    return pageYOffset;
  },
};

export default Viewport;
