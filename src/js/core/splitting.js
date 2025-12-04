import Splitting from "splitting";

import { $, $$, getBody } from "@utils/dom";


const splitByWordsForMaskAnimation = (el, options, ctx) => {
  const { words } = ctx;
  words.forEach(word => word.innerHTML = `<span class="wordText">${word.innerHTML}</span>`);

  return [];
};

// split by words and wrap each word content into another span to perform masking animation
Splitting.add({
  by: 'wordsMask',
  key: 'wordsMask',
  depends: ['words'],
  split: splitByWordsForMaskAnimation,
});


export default (el) => {
  if( !el ) el = getBody();

  [ ...$$('[data-splitting]', el) ].forEach(text => {
    const splittingMethod = text.dataset.splitting || "wordsMask";

    Splitting({ target: text, by: splittingMethod }).forEach(obj => {
      // check if [data-splitting-target] attribute exists on element
      let target = obj.el.getAttribute('data-splitting-target');
      if( !target ) return;

      // try to find target element
      target = $(target, el);
      if( !target ) return;

      // loop through each object keys (except "el") and copy key's length to target element in CSS variables
      Object.keys(obj).filter(key => key !== 'el').forEach(key => target.style.setProperty(`--${key}-total`, obj[key].length));
    });
  });
}
