const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DelWebpackPlugin = require('del-webpack-plugin');

module.exports = (env, options) => {
    const dotenv = new Dotenv();
    const isProd = options.mode === 'production';

    return {
        entry: {
            "dm-ce": "./src/entries/dm-embed.ts",
            "dm-amp": "./src/entries/amp/dm-amp.ts",
            'dm-no-cpe': "./src/entries/no-cpe/dm-no-cpe.ts",
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProd ? '[name].min.js' : '[name].js',
            chunkFilename: isProd ? '[id].min.chunk.js' : '[id].chunk.js',
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.((c|sa|sc)ss)$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        'style-loader',
                        // Translates CSS into CommonJS
                        'css-loader',
                        // Compiles Sass to CSS
                        'sass-loader',
                        'postcss-loader',
                    ],
                },
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Dailymotion Video Embed',
                template: 'src/entries/index.html',
                filename: 'index.html',
                chunks: ['dm-ce'],
                showErrors: isProd ? false : true,
                minify: isProd ? {
                    html5: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    minifyURLs: false,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributese: true,
                    useShortDoctype: true
                } : false,
                hash: false
            }),
            new HtmlWebpackPlugin({
                title: 'Dailymotion Multiple Video Embed',
                template: 'src/entries/multiple/index.html',
                filename: 'multiple/index.html',
                chunks: ['dm-ce'],
                showErrors: isProd ? false : true,
                minify: isProd ? {
                    html5: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    minifyURLs: false,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributese: true,
                    useShortDoctype: true
                } : false,
                hash: false
            }),
            new HtmlWebpackPlugin({
                title: 'Dailymotion Infinity Scroll Video Embed',
                template: 'src/entries/infinity-scroll/index.html',
                filename: 'infinity-scroll/index.html',
                chunks: ['dm-ce'],
                showErrors: isProd ? false : true,
                minify: isProd ? {
                    html5: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    minifyURLs: false,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributese: true,
                    useShortDoctype: true
                } : false,
                hash: false
            }),
            new HtmlWebpackPlugin({
                title: 'Dailymotion Player AMP',
                template: 'src/entries/dm-player.html',
                filename: 'dm-player.html',
                chunks: ['dm-amp'],
                showErrors: isProd ? false : true,
                minify: isProd ? {
                    html5: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    minifyURLs: false,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributese: true,
                    useShortDoctype: true
                } : false,
                hash: false
            }),
            new HtmlWebpackPlugin({
                title: 'Dailymotion AMP Video Embed',
                template: 'src/entries/amp/index.html',
                filename: 'amp/index.html',
                excludeChunks: ['dm-ce', 'dm-amp', 'dm-no-cpe'],
                showErrors: isProd ? false : true,
                minify: isProd ? {
                    html5: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    minifyURLs: false,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributese: true,
                    useShortDoctype: true
                } : false,
                hash: false
            }),
            new HtmlWebpackPlugin({
                title: 'Dailymotion private video',
                template: 'src/entries/private-video/index.html',
                filename: 'private-video/index.html',
                chunks: ['dm-ce'],
                showErrors: isProd ? false : true,
                minify: isProd ? {
                    html5: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    minifyURLs: false,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributese: true,
                    useShortDoctype: true
                } : false,
                hash: false
            }),
            new HtmlWebpackPlugin({
                title: 'Dailymotion No CPE Video Embed',
                template: 'src/entries/no-cpe/index.html',
                filename: 'no-cpe/index.html',
                chunks: ['dm-no-cpe'],
                showErrors: isProd ? false : true,
                minify: isProd ? {
                    html5: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    minifyURLs: false,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributese: true,
                    useShortDoctype: true
                } : false,
                hash: false
            }),
            new HtmlWebpackPlugin({
                title: 'Dailymotion Video with Playlist out the player',
                template: 'src/entries/playlist/index.html',
                filename: 'playlist/index.html',
                chunks: ['dm-ce'],
                showErrors: isProd ? false : true,
                minify: isProd ? {
                    html5: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    minifyURLs: false,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributese: true,
                    useShortDoctype: true
                } : false,
                hash: false
            }),
            // new DelWebpackPlugin({
            //     include: ['**'],
            //     exclude: [],
            //     info: true,
            //     keepGeneratedAssets: true,
            //     allowExternal: false
            // }),
            dotenv
        ]
    }
}