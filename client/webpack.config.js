const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const API = process.env.NODE_ENV === 'production' ? 'https://meditate-app-js.herokuapp.com/' : 'http://localhost:8080/';

module.exports = {
    devServer: {
        compress: true,
        headers: {
            'X-Frame-Options': 'sameorigin'
        },
        historyApiFallback: true,
        hot: true,
        port: 8000,
        proxy: {
            '/api': API,
        },
        static: path.resolve(__dirname, './dist'),
    },
    devtool: 'inline-source-map',
    entry: path.resolve(__dirname, './src/index.js'),
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './index.html'),
        }),
    ]
};