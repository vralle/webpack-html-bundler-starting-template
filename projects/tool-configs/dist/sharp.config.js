/**
 * sharp.js options
 * @see https://sharp.pixelplumbing.com/api-output
 */
const sharpEncodeOptions = {
    jpeg: {
        quality: 60,
        chromaSubsampling: "4:2:0",
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
        preset: "photo", // one of: default, photo, picture, drawing, icon, text
    },
};
export default sharpEncodeOptions;
