import SwiperCore, { Swiper, Pagination } from 'swiper';

// configure Swiper to use modules
SwiperCore.use([Pagination]);

const SWIPER_OPTIONS = {
  centeredSlides: false,
  freeMode: false,
  loop: false,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    type: 'bullets',
  },
  slidesPerView: 1,
  spaceBetween: 0,
  breakpoints: {
    992: {
      centerInsufficientSlides: true,
      slidesPerView: 1,
      watchOverflow: true,
    }
  }
};

class PbRowTestimonials {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
  }

  init() {
    this.slider = new Swiper(this.el, SWIPER_OPTIONS);
  }
  destroy() {
    if( this.slider ) this.slider.destroy();

    this.el = null;
    this.emitter = null;
    this.slider = null;
  }

  start() { this._bindEvents(); }
  stop() { this._unbindEvents(); }

  _bindEvents() {}
  _unbindEvents() {}
}

export default PbRowTestimonials;
