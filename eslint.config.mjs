import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Eslint options
 * @see https://eslint.org/docs/latest/use/configure/
 * @type {import('typescript-eslint').ConfigArray}
 */
export default tseslint.config(
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ["**/dist/**"],
  },
  {
    files: ["**/*.{js,mjs}"],
    ignores: ["**/src/js/**"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/src/js/**/*.{js,mjs}"],
    languageOptions: { globals: globals.browser },
  },
);
