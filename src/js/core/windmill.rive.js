/**
* @core/windmill.rive
* <br><br>
* ## Windmill Rive Integration.
*
* Preload Rive WASM runtime before everything else.
*
* @module windmill
* @preferred
*/

import { RuntimeLoader } from "@rive-app/canvas-lite";
//import { RuntimeLoader } from "@rive-app/webgl2";

import { getRiveWASMLink } from "@utils/rive";

export class WindmillRive {  
  /**
   * Plugin installation.
   */
  install(windmill) {
    windmill.on('init', this._onInit, this);
  }

  _onInit() {
    // this force Rive to use the rive.wasm resource URL injected in <head> with rive.php file
    const wasmURL = getRiveWASMLink();
    if( wasmURL ) RuntimeLoader.setWasmUrl( wasmURL );

    return new Promise(resolve => {
      RuntimeLoader.getInstance(resolve);
    });
  }  
}

export default WindmillRive;
