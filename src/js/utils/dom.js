import { isArray, isDomNode, isHTMLCollection, isNodeList, isString } from "./is";

export const html = document.documentElement;
export const head = document.head;
export const body = document.body;

export const $ = (query, target = html) => {
  if (isString(query)) return target.querySelector(query);
  else if (query === window) return query;
  else if (isDomNode(query)) return query;
  else if (isArray(query) || isNodeList(query) || isHTMLCollection(query)) return query[0];

  return null;
};
export const $$ = (query, target = html) => {
  if (isString(query)) return target.querySelectorAll(query);
  else if (query === window) return [query];
  else if (isDomNode(query)) return [query];
  else if (isArray(query) || isNodeList(query) || isHTMLCollection(query)) return query;

  return null;
};

export const rect = el => el.getBoundingClientRect();
export const removeAllChilds = el => {
  while (el.firstChild) el.removeChild(el.firstChild);
};
export const wrap = (el, wrapper) => {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
};
export const getFocusedElement = () => document.activeElement;

// https://stackoverflow.com/a/56531945/519240
export const innerDimensions = node => {
  var computedStyle = getComputedStyle(node);

  let width = node.clientWidth; // width with padding
  let height = node.clientHeight; // height with padding

  height -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
  width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);

  return { height, width };
};

export default {
  html,
  head,
  body,
  $,
  $$,
  rect,
  removeAllChilds,
  wrap,
  getFocusedElement,
  innerDimensions
};
