import cleanCssConfig from './cleanCss.config.mjs';

/**
 * HTML Minifier Terser options
 * @see https://github.com/terser/html-minifier-terser#options-quick-reference
 */
const htmlTerserConfig = {
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
