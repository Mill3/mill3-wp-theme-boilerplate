/*
 * Run a call at each ms through requestAnimationFrame
 * @param {Function} fn - Function to call on each run
 * @param {Number} delay - The number of milliseconds between calls
 * @returns {Function} function to stop interval
 */
export const requestInterval = (fn, delay) => {
  let start = new Date().getTime();
  let ended = false;
  let tick;

  function loop() {
    if (ended === true) return;

    tick = requestAnimationFrame(loop);

    const current = new Date().getTime();
    const delta = current - start;

    if (delta >= delay) {
      fn.call();
      start = new Date().getTime();
    }
  }

  function destroy() {
    if (tick) cancelAnimationFrame(tick);

    tick = null;
    ended = true;
  }

  tick = requestAnimationFrame(loop);
  return destroy;
};

export default {
  requestInterval
};
