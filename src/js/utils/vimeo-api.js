class VimeoAPI {
  constructor() {
    this._loader = null;
    this._promises = [];
  }

  load() {
    if( VIMEO_PLAYER_CLASS ) return Promise.resolve(VIMEO_PLAYER_CLASS);

    const promise = new Promise((resolve) => this._promises.push(resolve)); 

    import("@vimeo/player")
      .then(chunk => {
        VIMEO_PLAYER_CLASS = chunk.default;

        this._promises.forEach(promise => promise(VIMEO_PLAYER_CLASS));
        this._promises = null;
      })
      .catch(e => { console.error("Error loading Vimeo Player API :", e); });

    return promise;
  }

  // getter
  get ready() { return VIMEO_PLAYER_CLASS ? true : false; }
}

let VIMEO_PLAYER_CLASS;

const SINGLETON = new VimeoAPI();
export default SINGLETON;
