/**
 * @swc/html minimizer options
 * @see https://github.com/swc-project/swc/blob/main/packages/html/index.ts
 * @type {import("@swc/html").Options}
 */
const swcHtmlConfig = {
  minifyJson: false,
  minifyJs: false,
  minifyCss: false,
  collapseWhitespaces: "smart",
  removeComments: true,
  removeRedundantAttributes: "smart",
  collapseBooleanAttributes: true,
  normalizeAttributes: true,
  sortSpaceSeparatedAttributeValues: false,
  sortAttributes: true,
  quotes: true,
  // tagOmission can cause unexpected results.
  tagOmission: false,
};

export default swcHtmlConfig;
