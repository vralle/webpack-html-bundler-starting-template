import type { Options } from "clean-css";

/**
 * CleanCss Options
 * @see https://github.com/clean-css/clean-css
 */
const cleanCssConfig: Options = {
  level: 1,
  format: {
    breakWith: "lf",
  },
  rebase: false,
};

export default cleanCssConfig;
