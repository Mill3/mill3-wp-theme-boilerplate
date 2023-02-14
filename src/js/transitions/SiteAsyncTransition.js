import anime from "animejs";

import { $$, body, html } from "@utils/dom";
import { moduleDelays } from "./utils";

const CLASSNAME = "--js-windmill-transition";

class SiteTransition {
  exiting({ current }) {
    const { container } = current;

    // set body height to prevent layout shift
    body.style.height = `${body.scrollHeight}px`;
    html.style.cursor = 'wait';

    // remove all [data-scroll] from container
    [ ...$$('[data-scroll]', container) ].forEach(el => el.removeAttribute('data-scroll'));

    // remove all [data-module] & [data-ui] from container
    [ ...$$('[data-module]', container) ].forEach(el => el.removeAttribute('data-module'));
    [ ...$$('[data-ui]', container) ].forEach(el => el.removeAttribute('data-ui'));

    // save container's background-color
    const bgColor = getComputedStyle(container).backgroundColor;
    container.style.backgroundColor = bgColor;

    // prepare current container for transition
    current.container.setAttribute('aria-hidden', true);
  }

  // this method is required for the transition to be selected by Windmill
  exit() { html.classList.add(CLASSNAME); }

  fetched({ current, next }) {
    current.container.style.setProperty('--scroll-y', `${window.scrollY}px`);
    next.container.classList.add('visibility-hidden', 'position-relative');
  }

  entering({ next }) { moduleDelays(350, 450, next.container); }
  enter({ current, next }) {
    return new Promise((resolve) => {
      
      // set body height to prevent layout shift
      body.style.height = `${body.scrollHeight}px`;
      next.container.parentElement.style.overflow = 'hidden';
      html.style.removeProperty('cursor');

      const tl = anime.timeline({ autoplay: false });

            tl.add({
              targets: current.container,
              opacity: {
                value: 0.5, 
                easing: 'linear',
              },
              scale: 0.9,
              duration: 766.66666667,
              easing: 'cubicBezier(0.20, 0.00, 0.23, 1.00)',
            }, 0);

            tl.add({
              targets: next.container,
              translateY: ['100vh', '0vh'],
              duration: 766.66666667,
              easing: 'cubicBezier(0.20, 0.00, 0.23, 1.00)',
              complete: resolve,
            }, 0);

      next.container.classList.remove('visibility-hidden');
      tl.play();
    });
  }
  entered({ next }) {
    next.container.parentElement.style.removeProperty('overflow');
    body.style.removeProperty('height');
  }
}

export default SiteTransition;
