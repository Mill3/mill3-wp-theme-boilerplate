/**
* @core/windmill.splitting
* <br><br>
* ## Windmill Splitting.
*
* - Perform Splitting.js
*
* @module windmill
* @preferred
*/

import splitting from "@core/splitting";

export class WindmillSplitting {  
  /**
  * Plugin installation.
  */
  install(windmill) {
    // run Splitting.js after images are loaded & before enter transition
    windmill.on('loaded', this._onLoad, this);
    windmill.on('entering', this._onEntering, this);
  }

  _onLoad() { splitting(); }
  _onEntering({ next }) { splitting(next.container); }
}

export default WindmillSplitting;
