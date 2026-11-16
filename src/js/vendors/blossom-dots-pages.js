/**
 * Patch <blossom-dots> so it renders one dot per reachable scroll position
 * instead of one dot per slide.
 *
 * When several slides are visible at once, the last slides can never be
 * scrolled to the start of the viewport, so their dots are useless.
 * We trim the dots count to the first slide that reaches the end of the scroller,
 * and clamp the active index accordingly.
 *
 * Must be imported after "@blossom-carousel/web" has registered its custom elements.
 */

const SLIDE_SELECTOR = "[data-blossom-slide]";
const TOLERANCE = 1;
const cache = new WeakMap();

const getPagesCount = (scroller) => {
  const slides = scroller.querySelectorAll(SLIDE_SELECTOR);
  const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);

  // slides positions relative to scroll content only change when sizes change
  const key = `${slides.length}:${scroller.scrollWidth}:${scroller.clientWidth}`;
  const cached = cache.get(scroller);
  if (cached?.key === key) return cached.count;

  let count = slides.length;

  if (maxScroll <= TOLERANCE) count = 0;
  else {
    const { left } = scroller.getBoundingClientRect();
    const paddingStart = parseFloat(getComputedStyle(scroller).scrollPaddingInlineStart) || 0;

    for (let i = 0; i < slides.length; i++) {
      const position = slides[i].getBoundingClientRect().left - left + scroller.scrollLeft - paddingStart;

      // first slide that can't be scrolled further than the end is the last page
      if (position >= maxScroll - TOLERANCE) {
        count = i + 1;
        break;
      }
    }
  }

  cache.set(scroller, { key, count });
  return count;
};

const BlossomDots = typeof customElements !== "undefined" ? customElements.get("blossom-dots") : null;

if (BlossomDots && !BlossomDots.prototype.__pagesPatched) {
  const render = BlossomDots.prototype.render;

  BlossomDots.prototype.render = function (state, forId, force) {
    const scroller = forId ? document.getElementById(forId) : null;
    if (!scroller || !state) return render.call(this, state, forId, force);

    const count = Math.min(getPagesCount(scroller), state.count);
    const activeIndex = count > 0 ? Math.min(state.activeIndex, count - 1) : -1;

    return render.call(this, { ...state, count, activeIndex }, forId, force);
  };

  BlossomDots.prototype.__pagesPatched = true;

  // dots already connected may have rendered before this patch was applied
  document.querySelectorAll("blossom-dots").forEach((/** @type {any} */ dots) => {
    if (dots.lastState) dots.render(dots.lastState, dots.forId, true);
  });
}
