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
    height: h,
  };
};

export const hypothenuse = (x1, y1, x2, y2) => {
  return Math.hypot(Math.abs(x2 - x1), Math.abs(y2 - y1));
};

/**
 * lerp(start, end, multiplier);
 * lerp(0, 100, 0.12);
 */
export const lerp = (s, e, m) => s * (1 - m) + e * m;

/**
 * Limit value between minimum and maximum
 * limit(-1, 1, -0.35);
 */
export const limit = (min, max, value) => Math.max(min, Math.min(max, value));

export default {
  cover,
  hypothenuse,
  lerp,
  limit,
};
