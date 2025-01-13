import GForm from "@components/GForm";
import { $$ } from "@utils/dom";
import Throttle from "@utils/throttle";

export const SELECTOR = `.gform_wrapper`;

class GFormFactory {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.items = null;
    this.throttle = null;

    this._onFormResize = this._onFormResize.bind(this);
    this._onFormSuccess = this._onFormSuccess.bind(this);
    this._onThrottle = this._onThrottle.bind(this);
  }

  init() {
    this.throttle = Throttle({ cb: this._onThrottle, delay: 200, onlyAtEnd: true });
    this.items = [...$$(SELECTOR, this.el)].map(el => new GForm(el));

    // if there is at least one form, emit SiteScroll.update immediatly
    if( this.items.length > 0 ) this._onThrottle();
  }
  destroy() {
    if (this.throttle) this.throttle.dispose();
    if (this.items) this.items.forEach(el => el.destroy());

    this.el = null;
    this.emitter = null;
    this.items = null;
    this.throttle = null;

    this._onFormResize = null;
    this._onFormSuccess = null;
    this._onThrottle = null;
  }

  start() { this._bindEvents(); }
  stop() {
    this._unbindEvents();
    
    if( this.items ) this.items.forEach(item => item.destroy());
    this.items = null;
  }

  _bindEvents() {
    if( this.items ) {
      this.items.forEach(gform => {
        gform.on('resize', this._onFormResize);
        gform.on('success', this._onFormSuccess);
      });
    }
  }
  _unbindEvents() {
    if( this.items ) {
      this.items.forEach(gform => {
        gform.off('resize', this._onFormResize);
        gform.off('success', this._onFormSuccess);
      });
    }
  }

  _onFormResize() {
    // throttle for 200ms before SiteScroll.update
    this.throttle.init();
  }
  _onFormSuccess(formID) {
    if( this.emitter ) this.emitter.emit('GForm.success', formID);
  }
  _onThrottle() {
    if( this.emitter ) this.emitter.emit("SiteScroll.update");
  }
}

export default GFormFactory;
