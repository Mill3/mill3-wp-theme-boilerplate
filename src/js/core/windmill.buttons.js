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
import Splitting from "splitting";

import "@core/splitting";
import { $$, getBody } from "@utils/dom";
import { on, off } from "@utils/listener";
import { hover_device, motion_reduced } from "@utils/mobile";

export class WindmillButtons {
  constructor() {
    this._btns = [];
  }

  /**
   * Plugin installation.
   */
  install(windmill) {
    if( !hover_device || motion_reduced ) return;

    windmill.on('loaded', this._onLoad, this);
    windmill.on('entering', this._onEntering, this);
  }

  _onLoad() {
    this._splitCTA(getBody());
  }
  _onEntering({ next }) {
    this._splitCTA(next.container);
  }

  _splitCTA(wrapper) {
    [ ...$$('.btn.--cta:not(.pointer-events-none) .btn__label', wrapper) ].forEach(btn_label => {
      Splitting({ target: btn_label, by: "wordsMask" });
    });
  }
}

export default WindmillButtons;
