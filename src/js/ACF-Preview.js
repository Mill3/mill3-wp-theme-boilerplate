/* eslint-disable object-shorthand */
/* eslint-disable no-undef */

// ViteJS glob import all Modules and UIs
const module_chunks = import.meta.glob('./modules/**/index.js');
const ui_chunks = import.meta.glob('./ui/**/index.js');


import domready from "domready";

import windmill from "@core/windmill";
// import WindmillFluidTypography from "@core/windmill.fluid-typography";
import WindmillChunks from "@core/windmill.chunks";

import ACF from '@utils/acf';
import { body } from '@utils/dom';
import { limit } from '@utils/math';
import { once } from '@utils/listener';
import ResizeOrientation from '@utils/resize';

domready(() => {
  const parent = window.parent;
  const resize = () => {
    const max = Math.ceil(parent.innerHeight * 2 >> 0);
    window.frameElement.height = limit(25, max, body.scrollHeight);
  };

  resize();

  ACF.is_preview = true;

  ResizeOrientation.add(resize);
  once(window, 'load', resize);
  parent.addEventListener('resize', resize, false);
  windmill.on('done', resize);

  //windmill.use( new WindmillFluidTypography() );
  windmill.use( new WindmillChunks(null, {...module_chunks, ...ui_chunks}) );
  windmill.init();

  // import main styles in dev mode only then resize
  if (process.env.NODE_ENV === "development") {
    import("../scss/ACF-preview.scss").then(() => {
      resize();
    });
  }

});
