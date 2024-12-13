/** @type {import('stylelint').Config} */
export default {
  extends: 'stylelint-config-twbs-bootstrap',
  cache: true,
  ignoreFiles: [
    "dist/**"
  ],
  overrides: [
    {
      files: [
        "*.html"
      ],
      extends: [
        "stylelint-config-html"
      ]
    },
  ],
};
