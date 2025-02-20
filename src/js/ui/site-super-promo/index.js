import GDPR, { CONSENT_CLOSED } from "@core/gdpr";
import { $ } from "@utils/dom";
import { on, off } from "@utils/listener";
import { mobile } from "@utils/mobile";

const STORAGE_KEY = "scores.ca_superPromos";

const EXIT_INTENTION = true; // detect if user try to close window OR go back (false to disable this feature) do not work on mobile
const INACTIVITY_DELAY = 15000; // inactivity delay (anywhere in page) before showing modal in milliseconds (false to disable this feature)
const NO_SCROLL_DELAY = 5000; // delay before showing modal when user is at top of page and don't scroll for x milliseconds (false to disable this feature)
const SCROLL_REQUIRED = 0.5; // percentage (0 to 1) of scrolling required to show modal (false to disable this feature)
const SHOW_AFTER_ENOUGH_PAGE_VIEWS = 3; // force show modal after X pages are visited (false to disable this feature)
const SHOW_AFTER_ENOUGH_PAGE_VIEWS_DELAY = 2000; // in milliseconds

class SiteSuperPromo {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.closeBtn = $('.site-super-promo__closeBtn', this.el);

    this._detectNoScroll = null;
    this._id = parseInt(this.el.dataset.superPromotionId);
    this._inactivity = null;
    this._initialized = false;
    this._noScroll = null;
    this._numPageViews = 0;
    this._timeout = null;

    // get data from session storage
    // split into array
    // transform each values into integer using parseInt
    // filter non-integer values
    this._viewedPromos = (localStorage.getItem(STORAGE_KEY) || '')
      .split(',')
      .map(id => parseInt( id.toString().trim() ))
      .filter(id => id);

    this._viewed = this._viewedPromos.includes(this._id);

    this._resetInactivityTimeout = this._resetInactivityTimeout.bind(this);
    this._onDialogToggle = this._onDialogToggle.bind(this);
    this._onDialogClosed = this._onDialogClosed.bind(this);
    this._onClickOutside = this._onClickOutside.bind(this);
    this._onCloseClick = this._onCloseClick.bind(this);
    this._onGDPRClose = this._onGDPRClose.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onShowAfterEnoughPageViews = this._onShowAfterEnoughPageViews.bind(this);
    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    this._onInactivity = this._onInactivity.bind(this);
    this._onExitIntention = this._onExitIntention.bind(this);
    this._onNoScroll = this._onNoScroll.bind(this);
    this._onNoScrollCallback = this._onNoScrollCallback.bind(this);
  }

  init() {
    if( this._initialized || this._viewed ) return;
    this._initialized = true;

    this._bindEvents();
  }
  start() {
    if( this._viewed ) return;

    if( SHOW_AFTER_ENOUGH_PAGE_VIEWS !== false ) this._numPageViews++;
    this._detectNoScroll = NO_SCROLL_DELAY !== false;

    // if GPDR is not detected or already accepted/declined from previous visit, start watching
    // otherwise, wait for GPDR to be close before start watching
    if( !$('#gdpr') || GDPR.consent_status === CONSENT_CLOSED ) this._startWatching();
  }
  stop() {
    this._stopWatching();
  }

  _bindEvents() {
    on(this.el, 'toggle', this._onDialogToggle);
    on(this.el, 'click', this._onClickOutside);
    on(this.closeBtn, 'click', this._onCloseClick);
    this.emitter.on('GDPR.close', this._onGDPRClose);
  }
  _unbindEvents() {
    off(this.el, 'toggle', this._onDialogToggle);
    off(this.el, 'click', this._onClickOutside);
    off(this.closeBtn, 'click', this._onCloseClick);
    this.emitter.off('GDPR.close', this._onGDPRClose);
  }

  _startWatching() {
    if( SCROLL_REQUIRED !== false ) this.emitter.on('SiteScroll.scroll', this._onScroll);
    if( EXIT_INTENTION && !mobile ) on(document, 'mouseleave', this._onExitIntention);

    if( INACTIVITY_DELAY !== false ) {
      on(document, 'visibilitychange', this._onVisibilityChange);
      on(document, 'pointerdown', this._resetInactivityTimeout);
      on(document, 'pointermove', this._resetInactivityTimeout);
      on(document, 'pointerup', this._resetInactivityTimeout);
      on(window, 'keypress', this._resetInactivityTimeout);
      this.emitter.on('SiteScroll.scroll', this._resetInactivityTimeout);

      this._onVisibilityChange();
    }

    if( NO_SCROLL_DELAY !== false ) {
      this.emitter.on('SiteScroll.scroll', this._onNoScroll);
      if( !this._noScroll ) this._noScroll = setTimeout(this._onNoScrollCallback, NO_SCROLL_DELAY);
    }

    // if SHOW_AFTER_ENOUGH_PAGE_VIEWS feature is enabled AND numPageViews is enough
    if( SHOW_AFTER_ENOUGH_PAGE_VIEWS !== false && this._numPageViews >= SHOW_AFTER_ENOUGH_PAGE_VIEWS ) {
      if( !this._timeout ) this._timeout = setTimeout(this._onShowAfterEnoughPageViews, SHOW_AFTER_ENOUGH_PAGE_VIEWS_DELAY);
    }
  }
  _stopWatching() {
    if( this._inactivity ) clearTimeout(this._inactivity);
    if( this._noScroll ) clearTimeout(this._noScroll);
    if( this._timeout ) clearTimeout(this._timeout);

    this._inactivity = null;
    this._noScroll = null;
    this._timeout = null;

    off(document, 'mouseleave', this._onExitIntention);
    off(document, 'visibilitychange', this._onVisibilityChange);
    off(document, 'pointerdown', this._resetInactivityTimeout);
    off(document, 'pointermove', this._resetInactivityTimeout);
    off(document, 'pointerup', this._resetInactivityTimeout);
    off(window, 'keypress', this._resetInactivityTimeout);

    this.emitter.off('SiteScroll.scroll', this._onScroll);
    this.emitter.off('SiteScroll.scroll', this._resetInactivityTimeout);
    this.emitter.off('SiteScroll.scroll', this._onNoScroll);
  }
  _showModal() {
    this._stopWatching();
    this.el.showModal();
  }
  _resetInactivityTimeout() {
    if( this._inactivity ) clearTimeout(this._inactivity);
    this._inactivity = setTimeout(this._onInactivity, INACTIVITY_DELAY);
  }

  
  _onDialogToggle() {
    if( this.el.open ) {
      this._stopWatching();

      this._viewed = true;
      this._viewedPromos.push(this._id);
      localStorage.setItem(STORAGE_KEY, this._viewedPromos.join(','));
    } else {
      this._unbindEvents();
      on(this.el, 'transitionend', this._onDialogClosed);
    }
  }
  _onDialogClosed(event) {
    if( event.target !== this.el ) return;

    off(this.el, 'transitionend', this._onDialogClosed);
    this.el.remove();
  }
  _onClickOutside({ target }) {
    if( target.nodeName === 'DIALOG' ) this.el.close();
  }
  _onCloseClick(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    this.el.close();
  }
  _onGDPRClose() {
    this.emitter.off('GDPR.close', this._onGDPRClose);
    if( this._viewed ) return;

    this._startWatching();
  }
  _onScroll({ progress }) {
    if( progress > SCROLL_REQUIRED ) this._showModal();
  }
  _onShowAfterEnoughPageViews() {
    this._showModal();
  }
  _onVisibilityChange() {
    if( document.hidden ) {
      if( this._inactivity ) clearTimeout(this._inactivity);
      if( this._noScroll ) clearTimeout(this._noScroll);
      if( this._timeout ) clearTimeout(this._timeout);

      this._inactivity = null;
      this._noScroll = null;
      this._timeout = null;
    } else {
      this._resetInactivityTimeout();

      if( NO_SCROLL_DELAY !== false && this._detectNoScroll ) {
        if( this._noScroll ) clearTimeout(this._noScroll);
        this._noScroll = setTimeout(this._onNoScrollCallback, NO_SCROLL_DELAY);
      }

      if( SHOW_AFTER_ENOUGH_PAGE_VIEWS !== false && this._numPageViews >= SHOW_AFTER_ENOUGH_PAGE_VIEWS ) {
        if( this._timeout ) clearTimeout(this._timeout);
        this._timeout = setTimeout(this._onShowAfterEnoughPageViews, SHOW_AFTER_ENOUGH_PAGE_VIEWS_DELAY);
      }
    }
  }
  _onInactivity() {
    this._showModal();
  }
  _onExitIntention() {
    this._showModal();
  }
  _onNoScroll({ y }) {
    if( y <= 0 ) return;

    this.emitter.off('SiteScroll.scroll', this._onNoScroll);
    this._detectNoScroll = false;

    if( this._noScroll ) clearTimeout(this._noScroll);
    this._noScroll = null;
  }
  _onNoScrollCallback() {
    this._showModal();
  }
}

export default SiteSuperPromo;
