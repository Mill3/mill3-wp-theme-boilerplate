/* eslint-disable object-shorthand */
/* eslint-disable no-undef */
import domready from "domready";

import { body } from '@utils/dom';
import { limit } from '@utils/math';
import { on, once } from '@utils/listener';
import ResizeOrientation from '@utils/resize';

domready(() => {
  const parent = window.parent;
  const resize = () => {
    const max = Math.ceil(parent.innerHeight * 0.45 >> 0);
    window.frameElement.height = limit(25, max, body.scrollHeight);
  };

  const ro = ResizeOrientation(resize);
        ro.run();
        ro.on();

  once(window, 'load', resize);
  parent.addEventListener('resize', resize, false);
});
