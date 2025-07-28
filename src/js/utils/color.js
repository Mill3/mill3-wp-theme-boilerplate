// https://stackoverflow.com/a/1740716/519240
export const HEX_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

// get hexacimal digits from [0, 255]
const hex = (x) => (isNaN(x) ? "00" : HEX_DIGITS[(x - (x % 16)) / 16] + HEX_DIGITS[x % 16]);


// convert rgb color to hex format
export const rgb2hex = (rgb) => {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
};

// convert hex color to rgba format
export const hex2rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return { r, g, b };
}

// convert hex color to GLSL format
export const hex2glsl = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  return [ r, g, b ];
}


export default {
  rgb2hex,
  hex2rgb,
  hex2glsl
};
