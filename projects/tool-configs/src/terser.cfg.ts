import type { MinifyOptions } from "terser";

/**
 * Terser options
 * @see https://github.com/terser/terser
 */
const terserConfig: MinifyOptions = {
  compress: {
    passes: 2,
  },
  format: {
    comments: false,
  },
};

export default terserConfig;
