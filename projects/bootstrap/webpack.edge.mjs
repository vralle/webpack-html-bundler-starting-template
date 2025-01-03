/**
 * Webpack configuration
 */

import { join, parse, relative } from "node:path";
import process from "node:process";
import { styleText } from "node:util";

// Plugins
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlBundlerPlugin from "html-bundler-webpack-plugin";
import HtmlMinimizerPlugin from "html-minimizer-webpack-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import { SwcMinifyWebpackPlugin } from "swc-minify-webpack-plugin";

import browserslist from "browserslist";
import * as lightningcss from "lightningcss";

// Configurations of tools
import svgoConfig from "./configs/svgo.config.mjs";
import swcHtmlConfig from "./configs/swcHtml.config.mjs";
/** Leave browserslist args empty to load .browserslistrc or set it directly */
const browsersData = browserslist();

import projectPaths from "./configs/projectPaths.mjs";

/**
 * @typedef {import('webpack').Module} Module
 * @typedef {import('webpack').Configuration} WebpackConfig
 * @typedef {import('webpack-dev-server').Configuration} DevServerConfig
 */

// Project configuration
const projectPath = projectPaths.root;
const projectSrcPath = projectPaths.src;
const projectOutputPath = projectPaths.output;
const outputAssetPath = join(projectOutputPath, "static");
const outputJsDir = join(projectPaths.outputAssetDir, "js");
const outputCssDir = join(projectPaths.outputAssetDir, "css");
const outputImgDir = join(projectPaths.outputAssetDir, "img");
/** Copy directory structure from source image path */
const copySrcImgDirStructure = true;

const isProduction = () => process.env["NODE_ENV"] === "production";

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
    filename: join(outputJsDir, "[name].[contenthash].js"),
    chunkFilename({ filename }) {
      const outputFilename = "[id].js";
      if (filename === undefined) {
        return join(outputJsDir, outputFilename);
      }
      const basename = parse(filename).base;
      return join(outputJsDir, basename);
    },
    cssFilename: join(outputCssDir, "[name].[contenthash].css"),
    assetModuleFilename: ({ filename }) => {
      const outputFilename = "[name][ext]";

      if (!copySrcImgDirStructure || filename === undefined) {
        return join(outputImgDir, outputFilename);
      }

      // Copy the directory structure of the file path
      const relPath = relative(join(projectSrcPath, "img"), filename);
      const parsedPath = parse(relPath);
      const dir = parsedPath.dir.toLowerCase();

      // Avoid uppercase file names.
      // Caution: Control source file names to avoid file name collisions.
      const name = parsedPath.name.toLowerCase();

      const filePath = join(dir, `${name}[ext][query]`);
      const outputFilePath = join(outputImgDir, filePath);

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
          loader: "swc-loader",
          /** @see https://swc.rs/docs/usage/swc-loader */
          options: {
            env: {
              targets: browsersData,
            },
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
              importLoaders: isProduction() ? 0 : 1,
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
               * @type {import('sass-embedded').Options<"sync"|"async">} SassOptions
               */
              sassOptions: {
                loadPaths: ["node_modules", "../../node_modules"],
                style: isProduction() ? "compressed" : "expanded",
                quietDeps: true,
              },
            },
          },
        ],
      },
      {
        test: imgRegExp,
        type: "asset",
        include: projectSrcPath,
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
        filename: join(outputCssDir, "[name].[contenthash:9].css"),
      },
      preprocessor: false,
      /** @see https://github.com/webdiscus/html-bundler-webpack-plugin?tab=readme-ov-file#option-loader-options */
      loaderOptions: {
        sources: [
          {
            tag: "meta",
            attributes: ["content"],
            filter({ attributes }) {
              if (attributes["content"]) {
                return imgRegExp.test(attributes["content"]);
              }

              return false;
            },
          },
          {
            tag: "a",
            attributes: ["href"],
            filter({ attributes }) {
              if (attributes["href"]) {
                return imgRegExp.test(attributes["href"]);
              }

              return false;
            },
          },
        ],
      },
      minify: false,
      hotUpdate: true,
      verbose: "auto",
      watchFiles: {
        paths: [projectSrcPath],
        includes: [/\.([cm]?js|ts|json|html|s?css)(\?.*)?$/i],
        excludes: [/node_modules/],
      },
    }),
  ],
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        test: /\.*.svg(\?.*)?/i,
        include: join(projectSrcPath, "img"),
        exclude: "**/node_modules*/**",
        deleteOriginalAssets: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.svgoMinify,
          options: {
            encodeOptions: svgoConfig,
          },
        },
      }),
      new SwcMinifyWebpackPlugin(),
      new HtmlMinimizerPlugin({
        minify: HtmlMinimizerPlugin.swcMinify,
        // @ts-ignore
        minimizerOptions: swcHtmlConfig,
      }),
      new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.lightningCssMinify,
        /** @type {import('css-minimizer-webpack-plugin').CustomOptions} */
        minimizerOptions: {
          /** @see https://lightningcss.dev/transpilation.html */
          targets: lightningcss.browserslistToTargets(browsersData),
        },
      }),
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
    ignored: ["node_modules/**"],
  },
  stats: {
    errorDetails: true,
  },
  infrastructureLogging: {
    level: "verbose",
  },
};

export default webpackConfig;
