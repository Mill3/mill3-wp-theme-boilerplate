import { $$, rect } from '@utils/dom';
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
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    this.el = null;
    this.emitter = null;
    this.paths = null;

    this._onResize = null;
  }

  _bindEvents() {
    if( this.paths.length > 0 ) {
      ResizeOrientation.add(this._onResize);
      this._onResize();
    }
  }
  _unbindEvents() {
    if( this.paths.length > 0 ) ResizeOrientation.remove(this._onResize);
  }

  _onResize() {
    this.paths.forEach(path => {
      const scale = path.getAttribute('vector-effect') === 'non-scaling-stroke' ? rect(path).width / path.getBBox().width : 1;
      path.style.setProperty('--length', `${path.getTotalLength() * scale}px`);
    });
  }
}

export default SvgPathLength;
