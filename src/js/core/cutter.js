import { $, $$, getBody } from "@utils/dom";

/**
 * Calculate line index of each words in element.
 * Also, add total numbers of words and lines on the same element.
 * 
 * @param {Element} el : DOM Element to perform calculations.
 */
const words = (el) => {
  let rows = {};
  const words = [ ...$$('.word', el) ];

  // save every word's offsetTop
  words.forEach(word => {
    const val = Math.round(word.offsetTop);
    (rows[val] || (rows[val] = [])).push(word);
  });

  // order rows by values and add --line-index to each words
  const lines = Object.keys(rows);
        lines
          .map(Number)
          .sort(( a, b ) => a - b)
          .forEach((row, index) => {
            rows[row].forEach(word => word.style.setProperty('--line-index', index));
          });

  // add words and lines total to element
  el.style.setProperty('--word-total', words.length);
  el.style.setProperty('--line-total', lines.length);

  let target = el.dataset.cutterTarget;
  if( !target ) return;

  // try to find target element
  target = $(target);
  if( !target ) return;

  // pass total vars to target element
  let prefix = el.dataset.cutterTargetPrefix;

  if( prefix ) prefix = `${prefix}-`;
  else prefix = '';

  target.style.setProperty(`--${prefix}word-total`, words.length);
  target.style.setProperty(`--${prefix}line-total`, lines.length);
};

const chars = (el) => {
  const chars = [ ...$$('.char', el) ];
  el.style.setProperty('--char-total', chars.length);

  let target = el.dataset.cutterTarget;
  if( !target ) return;

  target = $(target);
  if( !target ) return;

  // pass total vars to target element
  let prefix = el.dataset.cutterTargetPrefix;

  if( prefix ) prefix = `${prefix}-`;
  else prefix = '';

  target.style.setProperty(`--${prefix}char-total`, chars.length);
};

export default (el) => {
  if( !el ) el = getBody();

  [ ...$$('[data-cutter]', el) ].forEach(el => {
    switch( el.dataset.cutter ) {
      case "chars": chars(el); break;
      case "words":
      case "wordsMask":
      default: words(el);
    }
  });
}
