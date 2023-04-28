/* eslint-disable no-undef */
import EventEmitter2 from "eventemitter2";

import { $, $$ } from "@utils/dom";
import { getFormId } from "@utils/gform";
import { on, off } from "@utils/listener";

const CLASSNAME = "--filled";
const SUBMIT_SELECTOR = ".gsubmit";
const SUBMITING_CLASSNAME = "--submitting";

class GForm extends EventEmitter2 {
  constructor(el) {
    super();

    this.el = el;
    this.form = null;
    this.id = null;
    this.postTitle = '';

    this._onRender = this._onRender.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onConditionalLogic = this._onConditionalLogic.bind(this);

    this.reset();
    this.init();
  }

  init() {
    jQuery(document).on("gform_post_render", this._onRender);
    gform.addAction("gform_post_conditional_logic_field_action", this._onConditionalLogic);
  }
  destroy() {
    jQuery(document).off("gform_post_render", this._onRender);
    gform.removeAction("gform_post_conditional_logic_field_action", this._onConditionalLogic);

    if (this.fields) {
      this.fields.forEach((field) => {
        field.off('resize', this._onResize);
        field.destroy();
      });
    }

    this.el = null;
    this.id = null;
    this.form = null;
    this.body = null;
    this.submit = null;
    this.fields = null;
    this.postTitle = null;

    this._onRender = null;
    this._onSubmit = null;
    this._onResize = null;
    this._onConditionalLogic = null;
  }

  reset() {
    if (this.submit) off(this.submit, "click", null);
    if (this.fields) {
      this.fields.forEach((field) => {
        field.off('resize', this._onResize);
        field.destroy();
      });
    }

    this.form = $("form", this.el);
    this.id = getFormId(this.form);
    this.body = $(".gform_body", this.el);
    this.submit = $(SUBMIT_SELECTOR, this.el);
    this.fields = [...$$(".gfield", this.body)].map((field) => new GFormField(field));

    if (this.submit) on(this.submit, "click", this._onSubmit);
  }
  updatePostTitle(postTitle = '') {
    this.fields.forEach(field => {
      const input = field.input;
      if( input && input instanceof GFieldPostTitle ) input.update(postTitle);
    });
  }

  _onRender(event, formId) {
    // if event is not for this form, stop here
    if (formId !== this.id) return;

    this.el.classList.remove(SUBMITING_CLASSNAME);

    this.reset();
    this.emit("resize");
  }
  _onSubmit() {
    if( this.el ) this.el.classList.add(SUBMITING_CLASSNAME);
  }
  _onResize() {
    this.emit("resize");
  }
  _onConditionalLogic(formId, action, targetId) {
    // if event is not for this form, stop here
    if( formId !== this.id || action !== 'hide' ) return;

    // refresh field related to this event
    const field = this.fields.find(field => field.id === targetId);
    if( field ) field.refresh();
  }
}

const INPUT_SELECTOR =
  'input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="image"]):not([type="file"]):not([type="hidden"])';
const TEXTAREA_SELECTOR = "textarea";
const SELECT_SELECTOR = "select";
const FILE_UPLOAD_SELECTOR = 'input[type="file"]';
const POST_TITLE_SELECTOR = 'input[type="hidden"][data-gform-post-title-input]';

class GFormField extends EventEmitter2 {
  constructor(el) {
    super();

    this.el = el;
    this.label = $(".gfield_label", this.el);
    this.inputContainer = $(".ginput_container", this.el);
    this.parentContainer = this.inputContainer.parentElement;
    this.input = this._getInput();
    this.type = this._getType();
    this.id = '#' + this.el.id;

    this._onInputFocus = this._onInputFocus.bind(this);
    this._onInputBlur = this._onInputBlur.bind(this);
    this._onInputResize = this._onInputResize.bind(this);

    this.init();
  }

  init() {
    if (this.input) {
      this.input.on("focus", this._onInputFocus);
      this.input.on("blur", this._onInputBlur);
      this.input.on("resize", this._onInputResize);

      // set input type on parentContainer
      if(this.parentContainer)  this.parentContainer.classList.add(`--${this.type}`);

      const value = this.input.value.trim();
      if (value) this._onInputFocus();
    }
  }
  destroy() {
    if (this.input) {
      this.input.off("focus", this._onInputFocus);
      this.input.off("blur", this._onInputBlur);
      this.input.off("resize", this._onInputResize);
      this.input.destroy();
    }

    this.el = null;
    this.label = null;
    this.inputContainer = null;
    this.parentContainer = null;
    this.input = null;
    this.type = null;
    this.id = null;

    this._onInputFocus = null;
    this._onInputBlur = null;
    this._onInputResize = null;
  }
  refresh() {
    if( !this.input ) return;

    const value = this.input.value.trim();

    if (value) this._onInputFocus();
    else this._onInputBlur();
  }

  _onInputFocus() {
    if( this.el ) this.el.classList.add(CLASSNAME);
  }
  _onInputBlur() {
    // check if input is empty
    if (this.input) {
      const value = this.input.value.trim();
      if (value) return;
    }

    if( this.el ) this.el.classList.remove(CLASSNAME);
  }
  _onInputResize() {
    this.emit("resize", this);
  }

  _getInput() {
    if( !this.inputContainer) return null;

    const textarea = $(TEXTAREA_SELECTOR, this.inputContainer);
    if (textarea) return new GFieldTextArea(textarea);

    const select = $(SELECT_SELECTOR, this.inputContainer);
    if (select) return new GFieldSelect(select);

    const file_input = $(FILE_UPLOAD_SELECTOR, this.inputContainer);
    if (file_input) return new GFieldFileUpload(file_input);

    const post_title_input = $(POST_TITLE_SELECTOR, this.inputContainer);
    if( post_title_input ) return new GFieldPostTitle(post_title_input);

    const input = $(INPUT_SELECTOR, this.inputContainer);
    if (input) return new GFieldInput(input);

    return null;
  }
  _getType() {
    if( !this.input) return null;

    const type = this.input.el.getAttribute('type');
    const tagName = this.input.el.tagName.toLowerCase();

    return type ? type : tagName;
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
      //window.dispatchEvent(new Event("resize"));
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
class GFieldFileUpload extends GFieldInput {
  init() {
    this.outputEl = $('.gform_fileupload_rules', this.el.parentElement);

    this._defaultOuputHTML = this.outputEl ? this.outputEl.innerHTML : null;
    this._value = '';

    this._onInput = this._onInput.bind(this);

    super.init();
  }
  destroy() {
    this.outputEl = null;

    this._defaultOuputHTML = null;
    this._value = null;

    this._onInput = null;

    super.destroy();
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
    if( !this.el || !this.outputEl) return;

    // output message to default value
    let output = this._defaultOuputHTML;

    // get filename of all files
    const { files } = this.el;
    if( files && files.length > 0 ) output = [ ...files ].map(file => file.name).join('<br />');

    // update value
    this._value = output === this._defaultOuputHTML ? '' : output;

    // update output message
    this.outputEl.classList[ output === this._defaultOuputHTML ? 'remove' : 'add' ]('--filled');
    this.outputEl.innerHTML = output;

    // trigger event
    this.emit(this._value.trim() ? "focus" : "blur", this);
  }

  // getter
  get value() { return this._value; }
}

class GFieldPostTitle extends EventEmitter2 {
  constructor(el) {
    super();

    this.el = el;

    this.init();
  }

  init() {}
  destroy() {
    this.el = null;
  }
  update(value) {
    this.el.value = value;
  }

  // getter 
  get value() {
    return this.el.value;
  }
}

export default GForm;
