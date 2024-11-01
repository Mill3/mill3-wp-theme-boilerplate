import { on, off } from "@utils/listener";

class MouseWheelFrame {
  constructor(el) {
    this.el = el;
    this.parent = this.el.parentNode;

    this._started = false;
    this._onClick = this._onClick.bind(this);
  }

  destroy() {
    this.stop();

    this.el = null;
    this.parent = null;

    this._started = null;
    this._onClick = null;
  }
  start() {
    if( this._started ) return;
    this._started = true;

    this._bindEvents();
  }
  stop() {
    if( !this._started ) return;
    this._started = false;

    this._unbindEvents();
  }

  _bindEvents() {
    if( this.parent ) {
      this.el.style.pointerEvents = "none";

      off(this.parent, "click", this._onClick);
      on(this.parent, "click", this._onClick);
    }
  }
  _unbindEvents() {
    if( this.parent ) {
      this.el.style.removeProperty("pointer-events");
      off(this.parent, "click", this._onClick);
    }
  }

  _onClick(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    this._unbindEvents();
  }
}

export default MouseWheelFrame;
