/* eslint-disable object-shorthand */
/* eslint-disable no-undef */

// ViteJS glob import all Modules
const module_chunks = import.meta.glob('./modules/**/index.js');

import domready from "domready";
import EventEmitter2 from "eventemitter2";

import ACF from '@utils/acf';

domready(() => {
  const parent = window.parent;
  const EMITTER = new EventEmitter2({ wildcard: true });
  const chunks = new Map();
  const modules = [];
  const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isFunction = (v) => toString.call(v) === "[object Function]" || typeof v === "function";

  class ChunkData {
    constructor(el, chunk) {
      this.el = el;
      this.chunk = chunk;
    }
  }


  const resize = () => {
    const max = Math.ceil(parent.innerHeight * 2 >> 0);
    const height = document.body.querySelector('.pb-row-wrapper').getBoundingClientRect().height;

    window.frameElement.height = Math.max(25, Math.min(max, height));
  };

  const importChunks = () => {
    const promises = [];
    const container = document.body;

    [ ...container.querySelectorAll("[data-module]"), container ].forEach(el => {

      // get data and module or ui chunk type
      // element should be : <div data-module="my-module"> or <div data-ui="my-ui-js-thing">
      const { module, moduleNative, moduleBackend } = el.dataset;

      // element can cast 1 or multiple chunk, each seperated by a coma
      if (module) {
        const moduleSelector = ACF.is_preview && el.hasAttribute('data-module-backend') ? moduleBackend : (mobile && el.hasAttribute('data-module-native') ? moduleNative : module);

        if( moduleSelector ) {
          moduleSelector.split(",").forEach(m => {
            const name = `modules/${m}`;

            // if this chunk as never been imported before, import it
            if( !chunks.has(name) ) promises.push( importChunk(name) );

            // add element to modules
            modules.push(new ChunkData(el, name));
          });
        }
      }
    });

    return Promise.all(promises);
  };
  const importChunk = (name) => {
    const moduleName = `./${name}/index.js`; // must append index.js to name for matching ViteJS reference
    let promise = null;

    if( module_chunks[moduleName] ) promise = module_chunks[moduleName]();
    if( !promise ) return Promise.reject(`Error loading webpack chunk ${name}`);

    // save promise in chunks map
    chunks.set(name, promise);

    // when loading is completed, update chunks set with default export
    promise.then(chunk => { chunks.set(name, chunk.default) });
    promise.catch(error => { console.error(`Error loading chunk ${name}:`, error); });

    return promise;
  };
  const createModuleInstances = () => {
    modules.forEach((module, index) => {
      if( !(module instanceof ChunkData) ) return;

      const klass = chunks.get(module.chunk);
      modules[index] = { el: module.el, instance: new klass(module.el, EMITTER) };
    });
  };
  const initModules = () => {
    modules.forEach(({ instance }) => { if( isFunction(instance.init) ) instance.init(); });
  };
  const startModules = () => {
    modules.forEach(({ instance }) => { if( isFunction(instance.start) ) instance.start(); });
  };

  resize();

  ACF.is_preview = true;

  window.addEventListener('load', resize, { once: true });
  window.addEventListener('resize', resize);
  parent.addEventListener('resize', resize, { capture: false });


  // import main styles in dev mode only then resize
  if (process.env.NODE_ENV === "development") {
    import("../scss/ACF-preview.scss")
      .then(resize)
      .then(importChunks)
      .then(createModuleInstances)
      .then(initModules)
      .then(startModules)
      .then(resize);
  } else {
    importChunks()
      .then(createModuleInstances)
      .then(initModules)
      .then(startModules)
      .then(resize);
  }

});
