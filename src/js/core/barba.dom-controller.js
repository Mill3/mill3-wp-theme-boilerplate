/**
 * Barba plugin : Dom-Controller
 *
 * Handles UI and Modules classes init-destroy-restart
 * with Barba available hooks
 *
 * Example :
 *
 * <div data-ui="site-nav"></div>
 * <div data-module="my-module"></div>
 *
 * Eelement can cast 1 or multiple class, each seperated by a coma.
 *
 * <div data-ui="site-nav,foo-bar"></div>
 *
 * The data-module or data-ui value `my-module-name` is transformed to PascalCase `MyModuleName`, this should match your class static name
 *
 * Example :
 *
 * <div data-module="my-module-name"></div>
 *
 * Located in /src/modules/my-module-name/index.js
 *
 * Inside this class, you must use the PascalCase format or the class won't init :
 *
 * get name() {
 *  return `MyModuleName`;
 * }
 *
 * @module barba-plugin
 * @preferred
 */

 import EventEmitter2 from "eventemitter2";

 import { STATE } from "./state";
 import { PascalCase } from "../utils/string";

 const VERSION = `0.0.1`;

 const MODULES_SELECTOR = `[data-module]`;
 const UI_SELECTOR = `[data-ui]`;

 export class BarbaDomController {
   constructor(classes = []) {
     this.name = "@barba/dom-controller";
     this.version = VERSION;
     this.barba;
     this.logger;

     this._parser;
     // all available classes
     this._classes = classes;

     // holder for all future class initialisation
     this._chunks = [];

     // global emitter sent to class on initialisation
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
       wildcard: true,
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
    * `afterEnter` hook.
    */
   _startModules() {
     // Run start() func from all chunks
     Object.keys(this._chunks).forEach((m) => {
       if (typeof this._chunks[m].start === `function`) this._chunks[m].start();
     });
   }

   /**
    * `once & enter` hook.
    */
   _initModules({ next }) {
     return new Promise((resolve) => {
       const source = this._parser.parseFromString(next.html, "text/html");

       let elements = [
         ...source.querySelectorAll(MODULES_SELECTOR),
         ...source.querySelectorAll(UI_SELECTOR),
       ];

       // loop each elements and look for UI or Module classes
       elements.forEach((el) => {
         let chunks = [];

         // get data and module or ui chunk type
         // element should be : <div data-module="my-module"> or <div data-ui="my-ui-js-thing">
         const { initialized, module, ui } = el.dataset;

         // stop here if already initialized
         if (initialized === `true`) return;

         // set element initialized
         el.dataset.initialized = true;

         if (module) chunks = chunks.concat(module.split(",").map((m) => PascalCase(m)));

         // element can cast 1 or multiple chunk module, each seperated by a coma
         if (ui) chunks = chunks.concat(ui.split(",").map((m) => PascalCase(m)));

         // try to get instance from each chunk
         chunks.forEach((chunk) => {
           const c = this._validateClass(chunk);

           // not found in registered classes, stop here
           if (!c) return;

           // get instance from found class
           const { instance } = c;

           // attach emitter to instance
           instance.emitter = this._emitter;

           // attach state
           instance.state = STATE;

           // push this to all chunks
           this._chunks.push(instance);
         });
       });

       // Now we can init() all available chunks
       Object.keys(this._chunks).forEach((m) => {
         if (typeof this._chunks[m].init === `function`) this._chunks[m].init();
       });

       resolve();
     });
   }

   /**
    * Validate if class is loaded in instance, or is if it's already added to this._chunks
    */
   _validateClass(name) {
     const inChunks = this._chunks.filter((c) => c.name === name)[0];
     if (inChunks) return false;

     const isDefined = this._classes.filter((c) => c.instance?.name === name)[0];
     return isDefined;
   }
 }

 export default BarbaDomController;
