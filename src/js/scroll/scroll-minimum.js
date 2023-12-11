import EMITTER from "@core/emitter";
import { STATE } from "@core/state";
import { SCROLL_MINIMUM, SCROLL_MINIMUM_CLASSNAME } from "@scroll/constants";
import { body } from "@utils/dom";

class ScrollMinimum {
  constructor(scroll) {
    this.scroll = scroll;

    this._hasScrolledAboveThreshold = false;
    this._started = false;

    this._onScroll = this._onScroll.bind(this);
  }

  start() {
    if( this._started ) return;
    this._started = true;

    EMITTER.on("SiteScroll.scroll", this._onScroll);
  }
  stop() {
    if( !this._started ) return;
    this._started = false;

    EMITTER.off("SiteScroll.scroll", this._onScroll);
  }
  reset() {
    this._hasScrolledAboveThreshold = false;
  }

  _onScroll({ y }) {
    const threshold = y > SCROLL_MINIMUM;

    // if scroll is greater than threshold AND was previously lower than threshold
    if (threshold === true && this._hasScrolledAboveThreshold === false) {
      this._hasScrolledAboveThreshold = true;
      STATE.dispatch("SCROLL_MIN", true);

      body.classList.add(SCROLL_MINIMUM_CLASSNAME);
      EMITTER.emit("SiteScroll.scroll-min", true);
    }
    // if scroll is lower than threshold AND was previously greater than threshold
    else if (threshold === false && this._hasScrolledAboveThreshold === true) {
      this._hasScrolledAboveThreshold = false;
      STATE.dispatch("SCROLL_MIN", false);

      body.classList.remove(SCROLL_MINIMUM_CLASSNAME);
      EMITTER.emit("SiteScroll.scroll-min", false);
    }
  }
}

export default ScrollMinimum;
