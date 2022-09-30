# MILL3-packages : Wordpress Theme Boilerplate with Webpack

Our WP theme boilerplate using Timber/Twig templates

## Requirements

- npm / yarn
- [Timber WP plugin](https://github.com/timber/timber/)
- [Advanced Custom Fields](https://www.advancedcustomfields.com/)

## How to use for local development

Edit `wp-config.php` and add this constant :

```php
define('THEME_ENV', 'development');
```

Make sure the **name: mill3-wp-theme-boilerplate** line in `package.json` matches your theme's directory name.

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

Then install NodeJS dependencies

```bash
npm ci
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

# Module CLI tool

Our theme comes with an utility cli for creating JS, CSS and Liquid templates.

Let's create all required file for a page-builder feature :

```bash
npm run modules-cli js modules PbRowRadModule
npm run modules-cli scss modules PbRowRadModule
npm run modules-cli templates module PbRowRadModule
```

![CleanShot 2022-05-11 at 09 49 03](https://media.cleanshot.cloud/media/15151/ykqkfdIhJMPqezcefYtia2F2UKXVuH8zGy71Ck5s.jpeg?Expires=1664563096&Signature=U~98aD6fO1wQv7-ORklEF6Fu4WDptyWTqhejsYyGMCAK1tKFDzJlu0VPFi0EP-cqhMQFpYUrrUwWhwAASUa2CLJ5saBSEhc7OSKH726ZTeiojVatfSdnhKupntsStl3meIgB6f0nOJk57~htIpfH6nSn3hDEcO3v2FcBsnQaPZMNvzpwveBCPCutN9xdC0DOX1Z-c70L7TL-7f~fEGg0SAX1pi-GCvn81kFSOaowm5Cwf6rPlmmo55C9tN~G0CYHIQfW46KZG8wRescBLaz~8BBYnRyY0jgmUTNoFxv5Lk7ZcrXWH-JT5AWplkSoNYBttFIMxFEt6gEFGk3IEKfKGQ__&Key-Pair-Id=K269JMAT9ZF4GZ)

Or a site-ui element :

```bash
npm run modules-cli js ui VideoModal
```

It's also possible to generate a file from a source template and target and exact destination directory

```bash
npm run modules-cli scss modules PostPreview -- --dest ./src/scss/post-type/post/
```

## TinyMCE stylesheet

You have to edit ```add_editor_stylesheet``` function in ```.lib/editor.php``` to match your theme name.
Not doing so will result in TinyMCE not loading your theme stylesheet.

## Polylang & i18n notes

Generally, we want to seperate Wordpress core translations ```__('my string')``` from the twig templates, since we are using Polylang, strings are translated with the method ```pll_e('my string')```, thus, Wordpress admin view can't apply those Polylang translations.

**Golden rules :**

* Anything that is displayed in WP admin views goes in ```./languages/locale_CA.po``` (post type labels mostly)
* Do **not** use ```pll__``` method in .php files like ```taxonomies.php``` and ```post-type.php```, those files do not depends on Polylang.
* Register twig template translations in ```./lib/translations.php``` using ```pll_register_string( 'mill3wp', 'Dummy', 'mill3wp' )```
* Translate those twig strings in Polylang's string translations admin panel
* String registration can be skipped using Polylang (TTfP) : https://fr.wordpress.org/plugins/theme-translation-for-polylang/

## .pot file usage instruction

Assuming you installed on your machine wordpress-i18n PHP tools, install using this fork from the original Worpdress SVN repository : https://github.com/Mill3/wordpress-makepot

```php /path-to/makepot.php wp-theme /path-to/[my-theme]/ /path-to/[my-theme]/languages/mill3wp.pot```

How to merge new string from main .pot template :

```msgmerge -U fr_CA.po mill3wp.pot```

How to compile :

```msgfmt -o fr_CA.mo fr_CA.po```

## ACF base fields for our Page Builder

You need to import JSON files located in ```./acf-imports/*.json``` using ACF import tool. You can find this tool under Custom Fields --> Tools.

