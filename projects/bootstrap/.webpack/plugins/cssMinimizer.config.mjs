/**
 * @typedef {import('css-minimizer-webpack-plugin').CustomOptions} CustomOptions
 * @typedef {import('css-minimizer-webpack-plugin').BasePluginOptions} BasePluginOptions
 * @typedef {import('css-minimizer-webpack-plugin').DefinedDefaultMinimizerAndOptions<CustomOptions>} DefinedDefaultMinimizerAndOptions
 * @typedef {BasePluginOptions & DefinedDefaultMinimizerAndOptions} CssMinimizerPluginConfig
 */

import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import cleanCssConfig from "../../configs/cleanCss.config.mjs";

/**
 * CssMinimizer options
 * @see https://github.com/webpack-contrib/css-minimizer-webpack-plugin
 * @type {CssMinimizerPluginConfig}
 */
const cssMinimizerPluginConfig = {
  minimizerOptions: cleanCssConfig,
  minify: CssMinimizerPlugin.cleanCssMinify,
};

export default cssMinimizerPluginConfig;
