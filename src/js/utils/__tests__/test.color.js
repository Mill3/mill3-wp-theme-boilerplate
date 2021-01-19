/* eslint-disable no-undef */
import { rgb2hex } from "../color";

test('Test RGB to HEX color transformation', () => {
  const colorRGB = 'rgb(255,255,255)';
  const colorHEX = '#ffffff';
  expect(rgb2hex(colorRGB)).toEqual(colorHEX);
});
