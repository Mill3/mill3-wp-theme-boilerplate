import Splitting from "splitting";

import { $$ } from "@utils/dom";


export default () => {
  [ ...$$('[data-splitting]') ].forEach(el => {
    const splittingMethod = el.dataset.splitting || "chars";

    Splitting({
      target: el,
      by: splittingMethod
    });
  });
}
