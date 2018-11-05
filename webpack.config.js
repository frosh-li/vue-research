const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './v2/src/main.js',
    output: {
        path: path.resolve(__dirname, 'v2/dist'),
        filename: 'vue.js'
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "v2/dist"),
        port: 9000,
        compress: false,
    },
    plugins: [
        new HtmlWebpackPlugin({template: './v2/index.html'}),
        new CopyWebpackPlugin([
            {from: "./v2/index.html", to: "./v2/dist/"}
        ])
    ]
};
