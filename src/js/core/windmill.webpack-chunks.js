/**
* @core/windmill.webpack-chunks
* <br><br>
* ## Windmill Webpack Chunks.
*
* - Load webpack-chunks from [data-module] & [data-ui] attributes
* - Init, start, stop and destroy module during Windmill's page transition
* 
*
* --------------
*  How it works
* --------------
* This script will parse HTML source and find nodes with [data-module] and [data-ui] attributes.
* These scripts will be loaded asynchronously, and store in a registry for the next page.
* Scripts are loaded only once to preserve bandwith and speed up next's page loading.
* 
*
* ------------------------------------------
*  Where to locate "modules" and "ui"
* ------------------------------------------
* Modules are located in js/modules/[module-name]/
* UIs are located in js/ui/[ui-name]/
* Every modules and uis must have an index.js file that export a default class constructor.
* This default class constructor will be invoked with 2 parameters during Windmill process.
*
*
* ------------------------------------------
*  What shoud i expect the get in my Module/UI class constructor?
* ------------------------------------------
* When Windmill have finished loading your script, it will create an instance of your default class constructor.
* This class constructor will receive 2 parameters:
*   el: NodeElement who loaded this script. (aka: <div data-module="my-module">)
*   emitter: Global event emitter used through application. Very useful if you want to communicate between two modules during application runtime.
*
*
* ------------------------------------------
*  Windmill events flow
* ------------------------------------------
* Windmill will invoked custom methods for each modules/ui in page at different time during page loading.
* Depending of Windmill synchronosity (async: true | false), events flow may be different.
*
* Synchronous events flow:
*   ready: Parse HTML source and import modules/ui (referenced as "chunks").
*          Create instances of all chunks required in this page.
*          Call every chunk.init() method.
*
*   done: Call every chunk.start() method.
*
*   exiting: Call every chunk.stop() method.
*   exited: Call every chunk.destroy() method for chunks who are not children of [data-windmill="container"].
*
*   enter: Parse HTML source and import chunks.
*          Create instances of all chunks required in this page.
*          Call every chunk.init() method. Even for chunks that were not destroyed in previous "exited" event.
*
*   done: Call every chunk.start() method.
*
*
* Asynchronous events flow: 
*   ready: Parse HTML source and import modules/ui (referenced as "chunks").
*          Create instances of all chunks required in this page.
*          Call every chunk.init() method.
*
*   done: Call every chunk.start() method.
*
*   exiting: Call every chunk.stop() method.
*
*   enter: Parse HTML source and import chunks.
*          Create instances of all chunks required in this page.
*          Call every chunk.init() method. Even for chunks that were not destroyed in previous "exited" event.
*
*   entered: Call every chunk.destroy() method for previous page's chunks who were not children of [data-windmill="container"].
*
*   done: Call every chunk.start() method.
*
*
* ------------------------------------------
*  Preloading modules/ui ahead-of-time
* ------------------------------------------
* When Windmill is not performing CPU intensive tasks, it will preload modules ahead-of-time to speed up future pages loading.
* To do so, you need to create a registry of modules/ui used in your application.
* Registry is located in: js/modules/index.webpack-chunks.js
*
*
* @module windmill
* @preferred
*/

import EMITTER from "@core/emitter";
import { STATE } from "@core/state";
import { $$, body } from "@utils/dom";
import { isFunction } from "@utils/is";
import { mobile } from "@utils/mobile";

const MODULES_SELECTOR = `[data-module]`;
const UI_SELECTOR = `[data-ui]`;

export class WindmillWebpackChunks {
  constructor(registry = []) {
    this._registry = new Set(registry);
    this._chunks = new Map();
    this._modules = [];
    this._uis = [];
    this._trashed = [];
    this._idleID = null;
    this._waiting = false;

    this._preloadModule = this._preloadModule.bind(this);
  }

  install(windmill) {
    // before windmill ready transition, parse & import chunks
    // when importation is finished, init modules
    windmill.on('ready', this._importChunks, this);
    windmill.on('ready', this._createInstances, this);
    windmill.on('ready', this._initModules, this);

    // before windmill exit, stop all modules
    windmill.on('exiting', this._stopModules, this);

    // after windmill exit, collect all instances that need to be destroyed after page is removed
    windmill.on('exited', this._collectInstancesInOldPage, this);

    // if windmill is async, destroy collected modules after windmill exit
    if( !windmill.async ) windmill.on('exited', this._destroyModules, this);

    // before windmill enter, reset STATE, import chunks, create instances & init modules
    windmill.on('enter', this._resetState, this);
    windmill.on('enter', this._importChunks, this);
    windmill.on('enter', this._createInstances, this);
    windmill.on('enter', this._initModules, this);

    // after windmill exit, destroy all modules
    if( windmill.async ) windmill.on('entered', this._destroyModules, this);

    // windmill completed his page transition
    windmill.on('done', this._startModules, this);

    // if requestIdleCallback is supported by browser and registry isn't empty
    if( window.requestIdleCallback && this._registry.size > 0 ) {
      windmill.on('exiting', this._stopIdle, this);
      windmill.on('done', this._startIdle, this);
    }
  }

  _importChunks({ next }) {
    const promises = [];
    const container = next.container || body;

    [ ...$$(MODULES_SELECTOR, container), ...$$(UI_SELECTOR, container), container ].forEach(el => {

      // get module or ui chunk type
      // element could be : 
      //    <div data-module="my-module"> or 
      //    <div data-ui="my-ui-js-thing">
      const { module, moduleNative, ui, uiNative } = el.dataset;

      // element can cast multiple chunks, each seperated by a coma
      if (module) {
        // use [data-module-native] attribute if exists AND user is on mobile device
        const moduleSelector = (mobile && el.hasAttribute('data-module-native') ? moduleNative : module);

        if( moduleSelector ) {
          moduleSelector.split(",").forEach(m => {
            const name = `modules/${m}`;
            
            // if this chunk as never been imported before, import it
            if( !this._chunks.has(name) ) promises.push( this._importChunk(name) );
            
            // add element to modules
            this._modules.push(new ChunkData(el, name));
          });
        }
      }

      if (ui) {
        // use [data-ui-native] attribute if exists AND user is on mobile device
        const uiSelector = (mobile && el.hasAttribute('data-ui-native') ? uiNative : ui);

        if( uiSelector ) {
          uiSelector.split(",").forEach(m => {
            const name = `ui/${m}`;
            
            // if this chunk as never been imported before, import it
            if( !this._chunks.has(name) ) promises.push( this._importChunk(name) );
            
            // add element to uis
            this._uis.push(new ChunkData(el, name));
          });
        }
      }
    });

    return Promise.all(promises);
  }
  _importChunk(name) {
    // import module with webpack
    const promise = import(`../${name}/`);

    // save promise in chunks map
    this._chunks.set(name, promise);

    // remove chunk from registry
    if( this._registry.has(name) ) this._registry.delete(name);

    // when loading is completed, update chunks set with default export
    promise.then(chunk => { this._chunks.set(name, chunk.default) });
    promise.catch(error => { console.error(`Error loading webpack chunk ${name}:`, error); });

    return promise;
  }
  _createInstances() {
    this._modules.forEach((module, index) => {
      if( !(module instanceof ChunkData) ) return;

      const klass = this._chunks.get(module.chunk);
      this._modules[index] = { el: module.el, instance: new klass(module.el, EMITTER) };
    });

    this._uis.forEach((ui, index) => {
      if( !(ui instanceof ChunkData) ) return;

      const klass = this._chunks.get(ui.chunk);
      this._uis[index] = { el: ui.el, instance: new klass(ui.el, EMITTER) };
    });
  }
  _collectInstancesInOldPage({ current }) {
    const { container } = current;

    const trashInstances = (data, index, array) => {
      // if element is not part of old page [data-windmill="container"], it doesn't need to be destroyed
      if( !container.contains(data.el) && container !== data.el ) return;

      // put instance in trash and remove from array
      this._trashed.push(data);
      array.splice(index, 1);
    };

    for(let i = this._modules.length - 1; i>=0; i--) trashInstances(this._modules[i], i, this._modules);
    for(let i = this._uis.length - 1; i>=0; i--) trashInstances(this._uis[i], i, this._uis);
  }
  _resetState() { STATE.dispatch("RESET"); }



  _initModules() {
    [ ...this._modules, ...this._uis ].forEach(({ instance }) => {
      if( isFunction(instance.init) ) instance.init();
    });
  }
  _destroyModules() {
    this._trashed.forEach(({ instance }) => {
      if( isFunction(instance.destroy) ) instance.destroy();
    });

    this._trashed.splice(0);
  }
  _startModules() {
    [ ...this._modules, ...this._uis ].forEach(({ instance }) => {
      if( isFunction(instance.start) ) instance.start();
    });
  }
  _stopModules() {
    [ ...this._modules, ...this._uis ].forEach(({ instance }) => {
      if( isFunction(instance.stop) ) instance.stop();
    });
  }


  _startIdle() {
    if( this._waiting ) return;
    this._waiting = true;

    if( this._registry.size > 0 ) this._idleID = requestIdleCallback(this._preloadModule);
  }
  _stopIdle() {
    if( this._idleID ) cancelIdleCallback(this._idleID);

    this._idleID = null;
    this._waiting = false;
  }
  _preloadModule() {
    this._idleID = null;

    const module = this._registry.values().next().value;
    //console.log('preload', module);

    this
      ._importChunk(module)
      .then(() => {
        if( this._waiting ) {
          this._waiting = false;
          this._startIdle();
        };
      });
  }
}

class ChunkData {
  constructor(el, chunk) {
    this.el = el;
    this.chunk = chunk;
  }
}

export default WindmillWebpackChunks;
