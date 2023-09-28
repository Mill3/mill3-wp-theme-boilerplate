import { $, rect } from "@utils/dom";
import ResizeOrientation, { BEFORE_SCROLL_UPDATE, AFTER_SCROLL_UPDATE } from "@utils/resize";
import Viewport from '@utils/viewport';

class PbRowWrapperReveal {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.wrapper = $('.pb-row-wrapper__reveal', this.el);

    this._height = 0;
    this._top = 0;
    this._bottom = 0;
    this._scroll = null;

    this._updatePosition = this._updatePosition.bind(this);
    this._onScrollInit = this._onScrollInit.bind(this);
    this._onScrollBeforeUpdate = this._onScrollBeforeUpdate.bind(this);
    this._onScrollAfterUpdate = this._onScrollAfterUpdate.bind(this);
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this.el = null;
    this.emitter = null;
    this.wrapper = null;

    this._height = null;
    this._top = 0;
    this._bottom = 0;
    this._scroll = null;

    this._updatePosition = null;
    this._onScrollInit = null;
    this._onScrollBeforeUpdate = null;
    this._onScrollAfterUpdate = null;
  }
  stop() { this._unbindEvents(); }


  _bindEvents() {
    this.emitter.on('SiteScroll.init', this._onScrollInit);
    this.emitter.on('SiteScroll.before-update', this._onScrollBeforeUpdate);
    this.emitter.on('SiteScroll.after-update', this._onScrollAfterUpdate);
    this.emitter.on('SiteScroll.scroll', this._updatePosition);

    ResizeOrientation.add(this._onScrollBeforeUpdate, BEFORE_SCROLL_UPDATE);
    ResizeOrientation.add(this._onScrollAfterUpdate, AFTER_SCROLL_UPDATE);
  }
  _unbindEvents() {
    this.emitter.off('SiteScroll.init', this._onScrollInit);
    this.emitter.off('SiteScroll.before-update', this._onScrollBeforeUpdate);
    this.emitter.off('SiteScroll.after-update', this._onScrollAfterUpdate);
    this.emitter.off('SiteScroll.scroll', this._updatePosition);

    ResizeOrientation.remove(this._onScrollBeforeUpdate, BEFORE_SCROLL_UPDATE);
    ResizeOrientation.remove(this._onScrollAfterUpdate, AFTER_SCROLL_UPDATE);
  }

  _calculateLimits() {
    this._height = rect(this.wrapper).height;
    this._top = rect(this.el).top - Viewport.height + this._scroll.y;
    this._bottom = this._top + this._height + Viewport.height;
  }
  _updatePosition({ y: scrollY }) {
    // stop here if element is not in viewport
    if( scrollY < this._top || scrollY > this._bottom ) return;

    // calculate distance from el's top to viewport's bottom
    const distance = scrollY - this._top;

    let y = 0, vh = Viewport.height;

    if( this._height > vh ) {
      // snap to viewport's top until section's top is higher than viewport's top
      y = Math.min(0, distance - vh);

      // if section's bottom is higher than viewport's bottom, snap to viewport's bottom
      if( distance > this._height ) y = distance - this._height;
    } else {
      // snap to el's bottom until ...
      y = Math.min(0, distance - this._height);

      // if el's top is higher than viewport's top
      if( distance > vh ) y = distance - vh;
    }

    // update DOM
    this.wrapper.style.transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,0,${y},0,1)`;
  }

  _onScrollInit(scroll) {
    this._scroll = scroll;

    this._calculateLimits();
    this._updatePosition(this._scroll);
  }
  _onScrollBeforeUpdate() {
    // reset DOM transformation to prevent incorrect calculations of wrapper's children by Mill3 Scroll
    this.wrapper.style.transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,0,0,0,1)`;
  }
  _onScrollAfterUpdate() {
    this._calculateLimits();
    this._updatePosition(this._scroll);
  }
}

export default PbRowWrapperReveal;
