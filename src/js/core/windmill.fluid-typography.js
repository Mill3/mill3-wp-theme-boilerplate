/**
* @core/windmill.fluid-typography
* <br><br>
* ## Fluid typography using SVG.
*
* - resize fluid typography SVG width/viewbox
*
* @module windmill
* @preferred
*/

import { $, $$, rect } from "@utils/dom";

const SELECTOR = 'svg[data-fluid-typography]';

export class WindmillFluidTypography {

  /**
   * Plugin installation.
   */
  install(windmill) {
    windmill.on('init', this._resizeSVG, this);
    windmill.on('added', this._resizeSVG, this);
  }

  // resize dynamic font-size SVG width/viewbox
  _resizeSVG(data) {
    // query all fluid typography elements
  [ ...$$(SELECTOR, data.next.container || data.current.container) ].forEach(svg => {
    // if svg doesn't have text, stop here
    const text = $('text', svg);
    if( !text ) return;

    // get text width & SVG viewbox
    const width = Math.ceil(rect(text).width);
    const viewbox = svg.getAttribute('viewBox').split(' ');

    // update SVG width + viewbox
    // remove dynamic-font-size attribute to make sure SVG isn't recomputed a second time
    svg.setAttribute('width', width);
    svg.setAttribute('viewBox', `${viewbox[0]} ${viewbox[1]} ${width} ${viewbox[3]}`);
    svg.removeAttribute('data-fluid-typography');
  });
  }
}

export default WindmillFluidTypography;
