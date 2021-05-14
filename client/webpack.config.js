const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    devServer: {
        compress: true,
        contentBase: path.join(__dirname, '/dist'),
        historyApiFallback: true,
        hot: true,
        port: 8000,
        publicPath: "/",
    },
    devtool: 'inline-source-map',
    entry: {
        app: path.join(__dirname, '/src/index.js'),
    },
    mode: 'development',
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.(js|jsx)$/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: ['file-loader']
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, '/dist'),
        publicPath: '/'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '/index.html'),
        }),
    ]
};