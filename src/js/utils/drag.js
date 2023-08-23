/*

──────────────────────────────────────────
──────────────────────────────────────────
Dragging Component
──────────────────────────────────────────
──────────────────────────────────────────

const drag = new Drag(myElement, myOptions);

drag.start();  // start listening to pointer events
drag.stop(); // stop listening to pointer events
drag.destroy(); // destroy object and stop event listeners


// listening to events
drag.on('start', myCallback);
drag.on('move', myCallback);
drag.on('end', myCallback);

Each events will pass the PointerEvent as first argument


// Options

ignoreCtrlClick (Boolean) : Ignore event if triggered with CTRL key. Default to true.
ignoreMouseRightButton (Boolean) : Will ignore mouse's right click. Default to true.
preventImageDrag (Boolean) : Will prevent dragging image from application to application. Default to true.
preventScrolling (Boolean) : Will completely prevent page from scrolling on touch devices (horizontally and vertically). Default to false.
preventTextSelect (Boolean) : Will disable text selection during drag. Default to true.
textSelectClassname (String) : Name of the class to add to <body> when drag is active. Default to '--js-disable-text-select'.

*/

import EventEmitter2 from "eventemitter2";

import { body } from "./dom";
import { on, off } from "./listener";

const DEFAULT_OPTIONS = {
  ignoreCtrlClick: true,
  ignoreMouseRightButton: true,
  preventImageDrag: true,
  preventScrolling: false,
  preventTextSelect: true,
  textSelectClassname: '--js-disable-text-select',
};

class Drag extends EventEmitter2 {
  constructor(el, options = {}) {
    super();
    
    this.el = el;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    this._dragging = false;
    this._pointerId = null;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
  }

  destroy() {
    this.stop();

    this.el = null;
    this.options = null;

    this._dragging = null;
    this._pointerId = null;

    this._onPointerDown = null;
    this._onPointerMove = null;
    this._onPointerUp = null;
  }
  start() {
    on(this.el, 'pointerdown', this._onPointerDown);
    on(this.el, 'pointermove', this._onPointerMove);
    on(this.el, 'pointerup', this._onPointerUp);
    on(this.el, 'pointercancel', this._onPointerUp);

    if( this.options.preventImageDrag ) on(this.el, 'dragstart', this._preventDefault);
    if( this.options.preventScrolling ) on(this.el, 'touchstart', this._preventDefault);
  }
  stop() {
    off(this.el, 'pointerdown', this._onPointerDown);
    off(this.el, 'pointermove', this._onPointerMove);
    off(this.el, 'pointerup', this._onPointerUp);
    off(this.el, 'pointercancel', this._onPointerUp);
    off(this.el, 'touchstart', this._preventDefault);
    off(this.el, 'dragstart', this._preventDefault);
  }


  _preventDefault(e) { e.preventDefault(); }
  
  _onPointerDown(e) {
    // left button only
    if (this.options.ignoreMouseRightButton && e.button !== 0) return;

    // ignore ctrl + click
    if (this.options.ignoreCtrlClick && e.ctrlKey) return;

    // if already dragging, stop here
    if( this._dragging ) return;
    this._dragging = true;
    this._pointerId = e.pointerId;

    // limit pointer capture to this element (it works like magic!!!)
    this.el.setPointerCapture(this._pointerId);

    // disable text selection
    if( this.options.preventTextSelect ) body.classList.add(this.options.textSelectClassname);

    // dispatch event
    this.emit('start', e);
  }
  _onPointerMove(e) {
    // if dragging not started, stop here
    if ( !this._dragging ) return;

    // dispatch event
    this.emit('move', e);
  }
  _onPointerUp(e) {
    // if we were not dragging, stop here
    if( !this._dragging ) return;

    // enable text selection
    if( this.options.preventTextSelect ) body.classList.remove('--js-disable-text-select');

    // release pointer capture
    if( this._pointerId ) this.el.releasePointerCapture(this._pointerId);

    // update dragging status
    this._dragging = false;
    this._pointerId = null;

    this.emit('end', e);
  }


  // getter - setter
  get dragging() { return this._dragging; }
};

export default Drag;
