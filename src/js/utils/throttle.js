/*

──────────────────────────────────────────
──────────────────────────────────────────
THROTTLE
──────────────────────────────────────────
──────────────────────────────────────────

►►►  firstTime for window resizer

const throttle = new S.Throttle({
    cb: callback,
    delay: 200
    onlyAtEnd: true
})

throttle.init()

*/

const Throttle = (options = { delay: 200, onlyAtEnd: false }) => {
  const { delay, cb, onlyAtEnd } = options;
  let last, timer;

  const init = () => {
    let firstTime = true,
      now = Date.now();

    if ((last && now < last + delay) || firstTime) {
      firstTime = false;
      clearTimeout(timer);

      timer = setTimeout(function() {
        last = now;
        cb();
      }, delay);
    } else {
      last = now;

      if (!onlyAtEnd) {
        firstTime = false;
        cb();
      }
    }
  };
  const dispose = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const ctx = {
    init,
    dispose
  };

  return ctx;
};

export default Throttle;
