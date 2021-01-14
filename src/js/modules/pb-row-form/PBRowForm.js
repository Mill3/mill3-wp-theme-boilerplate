import { $ } from "@utils/dom";

import GForm from "@components/GForm";

class PbRowForm {
  constructor(el) {
    this.el = el;
    this.gform_wrapper = $(".gform_wrapper", this.el);
    this.gform = null;

    this.init();
  }

  init() {
    if (this.gform_wrapper) this.gform = new GForm(this.gform_wrapper);
  }
  destroy() {
    if (this.gform) this.gform.destroy();

    this.el = null;
    this.gform_wrapper = null;
    this.gform = null;
  }
}

export default PbRowForm;
