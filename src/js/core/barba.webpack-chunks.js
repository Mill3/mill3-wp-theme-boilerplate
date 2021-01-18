/**
 * @mill3-packages/barba-scripts
 * <br><br>
 * ## Barba Scripts.
 *
 * - Add external scripts from head
 * - Manage inlined scripts in next.container
 *
 * @module barba-scripts
 * @preferred
 */

import EventEmitter2 from "eventemitter2";

import { STATE } from "./state";

const VERSION = `0.0.1`;

const MODULES_SELECTOR = `[data-module]`;
const UI_SELECTOR = `[data-ui]`;

export class BarbaWebpackChunks {
  constructor() {
    this.name = "@barba/webpack-chunks";
    this.version = VERSION;
    this.barba;
    this.logger;

    this._parser;
    this._chunks = [];
    this._emitter = null;
  }

  /**
   * Plugin installation.
   */
  install(barba) {
    this.logger = new barba.Logger(this.name);
    this.logger.info(this.version);

    this.barba = barba;

    this._parser = new DOMParser();
    this._emitter = new EventEmitter2({
      wildcard: true
    });

    // attach emitter globally to browser Window
    window._emitter = this._emitter;
  }

  /**
   * Plugin installation.
   */
  init() {
    // before leaving current page
    this.barba.hooks.beforeLeave(this._stopModules, this);

    // after leaving transition is done
    this.barba.hooks.afterLeave(this._destroyModules, this);

    // new page is ready, parse and load modules
    this.barba.hooks.once(this._initModules, this);
    this.barba.hooks.enter(this._initModules, this);

    // new page is ready for interactivity
    this.barba.hooks.afterEnter(this._startModules, this);
  }

  /**
   * `beforeLeave` hook.
   */
  _stopModules() {
    // Stop all chunks with a stop() func
    Object.keys(this._chunks).forEach((m) => {
      if (typeof this._chunks[m].stop === `function`) this._chunks[m].stop();
    });

    // reset state to defaults
    STATE.dispatch("RESET");
  }

  /**
   * `_afterLeave` hook.
   */
  _destroyModules() {
    // Remove and destroy all chunks with a destroy() func
    Object.keys(this._chunks).forEach((m) => {
      if (typeof this._chunks[m].destroy !== `function`) return;
      this._chunks[m].destroy();
      delete this._chunks[m];
    });
  }

  /**
   * `once & enter` hook.
   */
  _initModules({ next }) {
    return new Promise((resolve) => {
      //const { initial } = this._state;
      const source = this._parser.parseFromString(next.html, "text/html");

      this._importChunks(source).then(() => {
        // set initial state to false
        //if (initial) this._state.changeStatus(false);

        // Init all chunks with a init() func
        Object.keys(this._chunks).forEach((m) => {
          if (typeof this._chunks[m].init === `function`) this._chunks[m].init();
        });

        return resolve();
      });
    });
  }

  /**
   * `afterEnter` hook.
   */
  _startModules() {
    // Run start() func from all chunks
    Object.keys(this._chunks).forEach((m) => {
      if (typeof this._chunks[m].start === `function`) this._chunks[m].start();
    });
  }

  /**
   * the module importer, look for data-module entries in DOM source
   */
  _importChunks(source) {
    let elements = [...source.querySelectorAll(MODULES_SELECTOR), ...source.querySelectorAll(UI_SELECTOR)];

    const promises = [];

    // import each module as a webpack chunk
    elements.forEach((el) => {
      // for storing each chunk attached to element
      let chunks = [];

      // get data and module or ui chunk type
      // element should be : <div data-module="my-module"> or <div data-ui="my-ui-js-thing">
      const { initialized, module, ui } = el.dataset;

      // stop here if already initialized
      if (initialized === `true`) return;

      // set element initialized
      el.dataset.initialized = true;

      // element can cast 1 or multiple chunk module, each seperated by a coma
      if (module) chunks = chunks.concat(module.split(",").map((m) => `modules/${m}`));

      if (ui) chunks = chunks.concat(ui.split(",").map((m) => `ui/${m}`));

      // try to load each module attached
      chunks.forEach((chunk) => {
        const promise = this._importChunk(chunk);
        if (promise) promises.push(promise);
      });
    });

    return Promise.all(promises);
  }

  _importChunk(name) {
    // return if module already loaded
    if (this._chunks[name]) return;

    // create a dummy object during module loading to prevent multiple request for the same module
    // that way, we also assure key names ordering is preserve in this._chunks
    this._chunks[name] = {};

    // import module with webpack
    const promise = import(`../${name}/`);

    // when loading is completed
    promise.then((chunk) => {
      const { instance } = chunk.default;

      // push instance to all modules
      if (instance) this._chunks[name] = instance;

      // attach emitter to instance
      instance.emitter = this._emitter;

      // attach state
      instance.state = STATE;

      // attach state
      instance.dispatcher = this._dispatcher;
    });

    promise.catch((e) => {
      console.error("Error loading webpack chunk :", e);
    });

    return promise;
  }
}

export default BarbaWebpackChunks;
