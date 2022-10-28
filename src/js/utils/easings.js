// source: https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
//
// t: actual time
// b: start value
// c: end value
// d: total time

export const easeInQuad = (t, b, c, d) => c*(t/=d)*t + b;
export const easeOutQuad = (t, b, c, d) => -c *(t/=d)*(t-2) + b;
export const easeInOutQuad = (t, b, c, d) => {
  if ((t/=d/2) < 1) return c/2*t*t + b;
  return -c/2 * ((--t)*(t-2) - 1) + b;
};

export const easeInCubic = (t, b, c, d) => c*(t/=d)*t*t + b;
export const easeOutCubic = (t, b, c, d) => c*((t=t/d-1)*t*t + 1) + b;
export const easeInOutCubic = (t, b, c, d) => {
  if ((t/=d/2) < 1) return c/2*t*t*t + b;
  return c/2*((t-=2)*t*t + 2) + b;
};

export const easeInQuart = (t, b, c, d) => c*(t/=d)*t*t*t + b;
export const easeOutQuart = (t, b, c, d) => -c * ((t=t/d-1)*t*t*t - 1) + b;
export const easeInOutQuart = (t, b, c, d) => {
  if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
  return -c/2 * ((t-=2)*t*t*t - 2) + b;
};

export const easeInQuint = (t, b, c, d) => c*(t/=d)*t*t*t*t + b;
export const easeOutQuint = (t, b, c, d) => c*((t=t/d-1)*t*t*t*t + 1) + b;
export const easeInOutQuint = (t, b = 0, c = 1, d = 1) => {
  if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
  return c/2*((t-=2)*t*t*t*t + 2) + b;
};

export const easeInSine = (t, b, c, d) => -c * Math.cos(t/d * (Math.PI/2)) + c + b;
export const easeOutSine = (t, b, c, d) => c * Math.sin(t/d * (Math.PI/2)) + b;
export const easeInOutSine = (t, b, c, d) => -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;

export const easeInExpo = (t, b, c, d) => (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
export const easeOutExpo = (t, b, c, d) => (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
export const easeInOutExpo = (t, b, c, d) => {
  if (t==0) return b;
  if (t==d) return b+c;
  if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
  return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
};

export const easeInCirc = (t, b, c, d) => -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
export const easeOutCirc = (t, b, c, d) => c * Math.sqrt(1 - (t=t/d-1)*t) + b;
export const easeInOutCirc = (t, b, c, d) => {
  if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
  return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
};

export default {
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
};
