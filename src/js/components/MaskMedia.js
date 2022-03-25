import anime from "animejs";
import EventEmitter2 from "eventemitter2";

import { $ } from "@utils/dom";

class MaskMedia extends EventEmitter2 {
  constructor(el) {
    super();

    this.el = el;
    this.mask = $('.mask-media__mask', this.el);
    this.unmask = $('.mask-media__unmask', this.el);
    this.media = $('.mask-media__media', this.el);

    this._animated = false;
    this._tween = { value: 0.001 };

    this.init();
  }

  init() {
    if( this.mask ) this.mask.style.transform = `scaleY(0)`;
    if( this.media ) this.media.style.transform = `scaleY(1)`;
  }
  destroy() {
    if( this._tween ) anime.remove(this._tween);

    this.el = null;
    this.mask = null;
    this.unmask = null;
    this.media = null;

    this._animated = null;
    this._tween = null;
  }

  animate(delay = 0) {
    // if component is already animated, skip here
    if( this._animated ) return;
    this._animated = true;

    // if delay is not provided, get value from --delay css variable
    if( delay <= 0 ) delay = getComputedStyle(this.el).getPropertyValue('--delay');

    // animate a dummy object that will update transformations of mask and img on each frame
    anime({
      targets: this._tween,
      value: [0.001, 1],
      duration: 1150,
      delay: delay,
      easing: 'easeInOutCubic',
      update: () => {
        this.mask.style.transform = `scaleY(${this._tween.value})`;
        this.unmask.style.transform = `scaleY(${this._tween.value === 0 ? 1 : 1 / this._tween.value})`;
      }
    });

    if( this.media ) {
      anime({
        targets: this.media,
        scale: 1,
        duration: 1250,
        delay: delay,
        easing: 'easeOutCubic',
      });
    }
  }
}

export default MaskMedia;
