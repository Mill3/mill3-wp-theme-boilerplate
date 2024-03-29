/* eslint-disable no-undef */
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const ejs = require("ejs");
const argv = require("yargs-parser")(process.argv.slice(2));

/**
 * MILL3 - Theme modules CLI utils for JS and CSS
 *
 * argument source : [js/scss]
 * argument type : [modules/ui/page-builder]
 * argument name : MyFooBarModule
 *
 * Examples :
 *
 * node cli.js js modules MySuperModule
 * node cli.js js ui MySuperModule
 * node cli.js js components MySuperModule
 * node cli.js scss modules MySuperModule --dest ./src/custom-path
 *
 */

const ALLOWED_SOURCES = ["js", "scss", "templates"];
const ALLOWED_TYPES = ["modules", "ui", "components", "page-builder"];

const cli = () => {
  //
  // print a quick usage banner
  //
  console.log(chalk.blueBright("---"));
  console.log(chalk.blueBright("MILL3 - Theme modules CLI utils for JS and CSS\n"));
  console.log(chalk.blueBright("Usage :\n\tnpm run modules-cli source type ModuleNamePascalCased"));
  console.log(
    chalk.blueBright("\tnpm run modules-cli source type ModuleNamePascalCased -- --dist ./src/custom-path  \n")
  );
  console.log(chalk.blueBright(`\t- Sources available : [${ALLOWED_SOURCES.join("/")}]`));
  console.log(chalk.blueBright(`\t- Types available : [${ALLOWED_TYPES.join("/")}]`));
  console.log(chalk.blueBright(`\t- Flag available : --dest ./src/custom-path \n`));
  console.log(chalk.blueBright("----\n"));

  try {
    const { _: commands, dest } = argv;

    // get source from commands
    const source = commands[0];
    const type = commands[1];
    const name = commands[2];

    //
    // First, validate argv, will stop here if fail
    //

    validateArgv(source, type, name);


    //
    // moving on...
    //

    // create slug for module name
    const module_slug = PascalCaseToSlug(name);

    // default src_path base
    let src_path = path.resolve(__dirname);

    // determine base destination base on source value
    switch (source) {
      case 'js':
        src_path = path.resolve(src_path, "../src");
        break;
      case 'scss':
        src_path = path.resolve(src_path, "../src");
        break;
      case 'templates':
        src_path = path.resolve(src_path, "../");
        break;
      default:
        src_path = null;
        break;
    }

    // create base path for source destination : ../src/[js/scss]
    // the value can be overided with --dest ./my-path option
    let destination_base = dest ? path.resolve(dest) : path.join(src_path, source, type);

    // in JS source, we store each module in its own directory : ../src/js/[module/ui]/[module_slug]/MySuperModule.js
    if (source == "js") {
      switch (type) {
        case "modules":
          createJSModule(destination_base, type, name, module_slug);
          break;
        case "ui":
          createJSUi(destination_base, type, name, module_slug);
          break;
        case "components":
          createJSComponent(destination_base, type, name, module_slug);
          break;
        case "page-builder":
          console.warn(chalk.yellowBright(`Not implemented : 'page-builder' type is not available for JS files`));
          break;
        default:
      }
    }

    // in SCSS source, we store each module at the root of its type : ../src/js/[module/ui/page-builder]/[module_slug].scss
    if (source == "templates") {
      switch (type) {
        case "modules":
          console.warn(chalk.yellowBright(`Not implemented : 'modules' type is not available for Twig files`));
          break;
        case "ui":
          console.warn(chalk.yellowBright(`Not implemented : 'ui' type is not available for Twig files`));
          break;
        case "components":
          console.warn(chalk.yellowBright(`Not implemented : 'components' type is not available for Twig files`));
          break;
        case "page-builder":
          // console.log(destination_base, name, module_slug);
          createTwig(destination_base, name, module_slug);
          break;
        default:
      }
    }

    // in SCSS source, we store each module at the root of its type : ../src/js/[module/ui/page-builder]/[module_slug].scss
    if (source == "scss") {
      switch (type) {
        case "modules":
          createSCSS(destination_base, name, module_slug);
          break;
        case "ui":
          createSCSS(destination_base, name, module_slug);
          break;
        case "components":
          console.warn(chalk.yellowBright(`Not implemented : 'components' type is not available for SCSS files`));
          break;
        case "page-builder":
          createSCSS(destination_base, name, module_slug);
          break;
        default:
      }
    }

    // exit process
    process.exit(1);
  } catch (err) {
    console.error(err);
  }
};

/**
 *
 * creates a JS module (index.js, factory, MyModule.js)
 *
 * @param {string} destination_base
 * @param {string} type
 * @param {string} name
 * @param {string} module_slug
 */

const createJSModule = (destination_base, type, name, module_slug) => {
  const template_index = path.join(__dirname, "sources/js", type, `index.ejs`);

  const data = {
    ModuleName: name,
    module_slug: module_slug
  };

  ejs.renderFile(template_index, data, {}, function (err, str) {
    if (err) {
      console.error(err);
    }
    const outputFile = path.join(destination_base, module_slug, `index.js`);

    // check if file exist or exit
    checkOverwrite(outputFile);

    // write file
    writeFile(outputFile, str);
  });

};

/**
 *
 * creates a JS ui class (index.js, MyModule.js)
 *
 * @param {string} destination_base
 * @param {string} type
 * @param {string} name
 * @param {string} module_slug
 */

const createJSUi = (destination_base, type, name, module_slug) => {
  const template_index = path.join(__dirname, "sources/js", type, `index.ejs`);

  const data = {
    ModuleName: name,
    module_slug: module_slug
  };

  ejs.renderFile(template_index, data, {}, function (err, str) {
    if (err) {
      console.error(err);
    }
    const outputFile = path.join(destination_base, module_slug, `index.js`);

    // check if file exist or exit
    checkOverwrite(outputFile);

    // write file
    writeFile(outputFile, str);
  });
};

/**
 *
 * creates a JS components class (index.js, MyModule.js)
 *
 * @param {string} destination_base
 * @param {string} type
 * @param {string} name
 * @param {string} module_slug
 */

const createJSComponent = (destination_base, type, name, module_slug) => {
  const template_component = path.join(__dirname, "sources/js", type, `ComponentTemplate.ejs`);

  const data = {
    ModuleName: name,
    module_slug: module_slug
  };

  ejs.renderFile(template_component, data, {}, function (err, str) {
    if (err) {
      console.error(err);
    }
    const outputFile = path.join(destination_base, `${name}.js`);

    // check if file exist or exit
    checkOverwrite(outputFile);

    // write file
    writeFile(outputFile, str);
  });
};

/**
 *
 * Create a SASS base module
 *
 * @param {string} destination_base
 * @param {string} name
 * @param {string} module_slug
 */

const createSCSS = (destination_base, name, module_slug) => {
  const template = path.join(__dirname, "sources/scss", `style-template.ejs`);

  const data = {
    ModuleName: name,
    module_slug: module_slug
  };

  ejs.renderFile(template, data, {}, function (err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err);
    }
    const outputFile = path.join(destination_base, `_${module_slug}.scss`);

    // check if file exist or exit
    checkOverwrite(outputFile);

    // write file
    writeFile(outputFile, str);
  });
};



/**
 *
 * Create a Twig base file
 *
 * @param {string} destination_base
 * @param {string} name
 * @param {string} module_slug
 */

 const createTwig = (destination_base, name, module_slug) => {
  const template = path.join(__dirname, "sources/twig", `pb-row.ejs`);

  const data = {
    ModuleName: name,
    module_slug: module_slug
  };

  // we name or twig using hyphen - for seperating words
  const filename_base = PascalCaseToSlug(name, "-");

  ejs.renderFile(template, data, {}, function (err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err);
    }
    const outputFile = path.join(destination_base, `${filename_base}.twig`);

    // check if file exist or exit
    checkOverwrite(outputFile);

    // write file
    writeFile(outputFile, str);
  });
};

/**
 * Write file and log message
 */
const writeFile = (outputFile, str) => {
  fs.ensureFileSync(outputFile);
  fs.outputFileSync(outputFile, str);
  console.log(chalk.greenBright(`File ${outputFile} created!`));
};

/**
 * Check if file exist, exit process when
 */
const checkOverwrite = (outputFile) => {
  if (fs.existsSync(outputFile)) {
    console.log(chalk.redBright(`outputFile ${outputFile} already exists, exiting now..`));
    process.exit(1);
  }
};

/**
 * validate cli commandline argv
 */

const validateArgv = (source, type, name) => {
  const allowedSourcesMessage = ALLOWED_SOURCES.join("/");
  const allowedTypeMessage = ALLOWED_TYPES.join("/");

  // check if has source argument
  if (!source) {
    console.error(chalk.redBright(`'source' argument is required : cli [${allowedSourcesMessage}]`));
    process.exit(1);
  }

  // check if source value is allowed
  if (!ALLOWED_SOURCES.some((s) => s === source)) {
    console.error(
      chalk.redBright(`'source' value '${source}' as an argument is invalid : cli [${allowedSourcesMessage}]`)
    );
    process.exit(1);
  }

  // check if has source & type
  if (!source || !type) {
    console.error(
      chalk.redBright(
        `'source' and 'type' arguments are required : cli [${allowedSourcesMessage}] [${allowedTypeMessage}]`
      )
    );
    process.exit(1);
  }

  // check if source type is allowed
  if (!ALLOWED_TYPES.some((s) => s === type)) {
    console.error(chalk.redBright(`'type' value '${type}' as an argument is invalid : cli [${allowedTypeMessage}]`));
    process.exit(1);
  }

  // check if name arg is defined
  if (!name) {
    console.error(
      chalk.redBright(
        `'name' argument is required : cli [${allowedSourcesMessage}] [${allowedTypeMessage}] MyFooBarModule`
      )
    );
    console.error(chalk.redBright("Important : you must name your module in `PascalCase` style."));
    process.exit(1);
  }
};

/**
 *
 * Transform a `PascalCase` string to `slug-type`
 *
 * @param {*} s string
 * @returns string
 */
const PascalCaseToSlug = (s, sep = "-") => {
  return s.trim().replace(/[A-Z]/g, (match, offset) => (offset > 0 ? sep : "") + match.toLowerCase());
};

cli();
