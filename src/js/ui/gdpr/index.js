import anime from "animejs";
import { default as Consent, CONSENT_DENIED, CONSENT_GRANTED, CONSENT_PENDING } from "@core/gdpr";
import { $, $$, rect } from "@utils/dom";
import { on, off } from "@utils/listener";
import Accordion from "@components/Accordion";
import ResizeOrientation from '@utils/resize';

class GDPR {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.container = $(".gdpr__container", this.el);
    this.acceptBtn = $(".gdpr__acceptBtn", this.el);
    this.rejectBtn = $(".gdpr__rejectBtn", this.el);
    this.saveCloseBtn = $(".gdpr__saveCloseBtn", this.el);
    this.inputs = [...$$('.gdpr__input input[type="checkbox"]', this.el)];
    this.moreBtn = $(".gdpr__moreBtn", this.el);
    this.backBtn = $(".gdpr__backBtn", this.el);
    this.homeWrap = $(".gdpr__homeWrap", this.el);
    this.optionsWrap = $(".gdpr__optionsWrap", this.el);
    this.userId = $(".gdpr__userId", this.el);
    this.accordionBtn = $(".gdpr__accordion__btn", this.el);
    this.accordionPanel = $(".gdpr__accordion__panel", this.el);
    this.wraps = [this.homeWrap, this.optionsWrap];
    this.accordion =
    this.accordionBtn && this.accordionPanel ? new Accordion(this.accordionBtn, this.accordionPanel) : null;
    this.toggleBtns = null;

    this._initialized = false;
    this._opened = false;
    this._expanded = false;

    this._acceptAll = this._acceptAll.bind(this);
    this._saveCustomized = this._saveCustomized.bind(this);
    this._rejectAll = this._rejectAll.bind(this);
    this._onMoreClick = this._onMoreClick.bind(this);
    this._onBackClick = this._onBackClick.bind(this);
    this._openBnd = this.open.bind(this);
    this._setHeight = this._setHeight.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  init() {
    if( this._initialized ) return;
    this._initialized = true;

    // set initial state on check inputs
    this.initInputs();

    // Check first is Consent is initialized at all
    // - we can't use cookie for controlling the 'aria-hidden="true/false"' in production because of page cache
    // - if set to CONSENT_PENDING, we can assume user haven't seen to panel yet, then force opening it
    if (Consent.consent_status === CONSENT_PENDING) this.open();

    // initial _setHeight call only when opened
    if (this._opened) this._setHeight(false);

    // send call to emitter
    if (this.emitter) this.emitter.on("GDPR.open", this._openBnd);
  }

  start() {
    // find togglers and bind click event
    this.toggleBtns = [...$$(`[aria-controls="${this.el.id}"]`)];
    if (this.toggleBtns) on(this.toggleBtns, "click", this._openBnd);
    ResizeOrientation.add(this._onResize);
  }
  stop() {
    // unbind click event on togglers
    if (this.toggleBtns) off(this.toggleBtns, "click", this._openBnd);
    this.toggleBtns = null;
    ResizeOrientation.remove(this._onResize);
  }

  open() {
    if (this._opened) return;
    this._opened = true;

    this._bindEvents();
    this._updateUserId();

    if (this.el) {
      this.el.setAttribute("aria-hidden", false);
      this._setHeight();
    }
  }
  close() {
    if (!this._opened) return;
    this._opened = false;

    if (this.el) this.el.setAttribute("aria-hidden", true);
    if (this.optionsWrap) this.optionsWrap.setAttribute("aria-hidden", true);
    if (this.homeWrap) this.homeWrap.setAttribute("aria-hidden", false);

    // reset to first panel if expanded
    if(this._expanded) this._onBackClick();

    this._unbindEvents();

    // emit event
    if( this.emitter ) this.emitter.emit("GDPR.close");
  }

  initInputs() {
    const pending = Consent.consent_status === CONSENT_PENDING;
    const inputs = [];

    // get consent values from inputs
    const analytics_input = this.inputs.find((input) => input.name === "consent_analytics");
    const ads_input = this.inputs.find((input) => input.name === "consent_ads");

    // push both inputs to array
    if (analytics_input) inputs.push(analytics_input);
    if (ads_input) inputs.push(ads_input);

    // set to allow on everything when pending
    if (pending) {
      inputs.forEach((input) => (input.checked = "checked"));
      return;
    }

    // When not pending, set checked status on input based on Consent's stored cookies,
    // inputs are checked by default in template's markup.
    // If consent is denied in cookies, remove checked attribute
    if (analytics_input && Consent.consent_analytics === CONSENT_GRANTED) {
      analytics_input.checked = "checked";
    } else if (analytics_input && Consent.consent_analytics === CONSENT_DENIED) {
      analytics_input.removeAttribute("checked");
    }
    if (ads_input && Consent.consent_ads === CONSENT_GRANTED) {
      ads_input.checked = "checked"
    } else if (ads_input && Consent.consent_ads === CONSENT_DENIED) {
      ads_input.removeAttribute("checked");
    }
  }

  _bindEvents() {
    if (this.acceptBtn) on(this.acceptBtn, "click", this._acceptAll);
    if (this.saveCloseBtn) on(this.saveCloseBtn, "click", this._saveCustomized);
    if (this.rejectBtn) on(this.rejectBtn, "click", this._rejectAll);
    if (this.moreBtn) on(this.moreBtn, "click", this._onMoreClick);
    if (this.backBtn) on(this.backBtn, "click", this._onBackClick);
    if (this.accordion) this.accordion.on("open", this._setHeight);
    if (this.accordion) this.accordion.on("close", this._setHeight);
  }
  _unbindEvents() {
    if (this.acceptBtn) off(this.acceptBtn, "click", this._acceptAll);
    if (this.saveCloseBtn) off(this.saveCloseBtn, "click", this._saveCustomized);
    if (this.rejectBtn) off(this.rejectBtn, "click", this._rejectAll);
    if (this.moreBtn) off(this.moreBtn, "click", this._onMoreClick);
    if (this.backBtn) off(this.backBtn, "click", this._onBackClick);
    if (this._ro) this._ro.dispose();
  }
  _updateUserId() {
    if (!this.userId || !Consent.consent_user_id) return;

    this.userId.textContent = this.userId.textContent.replace("%s", Consent.consent_user_id);
    this.userId.setAttribute("aria-hidden", false);
  }

  _onResize() {
    this._setHeight(false);
  }

  _acceptAll() {
    // allow everything
    if (this.inputs) this.inputs.forEach((input) => (input.checked = "checked"));

    // save consents
    Consent.save(CONSENT_GRANTED, CONSENT_GRANTED);

    // close UI & update user id
    this.close();
    this._updateUserId();
  }
  _saveCustomized() {
    // get consent values from inputs
    const analytics_input = this.inputs.find((input) => input.name === "consent_analytics");
    const ads_input = this.inputs.find((input) => input.name === "consent_ads");

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

    // force inputs to unchecked
    this.inputs.find((input) => input.name === "consent_analytics").removeAttribute("checked");
    this.inputs.find((input) => input.name === "consent_ads").removeAttribute("checked");

    // close UI & update user id
    this.close();
    this._updateUserId();
  }
  _onMoreClick() {
    if (this.homeWrap) this.homeWrap.setAttribute("aria-hidden", true);
    if (this.optionsWrap) this.optionsWrap.setAttribute("aria-hidden", false);
    this._expanded = true;
    this._setHeight(true);
  }
  _onBackClick() {
    if (this.optionsWrap) this.optionsWrap.setAttribute("aria-hidden", true);
    if (this.homeWrap) this.homeWrap.setAttribute("aria-hidden", false);
    this._expanded = false;
    this._setHeight(true);
  }
  _setHeight(animate = false) {
    const timeline = anime.timeline();
    let currentWrap = null;

    if (!this._expanded) currentWrap = this.wraps[0];
    else currentWrap = this.wraps[1];

    const { height } = rect(currentWrap);

    if (!animate || typeof animate != "boolean") return (this.container.style.height = `${height}px`);

    if (this._expanded) {
      timeline
        .add({
          targets: this.container,
          height: height,
          easing: `easeOutCubic`,
          duration: 350
        })
        .add({
          targets: this.wraps,
          translateX: [0, `-100%`],
          easing: `easeOutCubic`,
          duration: 250
        });
    } else {
      timeline
        .add({
          targets: this.wraps,
          translateX: [`-100%`, 0],
          easing: `easeOutCubic`,
          duration: 250
        })
        .add({
          targets: this.container,
          height: height,
          easing: `easeOutCubic`,
          duration: 350
        });
    }
  }
}

export default GDPR;
