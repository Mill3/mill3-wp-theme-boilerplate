/* eslint-disable object-shorthand */
/* eslint-disable no-undef */
import domready from "domready";

import windmill from "@core/windmill";
import WindmillFluidTypography from "@core/windmill.fluid-typography";
import WindmillWebpackChunks from "@core/windmill.webpack-chunks";

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
  windmill.use( new WindmillWebpackChunks() );
  windmill.init();

});
