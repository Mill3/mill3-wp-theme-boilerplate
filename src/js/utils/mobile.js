export const mobile =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);


export const touch_device = window.matchMedia ? window.matchMedia('(hover: none)').matches : false;
export const hover_device = window.matchMedia ? window.matchMedia('(hover: hover)').matches : true;
export const motion_reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
export const motion_no_pref = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: no-preference)').matches : true;
export const contrast_high = window.matchMedia ? window.matchMedia('(prefers-contrast: more)').matches : false;
export const contrast_no_pref = window.matchMedia ? window.matchMedia('not (prefers-contrast: more)').matches : true;

export default {
  mobile,
  touch_device,
  hover_device,
  motion_reduced,
  motion_no_pref,
  contrast_high,
  contrast_no_pref,
};
