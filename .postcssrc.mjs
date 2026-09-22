import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';

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
      'light-dark-function': false,
      'logical-properties-and-values': false,
      'trigonometric-functions': false,
      'cascade-layers': false
    }
  })
]

// plugins to use in production only
if( !DEV ) {
  PLUGINS.push(
    cssnano({
      preset: ['default',
        {
          convertValues: { time: false },
          reduceTransforms: false
        }
      ]
    }),
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
          /^visibility-/,
          /^pointer-events-/,
          /^bg-color-/,
          /^color-/,
          /^bg-gray-/,
          /^gray-/,
          /^--/,
          /^:is/,
          /^hsfc/,
          /~hs-/,
          // add more here if needed
        ],
        deep: [
          /^body/,
          /^wysiwyg/,
          /^btn/,
          /^gform/,
          /^gfield/,
          /^swiper/,
          /hsfc/,
          /hs-/,
        ],
        greedy: [
          // blossom-carousel toggles has-snap/has-repeat/has-overflow attributes at runtime,
          // so purgecss never finds them in source and strips their rules without this
          /blossom/
        ],
        variables: [
          /^--hsf/,
          /^--hs-/,
        ]
      }
    })
  )
}

const config = {
  syntax: 'postcss-scss',
  plugins: PLUGINS,
};

export default config;
