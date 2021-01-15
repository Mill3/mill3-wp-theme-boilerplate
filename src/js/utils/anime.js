/**
 * Return a formatted object to use in combination with Anime.js.
 * Your context must have been splitted by Splitting.js using "lines" AND "chars" plugins.
 * See utils/splitting.js for more details about "charsGrid" plugin.
 *
 * How to use:
 * var ctx = Splitting({ target: el, by: "charsGrid" })[0];
 * var params = formatSplittingJSToAnimeJsGrid(ctx);
 *
 * anime({
 *  targets: params.chars,
 *  translateX: [anime.stagger(5, {start: 100, grid: [params.rows, params.columns], from: "first", axis: "x" }), 0],
 *  duration: 1000,
 *  delay: anime.stagger(150, {start: 0, grid: [params.rows, params.columns], from: "first", axis: "y"}),
 *  easing: "easeOutCubic"
 * });
 *
 * @params ctx <object> { lines: <array>, chars: <array> }
 * @return <object> { chars: <array>, rows: <integer>, columns: <integer>}
 */
export const formatSplittingJSToAnimeJsGrid = (ctx) => {
  const numLines = ctx.lines.length;
  const linesLength = new Array(numLines).fill(0);

  // count chars per line
  ctx.lines.forEach((line, index) => {
    line.forEach((word) => (linesLength[index] += word.children.length));
  });

  // get length of longest line
  const longestLine = Math.max(...linesLength);

  // create a empty grid
  const grid = Array.from(ctx.chars);

  // add empty elements to equalize all lines
  for (let i = 0; i < numLines - 1; i++) {
    const length = linesLength[i];
    const spaces = longestLine - length;

    if (spaces > 0) {
      const fill = new Array(spaces).fill(null).map(() => {
        return {};
      });
      grid.splice(i * longestLine + length, 0, ...fill);
    }
  }

  return {
    chars: grid,
    rows: longestLine,
    columns: numLines,
  };
};
