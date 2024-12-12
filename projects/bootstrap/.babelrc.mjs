/** @type {import('babel__preset-env').Options} */
const presetOptions = {
  loose: true,
  bugfixes: true,
  modules: false,
};

/** @type {import('babel__core').TransformOptions} */
const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      presetOptions,
    ],
  ],
};

export default babelConfig;
