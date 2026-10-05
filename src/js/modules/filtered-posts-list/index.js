/**
 * Filtered Post List : enable post-type archive filtering without page transition, using a SELECT element and/or filter links.
 * Results are fetched, swapped in place and the URL is replaced (windmill.replace), so a reload shows the same filtered archive.
 * Animations: fade out results & pagination, then swap: new items reveal themselves through the scroll system (.is-inview on [data-scroll])
 *
 * How to use in your template :
 *
 * 1. attach JS module to the container containing : SELECT element, filter links, all posts, pagination
 *
 * <section data-module="filtered-posts-list"></section>
 *
 * 2. attach data-selector to SELECT element AND filter links
 *
 * <select class="my-ctp-archive__filter" data-filtered-posts-list-filters>
 *   <option value="{{ my-ctp_archive_link }}">{{ __('Filter by', 'mill3wp') }}</option>
 *   <option value="{{ term.link }}">{{ term.name }}</option>
 *
 * <nav class="my-cpt-archive__links" data-filtered-posts-list-links>
 *   <a href="#" data-filtered-posts-list-root>All</a>
 *   <a href="#">Filter 1</a>
 *   <a href="#">Filter 2</a>
 * </nav>
 *
 *    Optional: [data-filtered-posts-list-root] on the "All" link. It only filters in place when the module started on that URL;
 *    otherwise (e.g. visitor landed on a term archive) it runs a normal Windmill page transition, so the index page renders
 *    with everything term archives don't have (sticky posts, intro…).
 *
 *    The active link is whatever the fetched page marks as active (e.g. aria-current="page"): links are swapped with the results.
 *
 * 3. attach data-selector to posts container
 *
 * <ol data-filtered-posts-list-results>
 * {% for post in posts %}
 * ...
 * </ol>
 *
 * 4. attach data-selector to pagination element (keep it in the markup even when empty)
 *
 * <div data-filtered-posts-list-pagination>
 *   {% include 'partial/pagination.twig' %}
 * </div>
 *
*/

import anime from "animejs";

import windmill from "@core/windmill";
import { $ } from "@utils/dom";
import { inViewport } from "@transitions/utils";
import { on, off } from "@utils/listener";

const LOCKED_CLASSNAME = "--js-filtered-posts-list-locked";
const FILTERS_SELECTOR = "[data-filtered-posts-list-filters]";
const LINKS_SELECTOR = "[data-filtered-posts-list-links]";
const PAGINATION_SELECTOR = "[data-filtered-posts-list-pagination]";
const RESULTS_SELECTOR = "[data-filtered-posts-list-results]";
const ROOT_ATTRIBUTE = "data-filtered-posts-list-root";
const STAGGER = 40; // ms between each element of the animation-out

// compare URLs without hash
const sameURL = (a, b) => {
  const urlA = new URL(a, window.location.href);
  const urlB = new URL(b, window.location.href);

  return urlA.origin === urlB.origin && urlA.pathname === urlB.pathname && urlA.search === urlB.search;
};

// replace an element's content with the children of the same element in the fetched page
const swapChildren = (target, source) => {
  if( target ) target.replaceChildren(...(source ? source.childNodes : []));
};

class FilteredPostsList {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;

    this.filters = $(FILTERS_SELECTOR, this.el);
    this.links = $(LINKS_SELECTOR, this.el);
    this.pagination = $(PAGINATION_SELECTOR, this.el);
    this.results = $(RESULTS_SELECTOR, this.el);

    this._initialURL = window.location.href;
    this._parser = null;
    this._controller = null; // AbortController of the running request
    this._animation = null;

    this._onFilterChange = this._onFilterChange.bind(this);
    this._onLinkClick = this._onLinkClick.bind(this);
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if( this._controller ) this._controller.abort();
    if( this._animation ) this._animation.pause();

    this.el = null;
    this.emitter = null;
    this.filters = null;
    this.links = null;
    this.pagination = null;
    this.results = null;

    this._parser = null;
    this._controller = null;
    this._animation = null;

    this._onFilterChange = null;
    this._onLinkClick = null;
  }

  _bindEvents() {
    if( this.filters ) on(this.filters, 'change', this._onFilterChange);
    if( this.links ) on(this.links, 'click', this._onLinkClick);
  }
  _unbindEvents() {
    if( this.filters ) off(this.filters, 'change', this._onFilterChange);
    if( this.links ) off(this.links, 'click', this._onLinkClick);
  }

  _onFilterChange() {
    this._load(this.filters.value);
  }
  _onLinkClick(event) {
    // let the browser handle new tab / new window / download clicks
    if( event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) return;

    const link = event.target.closest('a[href]');
    if( !link || !this.links.contains(link) ) return;

    // "All" link when the module didn't start on it: let Windmill run a normal page transition
    if( link.hasAttribute(ROOT_ATTRIBUTE) && !sameURL(link.href, this._initialURL) ) return;

    // filter in place: keep Windmill from running a page transition
    event.preventDefault();
    event.stopImmediatePropagation();

    this._load(link.href);
  }

  async _load(href) {
    // nothing to do for the current filter
    if( !href || sameURL(href, window.location.href) ) return;

    // a newer request replaces the running one
    if( this._controller ) this._controller.abort();
    if( this._animation ) this._animation.pause();

    const controller = new AbortController();
    this._controller = controller;

    // block UI
    this.el.classList.add(LOCKED_CLASSNAME);

    try {
      const response = await fetch(href, { signal: controller.signal });
      if( !response.ok ) throw new Error(`HTTP ${response.status} on ${href}`);

      const html = await response.text();

      // module destroyed or request replaced meanwhile
      if( controller !== this._controller ) return;

      this._render(href, html);
    } catch(error) {
      if( error.name === 'AbortError' ) return;

      // fallback: regular navigation, the visitor still gets the page
      console.error('FilteredPostsList:', error);
      windmill.force(href);
    }
  }
  _render(href, html) {
    // create DOMParser only once
    if( !this._parser ) this._parser = new DOMParser();

    const doc = this._parser.parseFromString(html, "text/html");
    const results = $(RESULTS_SELECTOR, doc);

    // unexpected page (no results container): regular navigation
    if( !results || !this.results ) {
      windmill.force(href);
      return;
    }

    // URL only changes once the new content is in hand
    windmill.replace(href);

    // update filters and links immediately (active state comes from the fetched page)
    if( this.filters ) swapChildren(this.filters, $(FILTERS_SELECTOR, doc));
    if( this.links ) swapChildren(this.links, $(LINKS_SELECTOR, doc));

    const pagination = $(PAGINATION_SELECTOR, doc);
    // swap content: new items reveal themselves through the scroll system (.is-inview on [data-scroll])
    const swap = () => {
      if( !this.el ) return;

      if( doc.title ) document.title = doc.title;
      swapChildren(this.results, results);
      swapChildren(this.pagination, pagination);

      // pagination back in place (results were replaced), new children are hidden until .is-inview
      elements.forEach(el => {
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
      });
      this._animation = null;

      // refresh site-scroll: observes the new [data-scroll] elements, in-viewport ones get .is-inview
      if( this.emitter ) this.emitter.emit('SiteScroll.update');

      // unblock UI
      this.el.classList.remove(LOCKED_CLASSNAME);
    };

    // animate out only what's visible (each result, then pagination, staggered): a long list would delay the swap
    const elements = [...this.results.children, this.pagination].filter(el => el && inViewport(el));

    // nothing visible (scrolled past the list): swap right away
    if( !elements.length ) {
      swap();
      return;
    }

    this._animation = anime({
      targets: elements,
      opacity: {
        value: 0,
        duration: 250,
        delay: anime.stagger(STAGGER, { start: 200 }),
        easing: "linear"
      },
      translateY: {
        value: 60,
        duration: 450,
        delay: anime.stagger(STAGGER),
        easing: "easeInQuad"
      },
      complete: swap,
    });
  }
}

export default FilteredPostsList;
