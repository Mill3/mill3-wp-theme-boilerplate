/**
 * 
 * @param {Integer} width Destination's width
 * @param {Integer} height Destination's height
 * @param {Float} ratio Source image's aspect ratio
 * @returns {Object}
 */
export const cover = (width, height, ratio) => {
  let w = width;
  let h = w / ratio;

  if (h < height) {
    h = height;
    w = h * ratio;
  }

  return {
    x: (width - w) * 0.5,
    y: (height - h) * 0.5,
    width: w,
    height: h
  };
};

/**
 * 
 * @param {Integer} width Destination's width
 * @param {Integer} height Destination's height
 * @param {Float} ratio Source image's aspect ratio
 * @returns {Object}
 */
export const contain = (width, height, ratio) => {
  let w = width;
  let h = w / ratio;

  if (h > height) {
    h = height;
    w = h * ratio;
  }

  return {
    x: (width - w) * 0.5,
    y: (height - h) * 0.5,
    width: w,
    height: h
  };
};

/**
 * Calculate hypothenuse of a triangle
 */
export const hypothenuse = (x1, y1, x2, y2) => Math.hypot(Math.abs(x2 - x1), Math.abs(y2 - y1));

/**
 * Calculate length of c in a triangle using Pythagore formula
 * pythagore(300, 200);
 */
export const pythagore = (a, b) => Math.sqrt(a * a + b * b);

/**
 * degreeToRad(degree);
 * Example :
 * degreeToRad(45) returns 0.7853981633974483;
 */
export const degreeToRad = d => d * (Math.PI/180);

/**
 * radToDegree(radian);
 * Example :
 * radToDegree(0.7853981633974483) returns 45;
 */
export const radToDegree = radians => radians * 180 / Math.PI;


/**
 * lerp(start, end, multiplier);
 * lerp(0, 100, 0.12);
 */
export const lerp = (s, e, m) => s * (1 - m) + e * m;


/**
 * Frame Rate independant lerp
 * 
 * lerp2(start, end, multiplier, delta, fps);
 * lerp2(0, 100, 0.12, 1 / 60, 60);
 */
export const lerp2 = (s, e, m, delta, fps = 60) => {
  if( delta === undefined ) return lerp(s, e, m);

  const relativeDelta = delta / (1 / fps);
  const smoothing = 1 - m;

  return lerp(s, e, 1 - Math.pow(smoothing, relativeDelta));
};

/**
 * Limit value between minimum and maximum
 * limit(-1, 1, -0.35);
 */
export const limit = (min, max, value) => Math.max(min, Math.min(max, value));


// Map number x from range [a, b] to [c, d]
export const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;


export default {
  cover,
  contain,
  hypothenuse,
  pythagore,
  degreeToRad,
  radToDegree,
  lerp,
  lerp2,
  limit,
  map
};
