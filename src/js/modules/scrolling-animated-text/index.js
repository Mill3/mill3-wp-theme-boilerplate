import Splitting from "splitting";

import { INVIEW_ENTER, DIRECTION_DOWN } from "@scroll/constants";
import { $, rect } from "@utils/dom";
import { lerp2, limit } from "@utils/math";
import { mobile } from "@utils/mobile";
import RAF from "@utils/raf";
import ResizeOrientation, { BEFORE_SCROLL_UPDATE } from "@utils/resize";
import { getTranslate } from "@utils/transform";
import Viewport from "@utils/viewport";


const FPS = 60;
const OPACITY = 0.2;
const BIDIRECTIONAL = true;


class ScrollingAnimatedText {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.text = $('[data-text-target]', this.el);
    this.items = null;

    this._data = {
      direction: DIRECTION_DOWN,
      inView: false,
      progress: 0.0,
      scrollY: 0,
      top: null,
      bottom: null,
    };
    this._raf = null;

    this._onResize = this._onResize.bind(this);
    this._onScrollCall = this._onScrollCall.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onRAF = this._onRAF.bind(this);
  }

  load() {
    this.items = Splitting({ target: this.text, by: 'scrollingAnimatedText' })[0].chars.map((item, index, array) => new Item(item, (index + 1) / array.length));
  }
  init() {
    if( mobile ) return;
    
    this._raf = RAF.add(this._onRAF);
    this._onResize();
    this._bindEvents();
  }
  destroy() {
    if( !mobile ) this._unbindEvents();

    if( this._raf ) RAF.remove(this._onRAF);
    if( this.items ) this.items.forEach(item => item.destroy());

    this.el = null;
    this.emitter = null;
    this.text = null;
    this.items = null;

    this._data = null;
    this._raf = null;
    
    this._onResize = null;
    this._onScrollCall = null;
    this._onScroll = null;
    this._onRAF = null;
  }

  _bindEvents() {
    ResizeOrientation.add(this._onResize, BEFORE_SCROLL_UPDATE);
    this.emitter.on('SiteScroll.scrolling-animated-text', this._onScrollCall);
    this.emitter.on('SiteScroll.scroll', this._onScroll);
  }
  _unbindEvents() {
    this._raf(false);
    ResizeOrientation.remove(this._onResize);
    this.emitter.off('SiteScroll.scrolling-animated-text', this._onScrollCall);
    this.emitter.off('SiteScroll.scroll', this._onScroll);
  }
  _forceUpdate() {
    if( !this._data.progressObj ) return;

    const { progress } = this._data.progressObj;

    this.items.forEach(item => {
      item.target = item.percentage <= progress ? 1 : OPACITY;
      if( item.value === item.target ) return;

      item.value = item.target;
      item.el.style.opacity = item.value;
    });
  }

  _onResize() {
    const bcr = rect(this.text);
    const translate = getTranslate(this.text);
        
    let top = bcr.top - translate.y + this._data.scrollY;
    let bottom = Math.min(Infinity, top + bcr.height);
        
    top   += 0;
    bottom = Math.min(Infinity, bottom - Viewport.height * 0.3);
    
    this._data.top = top;
    this._data.bottom = bottom;
  }
  _onScrollCall(direction, obj) {
    if( obj.el !== this.el ) return;

    this._data.inView = direction === INVIEW_ENTER;

    if( this._data.inView ) this._raf(true);
    else {
      this._raf(false);
      this._forceUpdate();
    }
  }
  _onScroll({direction, y}) {
    this._data.direction = direction;
    this._data.scrollY = y;
  }
  _onRAF(delta) {
    const { direction, scrollY, top, bottom } = this._data;
    if( top === null || bottom === null ) return;

    const height = Math.min(bottom, Viewport.height + bottom - top);
    const distance = limit(0, height, bottom - scrollY);
    const targetProgress = 1 - distance / height;

    if( BIDIRECTIONAL ) this._data.progress = targetProgress;
    else {
      // update progress only if bigger than previous data (scrolling down only)
      if( targetProgress > this._data.progress ) this._data.progress = targetProgress;
    }      

    const { progress } = this._data;
    const multiplier = direction === DIRECTION_DOWN ? 0.04 : 0.2;
    const threshold = direction === DIRECTION_DOWN ? 0.1 : 0.02;

    this.items.forEach(item => {
      item.target = item.percentage <= progress ? 1 : OPACITY;
      if( item.value === item.target ) return;

      item.value = lerp2(item.value, item.target, multiplier, delta, FPS);
      if( Math.abs(item.target - item.value) < threshold ) item.value = item.target;

      item.el.style.opacity = item.value;
    });
  }
}

class Item {
  constructor(el, percentage) {
    this.el = el;
    this.percentage = percentage;
    this.value = OPACITY;
    this.target = OPACITY;

    this.init();
  }

  destroy() {
    this.el = null;
    this.percentage = null;
    this.value = null;
    this.target = null;
  }

  init(){
    this.el.style.opacity = this.value;
  }
}

export default ScrollingAnimatedText;
