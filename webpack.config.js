const path = require('path');

module.exports = {
    mode: "production",
    devtool: 'source-map',
    entry: './node_modules/mediasoup-client/src/index.ts',
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, 'public/javascripts'),
        filename: 'mediasoup-client.js',
        library: 'MediasoupClient',
        libraryTarget: 'umd',
        // libraryExport: ['Device'],
        // globalObject: 'this'
    },
    target: 'web'
};
