/**
 * PostCss config
 * @see https://github.com/postcss/postcss-load-config
 */
const postcssConfig = {
    map: false,
    plugins: {
        autoprefixer: {
            cascade: false,
        },
    },
};
export default postcssConfig;
