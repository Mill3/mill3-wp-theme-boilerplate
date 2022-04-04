/**
 * @core/windmill.dom-controller
 * <br><br>
 * ## Windmill DOM Controller.
 * 
 * Handles UI and Modules classes init/destroy/start/stop via Windmill hooks
 *
 * Example :
 *
 * <div data-ui="site-nav"></div>
 * <div data-module="my-module"></div>
 *
 * Element can cast 1 or multiple classes, each seperated by a coma.
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
 * @module windmill
 * @preferred
 */

 import EventEmitter2 from "eventemitter2";

 import { STATE } from "@core/state";
 import { $$ } from "@utils/dom";
 import { PascalCase } from "@utils/string";

 const MODULES_SELECTOR = `[data-module]`;
 const UI_SELECTOR = `[data-ui]`;

 export class WindmillDomController {
   constructor(classes = []) {
     this._chunks = [];
     this._emitter = new EventEmitter2({ wildcard: true });

     // available classes
     this._classes = classes;

     // attach emitter globally to browser Window
     window._emitter = this._emitter;
   }

   /**
    * Plugin installation.
    */
   install(windmill) {
     // before windmill ready transition, parse and load modules
     windmill.on('ready', this._initModules, this);
 
     // before windmill exit
     windmill.on('exiting', this._stopModules, this);
 
     // after windmill exit
     windmill.on('exited', this._destroyModules, this);
 
     // before windmill enter
     windmill.on('enter', this._initModules, this);
 
     // windmill completed his page transition
     windmill.on('done', this._startModules, this);
   }

   /**
    * `exiting` event.
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
    * `exited` event.
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
    * `done` event.
    */
   _startModules() {
     // Run start() func from all chunks
     Object.keys(this._chunks).forEach((m) => {
       if (typeof this._chunks[m].start === `function`) this._chunks[m].start();
     });
   }

   /**
    * `init & enter` event.
    */
   _initModules() {
     return new Promise((resolve) => {
       let elements = [ ...$$(MODULES_SELECTOR), ...$$(UI_SELECTOR) ];

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

         // element can cast 1 or multiple chunk module, each seperated by a coma
         if (module) chunks = chunks.concat(module.split(",").map((m) => PascalCase(m)));
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

 export default WindmillDomController;
