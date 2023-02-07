// build.js
const sass = require("sass");
const chalk = require("chalk");
const fs = require("fs");
const path = require(`path`);

const SRC_PATH = path.join(__dirname);
const TESTS_PATH = path.join(__dirname, `./tests`);
const DIST_PATH = path.join(__dirname, `./dist`);
const INPUT_FILENAME = `index.scss`;
const OUTPUT_FILENAME = `build.css`;

const PATHS = {
  main: path.resolve(SRC_PATH, INPUT_FILENAME),
  test: path.resolve(TESTS_PATH, `index.scss`),
  dist: path.resolve(DIST_PATH, OUTPUT_FILENAME)
};


// Read test SCSS file
fs.readFile(PATHS[`test`], (err, data) => {
  if (err) {
    console.error("err:", err);
    return;
  }

  const result = sass.compileString(data.toString(),
    {
      style: 'compressed',
      loadPaths: [TESTS_PATH]
    }
  );

  // output test rests
  console.log(result.css.toString());

  console.log(
    `${chalk.hex('#DEADED').bold("\n\END TESTS OUTPUT. Please note : this do *not* represent the full extend output of this lib, its only testing mixins and functions.\n\n")}`
  );
});

// Read main SCSS content
fs.readFile(PATHS[`main`], (err, data) => {
  if (err) {
    console.error("err:", err);
    return;
  }

  // get file source as string
  const source = data.toString();

  sass.render(
    {
      // concat parsed JSON theme variables with SCSS raw string source
      data: source,
      outFile: PATHS[`dist`],
      outputStyle: `compressed`,
      includePaths: [SRC_PATH]
    },
    function(err, result) {
      if (!err) {
        fs.writeFile(PATHS[`dist`], result.css, function(fsErr) {
          if (!fsErr) {
            const stats = fs.statSync(PATHS[`dist`]);
            const size = stats.size / 1024;
            const kb = Math.round((size + Number.EPSILON) * 100) / 100;

            console.log(
              `${chalk.green("SUCCESS!")} ${OUTPUT_FILENAME} file generated! ${chalk.yellow(`${kb}kb`)}`
            );
          }
          else
            console.log(
              `${chalk.red(
                "ERROR!"
              )} During ${OUTPUT_FILENAME} file generation: ${err}`
            );
        });
      } else {
        console.log(
          `${chalk.red(
            "ERROR!"
          )} During ${OUTPUT_FILENAME} file generation: ${err}`
        );
      }
    }
  );
});
