# MILL3-packages : Wordpress Theme Boilerplate with Webpack

Our WP theme boilerplate using Timber/Twig templates

## Requirements

- npm / yarn
- [Timber WP plugin](https://github.com/timber/timber/)
- [Advanced Custom Fields](https://www.advancedcustomfields.com/)

## How to use for local development

Edit `wp-config.php` and add this constant :

```php
define('THEME_DEV', true);
```

Make sure the _name_ line in `package.json` matches your theme's directory name.

```json
{
  "name": "mill3wp",
  "version": "x.x.x"
}
```

Directory :

```
/wp-content/themes/mill3wp/
```

Add bin command to your package.json file :

```json
{
  "scripts": {
    "mill3-cli": "mill3-cli",
  }
}
```

Then start Webpack dev server

```bash
npm run dev
```

## Local development with Docker

You can also use our [Docker boilerplate](https://github.com/Mill3/wordpress-docker-boilerplate) for WordPress which will set the `THEME_DEV` constant for you on initial Docker up command. Check out the repository : https://github.com/Mill3/wordpress-docker-boilerplate

## Production assets build

Simply run :

```bash
npm run build
```

In production mode, assets are loaded from dist/assets.json file, cache busting included !
