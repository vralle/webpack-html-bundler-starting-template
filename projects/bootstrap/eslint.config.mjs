import pluginJs from "@eslint/js";
import globals from "globals";

/**
 * Eslint options
 * @see https://eslint.org/docs/latest/use/configure/
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  pluginJs.configs.recommended,
  {
    ignores: ["dist/**"],
  },
  {
    files: ["**/*.{js,mjs,ts}"],
    ignores: ["src/js/**"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/js/**/*.{js,mjs,ts}"],
    languageOptions: { globals: globals.browser },
  },
];
