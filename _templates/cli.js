/* eslint-disable no-undef */
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const ejs = require("ejs");
const argv = require("yargs-parser")(process.argv.slice(2));

/**
 * MILL3 - Theme CLI utils for JS and CSS modules
 *
 * argument source : [js/css]
 * argument type : [modules/ui]
 * options : --name MyFooBarModule
 *
 * Examples :
 *
 * npm run cli js module --name MySuperModule
 * npm run cli js ui --name MySuperModule
 * npm run cli css module --name MySuperModule
 *
 */

const ALLOWED_SOURCES = ['js', 'scss'];
const ALLOWED_TYPES = ['modules', 'ui'];

const src_path = path.resolve(__dirname, '../src');
console.log('src_path:', src_path)

const cli = () => {
  try {
    const { _: commands } = argv

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
      console.log('source_destination:', source_destination)
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

    // in SCSS source, we store each module at the root of its type : ../src/js/[module/ui]/[module_slug].scss
    if (source == 'scss') {
      source_destination = path.join(source_destination, type, module_slug);
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
    console.log(`File ${outputFile} created!`);
  })

  ejs.renderFile(template_factory, data, {}, function(err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err)
    }
    const outputFile = path.join(destination, `factory.js`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
    console.log(`File ${outputFile} created!`);
  })

  ejs.renderFile(template_index, data, {}, function(err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err)
    }
    const outputFile = path.join(destination, `index.js`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
    console.log(`File ${outputFile} created!`);
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
    console.log(`File ${outputFile} created!`);
  })

  ejs.renderFile(template_ui, data, {}, function(err, str) {
    // str => Rendered HTML string
    if (err) {
      console.error(err)
    }
    const outputFile = path.join(destination, `${name}.js`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
    console.log(`File ${outputFile} created!`);
  })

}

/**
 * validate cli commandline argv
 */

const validateArgv = (source, type, name) => {
  // 1. check if has source argument
  if (!source) {
    console.error("`source` argument is required : cli [js/scss]")
    process.exit(1)
  }

  // 2. check if source value is allowed
  if(!ALLOWED_SOURCES.some((s) => s === source)) {
    console.error("`source` argument is invalid : cli [js/scss]")
    process.exit(1)
  }

  // 3. check if has source & type
  if (!source || !type) {
    console.error("`source` and `type` arguments are required : cli [js/scss] [modules/ui]")
    process.exit(1)
  }

  // 4. check if source type is allowed
  if(!ALLOWED_TYPES.some((s) => s === type)) {
    console.error("`type` argument is invalid : cli [modules/ui]")
    process.exit(1)
  }

  // 5. check if --name option is defined
  if(!name) {
    console.error("`name` argument is required : cli [js/scss] [modules/ui] MyFooBarModule")
    console.error("Important : you must name your module in `PascalCase` style.")
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
