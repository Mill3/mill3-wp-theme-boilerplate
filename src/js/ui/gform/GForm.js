import EventEmitter2 from "eventemitter2";

import GForm from "@components/GForm";

class Gform extends EventEmitter2 {
  constructor(el) {
    super();

    this.el = el;
    this.gform = null;

    this._onResize = this._onResize.bind(this);

    this.init();
  }

  init() {
    this.gform = new GForm(this.el);
    this.gform.on('resize', this._onResize);
  }
  destroy() {
    if (this.gform) {
      this.gform.off('resize', this._onResize);
      this.gform.destroy();
    }

    this.el = null;
    this.gform_wrapper = null;
    this.gform = null;

    this._onResize = null;
  }

  _onResize() {
    this.emit('resize');
  }
}

export default Gform;
