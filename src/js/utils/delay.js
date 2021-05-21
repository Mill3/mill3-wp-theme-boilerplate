/*

──────────────────────────────────────────
──────────────────────────────────────────
DELAY
──────────────────────────────────────────
──────────────────────────────────────────

const delay = new Delay(function(){
  // do something
}, 3500);

delay.start();
delay.stop();
delay.reset();

*/

const Delay = (cb, duration) => {
    let raf, startTime;

    // PRIVATE API
    const loop = ( now ) => {
      if( !startTime ) startTime = now;
      const progress = duration > 0 ? Math.min((now - startTime) / duration, 1) : 1;

      if( progress + 0.0000001 < 1 ) raf = requestAnimationFrame( loop );
      else if( cb ) cb();
    };



    // PUBLIC API
    const start = () => {
      if( raf ) stop();
      raf = requestAnimationFrame( loop );
    };
    const stop = () => {
      if( raf ) cancelAnimationFrame( raf );
      raf = null;
    };
    const reset = () => {
      startTime = null;
    };
    const dispose = () => {
      stop();
      
      raf = null;
      startTime = null;
    };


    const ctx = {
      dispose,
      start,
      stop,
      reset
    };

    return ctx;
}

export default Delay;
