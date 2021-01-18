/* eslint-disable no-undef */
import EventEmitter2 from "eventemitter2";

import { $, $$ } from "@utils/dom";
import { on, off } from "@utils/listener";

const CLASSNAME = "--filled";
const SUBMIT_SELECTOR = ".gsubmit";
const SUBMITING_CLASSNAME = "--submitting";

class GForm extends EventEmitter2 {
  constructor(el) {
    super();

    this.el = el;
    this.id = parseInt(this.el.id.replace("gform_wrapper_", ""));

    this._onRender = this._onRender.bind(this);
    this._onSubmit = this._onSubmit.bind(this);

    this.reset();
    this.init();
  }

  init() {
    jQuery(document).on("gform_post_render", this._onRender);
  }

  destroy() {
    jQuery(document).off("gform_post_render", this._onRender);
    if (this.fields) this.fields.forEach((field) => field.destroy());

    this.el = null;
    this.id = null;
    this.form = null;
    this.body = null;
    this.submit = null;
    this.fields = null;

    this._onRender = null;
    this._onSubmit = null;
  }

  reset() {
    if (this.fields) this.fields.forEach((field) => field.destroy());
    if (this.submit) off(this.submit, "click", null);

    this.form = $("form", this.el);
    this.body = $(".gform_body", this.el);
    this.submit = $(SUBMIT_SELECTOR, this.el);
    this.fields = [...$$(".gfield", this.body)].map((field) => new GFormField(field));

    if (this.submit) on(this.submit, "click", this._onSubmit);
  }

  _onRender(event, formId) {
    if (formId !== this.id) return;

    this.el.classList.remove(SUBMITING_CLASSNAME);

    this.reset();
    this.emit("resize");

    window.dispatchEvent(new Event("resize"));
  }
  _onSubmit() {
    this.el.classList.add(SUBMITING_CLASSNAME);
  }
}

const INPUT_SELECTOR =
  'input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="image"]):not([type="file"]):not([type="hidden"])';
const TEXTAREA_SELECTOR = "textarea";
const SELECT_SELECTOR = "select";

class GFormField {
  constructor(el) {
    this.el = el;
    this.label = $(".gfield_label", this.el);
    this.inputContainer = $(".ginput_container", this.el);
    this.input = this._getInput();

    this._onInputFocus = this._onInputFocus.bind(this);
    this._onInputBlur = this._onInputBlur.bind(this);

    this.init();
  }

  init() {
    if (this.input) {
      this.input.on("focus", this._onInputFocus);
      this.input.on("blur", this._onInputBlur);

      const value = this.input.value.trim();
      if (value) this._onInputFocus();
    }
  }
  destroy() {
    if (this.input) {
      this.input.off("focus", this._onInputFocus);
      this.input.off("blur", this._onInputBlur);
      this.input.destroy();
    }

    this.el = null;
    this.label = null;
    this.inputContainer = null;
    this.input = null;

    this._onInputFocus = null;
    this._onInputBlur = null;
  }

  _onInputFocus() {
    this.el.classList.add(CLASSNAME);
  }
  _onInputBlur() {
    // check if input is empty
    if (this.input) {
      const value = this.input.value.trim();
      if (value) return;
    }

    this.el.classList.remove(CLASSNAME);
  }

  _getInput() {
    const textarea = $(TEXTAREA_SELECTOR, this.inputContainer);
    if (textarea) return new GFieldTextArea(textarea);

    const select = $(SELECT_SELECTOR, this.inputContainer);
    if (select) return new GFieldSelect(select);

    const input = $(INPUT_SELECTOR, this.inputContainer);
    if (input) return new GFieldInput(input);

    return null;
  }
}

class GFieldInput extends EventEmitter2 {
  constructor(el) {
    super();

    this.el = el;

    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);

    this.init();
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    this.el = null;

    this._onFocus = null;
    this._onBlur = null;
  }

  _bindEvents() {
    on(this.el, "focus", this._onFocus);
    on(this.el, "blur", this._onBlur);
  }
  _unbindEvents() {
    off(this.el, "focus", this._onFocus);
    off(this.el, "blur", this._onBlur);
  }

  _onFocus() {
    this.emit("focus", this);
  }
  _onBlur() {
    this.emit("blur", this);
  }

  // getter
  get value() {
    return this.el.value;
  }
}

class GFieldTextArea extends GFieldInput {
  init() {
    this.el.setAttribute("rows", 1);
    this.el.removeAttribute("cols");

    this._currentHeight = null;
    this._onInput = this._onInput.bind(this);

    super.init();
    this.update();
  }
  destroy() {
    this._currentHeight = null;
    this._onInput = null;

    super.destroy();
  }
  update() {
    if (!this.el) return;

    // Reset height
    this.el.style.height = "inherit";

    // Calculate the height
    const height = this.el.scrollHeight;

    // if height has changed from previous value (except for initial update)
    if (this._currentHeight !== height && this._currentHeight !== null) {
      this.emit("resize", this);
      window.dispatchEvent(new Event("resize"));
    }

    this._currentHeight = height;
    this.el.style.height = `${this._currentHeight}px`;
  }

  _bindEvents() {
    super._bindEvents();
    on(this.el, "input", this._onInput);
  }
  _unbindEvents() {
    super._unbindEvents();
    off(this.el, "input", this._onInput);
  }

  _onInput() {
    this.update();
  }
}

// for future use
class GFieldSelect extends GFieldInput {}

export default GForm;
