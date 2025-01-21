import { dirname, join } from "node:path";
import url from "node:url";

/**
 * @typedef {Object} ProjectPaths
 * @property {string} root Absolute path to the root directory
 * @property {string} src Absolute path to the directory with the sources
 * @property {string} output Absolute path to the output directory
 * @property {string} outputAssetDir Relative path to the output asset directory
 */

const __filename = url.fileURLToPath(new URL(import.meta.url));
const __dirname = dirname(__filename);

const root = join(__dirname, "..");

/** @type {ProjectPaths} */
const projectPaths = {
  root,
  src: join(root, "src"),
  output: join(root, "dist"),
  outputAssetDir: "static",
};

export default projectPaths;
