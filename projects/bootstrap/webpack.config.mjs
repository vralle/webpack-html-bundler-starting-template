/**
 * Webpack configuration
 */

import { join, parse, relative } from "node:path";
import process from "node:process";
import { styleText } from "node:util";

// Plugins
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlBundlerPlugin from "html-bundler-webpack-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import cssMinimizerConfig from "./.webpack/plugins/cssMinimizer.config.mjs";

// Configurations of tools
import htmlTerserConfig from "./configs/htmlTerser.config.mjs";
import postcssConfig from "./configs/postcss.config.mjs";
import svgoConfig from "./configs/svgo.config.mjs";
import terserConfig from "./configs/terser.config.mjs";

/**
 * @typedef {import('webpack').Module} Module
 * @typedef {import('webpack').Configuration} WebpackConfig
 * @typedef {import('webpack-dev-server').Configuration} DevServerConfig
 */

/**
 * @typedef {import('sass-embedded').Options<"sync"|"async">} SassOptions
 */

// Project configuration
const projectPath = new URL("./", import.meta.url).pathname;
const projectSrcPath = join(projectPath, "src");
const projectOutputPath = join(projectPath, "dist");
const outputAssetPath = join(projectOutputPath, "static");
const outputJsPath = join(outputAssetPath, "js");
const outputCssPath = join(outputAssetPath, "css");
const outputImgPath = join(outputAssetPath, "img");
/** Copy directory structure from source image path */
const copySrcImgDirStructure = true;

const isProduction = () => process.env.NODE_ENV === "production";

console.info(styleText("green", "projectPath: "), projectPath);
console.info(styleText("green", "projectSrcPath: "), projectSrcPath);
console.info(styleText("green", "projectOutputPath: "), projectOutputPath);
console.info(styleText("green", "projectOutputAssetPath: "), outputAssetPath);

const imgRegExp = /\.(avif|gif|heif|ico|jp[2x]|j2[kc]|jpe?g|jpe|jxl|png|raw|svg|tiff?|webp)(\?.*)?/i;

/**
 * @type {WebpackConfig & DevServerConfig}
 */
const webpackConfig = {
  mode: isProduction() ? "production" : "development",
  output: {
    path: projectOutputPath,
    clean: true,
    hashDigestLength: 9,
    filename: relative(projectOutputPath, join(outputJsPath, "[name].[contenthash].js")),
    chunkFilename({ filename }) {
      const outputFilename = "[id].js";
      if (filename === undefined) {
        return relative(projectOutputPath, join(outputJsPath, outputFilename));
      }
      const basename = parse(filename).base;
      return relative(projectOutputPath, join(outputJsPath, basename));
    },
    cssFilename: relative(projectOutputPath, join(outputCssPath, "[name].[contenthash].css")),
    assetModuleFilename: ({ filename }) => {
      const outputFilename = "[name][ext]";

      if (!copySrcImgDirStructure || filename === undefined) {
        return relative(projectOutputPath, join(outputImgPath, outputFilename));
      }

      // Copy the directory structure of the file path
      const relPath = relative(join(projectSrcPath, "img"), filename);
      const parsedPath = parse(relPath);
      const dir = parsedPath.dir.toLowerCase();

      // Avoid uppercase file names.
      // Caution: Control source file names to avoid file name collisions.
      const name = parsedPath.name.toLowerCase();

      const filePath = join(dir, `${name}[ext][query]`);
      const outputFilePath = relative(projectOutputPath, join(outputImgPath, filePath));

      console.info(styleText("green", "webpackCfg.assetModuleFilename in: "), filename);
      console.info(styleText("green", "webpackCfg.assetModuleFilename out: "), outputFilePath);

      return outputFilePath;
    },
  },
  resolve: {
    alias: {
      "@src": projectSrcPath,
    },
  },
  module: {
    rules: [
      {
        test: /\.[cm]?js(\?.*)?$/i,
        include: join(projectSrcPath, "js"),
        use: {
          loader: "babel-loader",
          /** @see https://github.com/babel/babel-loader */
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.s?css(\?.*)?$/i,
        include: join(projectSrcPath, "scss"),
        use: [
          {
            loader: "css-loader",
            /** @see https://github.com/webpack-contrib/css-loader */
            options: {
              importLoaders: isProduction() ? 1 : 2,
            },
          },
          isProduction() === true && {
            loader: "postcss-loader",
            /** @see https://github.com/webpack-contrib/postcss-loader */
            options: {
              postcssOptions: postcssConfig,
            },
          },
          {
            loader: "sass-loader",
            /** @see https://github.com/webpack-contrib/sass-loader/ */
            options: {
              implementation: "sass-embedded",
              api: "modern-compiler", // 'modern-compiler' since sass-loader v14.2.0
              webpackImporter: false, // use sass.Options.loadPaths to improve performance
              warnRuleAsWarning: true, // Treats the @warn rule as a webpack warning.
              /**
               * @see https://sass-lang.com/documentation/js-api/interfaces/options/
               * @type {SassOptions}
               */
              sassOptions: {
                loadPaths: ["node_modules", "../../node_modules"],
                style: isProduction() ? "compressed" : "expanded",
                quietDeps: isProduction(),
              },
            },
          },
        ],
      },
      {
        test: imgRegExp,
        type: "asset",
        parser: {
          /**
           * Convert linked image into an embedded image
           * @param {Buffer} source
           * @param {{filename: string; module: Module;}} context
           * @returns {boolean}
           */
          dataUrlCondition(source, { filename }) {
            // Avoid converting logo for SEO reason
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
          import: join(projectSrcPath, "views", "home.html"),
        },
      },
      css: {
        test: /\.s?css(\?.*)?$/i,
        // webpackCfg output.cssFilename and output.hashDigestLength don't work for css. Tested with HtmlBundlerPlugin 4.10.2
        filename: relative(projectOutputPath, join(outputCssPath, "[name].[contenthash:9].css")),
      },
      preprocessor: false,
      /** @see https://github.com/webdiscus/html-bundler-webpack-plugin?tab=readme-ov-file#option-loader-options */
      loaderOptions: {
        sources: [
          {
            tag: "meta",
            attributes: ["content"],
            filter({ attributes }) {
              if (attributes.content) {
                return imgRegExp.test(attributes.content);
              }

              return false;
            },
          },
          {
            tag: "a",
            attributes: ["href"],
            filter({ attributes }) {
              if (attributes.href) {
                return imgRegExp.test(attributes.href);
              }

              return false;
            },
          },
        ],
      },
      minify: isProduction(),
      minifyOptions: htmlTerserConfig,
      hotUpdate: true,
      verbose: "auto",
      watchFiles: {
        paths: [projectSrcPath],
        includes: [/\.([cm]?js|ts|json|html|s?css)(\?.*)?$/i],
      },
    }),
  ],
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        test: /\.*.svg(\?.*)?/i,
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
  devtool: isProduction() ? false : "inline-cheap-source-map",
  devServer: {
    static: {
      directory: projectOutputPath,
      publicPath: "",
    },
    watchFiles: {
      paths: [`${projectSrcPath}/**`],
    },
    hot: true,
    client: {
      progress: true,
    },
  },
  watchOptions: {
    aggregateTimeout: 600,
    poll: 1000,
    ignored: ["**/node_modules/"],
  },
  stats: {
    errorDetails: true,
  },
  infrastructureLogging: {
    level: "verbose",
  },
  // cache: {
  //   type: 'filesystem', // fails with errors
  // }
};

export default webpackConfig;
