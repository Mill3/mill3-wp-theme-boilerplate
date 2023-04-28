import EMITTER from "@core/emitter";
import { FPS, SCROLLBAR_HIDDEN_CLASSNAME, SCROLL_TO_OPTIONS } from "@scroll/constants";
import Scroll from "@scroll/scroll";
import ScrollDirection from "@scroll/scroll-direction";
import ScrollIntersection from "@scroll/scroll-intersection";
import ScrollMinimum from "@scroll/scroll-minimum";
import ScrollTimeline from "@scroll/scroll-timeline";
import ScrollTo from "@scroll/scroll-to";
//import ScrollWebGL from "@scroll/scroll-webgl";
import { html } from "@utils/dom";
//import { mobile } from "@utils/mobile";
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
    this.minimum = null;
    this.timeline = null;
    this.to = null;
    this.webgl = null;

    this._async = false;
    this._raf = null;
    this._started = false;
    this._lastTime = null;

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

    windmill.on('init', this._onInit, this);
    windmill.on('ready', this._onPageReady, this);
    windmill.on('exiting', this._onPageExit, this);

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
    this.intersection = new ScrollIntersection(this.scroll);
    this.minimum = new ScrollMinimum(this.scroll);
    this.timeline = new ScrollTimeline(this.scroll);
    this.to = new ScrollTo(this.scroll);
    //if( !mobile ) this.webgl = new ScrollWebGL(this.scroll);
  }
  _onRAF() {
    if( !this._started ) {
      this._raf = null;
      return;
    }

    const time = performance.now();
    const delta = this._lastTime ? Math.min(Math.ceil((time - this._lastTime) / FPS * 10) / 10, 1) : 1;

    this._lastTime = time;

    this.scroll.raf(delta);
    this.intersection?.raf(delta);
    this.timeline?.raf();
    this.webgl?.raf(delta);

    this._raf = requestAnimationFrame(this._onRAF);
  }
  _onResize() {
    if( !this._started ) return;

    this.scroll?.resize();
    this.intersection?.resize();
    this.webgl?.resize();
  }

  _onPageReady() {
    this._lastTime = null;

    this.scroll?.init();
    this.intersection?.init();
    this.webgl?.init();

    this._startModules();
    this._bindEvents();
    this._onRAF();
  }
  _onPageExit() {
    this._unbindEvents( !this._async );
  }
  _onPageDone() {
    this.scroll?.resize();
    this.intersection?.resize();
    this.webgl?.resize();
  }

  _onAsyncPageEnter({ next }) {
    this._unbindEvents();
    this._stopModules();

    html.classList.remove(SCROLLBAR_HIDDEN_CLASSNAME);

    this.scroll?.init();
    this.intersection?.init(next.container);
    this.webgl?.init();
  }
  _onAsyncPageEntered() {
    this._lastTime = null;

    this._startModules();
    this._bindEvents();
    this._onRAF();
  }

  _onSyncPageEnter({ next }) {
    this._lastTime = null;

    this.scroll?.init();
    this.intersection?.init(next.container);
    this.webgl?.init();

    this._startModules();
    this._bindEvents();
    this._onRAF();
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
    this.timeline?.reset();
    this.scroll?.resize();
    this.intersection?.update();

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

    if( stopRAF ) {
      if( this._raf ) cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  _startModules() {
    if( this._started ) return;
    this._started = true;

    this.direction?.start();
    this.intersection?.start();
    this.minimum?.start();
    this.timeline?.start();
    this.to?.start();
    this.webgl?.start();
    this.scroll?.start();
  }
  _stopModules() {
    if( !this._started ) return;

    this.scroll?.stop();
    this.direction?.stop();
    this.intersection?.stop();
    this.minimum?.stop();
    this.timeline?.stop();
    this.to?.stop();
    this.webgl?.stop();
    
    this._started = false;
  }
  _resetScrollModules() {
    this.scroll?.reset();
    this.intersection?.reset();
    this.minimum?.reset();
    this.timeline?.reset();
    this.webgl?.reset();
    this.webgl?.cleanup();
  }
}

export default WindmillScroll;
 