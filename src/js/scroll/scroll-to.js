import { getOffset } from "@scroll/utils";
import { on, off } from "@utils/listener";


const SELECTOR = "[data-scroll-to]";


class ScrollTo {
  constructor(scroll) {
    this.scroll = scroll;

    this._onScrollToClick = this._onScrollToClick.bind(this);
  }

  start() {
    on(SELECTOR, 'click', this._onScrollToClick);
  }
  stop() {
    off(SELECTOR, 'click', this._onScrollToClick);
  }

  _onScrollToClick(event) {
    if( event ) event.preventDefault();

    const { currentTarget } = event;

    // get scroll to target
    let target = (currentTarget.getAttribute('data-scroll-to') ?? '').trim();

    // if target is not provided, try to get from href attribute
    if( target === '' ) target = (currentTarget.getAttribute('href') ?? '').trim();

    // if target is empty, stop here
    if( target === '' ) return;

    // start scrollTo
    this.scroll.scrollTo(target, { offset: getOffset(currentTarget) ?? 0 });
  }
}

export default ScrollTo;
