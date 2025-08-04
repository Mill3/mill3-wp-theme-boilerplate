import EMITTER from "@core/emitter";
import { SCROLLBAR_HIDDEN_CLASSNAME, SCROLL_TO_OPTIONS } from "@scroll/constants";
import Scroll from "@scroll/scroll";
import ScrollDirection from "@scroll/scroll-direction";
import ScrollIO from "@scroll/scroll-io";
import ScrollMinimum from "@scroll/scroll-minimum";
import ScrollParallax from "@scroll/scroll-parallax";
//import ScrollTimeline from "@scroll/scroll-timeline";
import ScrollTo from "@scroll/scroll-to";
//import ScrollWebGL from "@scroll/scroll-webgl";
import { html } from "@utils/dom";
import { mobile } from "@utils/mobile";
import RAF, { WINDMILL_SCROLL } from "@utils/raf";
import ResizeOrientation, { MILL3_SCROLL_PRIORITY } from "@utils/resize";

/**
 * @core/windmill.scroll
 * <br><br>
 * ## Windmill Scroll.
 *
 * - Add external scripts from head of next page
 * - Manage inlined scripts in next page
 *
 * @module windmill
 * @preferred
 */
 
export class WindmillScroll {
  constructor() {
    this.scroll = null;
    this.direction = null;
    this.intersection = null;
    this.io = null;
    this.minimum = null;
    this.parallax = null;
    this.timeline = null;
    this.to = null;
    this.webgl = null;

    this._async = false;
    this._started = false;

    this._onRAF = this._onRAF.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onSiteScrollStart = this._onSiteScrollStart.bind(this);
    this._onSiteScrollStop = this._onSiteScrollStop.bind(this);
    this._onSiteScrollUpdate = this._onSiteScrollUpdate.bind(this);
    this._onSiteScrollTo = this._onSiteScrollTo.bind(this);
    this._onSiteScrollUp = this._onSiteScrollUp.bind(this);
  }

  /**
   * Plugin installation.
   */
  install(windmill) {
    this._async = windmill.async;
    this._raf = RAF.add(this._onRAF, WINDMILL_SCROLL, true);

    windmill.on('init', this._onInit, this);
    windmill.on('ready', this._onPageReady, this);
    windmill.on('exiting', this._onPageExiting, this);
    windmill.on('exit', this._onPageExit, this);

    if( this._async ) {
      windmill.on('entering', this._resetScrollModules, this);
      windmill.on('enter', this._onAsyncPageEnter, this);
      windmill.on('entered', this._onAsyncPageEntered, this);
    } else {
      windmill.on('exiting', this._stopModules, this);
      windmill.on('entering', this._resetScrollModules, this);
      windmill.on('enter', this._onSyncPageEnter, this);
    }

    windmill.on('done', this._onPageDone, this);
  }

  _onInit() {
    this.scroll = new Scroll();
    this.direction = new ScrollDirection(this.scroll);
    this.io = new ScrollIO(this.scroll);
    this.minimum = new ScrollMinimum(this.scroll);
    if( !mobile ) this.parallax = new ScrollParallax(this.scroll);
    //this.timeline = new ScrollTimeline(this.scroll);
    this.to = new ScrollTo(this.scroll);
    //if( !mobile ) this.webgl = new ScrollWebGL(this.scroll);
  }
  _onRAF(delta) {
    if( !this._started ) {
      this._raf(false);
      return;
    }

    this.scroll.raf(delta);
    this.parallax?.raf(delta);
    //this.timeline?.raf();
    //this.webgl?.raf(delta);
  }
  _onResize() {
    if( !this._started ) return;

    this.scroll?.resize();
    this.io?.resize();
    this.parallax?.resize();
    //this.webgl?.resize();
  }

  _onPageReady() {
    this.scroll?.init();
    //this.webgl?.init();
    this.io?.init();
    this.parallax?.init();

    this._startModules();
    this._bindEvents();
    this._raf(true);
  }
  _onPageExiting() {
    this._unbindEvents( !this._async );
  }
  _onPageExit() {
    this.io?.exit();
  }
  _onPageDone() {
    this.scroll?.resize();
    //this.webgl?.resize();
    this.io?.resize();
    this.parallax?.resize();
  }

  _onAsyncPageEnter({ next }) {
    this._unbindEvents();
    this._stopModules();

    html.classList.remove(SCROLLBAR_HIDDEN_CLASSNAME);

    this.scroll?.init();
    //this.webgl?.init(next.container);
    this.io?.init(next.container);
    this.parallax?.init(next.container);
    this.io?.start();
  }
  _onAsyncPageEntered() {
    this._startModules();
    this._bindEvents();
    this._raf(true);
  }

  _onSyncPageEnter({ next }) {
    this.scroll?.init();
    this.io?.init(next.container);
    this.parallax?.init(next.container);
    //this.webgl?.init();

    this._startModules();
    this._bindEvents();
    this._raf(true);
  }

  _onSiteScrollStart() {
    this.scroll?.start();
    this.minimum?.start();

    html.classList.remove(SCROLLBAR_HIDDEN_CLASSNAME);
  }
  _onSiteScrollStop(hideScrollbar = false) {
    this.scroll?.stop();
    this.minimum?.stop();
    
    if( hideScrollbar ) html.classList.add(SCROLLBAR_HIDDEN_CLASSNAME);
  }
  _onSiteScrollUpdate() {
    // trigger event that scroll update will occur
    EMITTER.emit("SiteScroll.before-update", this.scroll);

    // update scroll
    //this.timeline?.reset();
    this.scroll?.resize();
    //this.webgl?.update();
    this.io?.update();
    this.parallax?.update();

    // trigger event that scroll update is completed
    EMITTER.emit("SiteScroll.after-update", this.scroll);
  }
  _onSiteScrollTo(target, options = SCROLL_TO_OPTIONS) { this.scroll?.scrollTo(target, options); }
  _onSiteScrollUp() { this.scroll?.scrollTo('top'); }

  _bindEvents() {
    ResizeOrientation.add(this._onResize, MILL3_SCROLL_PRIORITY);

    EMITTER.on('SiteScroll.start', this._onSiteScrollStart);
    EMITTER.on('SiteScroll.stop', this._onSiteScrollStop);
    EMITTER.on('SiteScroll.update', this._onSiteScrollUpdate);
    EMITTER.on('SiteScroll.scrollTo', this._onSiteScrollTo);
    EMITTER.on('SiteScroll.scrollUp', this._onSiteScrollUp);
  }
  _unbindEvents(stopRAF = true) {
    ResizeOrientation.remove(this._onResize);

    EMITTER.off('SiteScroll.start', this._onSiteScrollStart);
    EMITTER.off('SiteScroll.stop', this._onSiteScrollStop);
    EMITTER.off('SiteScroll.update', this._onSiteScrollUpdate);
    EMITTER.off('SiteScroll.scrollTo', this._onSiteScrollTo);
    EMITTER.off('SiteScroll.scrollUp', this._onSiteScrollUp);

    if( stopRAF ) this._raf(false);
  }

  _startModules() {
    if( this._started ) return;
    this._started = true;

    this.direction?.start();
    this.io?.start();
    this.parallax?.start();
    this.minimum?.start();
    //this.timeline?.start();
    this.to?.start();
    //this.webgl?.start();
    this.scroll?.start();
  }
  _stopModules() {
    if( !this._started ) return;

    this.scroll?.stop();
    this.direction?.stop();
    this.io?.stop();
    this.parallax?.stop();
    this.minimum?.stop();
    //this.timeline?.stop();
    this.to?.stop();
    //this.webgl?.stop();
    
    this._started = false;
  }
  _resetScrollModules() {
    this.scroll?.reset();
    this.io?.reset();
    this.parallax?.reset();
    this.minimum?.reset();
    //this.timeline?.reset();
    //this.webgl?.reset();
  }
}

export default WindmillScroll;
 