import { $ } from "@utils/dom";
import { on, off } from "@utils/listener";

const CLASSNAME = "--filled";
const VALIDATION_CLASSNAME = '--validation-reported';
const SUCCESS_CLASSNAME = '--wp-success';
const ERROR_CLASSNAME = '--wp-error';
const OUTPUT_DELAY = 5000;

class Newsletter {
  constructor(el) {
    this.el = el;
    this.form = $('.newsletter__form', this.el);
    this.input = $('.newsletter__form__input', this.form);
    this.btn = $('.newsletter__form__submit', this.form);
    this.output = $('.newsletter__form__output', this.form);

    this._waiting = false;
    this._timer = null;

    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onSubmitCallback = this._onSubmitCallback.bind(this);
    this._onSubmitError = this._onSubmitError.bind(this);
    this._onReset = this._onReset.bind(this);
    this._send = this._send.bind(this);
    this._removeOutputMessage = this._removeOutputMessage.bind(this);
  }

  init() {
    if (this.input) {
      on(this.input, "focus", this._onFocus);
      on(this.input, "blur", this._onBlur);

      const value = this.input.value.trim();
      if (value) this._onFocus();
    }

    if (this.form) {
      on(this.form, "submit", this._onSubmit);
      on(this.form, "reset", this._onReset);
    }
  }
  destroy() {
    if( this.input ) {
      off(this.input, "focus", this._onFocus);
      off(this.input, "blur", this._onBlur);
    }

    if( this.form ) {
      off(this.form, "submit", this._onSubmit);
      off(this.form, "reset", this._onReset);
    }

    this.el = null;
    this.form = null;
    this.input = null;
    this.btn = null;
    this.output = null;

    this._onFocus = null;
    this._onBlur = null;
    this._onSubmit = null;
    this._onSubmitCallback = null;
    this._onSubmitError = null;
    this._onReset = null;
    this._send = null;
    this._removeOutputMessage = null;
  }

  _onFocus() {
    if( this._timer ) clearTimeout( this._timer );
    this._timer = null;

    if( this.form.classList.contains(SUCCESS_CLASSNAME) ) {
      this.form.classList.remove(SUCCESS_CLASSNAME);
      if( this.output ) this.output.innerHTML = '';
    }

    this.form.classList.add(CLASSNAME);
  }
  _onBlur() {
    // check if input is empty
    if (this.input) {
      const value = this.input.value.trim();
      if (value) return;
    }

    this.form.classList.remove(CLASSNAME);
  }
  _onSubmit(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    // remove previous success status
    if( !this.form.classList.contains( SUCCESS_CLASSNAME ) )this.form.classList.remove(SUCCESS_CLASSNAME);

    // add class to form informing fields that they can show their validity/invalidity status
    if( !this.form.classList.contains( VALIDATION_CLASSNAME ) ) this.form.classList.add( VALIDATION_CLASSNAME );

    // if native form validation is not supported
    if( this.form.reportValidity ){

      // if form validation fails, skip here
      if( !this.form.reportValidity() ) return false;
    }

    // if form is already submitted
    if( this._waiting === true ) return false;
    this._waiting = true;

    // cancel delayed reset of output message
    if( this._timer ) clearTimeout( this._timer );
    this._timer = null;

    // disable submit button to prevent multiple click
    if( this.btn ) this.btn.setAttribute('disabled', true);

    // clear & hide output message
    if( this.output ) {
      this.output.classList.remove(ERROR_CLASSNAME);
      this.output.innerHTML = '';
    }

    // invoke Google reCAPTCHA v3
    if( window.grecaptcha && window.reCAPTCHA_SITE_KEY ) {
      window.grecaptcha
        .execute(window.reCAPTCHA_SITE_KEY, {action: 'newsletter'})
        .then(this._send);
    }
    else this._send();

    return false;
  }
  _onSubmitCallback(response) {
    const { success, message, errors } = response;

    if( success ) {
      this.form.classList.remove(VALIDATION_CLASSNAME);
      this.form.classList.add(SUCCESS_CLASSNAME);
      this.form.reset();
    }

    // show output message only if there is no errors in fields
    if( message && this.output && !errors ) {
      if( !success ) this.output.classList.add(ERROR_CLASSNAME);
      this.output.innerHTML = message;

      if( success ) this._timer = setTimeout(this._removeOutputMessage, OUTPUT_DELAY);
    }

    // enabled submit button
    if( this.btn ) this.btn.removeAttribute('disabled');
    this._waiting = false;
  }
  _onSubmitError(error) {
    // show output message
    if( this.output ) {
      this.output.classList.add(ERROR_CLASSNAME);
      this.output.innerHTML = error;
    }

    // remove form validator
    this.form.classList.remove( VALIDATION_CLASSNAME );

    // enabled submit button
    if( this.btn ) this.btn.removeAttribute('disabled');
    this._waiting = false;
  }
  _onReset() {
    this._onBlur();
  }

  _send(token = null) {
    const url = this.form.getAttribute('action');
    const formData = new FormData(this.form)

    // add token if available
    if(token) formData.append('reCAPTCHA', token)

    return fetch(url, { method: 'post', body: formData })
      .then((response) => response.json())
      .then(this._onSubmitCallback)
      .catch(this._onSubmitError);
  }
  _removeOutputMessage() {
    if( this._timer ) clearTimeout( this._timer );
    this._timer = null;

    if( this.form ) this.form.classList.remove(CLASSNAME, SUCCESS_CLASSNAME);
    if( this.output ) this.output.innerHTML = '';
  }
}

export default Newsletter;
