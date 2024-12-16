/**
 * @typedef {import('css-minimizer-webpack-plugin').CustomOptions} CustomOptions
 * @typedef {import('css-minimizer-webpack-plugin').BasePluginOptions} BasePluginOptions
 * @typedef {import('css-minimizer-webpack-plugin').DefinedDefaultMinimizerAndOptions<CustomOptions>} DefinedDefaultMinimizerAndOptions
 * @typedef {BasePluginOptions & DefinedDefaultMinimizerAndOptions} CssMinimizerPluginConfig
 */

import browserslist from "browserslist";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import * as lightningcss from "lightningcss";

/**
 * CssMinimizer options
 * @see https://github.com/webpack-contrib/css-minimizer-webpack-plugin
 * @type {CssMinimizerPluginConfig}
 */
const cssMinimizerPluginConfig = {
  minify: CssMinimizerPlugin.lightningCssMinify,
  minimizerOptions: lightningcss.browserslistToTargets(browserslist()),
};

export default cssMinimizerPluginConfig;
