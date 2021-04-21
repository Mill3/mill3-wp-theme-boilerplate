import copy from "clipboard-copy";

import { $ } from "@utils/dom";
import { on, off } from "@utils/listener";

class Sharing {
  constructor(el) {
    this.el = el;
    this.copyBtn = $('.sharing__copyBtn');
    this.copyMessage = $('.sharing__copyMessage');

    this._copyPromise = null;
    this._copyTick = null;

    this._onCopyClick = this._onCopyClick.bind(this);
    this._onCopySuccess = this._onCopySuccess.bind(this);
    this._onCopyError = this._onCopyError.bind(this);
    this._copyCompleted = this._copyCompleted.bind(this);
    
    this.init();
  }
  
  init() {
    this._bindEvents();
  }
  destroy() {
    if( this._copyTick ) clearTimeout(this._copyTick);
    this._unbindEvents();

    this.el = null;
    this.copyBtn = null;
    this.copyMessage = null;

    this._copyPromise = null;
    this._copyTick = null;

    this._onCopyClick = null;
    this._onCopySuccess = null;
    this._onCopyError = null;
    this._copyCompleted = null;
  }
  
  _bindEvents() {
    if( this.copyBtn ) on(this.copyBtn, 'click', this._onCopyClick);
  }
  _unbindEvents() {
    if( this.copyBtn ) off(this.copyBtn, 'click', this._onCopyClick);
  }

  _onCopyClick(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    
    // if promise exist, it means copying is in progress
    if( this._copyPromise ) return;

    this._copyPromise = copy(this.copyBtn.dataset.sharingCopyUrl)
      .then(this._onCopySuccess)
      .catch(this._onCopyError);
  }
  _onCopySuccess() {
    if( this.copyMessage ) {
      this.copyMessage.setAttribute('aria-hidden', false);
      this._copyTick = setTimeout(this._copyCompleted, 3000);
    }
  }
  _onCopyError(error) {
    console.log(error);
    this._copyPromise = null;
  }
  _copyCompleted() {
    if( this.copyMessage ) this.copyMessage.setAttribute('aria-hidden', true);
    this._copyPromise = null;
  }
}

export default Sharing;
