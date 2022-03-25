// browser checking has been copied from https://github.com/arasatasaygin/is.js
/*

──────────────────────────────────────────
──────────────────────────────────────────
Check browser vendor and version
──────────────────────────────────────────
──────────────────────────────────────────

Browser.android()
Browser.chrome(range) // range is optional
Browser.edge(range) // range is optional
Browser.firefox(range) // range is optional
Browser.ie(range) // range is optional
Browser.ios()
Browser.ipad(range) // range is optional
Browser.iphone(range) // range is optional
Browser.ipod(range) // range is optional
Browser.mobile()
Browser.opera(range) // range is optional
Browser.safari(range) // range is optional

*/

import { isWindow } from "./is";
import mobile from "./mobile";


const freeSelf = isWindow(typeof self == "object" && self) && self;
const navigator = freeSelf && freeSelf.navigator;
const userAgent = ((navigator && navigator.userAgent) || "").toLowerCase();
const vendor = (navigator && navigator.vendor || '').toLowerCase();

// build a 'comparator' object for various comparison checks
const comparator = {
  "<": function (a, b) {
    return a < b;
  },
  "<=": function (a, b) {
    return a <= b;
  },
  ">": function (a, b) {
    return a > b;
  },
  ">=": function (a, b) {
    return a >= b;
  }
};

// helper function which compares a version to a range
const compareVersion = (version, range) => {
  const string = range + "";
  const n = +(string.match(/\d+/) || NaN);
  const op = string.match(/^[<>]=?|/)[0];

  return comparator[op] ? comparator[op](version, n) : version == n || n !== n;
};


export const android = () => /android/.test(userAgent);

export const chrome = (range) => {
  // eslint-disable-next-line no-undef
  const match = /google inc/.test(vendor) ? userAgent.match(/(?:chrome|crios)\/(\d+)/) : null;
  return match !== null && !opera() && compareVersion(match[1], range);
};
export const firefox = (range) => {
  const match = userAgent.match(/(?:firefox|fxios)\/(\d+)/);
  return match !== null && compareVersion(match[1], range);
};
export const safari = (range) => {
  const match = userAgent.match(/version\/(\d+).+?safari/);
  return match !== null && compareVersion(match[1], range);
};
export const opera = (range) => {
  const match = userAgent.match(/(?:^opera.+?version|opr)\/(\d+)/);
  return match !== null && compareVersion(match[1], range);
};

export const ie = (range) => {
  const match = userAgent.match(/(?:msie |trident.+?; rv:)(\d+)/);
  return match !== null && compareVersion(match[1], range);
};
export const edge = (range) => {
  const match = userAgent.match(/edge\/(\d+)/);
  return match !== null && compareVersion(match[1], range);
};

export const ios = () => iphone() || ipad() || ipod();
export const ipad = (range) => {
  const match = userAgent.match(/ipad.+?os (\d+)/);
  return match !== null && compareVersion(match[1], range);
};
export const iphone = (range) => {
  // avoid false positive for Facebook in-app browser on ipad;
  // original iphone doesn't have the OS portion of the UA
  const match = ipad() ? null : userAgent.match(/iphone(?:.+?os (\d+))?/);
  return match !== null && compareVersion(match[1] || 1, range);
};
export const ipod = (range) => {
  const match = userAgent.match(/ipod.+?os (\d+)/);
  return match !== null && compareVersion(match[1], range);
};


export default {
  android,
  chrome,
  firefox,
  safari,
  opera,
  ie,
  edge,
  ios,
  ipad,
  iphone,
  ipod,
};
