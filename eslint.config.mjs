import eslintJs from "@eslint/js";
import globals from "globals";
import eslintTs from "typescript-eslint";

/**
 * Eslint options
 * @see https://eslint.org/docs/latest/use/configure/
 * @type {import('typescript-eslint').ConfigArray}
 */
export default eslintTs.config(
  eslintJs.configs.recommended,
  eslintTs.configs.recommended,
  eslintTs.configs.stylistic,
  {
    rules: {
      "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true, allowDefinitionFiles: true }],
    },
  },
  {
    ignores: ["**/dist"],
  },
  {
    files: ["*.{js,mjs,ts}"],
    ignores: ["**/src/js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/src/js/**/*.{js,mjs}"],
    languageOptions: { globals: globals.browser },
  },
);
