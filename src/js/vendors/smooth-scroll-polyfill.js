// polyfill for window.scrollTo({behavior: 'smooth'});
// inspired by https://gist.github.com/eyecatchup/d210786daa23fd57db59634dd231f341

import { html } from "@utils/dom";
import { isObject } from "@utils/is";

const polyfill = () => {
  // detect support for the behavior property in ScrollOptions
  const supportsNativeSmoothScroll = 'scrollBehavior' in html.style;

  // if feature is natively supported, do nothing
  if( supportsNativeSmoothScroll ) return;

  const nativeScrollTo = window.scrollTo;


  // t = current time
  // b = start value
  // c = change in value
  // d = duration
  const easeInOutQuad = (t, b, c, d) => {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
  };

  const DURATION = 600;

  window.scrollTo = function() {
    // if there is no arguments passed to function, stop here
    if( arguments.length < 1 ) return;

    // if we have more than 1 argument, it use the old x-coord, y-coord syntax
    if( arguments.length > 1 ) {
      nativeScrollTo(arguments[0], arguments[1]);
      return;
    }

    // if argument is not an object, it's not conform to API, stop here
    if( !isObject(arguments[0]) ) return;
    
    // get ScrollOptions
    const options = arguments[0];

    // if behavior is not smooth or top is not defined, use native scrollTo
    if( options.behavior !== 'smooth' || !options.top ) {
      nativeScrollTo(options);
      return;
    }

    const { top } = options;
    const start = html.scrollTop;
    const change = top - start;
    const startDate = +new Date();
    

    const animateScroll = () => {
        const currentDate = +new Date();
        const currentTime = currentDate - startDate;

        html.scrollTop = parseInt(easeInOutQuad(currentTime, start, change, DURATION));

        if( currentTime < DURATION ) requestAnimationFrame(animateScroll);
        else html.scrollTop = top;
    };

    animateScroll();
  };
};

export default polyfill;
