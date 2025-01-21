import type { Config, ConfigFn } from "postcss-load-config";

/**
 * PostCss config
 * @see https://github.com/postcss/postcss-load-config
 */
const postcssConfig: Config | ConfigFn = {
  map: false,
  plugins: {
    autoprefixer: {
      cascade: false,
    },
  },
};

export default postcssConfig;
