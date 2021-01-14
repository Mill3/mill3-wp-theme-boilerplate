![npm](https://img.shields.io/npm/v/@mill3-packages/wp-boilerplate?style=flat-square)

# MILL3-packages : Wordpress Theme Boilerplate with Webpack

Our WP theme boilerplate using Timber/Twig templates

![](https://media.giphy.com/media/XyJjfbEPltkHE4s7hg/giphy.gif)

## Requirements

- npm / yarn
- [Timber WP plugin](https://github.com/timber/timber/)

## How to install

Our boilerplate package is distributed with NPM, init a new project and install with it :

**Note:** make sure you run thoses commands inside a fresh empty WP theme directory. Not at the root of your Wordpress installation.

```bash
npm init
npm install @mill3-packages/wp-boilerplate
```

## How to use for local development

Edit `wp-config.php` and add this constant :

```php
define('THEME_DEV', true);
```

Make sure the _name_ line in `package.json` matches your theme's directory name.

```json
{
  "name": "mill3-wp-boilerplate",
  "version": "2.0.0"
}
```

Directory :

```
/wp-content/themes/mill3-wp-boilerplate/
```

Add bin command to your package.json file :

```json
{
  "scripts": {
    "mill3-wp": "mill3-wp"
  }
}
```

Run the install script :

```bash
npm run mill3-wp install
```

Then start Webpack dev server

```bash
npm run mill3-wp dev
```

## Local development with Docker

You can also use our [Docker boilerplate](https://github.com/Mill3/wordpress-docker-boilerplate) for WordPress which will set the `THEME_DEV` constant for you on initial Docker up command. Check out the repository : https://github.com/Mill3/wordpress-docker-boilerplate

## Production assets build

Simply run :

```bash
npm run mill3-wp build
```

In production mode, assets are loaded from dist/assets.json file, cache busting included !

## Prettier/ESLint

You can ESLint your code with the following command :

First add in package's script :

```json
{
  "scripts": {
    "lint": "eslint --fix ./src/js",
    "prettier": "prettier-eslint ./src/js/*/*.js ./src/scss/**/*.scss --write"
  }
}
```

```bash
npm run lint
```

And Prettier formatting :

```bash
npm run prettier
```

Please also note that there's a pre-commit hook using [pretty-quick](https://github.com/azz/pretty-quick) which can be added in `package.json`.

```json
"husky": {
  "hooks": {
    "pre-commit": "pretty-quick --staged"
  }
}
```
