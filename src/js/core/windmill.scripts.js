/**
* @core/windmill.scripts
* <br><br>
* ## Windmill Scripts.
*
* - Add external scripts from head of next page
* - Manage inlined scripts in next page
*
* @module windmill
* @preferred
*/

import { head } from "@utils/dom";

export const SCRIPTS_SELECTOR = 'script:not([type="application/ld+json"]):not([type="application/json"]):not([type="text/html"])';

export class WindmillScripts {
  constructor() {
    this._dictionnary;
    this._deletions;
    this._parser;
    this._source;
    this._windmill;
  }
  
  /**
  * Plugin installation.
  */
  install(windmill) {
    this._dictionnary = new Map();
    this._deletions = new Map();
    this._parser = new DOMParser();
    this._windmill = windmill;
    
    windmill.on('init', this._onInit, this);
    windmill.on('exited', this._onExited, this);
    windmill.on('enter', this._onEnter, this);
  }


  _onInit() {
    const wrapper = document.querySelector(this._windmill.wrapper);

    // collect scripts from initial page load and save them in dictionnary
    [ ...document.querySelectorAll(SCRIPTS_SELECTOR) ].forEach(script => {
      const namespace = this._getScriptNamespace(script);
      if( !namespace ) return;

      // if script is inside windmill's wrapper, do not save it into dictionnary
      if( wrapper.contains(script) ) return;

      // if script has inline text and is not in <head>, do not save it into dictionnary
      if( this._scriptHasInlineText(script) && !head.contains(script) ) return;

      // add script to dictionnary
      this._dictionnary.set(namespace, script);
    });
  }

  _onExited() {
    this._deletions.forEach((script, key) => {
      this._dictionnary.delete(key);
      script.remove();
    });

    this._deletions.clear();
  }

  _onEnter({ next }) {
    // parse html return from Windmill
    this._source = this._parser.parseFromString(next.html, "text/html");

    const wrapper = this._source.querySelector(this._windmill.wrapper);
    const scripts = [];

    // collect scripts from new page
    [ ...this._source.querySelectorAll(SCRIPTS_SELECTOR) ].forEach(script => {
      const namespace = this._getScriptNamespace(script);
      if( !namespace ) return;

      // if script is already loaded, stop here
      if( this._dictionnary.has(namespace) ) return;

      const hasInlineText = this._scriptHasInlineText(script);
      const isInWindmill = wrapper.contains(script);

      // create new script tag
      const tag = document.createElement("script");

      // copy all attributes from script
      this._copyAttributes(tag, script);

      // if script has inlined text, copy it
      if( hasInlineText ) tag.appendChild(document.createTextNode(script.text));

      // add script to dictionnary if isn't inside windmill's wrapper
      if( !isInWindmill ) this._dictionnary.set(namespace, tag);

      // if script has inline text or is inside windmill's wrapper, remove script after page is removed
      if( hasInlineText || isInWindmill ) this._deletions.set(namespace, script);

      // add script to loading queue
      scripts.push(tag);
    });

    // synchronously load each script (sequentially)
    if( scripts.length > 0 ) {
      return scripts.reduce((promise, script) => {
        if( script.src && script.text ) {
          return promise
            .then(() => this._loadScript(script))
            .then(() => this._inlineScript(script));
        }
        else if( script.src ) return promise.then(() => this._loadScript(script));
        else return promise.then(() => this._inlineScript(script));
      }, Promise.resolve());
    }
  }

  /**
   * Load external script and append it to document.
   * @param {Element} script 
   * @returns Promise
   */
  _loadScript(script) {
    return new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      
      head.appendChild(script);
    });
  }

  /**
   * Append script to document and execute it.
   * @param {Element} script 
   * @returns Promise
   */
  _inlineScript(script) {
    return new Promise(resolve => {
      head.appendChild(script);

      try {
        eval(script.text);
      } catch (error) {
        if( this._windmill.debug === true ) console.error(error);
      }

      resolve();
    });    
  }

  /**
   * Check if script element has inline text.
   * @param {Element} script 
   * @returns Boolean
   */
  _scriptHasInlineText(script) {
    return script.text.trim() ? true : false;
  }

  /**
   * Get script namespace (kind of UDID).
   */
  _getScriptNamespace(script) {
    if( script.src ) return script.src;
    else if( script.id ) return script.id;
    else return script.text.trim();
  }

  /**
   * Copy all attributes from source to target element.
   */
  _copyAttributes(target, source) {
    if (source.hasAttributes()) {
      const attrs = source.attributes;
      for (let i = attrs.length - 1; i >= 0; i--) {
        target.setAttribute(attrs[i].name, attrs[i].value);
      }
    }
  }
}

export default WindmillScripts;
