// css "translate" property computed value : "none" | "10px" | "10px 20px" | "10px 20px 30px"
// (percentages are kept as-is by browsers, only px values can be converted)
const parseTranslateProperty = value => {
  const [x, y] = value && value !== 'none' ? value.split(' ') : [];

  return {
    x: x && !x.endsWith('%') ? parseFloat(x) || 0 : 0,
    y: y && !y.endsWith('%') ? parseFloat(y) || 0 : 0
  };
}

// get element's current translation in px, from css "transform" (matrix or matrix3d) and css "translate" property
// (combined, the same way browsers does it). Running css animations are included.
export function getTranslate(el) {
  const translate = {}
  if(!window.getComputedStyle) return;

  const style = getComputedStyle(el);
  const transform = style.transform || style.webkitTransform || style.mozTransform;

  let mat = transform.match(/^matrix3d\((.+)\)$/);
  if (mat) {
      translate.x = mat ? parseFloat(mat[1].split(', ')[12]) : 0;
      translate.y = mat ? parseFloat(mat[1].split(', ')[13]) : 0;
  } else{
      mat = transform.match(/^matrix\((.+)\)$/);
      translate.x = mat ? parseFloat(mat[1].split(', ')[4]) : 0;
      translate.y = mat ? parseFloat(mat[1].split(', ')[5]) : 0;
  }

  // css "translate" is applied before "transform" and adds up to it
  const prop = parseTranslateProperty(style.translate);
  translate.x += prop.x;
  translate.y += prop.y;

  return translate;
}

export default {
  getTranslate
};
