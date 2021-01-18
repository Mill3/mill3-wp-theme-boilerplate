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

const Browser = () => {
  const freeSelf = isWindow(typeof self == "object" && self) && self;
  const navigator = freeSelf && freeSelf.navigator;
  const userAgent = ((navigator && navigator.userAgent) || "").toLowerCase();

  return {
    android: () => /android/.test(userAgent),
    chrome: (range) => {
      // eslint-disable-next-line no-undef
      const match = /google inc/.test(vendor) ? userAgent.match(/(?:chrome|crios)\/(\d+)/) : null;
      return match !== null && !this.opera() && compareVersion(match[1], range);
    },
    edge: (range) => {
      const match = userAgent.match(/edge\/(\d+)/);
      return match !== null && compareVersion(match[1], range);
    },
    firefox: (range) => {
      const match = userAgent.match(/(?:firefox|fxios)\/(\d+)/);
      return match !== null && compareVersion(match[1], range);
    },
    ie: (range) => {
      const match = userAgent.match(/(?:msie |trident.+?; rv:)(\d+)/);
      return match !== null && compareVersion(match[1], range);
    },
    ios: () => {
      return this.iphone() || this.ipad() || this.ipod();
    },
    ipad: (range) => {
      const match = userAgent.match(/ipad.+?os (\d+)/);
      return match !== null && compareVersion(match[1], range);
    },
    iphone: (range) => {
      // avoid false positive for Facebook in-app browser on ipad;
      // original iphone doesn't have the OS portion of the UA
      const match = this.ipad() ? null : userAgent.match(/iphone(?:.+?os (\d+))?/);
      return match !== null && compareVersion(match[1] || 1, range);
    },
    ipod: (range) => {
      const match = userAgent.match(/ipod.+?os (\d+)/);
      return match !== null && compareVersion(match[1], range);
    },
    mobile: () => mobile,
    opera: (range) => {
      const match = userAgent.match(/(?:^opera.+?version|opr)\/(\d+)/);
      return match !== null && compareVersion(match[1], range);
    },
    safari: (range) => {
      const match = userAgent.match(/version\/(\d+).+?safari/);
      return match !== null && compareVersion(match[1], range);
    },
  };
};

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
  },
};

// helper function which compares a version to a range
const compareVersion = (version, range) => {
  const string = range + "";
  const n = +(string.match(/\d+/) || NaN);
  const op = string.match(/^[<>]=?|/)[0];

  return comparator[op] ? comparator[op](version, n) : version == n || n !== n;
};

export default Browser();
