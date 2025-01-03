/**
 * @swc/html minimizer options
 * @see https://github.com/swc-project/swc/blob/main/packages/html/index.ts
 * @type {import("@swc/html").Options}
 */
const swcHtmlConfig = {
  minifyJson: false,
  minifyJs: false,
  minifyCss: true,
  collapseWhitespaces: "smart",
  removeComments: true,
  normalizeAttributes: true,
  sortSpaceSeparatedAttributeValues: false,
  sortAttributes: true,
  // Omitting quotes or closing tags can cause unexpected results.
  quotes: true,
  tagOmission: false,
};

export default swcHtmlConfig;
