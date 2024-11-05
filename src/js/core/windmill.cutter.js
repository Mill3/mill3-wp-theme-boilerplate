/**
* @core/windmill.cutter
* <br><br>
* ## Windmill Cutter.
*
* - Perform calculation like Splitting.js from <span> previously created by Twig's Splitting filter.
*
* @module windmill
* @preferred
*/

import cutter from "@core/cutter";

export class WindmillCutter {  
  /**
   * Plugin installation.
   */
  install(windmill) {
    // run Cutter after images are loaded & before enter transition
    windmill.on('loaded', this._onLoad, this);
    windmill.on('entering', this._onEntering, this);
  }

  _onLoad() { cutter(); }
  _onEntering({ next }) { cutter(next.container); }
}

export default WindmillCutter;
