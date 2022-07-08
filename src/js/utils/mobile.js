// copied from locomotive-scroll to detect if device is mobile
export const mobile =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);


export const touch_device = window.matchMedia('(hover: none)').matches;

export default {
  mobile,
  touch_device
};
