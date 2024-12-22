/**
 * @swc/html minimizer options
 * @see https://github.com/swc-project/swc/blob/main/packages/html/index.ts
 * @type {import("@swc/html").Options}
 */
const swcHtmlConfig = {
  collapseWhitespaces: "smart",
  minifyJs: false,
  minifyCss: false,
};

export default swcHtmlConfig;
