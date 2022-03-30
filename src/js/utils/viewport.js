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
  }
};

export default Viewport;
