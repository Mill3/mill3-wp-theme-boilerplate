import EventEmitter2 from "eventemitter2";

import { on, off } from "@utils/listener";

class Accordion extends EventEmitter2 {
  constructor(el, closeOnTapOut = false) {
    super();

    this.el = el;

    this._closeOnTapOut = closeOnTapOut;
    this._silent = false;

    this._onToggle = this._onToggle.bind(this);
    this._onClickOutside = this._onClickOutside.bind(this);

    this.init();
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    this.el = null;

    this._closeOnTapOut = null;
    this._silent = null;

    this._onToggle = null;
    this._onClickOutside = null;
  }
  open(silent = false) {
    // if accordion is already opened, stop here
    if (this.opened === true) return;

    // save silent status
    this._silent = silent;

    // open accordion
    this.el.open = true;
  }
  close(silent = false) {
    // if accordion isn't opened, stop here
    if (this.opened === false) return;

    // save silent status
    this._silent = silent;

    // close accordion
    this.el.open = false;
  }
  toggle() {
    if (this.opened === true) this.close();
    else this.open();
  }
  

  _bindEvents() {
    if (this.el) on(this.el, "toggle", this._onToggle);
  }
  _unbindEvents() {
    if (this.el) off(this.el, "toggle", this._onToggle);
    if (this._closeOnTapOut) off(window, "click", this._onClickOutside);
  }
  _emit() { this.emit(this.opened ? "open" : "close", this); }


  _onToggle() {
    // if accordion need to be close on click outside
    if( this._closeOnTapOut ) {
      // bind/unbind click outside event if accordion is opened/closed
      if( this.opened ) on(window, "click", this._onClickOutside);
      else off(window, "click", this._onClickOutside);
    }
    
    // emit event if required
    if( !this._silent ) this._emit();
  }
  _onClickOutside() { this.close(); }

  // getter
  get opened() { return this.el.open; }
}

export default Accordion;
