import { getHead } from "@utils/dom";

class YoutubeAPI {
  constructor() {
    this._script = null;
    this._ready = false;
    this._promises = [];

    window.onYouTubeIframeAPIReady = () => {
      this._ready = true;      
      this._promises.forEach(promise => promise());
      this._promises = null;

      window.onYouTubeIframeAPIReady = null;
    }
  }

  load() {
    if( this._ready ) return Promise.resolve();

    const promise = new Promise((resolve) => this._promises.push(resolve));    

    if( !this._script ) {
      this._script = document.createElement("script");
      this._script.onerror = e => { console.error("Error loading Youtube iFrame API :", e); };
      this._script.src = "https://www.youtube.com/iframe_api";

      getHead().appendChild(this._script);
    }

    return promise;
  }

  // getter
  get ready() { return this._ready; }
}

const SINGLETON = new YoutubeAPI();
export default SINGLETON;
