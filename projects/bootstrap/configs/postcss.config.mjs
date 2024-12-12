/**
 * @typedef {import('postcss-load-config').Config} Config
 * @typedef {import('postcss-load-config').ConfigFn} ConfigFn
 */

/**
 * PostCss config
 * @see https://github.com/postcss/postcss-load-config
 * @type {ConfigFn | Config}
 */
const postcssConfig = {
  map: false,
  plugins: {
    autoprefixer: {
      cascade: false,
    },
  },
};

export default postcssConfig;
