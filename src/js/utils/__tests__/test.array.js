/* eslint-disable no-undef */
import { shuffle } from "../array";

test('Test shuffle array', () => {
  const array = [1,2,3,4,5,6,7,8,9,10];
  const suffled = shuffle(array);
  expect(suffled).not.toEqual(array);
});
