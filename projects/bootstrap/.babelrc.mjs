/**
 * Babel preset options
 * @see https://babeljs.io/docs/babel-preset-env
 * @type {import('@babel/preset-env').Options}
 */
const presetOptions = {
  loose: true,
  bugfixes: true,
  modules: false,
};

/**
 * Babel options
 * @see https://babeljs.io/docs/options
 * @type {import('@babel/core').TransformOptions}
 */
const babelConfig = {
  presets: [
    [
      "@babel/preset-env",
      presetOptions,
    ],
  ],
};

export default babelConfig;
