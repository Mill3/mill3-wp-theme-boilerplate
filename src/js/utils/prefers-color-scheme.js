import EventEmitter2 from "eventemitter2";

import { getHTML } from "@utils/dom";

export const COLOR_SCHEME_DARK = 'dark';
export const COLOR_SCHEME_LIGHT = 'light';
export const COLOR_SCHEME_STORAGE = 'PREFERS_COLOR_SCHEME';

class PrefersColorScheme extends EventEmitter2 {
  constructor() {
    super();

    this._default = window.matchMedia && window.matchMedia(`(prefers-color-scheme: ${COLOR_SCHEME_DARK})`).matches ? COLOR_SCHEME_DARK : COLOR_SCHEME_LIGHT;
    this._value = this._default;

    if(window.matchMedia){
      this._onPrefersColorSchemeChange = this._onPrefersColorSchemeChange.bind(this)

      try {
        this._mq = window.matchMedia(`(prefers-color-scheme: ${COLOR_SCHEME_DARK})`);
        this._mq.addEventListener('change', this._onPrefersColorSchemeChange);
      } catch (error) {
        console.error('PrefersColorScheme Error :', error);
      }
    }

    // Check if user has stored a specific color scheme
    // if the stored value is different from the OS default preference, switch current scheme
    const stored = localStorage.getItem(COLOR_SCHEME_STORAGE);
    
    if( stored ) {
      // if stored value isn't valid OR equal as system's default, remove local storage
      if( ![COLOR_SCHEME_DARK, COLOR_SCHEME_LIGHT].includes(stored) || stored === this._value ) localStorage.removeItem(COLOR_SCHEME_STORAGE);
      else {
        // stored value is valid and differs from system's default
        this._value = stored;
        getHTML().style.setProperty('color-scheme', this._value);
      }
    }
  }

  toggle() {
    // toggle value
    this._value = this._value === COLOR_SCHEME_DARK ? COLOR_SCHEME_LIGHT : COLOR_SCHEME_DARK;

    // remove store if value === system's default OR
    // store value in locale storage if value != system's default
    if( this._value === this._default ) localStorage.removeItem(COLOR_SCHEME_STORAGE);
    else localStorage.setItem(COLOR_SCHEME_STORAGE, this._value);

    // force color-scheme
    getHTML().style.setProperty('color-scheme', this._value);

    // dispatch event
    this.emit('change', this._value);
  }

  _onPrefersColorSchemeChange(event) {
    // set new value from mediaQuery
    this._default = event.matches ? COLOR_SCHEME_DARK : COLOR_SCHEME_LIGHT;
    this._value = this._default;

    // remove locale storage
    localStorage.removeItem(COLOR_SCHEME_STORAGE);

    // remove forced color-scheme
    getHTML().style.removeProperty('color-scheme');

    // dispatch event
    this.emit('change', this._value);
  }

  // getter - setter
  get value() { return this._value; }
}

const SINGLETON = new PrefersColorScheme();

export default SINGLETON;
