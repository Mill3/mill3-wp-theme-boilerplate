import GForm from "@components/GForm";

class Gform {
  constructor(el) {
    this.el = el;
    this.gform = null;

    this.init();
  }

  init() {
    this.gform = new GForm(this.el);
  }
  destroy() {
    if (this.gform) this.gform.destroy();

    this.el = null;
    this.gform_wrapper = null;
    this.gform = null;
  }
}

export default Gform;
