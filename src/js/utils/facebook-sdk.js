import { $, head, body } from "@utils/dom";

class FacebookSDK {
  constructor() {
    this._fbRoot = $('#fb-root');
    this._script = null;
    this._ready = false;
    this._xfbmlInitialized = false;
    this._promises = [];

    this._onXFBMLReady = this._onXFBMLReady.bind(this);

    window.fbAsyncInit = () => {
      FB.Event.subscribe('xfbml.ready', this._onXFBMLReady);

      this._ready = true;
      this._promises.forEach(promise => promise());
      this._promises = null;

      window.fbAsyncInit = null;
    }
  }

  load() {
    // if already loaded, return an auto-resolving Promise
    if( this._ready ) return Promise.resolve();

    // save promise for future
    const promise = new Promise((resolve) => this._promises.push(resolve));

    // make sur div#fb-root exist on the page
    if( !this._fbRoot ) {
      this._fbRoot = document.createElement('div');
      this._fbRoot.id = 'fb-root';

      body.appendChild(this._fbRoot);
    }

    // load Facebook SDK once
    if( !this._script ) {
      this._script = document.createElement("script");
      this._script.id = "facebook-jssdk";
      this._script.setAttribute("crossorigin", "anonymous");
      this._script.onerror = e => { console.error("Error loading Youtube iFrame API :", e); };
      this._script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v10.0";
      //this._script.src = "https://connect.facebook.net/en_US/sdk/debug.js#xfbml=1&version=v10.0";

      head.appendChild(this._script);
    }

    return promise;
  }

  _onXFBMLReady() { this._xfbmlInitialized = true; }

  // getter
  get ready() { return this._ready; }
  get xfbmlInitialized() { return this._xfbmlInitialized; }
}

const SINGLETON = new FacebookSDK();
export default SINGLETON;
