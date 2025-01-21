import type { Config } from "svgo";

/**
 * SVGO options
 * @see https://github.com/svg/svgo
 */
const svgoConfig: Config = {
  multipass: true,
  plugins: [
    "removeDimensions",
    {
      name: "cleanupNumericValues",
      params: {
        floatPrecision: 3,
        leadingZero: true,
        defaultPx: true,
        convertToPx: true,
      },
    },
    {
      name: "preset-default",
      params: {
        overrides: {
          removeUnknownsAndDefaults: {
            unknownContent: true,
            unknownAttrs: true,
            defaultAttrs: true,
            uselessOverrides: true,
            keepDataAttrs: true,
            keepAriaAttrs: true,
            keepRoleAttr: true,
          },
          removeViewBox: false,
        },
      },
    },
  ],
};

export default svgoConfig;
