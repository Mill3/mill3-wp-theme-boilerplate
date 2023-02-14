import { on, off } from "@utils/listener";
import PrefersColorScheme from "@utils/prefers-color-scheme";

class PrefersColorSchemeBtn {
  constructor(el) {
    this.el = el;
    this.labels = JSON.parse(this.el.dataset.prefersColorSchemeBtn);
    
    this._onClick = this._onClick.bind(this);
    this._onPrefersColorSchemeChange = this._onPrefersColorSchemeChange.bind(this);
  }
  
  init() {
    this._bindEvents();
    this._onPrefersColorSchemeChange(PrefersColorScheme.value);
  }
  destroy() {
    this.el = null;
    this.labels = null;

    this._onClick = null;
    this._onPrefersColorSchemeChange = null;
  }

  stop() { this._unbindEvents(); }
  
  _bindEvents() {
    if( this.el ) on(this.el, 'click', this._onClick);
    PrefersColorScheme.on('change', this._onPrefersColorSchemeChange);
  }
  _unbindEvents() {
    if( this.el ) off(this.el, 'click', this._onClick);
    PrefersColorScheme.off('change', this._onPrefersColorSchemeChange);
  }

  _onClick(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    PrefersColorScheme.toggle();
  }
  _onPrefersColorSchemeChange(value) {
    if( !this.el ) return;
    this.el.setAttribute('aria-label', this.labels[value]);
  }
}

export default PrefersColorSchemeBtn;
