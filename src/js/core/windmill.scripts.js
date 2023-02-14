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

export const SCRIPTS_SELECTOR = 'script[src][type="text/javascript"]';
export const INLINE_SCRIPTS_SELECTOR = 'script:not([src]):not([type="application/ld+json"]):not([type="application/json"]):not([type="text/html"])';

export class WindmillScripts {
  constructor() {
    this._parser;
    this._source;
    this._windmill;
  }
  
  /**
  * Plugin installation.
  */
  install(windmill) {
    this._parser = new DOMParser();
    this._windmill = windmill;
    
    windmill.on('fetched', this._onFetched, this);
    windmill.on('done', this._onDone, this);
  }
  
  /**
  * Add scripts (external source or inlined) to document <head>.
  */
  add(js) {
    // if scripts is empty, do nothing
    if (!js || js.length === 0) {
      return Promise.resolve();
    }
    
    const head = document.querySelector("head");
    
    // Collect all scripts in document
    const currentScripts = this._getScripts(document).map((script) => this._getScriptNamespace(script));
    const newScripts = [];
    
    // for each script found in head
    js.forEach((script) => {
      // if this script is already in head, do nothing
      if (currentScripts.includes(this._getScriptNamespace(script))) {
        return;
      }
      // create new script tag
      const tag = document.createElement("script");
      
      // copy all attributes from script
      this._copyAttributes(tag, script);
      
      // if script has inlined text, copy it
      if (script.text) {
        tag.appendChild(document.createTextNode(script.text));
      }
      
      // push script
      newScripts.push(tag);
    });
    
    // synchronously load each script
    if (newScripts.length > 0) {
      return newScripts.reduce((promise, script) => {
        return promise.then(() => (script.text ? this._inlineScript(script, head) : this._loadScript(script, head)));
      }, Promise.resolve());
    }
    
    return Promise.resolve();
  }
  
  /**
  * Run inlined scripts.
  * Will log error if script has no inlined code.
  */
  run(js) {
    // if scripts is empty, do nothing
    if (!js || js.length === 0) {
      return Promise.resolve();
    }
    
    const newScripts = [];
    
    // for each scripts
    js.forEach((script) => {
      // create new script tag
      const tag = document.createElement("script");
      
      // copy all attributes from script
      this._copyAttributes(tag, script);
      
      // if script has inlined text, copy it
      if (script.text) {
        tag.appendChild(document.createTextNode(script.text));
      } else {
        if( this._windmill.debug === true ) console.warn(`Unable to execute this script because it does not contains inlined code.`, script);
        return;
      }
      
      // enqueue script
      newScripts.push({ script: tag, target: script.parentNode });
      
      // remove script from DOM to avoid pollution
      script.parentNode.removeChild(script);
    });
    
    // return true;
    
    // synchronously run each script
    return newScripts.reduce((promise, { script, target }) => {
      return promise.then(() => this._inlineScript(script, target));
    }, Promise.resolve());
  }
  
  /**
  * Get all <head> + <body> script from a HTML source
  */
  _getScripts(source, selector = SCRIPTS_SELECTOR) {
    const head = source.querySelector("head");
    const body = source.querySelector("body");
    return [...head.querySelectorAll(selector), ...body.querySelectorAll(selector)];
  }
  
  
  /**
  * Load external script and append it to document.
  */
  _loadScript(script, target) {
    return new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      
      target.appendChild(script);
    });
  }
  
  /**
  * Append script to document and execute it.
  */
  _inlineScript(script, target) {
    return new Promise((resolve) => {
      target.appendChild(script);
      try {
        eval(script.innerHTML);
      } catch (error) {
        if( this._windmill.debug === true ) console.error(error);
      }
      resolve();
    });
  }
  
  /**
  * Get script namespace (kind of UDID).
  */
  _getScriptNamespace(script) {
    return script.src ? script.src : script.text;
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
  
  /**
  * `fetched` event.
  */
  _onFetched({ next }) {
    // parse html return from Windmill
    this._source = this._parser.parseFromString(next.html, "text/html");
    
    // Find head & body scripts in source
    const js = this._getScripts(this._source);
    
    // Inject new external scripts
    return this.add(js);
  }
  
  /**
  * `done` event.
  */
  _onDone() {
    // skip if source is not available
    if( !this._source ) return;
    
    // Find inlined scripts in source and eval() any text values as JS scripts
    // This is for useful for WP plugins like Gravity Forms who inject inline scripts
    const js = this._getScripts(this._source, INLINE_SCRIPTS_SELECTOR);
    
    // Run inlined scripts
    return this.run(js);
  }
}

export default WindmillScripts;
