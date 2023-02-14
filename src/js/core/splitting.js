import Splitting from "splitting";

import { $$, body } from "@utils/dom";


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


export default (el = body) => {
  [ ...$$('[data-splitting]') ].forEach(el => {
    const splittingMethod = el.dataset.splitting || "wordsMask";

    Splitting({
      target: el,
      by: splittingMethod
    });
  });
}
