/*

──────────────────────────────────────────
──────────────────────────────────────────
TAB
──────────────────────────────────────────
──────────────────────────────────────────

const tab = new Tab(tabVisibilityChange);
      tab.on();   // start listening to tab visibility change
      tab.off();  // stop listening to tab visibility change
      tab.run();  // execute object callback

function tabVisibilityChange(hidden) {
  if( hidden === true ) {
    // do something
  } else {
    // do something
  }
}
*/
import { on, off } from "./listener";

const Tab = (cb) => {
  // PUBLIC API
  const _on = () => {
    on(document, "visibilitychange", _run);
  };
  const _off = () => {
    off(document, "visibilitychange", _run);
  };
  const _run = () => {
    cb(document.hidden);
  };

  const ctx = {
    on: _on,
    off: _off,
    run: _run,
  };

  return ctx;
};

export default Tab;
