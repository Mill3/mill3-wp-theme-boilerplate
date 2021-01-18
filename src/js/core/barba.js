import barba from "@barba/core";

import { body, html } from "@utils/dom";
import { sleep } from "@utils/sleep";

const parser = new DOMParser();

export const updateBodyClass = (html) => {
  const source = parser.parseFromString(html, "text/html");
  const classNames = source.querySelector("body").classList;

  // apply new classList to body
  body.classList = classNames;
};

// before leave transition, add a special classname to html
barba.hooks.beforeLeave(() => {
  html.classList.add("--js-barba");
});

barba.hooks.afterLeave(() => {
  body.removeAttribute("class");
});

// before enter transition, remove old container and update body classnames
barba.hooks.beforeEnter((data) => {
  barba.transitions.remove(data);
  updateBodyClass(data.next.html);
});

// after transition, remove special classname from html + inject and eval scripts
barba.hooks.after(() => {
  // remove special classname
  html.classList.remove("--js-barba");

  return sleep(0);
});

export default {
  updateBodyClass
};
