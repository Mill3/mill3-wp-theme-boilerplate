import { getBody } from '@utils/dom';
import { requestInterval } from '@utils/interval';
import RAF from '@utils/raf';

const UPDATE_PER_SECONDS = 1; // how many time per seconds you want to update value on screen

class FPSTracker {
  constructor() {
    this.el = document.createElement('div');
    this.el.classList.add('fps-tracker', 'position-fixed', 't-0', 'l-0', 'd-flex', 'align-items-center', 'pointer-events-none');
    this.el.style.width = '40px';
    this.el.style.height = '40px';
    this.el.style.color = 'white';
    this.el.style.fontSize = '10px';
    this.el.style.fontFamily = 'monospace';
    this.el.style.padding = '0 2px';
    this.el.style.zIndex = '99999';
    this.el.style.whiteSpace = 'nowrap';
    this.el.setAttribute('inert', true);

    this._times = [];
    this._fps;

    this._onRAF = this._onRAF.bind(this);
    this._onUpdate = this._onUpdate.bind(this);

    getBody().appendChild(this.el);
    RAF.add(this._onRAF, 100000, true);
    requestInterval(this._onUpdate, 1000 / UPDATE_PER_SECONDS);
  }

  _onRAF() {
    const now = performance.now();
    while( this._times.length > 0 && this._times[0] <= now - 1000 ) this._times.shift();
    
    this._times.push(now);
    this._fps = this._times.length;
  }
  _onUpdate() { this.el.textContent = `FPS ${this._fps}`; }
}

new FPSTracker();
