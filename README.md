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

Installed in a directory with the same name :

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

## Polylang & i18n notes

Generally, we want to seperate Wordpress core translations ```__('my string')``` from the twig templates, since we are using Polylang, strings are translated with the method ```pll_e('my string')```, thus, Wordpress admin view can't apply those Polylang translations.

**Golden rules :**

* Anything that is displayed in WP admin views goes in ```./languages/locale_CA.po``` (post type labels mostly)
* Do **not** use ```pll__``` method in .php files like ```taxonomies.php``` and ```post-type.php```, those files do not depends on Polylang.
* Register twig template translations in ```./lib/translations.php```
* Translate those twig string with Polylang string translation
* Registering string can be skipped using Polylang (TTfP) : https://fr.wordpress.org/plugins/theme-translation-for-polylang/

## .pot file usage instruction

Assuming you installed on your machine wordpress-i18n PHP tools.

```php /path-to/makepot.php wp-theme /path-to/[my-theme]/ /path-to/[my-theme]/languages/mill3wp.pot```

How to merge new string from main .pot template :

```msgmerge -U fr_CA.po mill3wp.pot```

How to compile :

```msgfmt -o fr_CA.mo fr_CA.po```
