/*

──────────────────────────────────────────
──────────────────────────────────────────
RESIZE & ORIENTATION
──────────────────────────────────────────
──────────────────────────────────────────

import ResizeOrientation from '@utils/resize';

function callback(event) {
  // do something
}

ResizeOrientation.add(callback); // start listening to window's resize & orientation change events
ResizeOrientation.remove(callback); // stop listening to window's resize & orientation change events

*/

import { on, off } from "./listener";
import Throttle from "./throttle";


class ResizeOrientation {
  constructor() {
    this._event = null;
    this._listening = false;
    this._listeners = new Set();
    this._tick = null;

    this._getThrottleBnd = this._getThrottle.bind(this);
    this._getRafBnd = this._getRAF.bind(this);
    this._runBnd = this._run.bind(this);

    this.init();
  }

  init() {
    // create throttler
    this._throttle = Throttle({ cb: this._getRafBnd, delay: 200, onlyAtEnd: false });
  }

  add(callback) {
    // add callback to the list of listeners
    this._listeners.add(callback);

    // if not already listening to window's resize event AND
    // if list of listeners is not empty
    if( !this._listening && this._listeners.size > 0 ) this._bindEvents();
  }
  remove(callback) {
    // remove callback from list of listeners
    this._listeners.delete(callback);

    // if was listening to window's resize event AND
    // if list of listeners is empty
    if( this._listeners && this._listeners.size === 0 ) this._unbindEvents();
  }

  _bindEvents() {
    on(window, "orientationchange", this._getThrottleBnd);
    on(window, "resize", this._getThrottleBnd);
  }
  _unbindEvents() {
    off(window, "orientationchange", this._getThrottleBnd);
    off(window, "resize", this._getThrottleBnd);
  }

  _getThrottle(event) {
    // save event for later
    this._event = event;

    // start throttler
    this._throttle.init();
  }
  _getRAF() {
    // if already waiting for RAF to run, stop here
    if ( this._tick ) return;

    // save tick to prevent 
    this._tick = true;

    // RAF
    requestAnimationFrame( this._runBnd );
  }
  _run() {
    // execute all callbacks
    this._listeners.forEach(callback => callback(this._event));

    // enable another run for later
    this._tick = false;
  }
}

const SINGLETON = new ResizeOrientation();
export default SINGLETON;
