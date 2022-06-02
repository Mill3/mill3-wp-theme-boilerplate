import NativeScroll from "@scroll/NativeScroll";
import SmoothScroll from "@scroll/SmoothScroll";
import { mobile } from "@utils/mobile";

export const Mill3Scroll = (options) => {
  if( options && options.smooth === true && !mobile ) return new SmoothScroll(options);
  else return new NativeScroll(options);
};

export default Mill3Scroll;
