import { ios } from "@utils/browser";
import { $, html } from "@utils/dom";
import { on, off } from "@utils/listener";

export const POWER_MODE_LOW_CLASSNAME = 'power-mode-low';

class PowerMode {
  constructor() {
    this.video = $('video#powerMode');

    this._low = false;
    this._onPlay = this._onPlay.bind(this);

    // do nothing if video is not in page
    if( !this.video ) return;

    // detect power-mode only for iOS
    // also check for navigator.platform because this power-mode detection always return LOW on Chrome iOS emulation
    if( ios() && navigator.platform !== "MacIntel" ) this.init();
    else this.destroy();
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();
    
    if( this.video ) this.video.remove();
    this.video = null;

    this._onPlay = null;

    if( this.low ) html.classList.add(POWER_MODE_LOW_CLASSNAME);
  }

  _bindEvents() {
    if( this.video ) on(this.video, 'canplaythrough', this._onPlay);
  }
  _unbindEvents() {
    if( this.video ) off(this.video, 'canplaythrough', this._onPlay);
  }

  _onPlay() {
    if( this.video.paused ) this._low = true;
    if( window.console ) window.console.log(`PowerMode: ${this._low ? 'Low' : 'Default'}`);

    this.destroy();
  }


  // getter
  get low() { return this._low; }
  //get low() { return false; }
  //get low() { return true; }
}

export default new PowerMode();
