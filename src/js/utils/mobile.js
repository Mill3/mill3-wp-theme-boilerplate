export const mobile =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);


export const touch_device = window.matchMedia ? window.matchMedia('(hover: none)').matches : false;
export const hover_device = window.matchMedia ? window.matchMedia('(hover: hover)').matches : true;

export default {
  mobile,
  touch_device,
  hover_device
};
