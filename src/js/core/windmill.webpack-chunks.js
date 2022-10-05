/**
 * @core/windmill.webpack-chunks
 * <br><br>
 * ## Windmill Webpack Chunks.
 *
 * - Load webpack-chunks from [data-module] & [data-ui] attributes
 * - Start, stop and destroy module during Windmill's page transition
 *
 * @module windmill
 * @preferred
 */
 import EMITTER from "@core/emitter";
 import { STATE } from "@core/state";
 import { $$ } from "@utils/dom";
 
 const MODULES_SELECTOR = `[data-module]`;
 const UI_SELECTOR = `[data-ui]`;
 
 export class WindmillWebpackChunks {
   constructor() {
     this._chunks = [];
     this._emitter = EMITTER;
 
     // attach emitter globally to browser Window
     //window._emitter = this._emitter;
   }
 
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
    * `init & enter` event.
    */
   _initModules() {
     return new Promise((resolve) => {
       this._importChunks().then(() => {
         // Init all chunks with a init() func
         Object.keys(this._chunks).forEach((m) => {
           if (typeof this._chunks[m].init === `function`) this._chunks[m].init();
         });
 
         return resolve();
       });
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
    * the module importer, look for data-module entries in DOM
    */
   _importChunks() {
     let elements = [ ...$$(MODULES_SELECTOR), ...$$(UI_SELECTOR) ];
 
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
 
 export default WindmillWebpackChunks;
 