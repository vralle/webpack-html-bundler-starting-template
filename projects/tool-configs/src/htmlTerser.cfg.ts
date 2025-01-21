import type { Options } from "html-minifier-terser";
import cleanCssConfig from "./cleanCss.cfg.js";

/**
 * HTML Minifier Terser options
 * @see https://github.com/terser/html-minifier-terser#options-quick-reference
 */
const htmlTerserConfig: Options = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: false, // prevents styling bug when input "type=text" is removed
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: false,
  minifyCSS: cleanCssConfig,
  minifyJS: false,
};

export default htmlTerserConfig;
