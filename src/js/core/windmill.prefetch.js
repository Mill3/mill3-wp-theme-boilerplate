/**
* @core/windmill.prefetch
* <br><br>
* ## Windmill URLs prefetching.
*
* - Wait until first windmill.done events is triggered to run.
* - Then, load a list of URLs to prefetch (page, post, etc...) via AJAX. (see: /lib/windmill.prefetch.php)
* - Then, load the first non-cached URL from the list via fetch.
* - When fetch is completed, get HTML response and save it into windmill's cache system.
* - Continue with next non-cached URL in list until list is empty.
*
* @module windmill
* @preferred
*/

import { isArray } from "@utils/is";

export class WindmillPrefetch {  

  constructor() {
    this._urls = null;
    this._windmill = null;

    this._fetchURLs = this._fetchURLs.bind(this);
    this._prefetchURL = this._prefetchURL.bind(this);
  }

  /**
   * Plugin installation.
   */
  install(windmill) {
    // if windmill's cache is disabled OR requestIdleCallback is not supported by browser, stop here
    if( !windmill.cache || !window.requestIdleCallback ) return;

    this._windmill = windmill;
    this._windmill.once('done', this._onDone, this);
  }

  _onDone() { requestIdleCallback(this._fetchURLs); }

  _fetchURLs() {
    const locale = MILL3WP.locale;
    const url = locale ? `${MILL3WP.current_site}/${locale}/windmill-prefetch/` : `${MILL3WP.current_site}/windmill-prefetch/`;
    
    fetch(url)
      .then((response) => response.json())
      .then(json => {
        if( !isArray(json) || json.length < 1 ) return;

        this._urls = json;
        requestIdleCallback(this._prefetchURL);
      });
  }
  _prefetchURL() {
    // if array of urls is empty, stop here
    if( this._urls.length === 0 ) return;

    // get first url in list
    const url = this._urls.shift();

    // if url is already cached, restart idling process
    if( this._windmill.urlCached(url) ) return requestIdleCallback(this._prefetchURL);

    fetch(url, {headers: {'X-WINDMILL': 'yes'}}) // fetch URL (with custom headers)
        .then(response => response.text()) // return html
        .then(html => {
          // save cache
          this._windmill.saveCache(url, html);

          // restart idling process
          requestIdleCallback(this._prefetchURL);
        });
  }
}

export default WindmillPrefetch;
