import { STATE } from "@core/state";
import { $, $$, html } from "@utils/dom";
import { on, off } from "@utils/listener";

export const CLASSNAME = "--js-site-nav-opened";

class SiteNav {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.bg = $('.site-nav__bg', this.el);
    this.triggers = [...$$(`[aria-controls="${this.el.id}"]`)];

    this._isChildOfWindmill = this.el.closest('[data-windmill="container"]') ? true : false;
    this._opened = false;
    this._scrollY = 0;

    this._handleTriggers = this._handleTriggers.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._onCloseCompleted = this._onCloseCompleted.bind(this);

    this._bindEvents();
  }

  destroy() {
    html.classList.remove(CLASSNAME);

    this.el = null;
    this.emitter = null;
    this.bg = null;
    this.triggers = null;

    this._isChildOfWindmill = null;
    this._opened = false;
    this._scrollY = 0;

    this._handleTriggers = null;
    this._handleKeyDown = null;
    this._onCloseCompleted = null;
  }
  stop() {
    if( this._isChildOfWindmill ) this._unbindEvents();
  }

  _bindEvents() {
    if( this.triggers ) on(this.triggers, "click", this._handleTriggers);
    if( this.el ) on(window, "keydown", this._handleKeyDown);
    if( this.emitter ) this.emitter.on("SiteNav.toggle", this._handleTriggers);
  }
  _unbindEvents() {
    if( this.triggers ) off(this.triggers, "click", this._handleTriggers);
    if( this.el ) off(window, "keydown", this._handleKeyDown);
    if( this.emitter ) this.emitter.off("SiteNav.toggle", this._handleTriggers);
  }

  open() {
    // if SiteNav is already opened, do nothing
    if (this._opened === true) return;
    this._opened = true;

    // dispatch to state current status
    STATE.dispatch("SITE_NAV", this._opened);

    // save scrollY
    this._scrollY = window.scrollY;

    // unbind close completed callback
    if (this.bg) off(this.bg, "transitionend", this._onCloseCompleted);

    // inform <html> that SiteNav is opened
    html.classList.add(CLASSNAME);

    // stop page scroll & site-nav open
    this.emitter.emit("SiteScroll.stop");
    this.emitter.emit("SiteNav.open");

    // inform each triggers that SiteNav is opened
    this.triggers.forEach(btn => {
      btn.setAttribute("aria-expanded", true);
      btn.classList.add("is-active");
    });

    // set SiteNav visible for screen readers
    this.el.setAttribute("aria-hidden", false);
  }
  close() {
    // if SiteNav isn't opened, do nothing
    if (this._opened === false) return;
    this._opened = false;

    // dispatch to state current status
    STATE.dispatch("SITE_NAV", this._opened);

    // inform triggers that SiteNav is closed
    this.triggers.forEach(btn => {
      btn.setAttribute("aria-expanded", false);
      btn.classList.remove("is-active");
    });

    // close callback
    if (this.bg) {
      off(this.bg, "transitionend", this._onCloseCompleted);
      on(this.bg, "transitionend", this._onCloseCompleted);
    }

    // inform <html> that SiteNav is closed
    html.classList.remove(CLASSNAME);

    // restore previous scrollY
    window.scrollTo({top: this._scrollY, behavior: 'auto'});

    // update site-scroll & site-nav close
    this.emitter.emit('SiteScroll.update');
    this.emitter.emit("SiteNav.close");
  }
  toggle() {
    // regular SiteNav toggle handling
    if (this._opened === true) this.close();
    else this.open();
  }

  _handleTriggers(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.toggle();
  }
  _handleKeyDown(event) {
    if (this._opened === true && (event.key === "Escape" || event.key === "Esc")) {
      this.close();
    }
  }
  _onCloseCompleted() {
    if (this._opened === true) return;

    // restart page scroll
    this.emitter.emit("SiteScroll.start");

    // hide SiteNav from screen readers
    this.el.setAttribute("aria-hidden", true);
  }

  // getters
  get opened() {
    return this._opened;
  }
}

export default SiteNav;
