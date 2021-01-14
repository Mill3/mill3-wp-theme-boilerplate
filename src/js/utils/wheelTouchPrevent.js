/*

──────────────────────────────────────────
──────────────────────────────────────────
WHEEL & TOUCH PREVENT
──────────────────────────────────────────
──────────────────────────────────────────

WTP.on();   // prevent all touchMove & mouseWheel events on document
WTP.off();  // restore touchMove & mouseWheel events on document

*/
import { on, off } from "./event";

const WTP = () => {
  // PRIVATE API
  const cancel = e => {
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const ctx = {
    on: () => {
      on(document, "mouseWheel", cancel);
      on(document, "touchmove", cancel);
    },
    off: () => {
      off(document, "mouseWheel", cancel);
      off(document, "touchmove", cancel);
    }
  };

  return ctx;
};

const wtp = new WTP();
export default wtp;
