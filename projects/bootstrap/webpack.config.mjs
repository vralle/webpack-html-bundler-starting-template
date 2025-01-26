/**
 * Webpack configuration
 */

import { Buffer } from "node:buffer";
import { join, parse, relative } from "node:path";
import { env } from "node:process";
import { URL } from "node:url";
import { styleText } from "node:util";

import webpack from "webpack";

// Plugins
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlBundlerPlugin from "html-bundler-webpack-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import cssMinimizerConfig from "./.webpack/plugins/cssMinimizer.config.mjs";

// Tools
import svgToMiniDataURI from "mini-svg-data-uri";

// Configurations
import { htmlTerserConfig, postcssConfig, svgoConfig, terserConfig } from "@vralle/tool-configs";
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

// biome-ignore lint/complexity/useLiteralKeys: ts noPropertyAccessFromIndexSignature
const isProduction = () => env["NODE_ENV"] === "production";
// biome-ignore lint/complexity/useLiteralKeys: ts noPropertyAccessFromIndexSignature
const PUBLIC_URL = env["PUBLIC_URL"] === undefined ? env["PUBLIC_URL"] : (new URL("/", env["PUBLIC_URL"])).href;

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
    publicPath: PUBLIC_URL || "auto",
    path: projectOutputPath,
    clean: true,
    crossOriginLoading: "anonymous",
    hashDigestLength: 9,
    filename: join(outputJsDir, "[name].[contenthash].js"),
    chunkFilename: join(outputJsDir, isProduction() ? "[id].[contenthash].js" : "[name].[contenthash].js"),
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
              importLoaders: isProduction() ? 2 : 1,
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
               * @type {import('sass-embedded').Options<"sync"|"async">} SassOptions
               */
              sassOptions: {
                loadPaths: ["node_modules", "../../node_modules"],
                style: isProduction() ? "compressed" : "expanded",
                quietDeps: true,
                silenceDeprecations: ["import"],
              },
            },
          },
        ],
      },
      {
        test: /\.svg(\?.*)?$/i,
        type: "asset/inline",
        generator: {
          dataUrl: (/** @type {Buffer} */ content) => {
            return svgToMiniDataURI(content.toString());
          },
        },
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
        filename: join(outputCssDir, "[name].[contenthash:9].css"),
      },
      preload: [
        {
          test: /\.m?js$/i,
          as: "script",
        },
      ],
      integrity: "auto",
      preprocessor: false,
      /** @see https://github.com/webdiscus/html-bundler-webpack-plugin?tab=readme-ov-file#option-loader-options */
      loaderOptions: {
        sources: [
          {
            tag: "meta",
            attributes: ["content"],
            filter({ attributes }) {
              // biome-ignore lint/complexity/useLiteralKeys: ts noPropertyAccessFromIndexSignature
              if (attributes["content"]) {
                // biome-ignore lint/complexity/useLiteralKeys: ts noPropertyAccessFromIndexSignature
                return imgRegExp.test(attributes["content"]);
              }

              return false;
            },
          },
          {
            tag: "a",
            attributes: ["href"],
            filter({ attributes }) {
              // biome-ignore lint/complexity/useLiteralKeys: ts noPropertyAccessFromIndexSignature
              if (attributes["href"]) {
                // biome-ignore lint/complexity/useLiteralKeys: ts noPropertyAccessFromIndexSignature
                return imgRegExp.test(attributes["href"]);
              }

              return false;
            },
          },
        ],
      },
      minify: isProduction(),
      minifyOptions: htmlTerserConfig,
      verbose: "auto",
    }),
    new webpack.DefinePlugin({
      "process.env.PUBLIC_URL": PUBLIC_URL ? JSON.stringify(PUBLIC_URL) : "",
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
    },
    watchFiles: [`${projectSrcPath}/**/*.{html,scss,svg}`],
  },
  watchOptions: {
    poll: true,
    ignored: ["**/node_modules/**"],
  },
  stats: {
    errorDetails: true,
  },
  infrastructureLogging: {
    level: "verbose",
  },
};

export default webpackConfig;
