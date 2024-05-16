import { $$ } from '@utils/dom';
import { on, off } from '@utils/listener';

class Accordions {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.accordions = [ ...$$('.accordions__accordion', this.el) ];

    this._onAccordionToggle = this._onAccordionToggle.bind(this);
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    this.el = null;
    this.emitter = null;
    this.accordions = null;

    this._onAccordionToggle = null;
  }

  _bindEvents() {
    if( this.accordions ) on(this.accordions, 'toggle', this._onAccordionToggle);
  }
  _unbindEvents() {
    if( this.accordions ) off(this.accordions, 'toggle', this._onAccordionToggle);
  }

  _onAccordionToggle() {
    this.emitter.emit('SiteScroll.update');
  }
}

export default Accordions;
