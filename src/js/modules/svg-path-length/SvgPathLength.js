import { $$ } from '@utils/dom';
import ResizeOrientation from '@utils/resize';


class SvgPathLength {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.paths = [ ...$$('path', this.el) ];

    this._onResize = this._onResize.bind(this);

    this.init();
  }

  init() {
    if( this.paths.length > 0 ) {
      this._ro = new ResizeOrientation(this._onResize);
      this._ro.run();
    }

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if( this._ro ) this._ro.dispose();

    this.el = null;
    this.emitter = null;
    this.paths = null;

    this._ro = null;
  }

  _bindEvents() {
    if( this._ro ) this._ro.on();
  }
  _unbindEvents() {
    if( this._ro ) this._ro.off();
  }

  _onResize() {
    this.paths.forEach(path => path.style.setProperty('--length', `${path.getTotalLength()}px`));
  }
}

export default SvgPathLength;
