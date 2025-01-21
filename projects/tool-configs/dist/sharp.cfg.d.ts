import type { AvifOptions, GifOptions, HeifOptions, Jp2Options, JpegOptions, JxlOptions, PngOptions, RawOptions, TiffOptions, WebpOptions } from "sharp";
interface SharpEncodeOptions {
    avif?: AvifOptions;
    gif?: GifOptions;
    heif?: HeifOptions;
    jp2?: Jp2Options;
    jpeg?: JpegOptions;
    jxl?: JxlOptions;
    png?: PngOptions;
    raw?: RawOptions;
    tiff?: TiffOptions;
    webp?: WebpOptions;
}
/**
 * sharp.js options
 * @see https://sharp.pixelplumbing.com/api-output
 */
declare const sharpEncodeOptions: SharpEncodeOptions;
export default sharpEncodeOptions;
