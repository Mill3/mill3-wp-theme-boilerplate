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
* @module windmill
* @preferred
*/

import EMITTER from "@core/emitter";
import { STATE } from "@core/state";
import { $$, body } from "@utils/dom";
import { isFunction } from "@utils/is";
import { PascalCase } from "@utils/string";

const MODULES_SELECTOR = `[data-module]`;
const UI_SELECTOR = `[data-ui]`;

export class WindmillDomController {
  constructor(classes = {}) {
    this._modules = [];
    this._uis = [];
    this._trashed = [];
    this._classes = classes;
  }
  
  /**
  * Plugin installation.
  */
  install(windmill) {
    // before windmill ready transition, create instances & init modules
    windmill.on('ready', this._createInstances, this);
    windmill.on('ready', this._initModules, this);

    // before windmill exit
    windmill.on('exiting', this._stopModules, this);

    // after windmill exit, collect all instances that need to be destroyed after page is removed
    windmill.on('exited', this._collectInstancesInOldPage, this);

    // if windmill is async, destroy collected modules after windmill exit
    if( !windmill.async ) windmill.on('exited', this._destroyModules, this);

    // before windmill enter, reset STATE, create instances & init modules
    windmill.on('enter', this._resetState, this);
    windmill.on('enter', this._createInstances, this);
    windmill.on('enter', this._initModules, this);

    // after windmill exit, destroy all modules
    if( windmill.async ) windmill.on('entered', this._destroyModules, this);

    // windmill completed his page transition
    windmill.on('done', this._startModules, this);
  }
  
  _createInstances({ next }) {
    const container = next.container || body;
    
    [ container, ...$$(MODULES_SELECTOR, container), ...$$(UI_SELECTOR, container) ].forEach((el) => {
      // get data and module or ui chunk type
      // element should be : <div data-module="my-module"> or <div data-ui="my-ui-js-thing">
      const { module, moduleNative, ui, uiNative } = el.dataset;
      
      // element can cast 1 or multiple chunk, each seperated by a coma
      if (module) {
        const moduleSelector = (mobile && el.hasAttribute('data-module-native') ? moduleNative : module);

        if( moduleSelector ) {
          moduleSelector.split(",").forEach(m => {
            const klass = this._validateClass( PascalCase(m), 'modules' );
            
            // if this class does'nt exists, stop here
            if( !klass ) return;
            
            // add module
            this._modules.push({el, instance: new klass(el, EMITTER) });
          });
        }
      }
      
      if (ui) {
        const uiSelector = (mobile && el.hasAttribute('data-ui-native') ? uiNative : ui);

        if( uiSelector ) {
          uiSelector.split(",").forEach(m => {
            const klass = this._validateClass( PascalCase(m), 'ui' );
            
            // if this class does'nt exists, stop here
            if( !klass ) return;
            
            // add ui
            this._uis.push({el, instance: new klass(el, EMITTER) });
          });
        }
      }
    });
  }
  _collectInstancesInOldPage({ current }) {
    const { container } = current;
    
    const trashInstances = (data, index, array) => {
      // if element is not part of old page [data-windmill="container"], it doesn't need to be destroyed
      if( !container.contains(data.el) && container !== data.el ) return;
      
      // put instance in trash and remove from array
      this._trashed.push(data.instance);
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
    this._trashed.forEach(instance => {
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
  
  
  
  
  /**
  * Validate if class exists in registry
  */
  _validateClass(name, group) {
    if( !this._classes || !(group in this._classes) || !(name in this._classes[group]) ) return false;
    return this._classes[group][name];
  }
}

export default WindmillDomController;
