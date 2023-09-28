/*

──────────────────────────────────────────
──────────────────────────────────────────
RequestAnimationFrame (rAF)
──────────────────────────────────────────
──────────────────────────────────────────

import RAF from '@utils/raf';

function callback(delta) {
  this._current = lerp(this._current, this._target, 0.2 * delta);
  this.el.style.transform = `scale(${this._current})`;
}

// start running code on each frame
//  - callback (function) : code to execute on each frame
//  - priority (integer) : execution priority [-999, 999], the higher will run first (default 0)
//  - active (boolean) : listener is active or not (default false)
RAF.add(callback, priority, active);

// stop running code on each frame
RAF.remove(callback);

// change callback's activness
this._raf = RAF.add(callback, 0, false);
this._raf(true); // become active
this._raf(false); // become inactive

*/

export const FPS = 1000 / 60;
export const BEFORE_SCROLL = 999;
export const WINDMILL_SCROLL = 450;
export const AFTER_SCROLL = -999;

class RAF {
  constructor() {
    this._lastTime = null;
    this._listeners = [];
    this._running = false;
    this._rafID = null;

    this._runBnd = this._run.bind(this);
  }

  add(callback, priority = 0, active = false) {
    // if callback is already registered, stop here
    if( this._exists(callback) ) return;

    // create object & controller
    const item = { callback, priority, active };
    const controller = (active) => {
      item.active = active === true;
      if( item.active ) SINGLETON._startRAF();
    };

    // add callback to the list of listeners
    this._listeners.push(item);

    // sort callbacks by priority (higher the better)
    this._listeners.sort((a, b) => {
      if( b.priority > a.priority ) return 1;
      else if( b.priority < a.priority ) return -1;
      
      return 0;
    });

    // if not running, start RAF on next frame
    if( !this._running ) this._startRAF();

    // return method to be able to controls callback's active status
    return controller;
  }
  remove(callback) {
    // if callback is not registered, stop here
    if( !this._exists(callback) ) return;

    // remove callback from list of listeners
    const index = this._listeners.findIndex(listener => listener.callback === callback);
    const item = this._listeners.splice(index, 1)[0];
          item.destroy();

    // if running AND listeners are empty, stop RAF immediately
    if( this._running && this._listeners && this._listeners.length === 0 ) this._stopRAF();
  }

  _exists(callback) {
    return this._listeners.find(listener => listener.callback === callback);
  }


  _startRAF() {
    // if already running, stop here
    if( this._running ) return;
    this._running = true;

    // RAF
    this._rafID = requestAnimationFrame(this._runBnd);
  }
  _stopRAF() {
    // if not running, stop here
    if( !this._running ) return;

    // cancel RAF
    if( this._rafID ) cancelAnimationFrame(this._rafID);

    this._rafID = null;
    this._running = false;
  }
  _run() {
    // destroy previous RAF ID
    this._rafID = null;

    // if RAF was requested to stop, stop here
    if( !this._running ) return;

    let rafRequired = false;

    const time = performance.now();
    const delta = this._lastTime ? Math.min(Math.ceil((time - this._lastTime) / FPS * 10) / 10, 1) : 1;

    this._lastTime = time;

    // execute all callbacks
    this._listeners.forEach(item => {
      // if callback isn't active, stop here
      if( !item.active ) return;
      
      // run callback
      item.callback(delta);

      // if callback is still active after execution, we can continue RAF
      if( item.active ) rafRequired = true;
    });

    // if we have at least one active RAF, keep running
    if( rafRequired ) this._rafID = requestAnimationFrame(this._runBnd);
    else this._stopRAF();
  }
}

const SINGLETON = new RAF();
export default SINGLETON;
