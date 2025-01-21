import type { Options } from "@swc/html";

/**
 * @swc/html minimizer options
 * @see https://github.com/swc-project/swc/blob/main/packages/html/index.ts
 */
const swcHtmlConfig: Options = {
  minifyJson: true,
  minifyJs: true,
  minifyCss: true,
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
