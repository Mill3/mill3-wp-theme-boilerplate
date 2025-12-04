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
import ACF from "@utils/acf";
import { $$, getBody } from "@utils/dom";
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
    // when it's time to import scripts, parse & import chunks
    windmill.on('scripts', this._importChunks, this);

    // before windmill ready transition, create modules instances and init modules
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
    const container = next.container || getBody();

    [ ...$$(MODULES_SELECTOR, container), ...$$(UI_SELECTOR, container), container ].forEach(el => {

      // get data and module or ui chunk type
      // element should be : <div data-module="my-module"> or <div data-ui="my-ui-js-thing">
      const { module, moduleNative, moduleBackend, ui, uiNative, uiBackend } = el.dataset;

      // element can cast 1 or multiple chunk, each seperated by a coma
      if (module) {
        const moduleSelector = ACF.is_preview && el.hasAttribute('data-module-backend') ? moduleBackend : (mobile && el.hasAttribute('data-module-native') ? moduleNative : module);

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
        const uiSelector = ACF.is_preview && el.hasAttribute('data-ui-backend') ? uiBackend : (mobile && el.hasAttribute('data-ui-native') ? uiNative : ui);

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
