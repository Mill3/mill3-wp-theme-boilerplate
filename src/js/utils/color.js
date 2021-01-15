// https://stackoverflow.com/a/1740716/519240
export const HEX_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

// convert rgb color to hex format
export const rgb2hex = (rgb) => {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
};

// get hexacimal digits from [0, 255]
const hex = (x) => (isNaN(x) ? "00" : HEX_DIGITS[(x - (x % 16)) / 16] + HEX_DIGITS[x % 16]);

export default {
  rgb2hex,
};
