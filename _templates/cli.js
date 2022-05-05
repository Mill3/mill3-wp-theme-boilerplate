/* eslint-disable no-undef */
const path = require("path");
const fs = require("fs-extra");
const ejs = require("ejs");
const argv = require("yargs-parser")(process.argv.slice(2));

/**
 * MILL3 - Theme CLI utils for JS and CSS modules
 *
 * argument source : [js/css]
 * argument type : [module/ui]
 * options : --name MyFooBarModule
 *
 * Examples :
 *
 * npm run cli js module --name MySuperModule
 * npm run cli js ui --name MySuperModule
 * npm run cli css module --name MySuperModule
 *
 */

const ALLOWED_SOURCES = ['js', 'css'];
const ALLOWED_TYPES = ['module', 'ui'];

const cli = () => {
  try {
    console.log(argv)

    const { _: commands, name } = argv

    // get source from commands
    const source = commands[0];
    const type = commands[1];

    // validate argv
    validateArgv(source, type, name);

    // const filename = path.join(__dirname, type, component, `./${component}.ejs`)
    // console.log('filename:', filename)

    // const data = {
    //   fn: name,
    //   arguments: commands
    // }

    // ejs.renderFile(filename, data, {}, function(err, str) {
    //   // str => Rendered HTML string
    //   if (err) {
    //     console.error(err)
    //   }

    //   console.log(str)
    // })

  } catch (err) {
    console.error(err)
  }
}

/**
 * validate cli commandline argv
 */

const validateArgv = (source, type, name) => {
  // 1. check if has source argument
  if (!source) {
    console.error("'source' argument is required : cli [js/css]")
    process.exit(1)
  }

  // 2. check if source value is allowed
  if(!ALLOWED_SOURCES.some((s) => s === source)) {
    console.error("'source' argument is invalid : cli [js/css]")
    process.exit(1)
  }

  // 3. check if has source & type
  if (!source || !type) {
    console.error("'source' and 'type' arguments are required : cli [js/css] [module/ui]")
    process.exit(1)
  }

  // 4. check if source type is allowed
  if(!ALLOWED_TYPES.some((s) => s === type)) {
    console.error("'type' argument is invalid : cli [module/ui]")
    process.exit(1)
  }

  // 5. check if --name option is defined
  if(!name) {
    console.error("--name option is required : cli [js/css] [module/ui] --name MyFooBarModule")
    process.exit(1)
  }
}

/**
 *
 * Transform a `CamelCasing` string to `slug-type`
 *
 * @param {*} s string
 * @returns string
 */
const camelToSlug = (s) => {
  return s.trim().replace(/[A-Z]/g, (match, offset) => (offset > 0 ? '-' : '') + match.toLowerCase())
}


cli();
