/**
 * Terser options
 * @see https://github.com/terser/terser
 */
const terserConfig = {
    compress: {
        passes: 2,
    },
    format: {
        comments: false,
    },
};
export default terserConfig;
