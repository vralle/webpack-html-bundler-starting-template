/**
 * @typedef {object} SharpEncodeOptions
 * @property {import('sharp').AvifOptions} [avif]
 * @property {import('sharp').GifOptions} [gif]
 * @property {import('sharp').HeifOptions} [heif]
 * @property {import('sharp').Jp2Options} [jp2]
 * @property {import('sharp').JpegOptions} [jpeg]
 * @property {import('sharp').JxlOptions} [jxl]
 * @property {import('sharp').PngOptions} [png]
 * @property {import('sharp').RawOptions} [raw]
 * @property {import('sharp').TiffOptions} [tiff]
 * @property {import('sharp').WebpOptions} [webp]
 */

/**
 * sharp.js options
 * @see https://sharp.pixelplumbing.com/api-output
 * @type {SharpEncodeOptions}
 */
const sharpEncodeOptions = {
  jpeg: {
    quality: 60,
    chromaSubsampling: '4:2:0',
  },
  png: {
    compressionLevel: 9,
    palette: true,
    adaptiveFiltering: true,
    quality: 92,
  },
  webp: {
    quality: 60, // default 80
    alphaQuality: 100,
    smartSubsample: true,
    preset: 'photo', // one of: default, photo, picture, drawing, icon, text
  },
};

export default sharpEncodeOptions;
