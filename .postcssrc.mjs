import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
import postcssPresetEnv from 'postcss-preset-env';

const DEV = process.env.NODE_ENV !== "production";

// plugins to use in all environments
const PLUGINS = [
  postcssPresetEnv({
    autoprefixer: {
      grid: false,
      flex: false,
      supports: true
    },
    features: {
      'clamp': false,
      'hwb-function': false,
      'lab-function': false,
      'logical-properties-and-values': false,
      'trigonometric-functions': false
    }
  })
]

// plugins to use in production only
if( !DEV ) {
  PLUGINS.push(
    purgeCSSPlugin({
      content: [
        './src/**/*.js',
        './templates/**/*.twig',
        './views/**/*.twig',
        './**/*.php',
        './**/*.svg',
      ],
      defaultExtractor: (content) => {
        // Capture classnames: regular + Tailwind-style
        return content.match(/[\w-/:%]+(?<!:)/g) || [];
      },
      safelist: {
        standard: [
          /^pt-/,
          /^pb-/,
          /^mt-/,
          /^mb-/,
          /^char-/,
          /^grid-gap-/,
          /^bg-color-/,
          /^color-/,
          /^bg-gray-/,
          /^gray-/,
          /^--/,
          // add more here if needed
        ],
        deep: [
          /^wysiwyg/,
          /^btn/,
          /^gform/,
          /^swiper/
        ],
      }
    })
  )
}

const config = {
  syntax: 'postcss-scss',
  plugins: PLUGINS,
};

export default config;
