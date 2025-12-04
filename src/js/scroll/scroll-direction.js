import EMITTER from "@core/emitter";
import { STATE } from "@core/state";
import { DIRECTION_DOWN, DIRECTION_DOWN_CLASSNAME, DIRECTION_UP_CLASSNAME } from "@scroll/constants";
import { getBody } from "@utils/dom";

class ScrollDirection {
  constructor(scroll) {
    this.scroll = scroll;

    this._onDirectionChange = this._onDirectionChange.bind(this);
  }

  start() {
    EMITTER.on("SiteScroll.direction", this._onDirectionChange);
  }
  stop() {
    EMITTER.off("SiteScroll.direction", this._onDirectionChange);
  }

  _onDirectionChange(direction, oldDirection) {
    // set scroll direction classname to <body>
    // we try to change direction classname in a single operation to avoid a useless draw call
    if (oldDirection === null) getBody().classList.add(direction === DIRECTION_DOWN ? DIRECTION_DOWN_CLASSNAME : DIRECTION_UP_CLASSNAME);
    else if (direction === DIRECTION_DOWN) getBody().classList.replace(DIRECTION_UP_CLASSNAME, DIRECTION_DOWN_CLASSNAME);
    else getBody().classList.replace(DIRECTION_DOWN_CLASSNAME, DIRECTION_UP_CLASSNAME);

    // set direction to state component
    STATE.dispatch("SCROLL_DIRECTION", direction);
  }
}

export default ScrollDirection;
