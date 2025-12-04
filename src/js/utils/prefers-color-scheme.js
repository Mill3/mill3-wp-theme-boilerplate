import EventEmitter2 from "eventemitter2";

import { getHTML } from "@utils/dom";

export const CLASSNAME = '--js-prefers-color-scheme--';
export const COLOR_SCHEME_DARK = 'dark';
export const COLOR_SCHEME_LIGHT = 'light';
export const COLOR_SCHEME_STORAGE = 'PREFERS_COLOR_SCHEME';

class PrefersColorScheme extends EventEmitter2 {
  constructor() {
    super();

    this._value = window.matchMedia && window.matchMedia(`(prefers-color-scheme: ${COLOR_SCHEME_DARK})`).matches ? COLOR_SCHEME_DARK : COLOR_SCHEME_LIGHT;

    if(window.matchMedia){
      this._onPrefersColorSchemeChange = this._onPrefersColorSchemeChange.bind(this)

      try {
        this._mq = window.matchMedia(`(prefers-color-scheme: ${COLOR_SCHEME_DARK})`);
        this._mq.addEventListener('colorschemechange', this._onPrefersColorSchemeChange);
      } catch (error) {
        console.error('PrefersColorScheme Error :', error)
      }
    }

    // Check user has stored preference a specific selected color scheme
    // if the stored value is different from the OS default preference, toggle current scheme
    const stored = localStorage.getItem(COLOR_SCHEME_STORAGE);
    if (stored && stored !== this._value) {
      this.toggle();
    }
  }

  toggle() {
    // remove previous value
    getHTML().classList.remove(CLASSNAME + this._value);

    // toggle value
    this._value = this._value === COLOR_SCHEME_DARK ? COLOR_SCHEME_LIGHT : COLOR_SCHEME_DARK;

    // set new value
    getHTML().classList.add(CLASSNAME + this._value);

    // store pref in locale storage
    localStorage.setItem(COLOR_SCHEME_STORAGE, this._value);

    // dispatch event
    this.emit('change', this._value);
  }

  _onPrefersColorSchemeChange(event) {
    // remove user forced value
    getHTML().classList.remove(CLASSNAME + COLOR_SCHEME_DARK, CLASSNAME + COLOR_SCHEME_LIGHT);

    // set new value from mediaQuery
    this._value = event.matches ? COLOR_SCHEME_DARK : COLOR_SCHEME_LIGHT;

    // store pref in locale storage
    localStorage.setItem(COLOR_SCHEME_STORAGE, this._value);

    // dispatch event
    this.emit('change', this._value);
  }

  // getter - setter
  get value() { return this._value; }
}

const SINGLETON = new PrefersColorScheme();

export default SINGLETON;
