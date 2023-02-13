import SwiperCore, { Swiper, Navigation } from 'swiper';

import { $ } from "@utils/dom";

// configure Swiper to use modules
SwiperCore.use([Navigation]);

const SWIPER_OPTIONS = {
  centeredSlides: false,
  freeMode: false,
  loop: true,
  loopAdditionalSlides: 4,
  navigation: {
    nextEl: '.pb-row-medias__next',
    prevEl: '.pb-row-medias__prev',
  },
  resistance: false,
  slidesPerView: 'auto',
  slidesOffsetAfter: 12,
  slidesOffsetBefore: 12,
  spaceBetween: 12,
  speed: 650,
  breakpoints: {
    992: {
      slidesOffsetAfter: 40,
      slidesOffsetBefore: 40,
      spaceBetween: 40,
    }
  }
};

class PbRowMedias {
  constructor(el) {
    this.el = el;
    this.slider = $(".pb-row-medias__slider", this.el);
  }

  init() {
    if( this.slider ) this.swiper = new Swiper(this.slider, SWIPER_OPTIONS);

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if( this.swiper ) this.swiper.destroy();

    this.el = null;
    this.slider = null;
    this.swiper = null;
  }

  _bindEvents() {}
  _unbindEvents() {}
}

export default PbRowMedias;
