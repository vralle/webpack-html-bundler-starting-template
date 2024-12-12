/**
 * css-minimizer-webpack-plugin config
 *
 * @typedef {import('css-minimizer-webpack-plugin').CustomOptions} CustomOptions
 * @typedef {import('css-minimizer-webpack-plugin').BasePluginOptions} BasePluginOptions
 * @typedef {import('css-minimizer-webpack-plugin').DefinedDefaultMinimizerAndOptions<CustomOptions>} DefinedDefaultMinimizerAndOptions
 * @typedef {BasePluginOptions & DefinedDefaultMinimizerAndOptions} CssMinimizerPluginConfig
 */

import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import cleanCssConfig from '../../configs/cleanCss.config.mjs';

/**
 * @type {CssMinimizerPluginConfig}
 */
const cssMinimizerPluginConfig = {
  minimizerOptions: cleanCssConfig,
  minify: CssMinimizerPlugin.cleanCssMinify,
};

export default cssMinimizerPluginConfig;
