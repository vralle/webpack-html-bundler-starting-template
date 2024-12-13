/** @type {import('@babel/preset-env').Options} */
const presetOptions = {
  loose: true,
  bugfixes: true,
  modules: false,
};

/** @type {import('@babel/core').TransformOptions} */
const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      presetOptions,
    ],
  ],
};

export default babelConfig;
