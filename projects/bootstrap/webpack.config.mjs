/**
 * Webpack configuration
 */

import { join, parse, relative } from 'node:path';
import process from 'node:process';
import { styleText } from 'node:util';

// Plugins
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

// Configurations of tools
import htmlTerserConfig from './configs/htmlTerser.config.mjs';
import postcssConfig from './configs/postcss.config.mjs';
import svgoConfig from './configs/svgo.config.mjs';
import terserConfig from './configs/terser.config.mjs';

import cssMinimizerConfig from './.webpack/plugins/cssMinimizer.config.mjs';

/**
 * @typedef {import('webpack').Module} Module
 * @typedef {import('webpack').Configuration} WebpackConfig
 * @typedef {import('webpack-dev-server').Configuration} DevServerConfig
 */

/**
 * @typedef {import('sass-embedded').Options<'sync'|'async'>} SassOptions
 */

// Project configuration
const projectPath = new URL('./', import.meta.url).pathname;
const projectOutputPath = join(projectPath, 'dist');
const projectOutputAssetPath = join(projectOutputPath, 'static');
const projectSrcPath = join(projectPath, 'src');
const isProduction = function () { return (process.env['NODE_ENV'] === 'production'); };

console.info('projectPath:', projectPath);
console.info('projectOutputPath:', projectOutputPath);
console.info('projectOutputAssetPath:', projectOutputAssetPath);
console.info('projectSrcPath:', projectSrcPath);

const imgRegExp = /\.(avif|gif|heif|ico|jp[2x]|j2[kc]|jpe?g|jpe|jxl|png|raw|svg|tiff?|webp)(\?.*)?/i;

/**
 * @type {WebpackConfig & DevServerConfig}
 */
const webpackConfig = {
  mode: isProduction() ? 'production' : 'development',
  output: {
    path: projectOutputPath,
    clean: true,
    hashDigestLength: 9,
    filename: relative(projectOutputPath, join(projectOutputAssetPath, 'js', '[name].[contenthash].js')),
    chunkFilename({ filename }) {
      const outputFilename = '[id].js';
      if (filename === undefined) {
        return relative(projectOutputPath, join(projectOutputAssetPath, 'js', outputFilename));
      }
      const basename = parse(filename).base;
      return relative(projectOutputPath, join(projectOutputAssetPath, 'js', basename));
    },
    cssFilename: relative(projectOutputPath, join(projectOutputAssetPath, 'css', '[name].[contenthash].css')),
    assetModuleFilename({ filename }) {
      const outputFilename = '[name][ext]';

      if (filename === undefined) {
        return relative(projectOutputPath, join(projectOutputAssetPath, 'img', outputFilename));
      }

      const relPath = relative(projectSrcPath, filename);
      const parsedPath = parse(relPath);
      const dir = parsedPath.dir.toLowerCase();

      const name = parsedPath.name.toLowerCase();

      const filePath = join(dir, `${name}[ext][query]`);
      const outputFilePath = relative(projectOutputPath, join(projectOutputAssetPath, filePath));

      console.info(styleText('green', 'webpackConfig.assetModuleFilename in: '), filename);
      console.info(styleText('green', 'webpackConfig.assetModuleFilename out: '), outputFilePath);

      return outputFilePath;
    },
  },
  resolve: {
    alias: {
      '@src': projectSrcPath,
    },
  },
  module: {
    rules: [
      {
        test: /\.[cm]?js(\?.*)?$/i,
        include: join(projectSrcPath, 'js'),
        use: {
          loader: 'babel-loader',
          /** @see https://github.com/babel/babel-loader */
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.s?css(\?.*)?$/i,
        include: join(projectSrcPath, 'scss'),
        use: [
          {
            loader: 'css-loader',
            /** @see https://github.com/webpack-contrib/css-loader */
            options: {
              importLoaders: isProduction() ? 1 : 0,
            },
          },
          isProduction() === true && {
            loader: 'postcss-loader',
            options: {
              postcssOptions: postcssConfig,
            },
          },
          {
            loader: 'sass-loader',
            /**
             * Sass Loader
             * @see https://github.com/webpack-contrib/sass-loader/blob/master/README.md#api
             */
            options: {
              implementation: 'sass-embedded',
              api: 'modern-compiler', // 'modern-compiler' since sass-loader v14.2.0
              webpackImporter: false, // use sass.Options.loadPaths to improve performance
              warnRuleAsWarning: true, // Treats the @warn rule as a webpack warning.
              /**
               * @see https://sass-lang.com/documentation/js-api/interfaces/options/
               * @type {SassOptions}
               */
              sassOptions: {
                loadPaths: ['node_modules'], // Required for api:modern, where webpack import doesn't work
                style: isProduction() ? 'compressed' : 'expanded',
                quietDeps: isProduction(),
              },
            },
          },
        ],
      },
      {
        test: imgRegExp,
        type: 'asset',
        parser: {
          /**
           * Control encoding to inline base64 url
           * @param {Buffer} source
           * @param {{filename: string; module: Module;}} context
           * @returns {boolean}
           */
          dataUrlCondition(source, { filename }) {
            if (/logo\.svg(\?.*)?$/i.test(filename)) {
              return false;
            }

            return Buffer.byteLength(source) <= 3 * 1024; // =maxSize: 3kb
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: join(projectSrcPath, 'views', 'home.html'),
        },
      },
      css: { // webpackConfig output.cssFilename and output.hashDigestLength don't work for css. Tested with HtmlBundlerPlugin 4.10.2
        filename: relative(projectOutputPath, join(projectOutputAssetPath, 'css', '[name].[contenthash:9].css')),
      },
      preprocessor: false,
      loaderOptions: {
        sources: [
          {
            tag: 'meta',
            attributes: ['content'],
            filter({ attributes }) {
              if (attributes['content']) {
                return imgRegExp.test(attributes['content']);
              }

              return false;
            },
          },
          {
            tag: 'a',
            attributes: ['href'],
            filter({ attributes }) {
              if (attributes['href']) {
                return imgRegExp.test(attributes['href']);
              }

              return false;
            },
          },
        ],
      },
      minify: isProduction(),
      minifyOptions: htmlTerserConfig,
      hotUpdate: true,
      verbose: 'auto',
      watchFiles: {
        paths: [
          projectSrcPath,
        ],
        includes: [
          /\.([cm]?js|ts|json|html|s?css)(\?.*)?$/i,
        ],
      },
    }),
  ],
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        test: imgRegExp,
        include: join(projectSrcPath, 'img'),
        deleteOriginalAssets: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.svgoMinify,
          options: {
            encodeOptions: svgoConfig,
          },
        },
      }),
      new TerserPlugin({
        test: /\.[cm]?js(\?.*)?$/i,
        extractComments: false,
        parallel: true,
        terserOptions: terserConfig,
      }),
      new CssMinimizerPlugin(cssMinimizerConfig),
    ],
  },
  devtool: isProduction() ? false : 'inline-cheap-source-map',
  devServer: {
    static: {
      directory: projectOutputPath,
      publicPath: '',
    },
    watchFiles: {
      paths: [
        `${projectSrcPath}/**`,
      ],
    },
    hot: true,
    client: {
      progress: true,
    },
  },
  watchOptions: {
    aggregateTimeout: 600,
    poll: 1000,
    ignored: ['**/node_modules/'],
  },
  stats: {
    errorDetails: true,
  },
  infrastructureLogging: {
    level: 'verbose',
  },
  // cache: {
  //   type: 'filesystem', // fails with errors
  // }
};

export default webpackConfig;
