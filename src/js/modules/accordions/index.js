import Accordion from '@components/Accordion';
import { $, $$ } from '@utils/dom';

class Accordions {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.accordions = [ ...$$('.accordions__accordion', this.el) ].map(accordion => {
      const btn = $('.accordions__btn', accordion);
      const panel = $('.accordions__content', accordion);

      return new Accordion(btn, panel);
    });

    this._onAccordionOpen = this._onAccordionOpen.bind(this);
    this._onAccordionClose = this._onAccordionClose.bind(this);
  }

  destroy() {
    if( this.accordions ) this.accordions.forEach(accordion => accordion.destroy());

    this.el = null;
    this.emitter = null;
    this.accordions = null;

    this._onAccordionOpen = null;
    this._onAccordionClose = null;
  }

  start() { this._bindEvents(); }
  stop() { this._unbindEvents(); }

  _bindEvents() {
    if( this.accordions ) {
      this.accordions.forEach(accordion => {
        accordion.on('open', this._onAccordionOpen);
        accordion.on('close', this._onAccordionClose);
      });
    }
  }
  _unbindEvents() {
    if( this.accordions ) {
      this.accordions.forEach(accordion => {
        accordion.off('open', this._onAccordionOpen);
        accordion.off('close', this._onAccordionClose);
      });
    }
  }

  _onAccordionOpen() {
    this.emitter.emit('SiteScroll.update');
  }
  _onAccordionClose() {
    this.emitter.emit('SiteScroll.update');
  }
}

export default Accordions;
