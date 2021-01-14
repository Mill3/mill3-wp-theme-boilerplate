#!/usr/bin/env node
const prompts = require("prompts");
const fse = require("fs-extra");
const path = require("path");
const pathExists = require("path-exists");
const figlet = require("figlet");
const chalk = require("chalk");
const replace = require("replace-in-file");

const PROCESS_PATH = path.join(process.cwd());
const ROOT_PATH = path.join(__dirname);
const INSTALL_SRC_PATH = path.join(ROOT_PATH, `./install-src/`);

// current values for i18n domain & php classes namespace
const DEFAULT_THEME_DOMAIN = "mill3wp";
const DEFAULT_THEME_NAMESPACE = "Mill3WP";

// holder when user is cancel Prompts
let cancelled = false;

// defaults
let settings = {
  INSTALL_PATH: PROCESS_PATH,
  THEME_DOMAIN: DEFAULT_THEME_DOMAIN,
  THEME_NAMESPACE: DEFAULT_THEME_NAMESPACE
};

// start Prompts
const run = async () => {
  // First Intro message
  console.log(chalk.blue("*****************************************************"));
  console.log(chalk.blue(figlet.textSync("MILL3", { horizontalLayout: "full" })));
  console.log(chalk.blue("*****************************************************"));

  const questions = [
    {
      type: "text",
      name: "INSTALL_PATH",
      message: "Install path for theme (must be relative, defaults to current directory) :",
      initial: settings["INSTALL_PATH"],
      format: val => {
        return val !== settings["INSTALL_PATH"] ? path.join(PROCESS_PATH, val) : val;
      },
      validate: async text => {
        return (await pathExists(text)) ? true : `The relative path '${text}' doesn't existing`;
      }
    },
    {
      type: "text",
      name: "THEME_DOMAIN",
      initial: settings["THEME_DOMAIN"],
      message: "Theme domain for i18n strings :",
      validate: text => {
        return /^\S*$/.test(text) ? true : "No spaces allowed.";
      }
    },
    {
      type: "text",
      name: "THEME_NAMESPACE",
      initial: settings["THEME_NAMESPACE"],
      message: "Namespace for PHP classes :",
      validate: text => {
        return /[A-Z]/.test(text) ? true : "Please use CamelCase style";
      }
    },
    {
      type: "toggle",
      name: "confirm",
      message: `Are you sure? This will overwrite any same exiting file in target directory!`,
      initial: false,
      active: "yes",
      inactive: "no"
    }
  ];

  const onSubmit = (prompt, answer) => {
    // merge each answer to settings
    answer.length ? (settings[prompt.name] = answer) : null;
  };

  const onCancel = prompt => {
    console.log(chalk.red("✖ Abort Abort Abort !"));
    cancelled = true;
    return false;
  };

  const response = await prompts(questions, { onSubmit, onCancel });

  // stop here if did not confirm
  if (!response.confirm) return;

  // stop here if canceled
  if (cancelled) return;

  console.log(chalk.blue(`\nDone with questions, starting installation in directory ${settings["INSTALL_PATH"]}\n`));

  // install all files
  await install();

  // rename to new namespace
  await rename();

  console.log(chalk.blue(`\nInstallation done in ${settings["INSTALL_PATH"]}\n`));
};

// install all files
const install = async () => {
  try {
    await fse.copy(INSTALL_SRC_PATH, settings["INSTALL_PATH"]);
    await fse.move(`${settings["INSTALL_PATH"]}/.env.sample`, `${settings["INSTALL_PATH"]}/.env`, { overwrite: true });
    console.log(chalk.green("Step 1/2 : copied all files."));
  } catch (err) {
    console.error(err);
  }
};

const rename = async () => {
  // regex for domain and namespace
  var reDomain = new RegExp(DEFAULT_THEME_DOMAIN, "g");
  var reNamespace = new RegExp(DEFAULT_THEME_NAMESPACE, "g");

  // replace options
  const options = {
    files: [`${settings["INSTALL_PATH"]}/**/*.php`, `${settings["INSTALL_PATH"]}/**/*.js`],
    ignore: ["install-src/**", "node_modules/**"],
    from: [reDomain, reNamespace],
    to: [settings["THEME_DOMAIN"], settings["THEME_NAMESPACE"]],
    countMatches: true
  };

  try {
    await replace(options);
    console.log(chalk.green("Step 2/2 : renamed all files."));
  } catch (err) {
    console.error(err);
  }
};

run();

exports.module = run;
