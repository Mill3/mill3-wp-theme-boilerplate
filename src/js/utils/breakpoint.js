/*

──────────────────────────────────────────
──────────────────────────────────────────
BREAKPOINT
──────────────────────────────────────────
──────────────────────────────────────────

const bp = Breakpoint(['(min-width: 768px)'], callback);

bp.on();  // start listening to media query's match
bp.off(); // stop listening to media query's match
bp.run(); // execute object callback

function resize(event) {
  // do something
}

*/

const Breakpoint = (mediaQueries, cb) => {
  // PRIVATE API
  const getThrottle = (e) => {
    event = e;

    if (!tick) {
      requestAnimationFrame(_run);
      tick = true;
    }
  };

  let listeners = mediaQueries.map((query) => window.matchMedia(query)),
    tick = false,
    event;

  // PUBLIC API
  const _on = () => {
    listeners.forEach((mql) => mql.addListener(getThrottle));
  };
  const _off = () => {
    listeners.forEach((mql) => mql.removeListener(getThrottle));
  };
  const _run = () => {
    cb(event);
    tick = false;
  };
  const _dispose = () => {
    tick = true;
    event = null;
    listeners = null;
  };

  const ctx = {
    dispose: _dispose,
    on: _on,
    off: _off,
    run: _run
  };

  return ctx;
};

export default Breakpoint;
