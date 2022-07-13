import EventEmitter2 from "eventemitter2";

import { on, off } from "@utils/listener";

class Accordion extends EventEmitter2 {
  constructor(button, panel, closeOnTapOut = false) {
    super();

    this.button = button;
    this.panel = panel;
    this.parent = button.closest('.accordions__accordion');

    this._toggled = this.button.getAttribute("aria-expanded") == 'true';
    this._closeOnTapOut = closeOnTapOut;

    this._onClick = this._onClick.bind(this);
    this._onClickPanel = this._onClickPanel.bind(this);
    this._onClickOutside = this._onClickOutside.bind(this);

    this.init();
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    this.button = null;
    this.panel = null;

    this._toggled = null;
    this._closeOnTapOut = null;

    this._onClick = null;
    this._onClickPanel = null;
    this._onClickOutside = null;
  }
  open(silent = false) {
    if (this._toggled === true) return;
    this._toggled = true;

    this.parent.setAttribute("aria-expanded", true);
    this.button.setAttribute("aria-expanded", true);
    this.panel.setAttribute("aria-hidden", false);

    if (this._closeOnTapOut) window.addEventListener("click", this._onClickOutside);

    if (!silent) this.emit("open", this);
  }
  close(silent = false) {
    if (this._toggled === false) return;
    this._toggled = false;

    if (this._closeOnTapOut) window.removeEventListener("click", this._onClickOutside);

    this.parent.setAttribute("aria-expanded", false);
    this.button.setAttribute("aria-expanded", false);
    this.panel.setAttribute("aria-hidden", true);

    if (!silent) this.emit("close", this);
  }
  toggle() {
    if (this._toggled === true) this.close();
    else this.open();
  }

  _bindEvents() {
    if (this.button) on(this.button, "click", this._onClick);
    if (this.panel) on(this.panel, "click", this._onClickPanel);
  }
  _unbindEvents() {
    if (this.button) off(this.button, "click", this._onClick);
    if (this.panel) off(this.panel, "click", this._onClickPanel);
    if (this._closeOnTapOut) window.removeEventListener("click", this._onClickOutside);
  }

  _onClick(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    this.toggle();
  }
  _onClickPanel(event) {
    if (event) {
      event.stopImmediatePropagation();
    }
  }
  _onClickOutside() {
    this.close();
  }

  // getter
  get toggled() {
    return this._toggled;
  }
}

export default Accordion;
