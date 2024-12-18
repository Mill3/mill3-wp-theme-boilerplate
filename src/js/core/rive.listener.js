import MILL3_EMITTER from "@core/emitter";

class RiveListener {
  constructor() {
    this._event = null;
    this._listening = false;
    this._listeners = [];
    this._tick = null;

    this._onScrollCall = this._onScrollCall.bind(this);
  }

  // priority = higher number means executing first
  add(callback, priority = 0) {
    // if callback is already registered, stop here
    if( this._exists(callback) ) return;

    // add callback to the list of listeners
    this._listeners.push({ callback, priority });

    // sort callbacks by priority (higher the better)
    this._listeners.sort((a, b) => {
      if( b.priority > a.priority ) return 1;
      else if( b.priority < a.priority ) return -1;
      
      return 0;
    });

    // if not already listening to window's resize event AND
    // if list of listeners is not empty
    if( !this._listening && this._listeners.length > 0 ) this._bindEvents();
  }
  remove(callback) {
    // if callback is not registered, stop here
    if( !this._exists(callback) ) return;

    // remove callback from list of listeners
    const index = this._listeners.findIndex(listener => listener.callback === callback);
    this._listeners.splice(index, 1);

    // if was listening to window's resize event AND
    // if list of listeners is empty
    if( this._listening && this._listeners.length === 0 ) this._unbindEvents();
  }

  _bindEvents() {
    if( this._listening ) return;
    this._listening = true;
    
    MILL3_EMITTER.on('SiteScroll.rive', this._onScrollCall);
  }
  _unbindEvents() {
    if( !this._listening ) return;

    MILL3_EMITTER.off('SiteScroll.rive', this._onScrollCall);
    this._listening = false;
  }

  _exists(callback) {
    return this._listeners.find(listener => listener.callback === callback);
  }

  _onScrollCall(direction, obj) {
    // execute all callbacks
    this._listeners.forEach(({callback}) => callback(direction, obj));
  }
}

const SINGLETON = new RiveListener();
export default SINGLETON;
