module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: "eslint:recommended",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
    parser: "babel-eslint",
    allowImportExportEverywhere: true
  },
  rules: {}
};
