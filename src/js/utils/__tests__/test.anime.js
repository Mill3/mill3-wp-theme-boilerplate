/* eslint-disable no-undef */
import Splitting from "splitting";
import { formatSplittingJSToAnimeJsGrid } from '../anime'
import '../splitting'

test('Test Splitting text JS grid', () => {
  document.body.innerHTML = `<h1>my super title\non two lines</h1>`
  const el = document.querySelector('h1');
  const ctx = Splitting({ target: el, by: "charsGrid" })[0];
  const grid = formatSplittingJSToAnimeJsGrid(ctx)

  // run tests on formatSplittingJSToAnimeJsGrid object
  expect(grid.chars).toBeDefined();
  expect(grid.chars.length).toBeGreaterThan(0);
  expect(grid.rows).toBeDefined();
  expect(grid.columns).toBeDefined();
});
