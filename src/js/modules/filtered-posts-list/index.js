/**
 * Filtered Post List : enable post-type archive filtering using SELECT element containing a post-type taxonomy
 *
 * How to use in your template :
 *
 * 1. attach JS module to the container containing : SELECT element, all posts, pagination
 *
 * <section data-module="filtered-posts-list" data-filtered-posts-list></section>
 *
 * 2. attach data-selector to SELECT element
 *
 * <select class="my-ctp-archive__filter" data-filtered-posts-list-filters >
 *   <option value="{{ my-ctp_archive_link }}">{{ __('Filter by', 'mill3wp') }}</option>
 *   <option value="{{ term.link }}">{{ term.name }}</option>
 *
 * 3. attach data-selector to posts container
 *
 * <ol data-filtered-posts-list-results >
 * {% for post in posts %}
 * ...
 * </ol>
 *
 * 4. attach data-selector to pagination element
 *
 * <div data-filtered-posts-list-pagination>
 *   {% include 'partial/pagination.twig' }
 * </div>
 *
*/

import anime from "animejs";

import windmill from "@core/windmill";
import { $ } from "@utils/dom";
import { on, off } from "@utils/listener";

const LOCKED_CLASSNAME = "--js-filtered-posts-list-locked";
const FILTERS_SELECTOR = "[data-filtered-posts-list-filters]";
const PAGINATION_SELECTOR = "[data-filtered-posts-list-pagination]";
const RESULTS_SELECTOR = "[data-filtered-posts-list-results]";

class FilteredPostsList {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;

    this.filters = $(FILTERS_SELECTOR, this.el);
    this.pagination = $(PAGINATION_SELECTOR, this.el);
    this.results = $(RESULTS_SELECTOR, this.el);

    this._parser = null;
    this._newPageTitle = null;
    this._newPaginationHTML = null;
    this._newResultsHTML = null;

    this._onTypeChange = this._onTypeChange.bind(this);
    this._onAjaxCallback = this._onAjaxCallback.bind(this);
    this._onAjaxResponse = this._onAjaxResponse.bind(this);
    this._onAjaxError = this._onAjaxError.bind(this);
    this._onElementsHidden = this._onElementsHidden.bind(this);
    this._onTimelineComplete = this._onTimelineComplete.bind(this);
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    this.el = null;
    this.emitter = null;
    this.filters = null;
    this.pagination = null;
    this.results = null;

    this._parser = null;
    this._newPageTitle = null;
    this._newPaginationHTML = null;
    this._newResultsHTML = null;

    this._onTypeChange = null;
    this._onAjaxCallback = null;
    this._onAjaxResponse = null;
    this._onAjaxError = null;
    this._onElementsHidden = null;
    this._onTimelineComplete = null;
  }

  _bindEvents() {
    if(this.filters) on(this.filters, 'change', this._onTypeChange);
  }
  _unbindEvents() {
    if(this.filters) off(this.filters, 'change', this._onTypeChange);
  }

  _onTypeChange() {
    const href = this.filters.value;

    // replace current history state
    windmill.replace(href);

    // block UI
    if( this.el ) this.el.classList.add(LOCKED_CLASSNAME);

    // fetch HTML
    fetch(href)
      .then(this._onAjaxCallback)
      .then(this._onAjaxResponse)
      .catch(this._onAjaxError);
  }
  _onAjaxCallback(response) {
    // stop here if module has been destroyed during Fetch request
    if( !this.el ) return;

    // return fetch response to promises
    if( response.ok ) return response.text();
    else this._onTimelineComplete();
  }
  _onAjaxResponse(html) {
    // stop here if module has been destroyed during Fetch request
    if( !this.el ) return;

    // create DOMParser only once
    if( !this._parser ) this._parser = new DOMParser();

    const doc = this._parser.parseFromString(html, "text/html");
    const title = $('html title', doc);
    const results = $(RESULTS_SELECTOR, doc);
    const pagination = $(PAGINATION_SELECTOR, doc);

    // if we can't find results, stop here
    if( !results ) {
      this._onTimelineComplete();
      return;
    }

    // save new content
    this._newPageTitle = title.innerText;
    this._newResultsHTML = results.innerHTML;
    this._newPaginationHTML = pagination ? pagination.innerHTML : '';

    // fade out results & pagination
    const elements = [];

    if( this.results ) elements.push(this.results);
    if( this.pagination ) elements.push(this.pagination);

    if( elements.length > 0 ) {
      anime({
        targets: elements,
        opacity: {
          value: 0,
          duration: 250,
          delay: 200,
          easing: "linear"
        },
        translateY: {
          value: 60,
          duration: 450,
          easing: "easeInQuad"
        },
        complete: this._onElementsHidden,
      });
    }
    else this._onTimelineComplete();
  }
  _onAjaxError(error) {
    console.log('FlteredPostsList AJAX error:', error);

    this._onTimelineComplete();
  }
  _onElementsHidden() {
    // stop here if module has been destroyed during Fetch request
    if( !this.el ) return;

    // update page title
    document.title = this._newPageTitle;

    // replace results
    if( this.results ) this.results.innerHTML = this._newResultsHTML;

    // replace pagination
    if( this.pagination ) this.pagination.innerHTML = this._newPaginationHTML;

    // clear variables
    this._newPageTitle = null;
    this._newResultsHTML = null;
    this._newPaginationHTML = null;

    // refresh site-scroll
    this.emitter.emit('SiteScroll.update');

    // fade in results & pagination
    const elements = [];

    if( this.results ) elements.push(this.results);
    if( this.pagination ) elements.push(this.pagination);

    // fade in list each time
    if( elements.length > 0 ) {
      anime({
        targets: elements,
        opacity: {
          value: [0, 1],
          duration: 450,
          easing: "linear"
        },
        translateY: {
          value: [60, 0],
          duration: 850,
          easing: 'easeOutCubic'
        }
      });
    }

    this._onTimelineComplete();
  }
  _onTimelineComplete() {
    // unblock UI
    if( this.el ) this.el.classList.remove(LOCKED_CLASSNAME);
  }
}

export default FilteredPostsList;
