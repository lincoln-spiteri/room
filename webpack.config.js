const path = require('path');

module.exports = {
    mode: "development",
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
        filename: 'mediasoup-client.js'
    }
};
