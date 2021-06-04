import EventEmitter2 from "eventemitter2";

import { $, $$ } from "@utils/dom";
import { on, off } from "@utils/listener";

class TabList extends EventEmitter2 {
  constructor(el) {
    super();

    this.el = el;
    this.buttons = [ ...$$('[role*="tab"]', this.el) ];

    this._selectedItem = null;
    this._value = null;

    this._onClick = this._onClick.bind(this);

    this.init();
  }

  init() {
    // set initial selected item & value
    this._selectedItem = this.buttons.find(button => button.getAttribute('aria-selected') === 'true');
    if( this._selectedItem ) this._value = this._selectedItem.getAttribute('aria-controls');

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    this.el = null;
    this.buttons = null;

    this._selectedItem = null;
    this._value = null;

    this._onClick = null;
  }

  _bindEvents() {
    if( this.buttons ) on(this.buttons, 'click', this._onClick);
  }
  _unbindEvents() {
    if( this.buttons ) off(this.buttons, 'click', this._onClick);
  }

  _onClick(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    const btn = event.currentTarget;

    // if clicked button is already selected, skip here
    if( btn === this._selectedItem ) return;

    // deselected previously selected button
    if( this._selectedItem ) this._selectedItem.setAttribute('aria-selected', false);

    // hide previously selected button
    if( this._value ) {
      const previous_panel = $(`#${this._value}`);
      if( previous_panel ) previous_panel.setAttribute('aria-hidden', true);
    }

    // select button
    this._selectedItem = btn;
    this._selectedItem.setAttribute('aria-selected', true);

    // update value
    this._value = this._selectedItem.getAttribute('aria-controls');

    // try to select is controlled child
    const panel = $(`#${this._value}`);
    if( panel ) panel.setAttribute('aria-hidden', false);

    // emit change event
    this.emit('change', this._value);
  }

  // getter - setter
  get selectedItem() { return this._selectedItem; }
  get value() { return this._value; }
}

export default TabList;
