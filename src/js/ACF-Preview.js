/* eslint-disable object-shorthand */
/* eslint-disable no-undef */
import domready from "domready";

import windmill from "@core/windmill";
import WindmillScripts from "@core/windmill.scripts";
import WindmillWebpackChunks from "@core/windmill.webpack-chunks";

import { body } from '@utils/dom';
import { limit } from '@utils/math';
import { once } from '@utils/listener';
import ResizeOrientation from '@utils/resize';

domready(() => {
  const parent = window.parent;
  const resize = () => {
    const max = Math.ceil(parent.innerHeight * 2 >> 0);
    window.frameElement.height = limit(25, max, body.scrollHeight);
    // window.frameElement.height = body.scrollHeight;
  };

  resize();

  ResizeOrientation.add(resize);
  once(window, 'load', resize);
  parent.addEventListener('resize', resize, false);

  windmill.use( new WindmillScripts() );
  windmill.use( new WindmillWebpackChunks() );
  windmill.init();

});
