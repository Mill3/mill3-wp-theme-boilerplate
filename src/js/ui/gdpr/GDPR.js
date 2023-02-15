import { default as Consent, CONSENT_DENIED, CONSENT_GRANTED } from "@core/gdpr";
import { $, $$ } from "@utils/dom";
import { on, off } from "@utils/listener";

export const SELECTOR = "#gdpr";

const CLASSNAME_MORE_OPTIONS = "--js-more-options";

class GDPR {
  constructor(init = false) {
    this.initialized = false;
    this.el = null;

    this._opened = false;

    this._acceptAll = this._acceptAll.bind(this);
    this._saveCustomized = this._saveCustomized.bind(this);
    this._rejectAll = this._rejectAll.bind(this);
    this._onMoreClick = this._onMoreClick.bind(this);
    this._onBackClick = this._onBackClick.bind(this);
    this._openBnd = this.open.bind(this);

    init ? this.init() : null;
  }

  get name() { return `GDPR`; }

  init() {
    if( this.initialized ) return;
    this.initialized = true;

    this.el = $(SELECTOR);
    this.acceptBtn = $('.gdpr__acceptBtn', this.el);
    this.rejectBtn = $('.gdpr__rejectBtn', this.el);
    this.saveCloseBtn = $('.gdpr__saveCloseBtn', this.el);
    this.inputs = [ ...$$('.gdpr__input input[type="checkbox"]', this.el) ];
    this.moreBtn = $('.gdpr__moreBtn', this.el);
    this.backBtn = $('.gdpr__backBtn', this.el);
    this.homeWrap = $('.gdpr__homeWrap', this.el);
    this.optionsWrap = $('.gdpr__optionsWrap', this.el);
    this.userId = $('.gdpr__userId', this.el);

    this._opened = this.el.getAttribute('aria-hidden') !== 'true';

    if( this._opened ) this._bindEvents();
    if( this.emitter ) this.emitter.on('GDPR.open', this._openBnd);
  }
  /*
  destroy() {
    this._unbindEvents();
    if( this.emitter ) this.emitter.off('GDPR.open', this._openBnd);

    this.initialized = false;
    this.el = null;
    this.emitter = null;
    this.acceptBtn = null;
    this.rejectBtn = null;
    this.saveCloseBtn = null;
    this.inputs = null;
    this.moreBtn = null;
    this.backBtn = null;
    this.homeWrap = null;
    this.optionsWrap = null;
    this.userId = null;

    this._opened = null;

    this._acceptAll = null;
    this._saveCustomized = null;
    this._rejectAll = null;
    this._onMoreClick = null;
    this._onBackClick = null;
    this._openBnd = null;
  }
  */

  open() {
    if( this._opened ) return;
    this._opened = true;

    this._bindEvents();

    if( this.el ) this.el.setAttribute('aria-hidden', false);
  }
  close() {
    if( !this._opened ) return;
    this._opened = false;

    if( this.el ) {
      this.el.setAttribute('aria-hidden', true);
      this.el.classList.remove(CLASSNAME_MORE_OPTIONS);
    }

    if( this.optionsWrap ) this.optionsWrap.setAttribute('aria-hidden', true);
    if( this.homeWrap ) this.homeWrap.setAttribute('aria-hidden', false);

    this._unbindEvents();
  }

  _bindEvents() {
    if( this.acceptBtn ) on(this.acceptBtn, 'click', this._acceptAll);
    if( this.saveCloseBtn ) on(this.saveCloseBtn, 'click', this._saveCustomized);
    if( this.rejectBtn ) on(this.rejectBtn, 'click', this._rejectAll);
    if( this.moreBtn ) on(this.moreBtn, 'click', this._onMoreClick);
    if( this.backBtn ) on(this.backBtn, 'click', this._onBackClick);
  }
  _unbindEvents() {
    if( this.acceptBtn ) off(this.acceptBtn, 'click', this._acceptAll);
    if( this.saveCloseBtn ) off(this.saveCloseBtn, 'click', this._saveCustomized);
    if( this.rejectBtn ) off(this.rejectBtn, 'click', this._rejectAll);
    if( this.moreBtn ) off(this.moreBtn, 'click', this._onMoreClick);
    if( this.backBtn ) off(this.backBtn, 'click', this._onBackClick);
  }
  _updateUserId() {
    if( !this.userId || !Consent.consent_user_id ) return;

    this.userId.textContent = this.userId.textContent.replace('%s', Consent.consent_user_id);
    this.userId.setAttribute('aria-hidden', false);
  }

  _acceptAll() {
    // allow everything
    if( this.inputs ) this.inputs.forEach(input => input.checked = 'checked');

    // save consents
    Consent.save(CONSENT_GRANTED, CONSENT_GRANTED);

    // close UI & update user id
    this.close();
    this._updateUserId();
  }
  _saveCustomized() {
    // get consent values from inputs
    const analytics_input = this.inputs.find(input => input.name === 'consent_analytics');
    const ads_input = this.inputs.find(input => input.name === 'consent_ads');

    const consent_analytics = analytics_input && analytics_input.checked ? CONSENT_GRANTED : CONSENT_DENIED;
    const consent_ads = ads_input && ads_input.checked ? CONSENT_GRANTED : CONSENT_DENIED;

    // save consents
    Consent.save(consent_analytics, consent_ads);

    // close UI & update user id
    this.close();
    this._updateUserId();
  }
  _rejectAll() {
    // save consents
    Consent.save(CONSENT_DENIED, CONSENT_DENIED);

    // close UI & update user id
    this.close();
    this._updateUserId();
  }
  _onMoreClick() {
    if( this.homeWrap ) this.homeWrap.setAttribute('aria-hidden', true);
    if( this.optionsWrap ) this.optionsWrap.setAttribute('aria-hidden', false);

    this.el.classList.add(CLASSNAME_MORE_OPTIONS);
  }
  _onBackClick() {
    if( this.optionsWrap ) this.optionsWrap.setAttribute('aria-hidden', true);
    if( this.homeWrap ) this.homeWrap.setAttribute('aria-hidden', false);

    this.el.classList.remove(CLASSNAME_MORE_OPTIONS);
  }
}

export default GDPR;
