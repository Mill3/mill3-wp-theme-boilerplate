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
 * node cli.js js module MySuperModule
 * node cli.js js ui MySuperModule
 * node cli.js scss module MySuperModule
 *
 */

const ALLOWED_SOURCES = ['js', 'scss'];
const ALLOWED_TYPES = ['modules', 'ui', 'page-builder'];

const cli = () => {
  //
  // print a quick usage banner
  //
  console.log(chalk.blueBright('---'));
  console.log(chalk.blueBright('MILL3 - Theme modules CLI utils for JS and CSS\n'));
  console.log(chalk.blueBright('Usage :\n\tnpm run modules-cli source type ModuleNamePascalCased \n'));
  console.log(chalk.blueBright(`\t- Sources available : [${ALLOWED_SOURCES.join('/')}]`));
  console.log(chalk.blueBright(`\t- Types available : [${ALLOWED_TYPES.join('/')}] \n`));
  console.log(chalk.blueBright('----\n'));

  try {
    const { _: commands } = argv;

    // theme src path which serve as the base destination
    const src_path = path.resolve(__dirname, '../src');

    // get source from commands
    const source = commands[0];
    const type = commands[1];
    const name = commands[2];

    // validate argv
    validateArgv(source, type, name);

    // create slug for module name
    const module_slug = PascalCaseToSlug(name);

    // create base path for source destination : ../src/[js/scss]
    let source_destination = path.join(src_path, source);

    // in JS source, we store each module in its own directory : ../src/js/[module/ui]/[module_slug]/MySuperModule.js
    if (source == 'js') {
      source_destination = path.join(source_destination, type, module_slug);
      switch (type) {
        case 'modules':
          createJSModule(source_destination, type, name, module_slug)
          break;
        case 'ui':
          createJSUi(source_destination, type, name, module_slug)
          break;
        default:

      }
      process.exit(1);
    }

    // in SCSS source, we store each module at the root of its type : ../src/js/[module/ui/page-builder]/[module_slug].scss
    if (source == 'scss') {
      source_destination = path.join(source_destination, type);
      createSCSS(source_destination, type, name, module_slug);
      process.exit(1);
    }


  } catch (err) {
    console.error(err)
  }
}

const createJSModule = (destination, type, name, module_slug) => {
  const template_index = path.join(__dirname, 'sources/js', type, `index.ejs`)
  const template_factory = path.join(__dirname, 'sources/js', type, `factory.ejs`)
  const template_module = path.join(__dirname, 'sources/js', type, `ModuleTemplate.ejs`)

  const data = {
    ModuleName: name,
    module_slug: module_slug
  }

  ejs.renderFile(template_module, data, {}, function(err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err)
    }
    const outputFile = path.join(destination, `${name}.js`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
    console.log(chalk.greenBright(`File ${outputFile} created!`));
  })

  ejs.renderFile(template_factory, data, {}, function(err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err)
    }
    const outputFile = path.join(destination, `factory.js`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
    console.log(chalk.greenBright(`File ${outputFile} created!`));
  })

  ejs.renderFile(template_index, data, {}, function(err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err)
    }
    const outputFile = path.join(destination, `index.js`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
    console.log(chalk.greenBright(`File ${outputFile} created!`));
  })
}

const createJSUi = (destination, type, name, module_slug) => {
  const template_index = path.join(__dirname, 'sources/js', type, `index.ejs`)
  const template_ui = path.join(__dirname, 'sources/js', type, `UiTemplate.ejs`)

  const data = {
    ModuleName: name,
    module_slug: module_slug
  }

  ejs.renderFile(template_index, data, {}, function(err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err)
    }
    const outputFile = path.join(destination, `index.js`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
    console.log(chalk.greenBright(`File ${outputFile} created!`));
  })

  ejs.renderFile(template_ui, data, {}, function(err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err)
    }
    const outputFile = path.join(destination, `${name}.js`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
    console.log(chalk.greenBright(`File ${outputFile} created!`));
  })

}

const createSCSS = (destination, type, name, module_slug) => {
  const template = path.join(__dirname, 'sources/scss', `style.ejs`)

  const data = {
    ModuleName: name,
    module_slug: module_slug
  }

  ejs.renderFile(template, data, {}, function(err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err)
    }
    const outputFile = path.join(destination, `_${module_slug}.scss`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
    console.log(chalk.greenBright(`File ${outputFile} created!`));
  })

}

/**
 * validate cli commandline argv
 */

const validateArgv = (source, type, name) => {

  const allowedSourcesMessage = ALLOWED_SOURCES.join('/');
  const allowedTypeMessage = ALLOWED_SOURCES.join('/');

  // check if has source argument
  if (!source) {
    console.error(chalk.redBright(`'source' argument is required : cli [${allowedSourcesMessage}]`))
    process.exit(1)
  }

  // check if source value is allowed
  if(!ALLOWED_SOURCES.some((s) => s === source)) {
    console.error(chalk.redBright(`'source' value '${source}' as an argument is invalid : cli [${allowedSourcesMessage}]`))
    process.exit(1)
  }

  // check if has source & type
  if (!source || !type) {
    console.error(chalk.redBright(`'source' and 'type' arguments are required : cli [${allowedSourcesMessage}] [${allowedTypeMessage}]`))
    process.exit(1)
  }

  // check if source type is allowed
  if(!ALLOWED_TYPES.some((s) => s === type)) {
    console.error(chalk.redBright(`'type' value '${type}' as an argument is invalid : cli [${allowedTypeMessage}]`))
    process.exit(1)
  }

  // check if name arg is defined
  if(!name) {
    console.error(chalk.redBright(`'name' argument is required : cli [${allowedSourcesMessage}] [${allowedTypeMessage}] MyFooBarModule`))
    console.error(chalk.redBright("Important : you must name your module in `PascalCase` style."))
    process.exit(1)
  }
}

/**
 *
 * Transform a `PascalCase` string to `slug-type`
 *
 * @param {*} s string
 * @returns string
 */
const PascalCaseToSlug = (s) => {
  return s.trim().replace(/[A-Z]/g, (match, offset) => (offset > 0 ? '-' : '') + match.toLowerCase())
}


cli();