import { $, $$ } from '@utils/dom';
import { on, off } from "@utils/listener";

class Styleguide {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
  }

  init() {
    this.labels = [ ...$$('[data-label]', this.el) ].map((el) => new StyleguideLabel(el));
  }
  destroy() {
    if(this.labels) this.labels.forEach(el => el.destroy());

    this.el = null;
    this.emitter = null;
  }

  start() { this._bindEvents(); }
  stop() { this._unbindEvents(); }

  _bindEvents() {}
  _unbindEvents() {}
}

class StyleguideLabel {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;

    this.label = this.el.dataset.label;

    if (this.el.dataset.clipboardLabel) {
      this.label = this.el.dataset.clipboardLabel;
    }

    this._copyToClipboard = this._copyToClipboard.bind(this);

    this.init();
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    this.el = null;
    this.emitter = null;
  }

  _bindEvents() {
    on(this.el, 'click', this._copyToClipboard);
  }
  _unbindEvents() {
    off(this.el, 'click', this._copyToClipboard);
  }

  _copyToClipboard(){
    navigator.clipboard.writeText(this.label);

  this.el.classList.add('--copied');

  setTimeout(() => this.el.classList.remove('--copied'), 1000);
  }
}

export default Styleguide;
