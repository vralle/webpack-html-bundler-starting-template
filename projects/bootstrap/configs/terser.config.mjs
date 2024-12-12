/**
 * Terser options
 * @see https://github.com/terser/terser
 * @type {import('terser').MinifyOptions}
 */
const terserConfig = {
  compress: {
    passes: 2,
  },
  format: {
    comments: false,
  },
};

export default terserConfig;
