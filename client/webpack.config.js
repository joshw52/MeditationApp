const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    devServer: {
        compress: true,
        historyApiFallback: true,
        hot: true,
        port: 8000,
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
            // {
            //     test: /\.(gif|png|jpe?g|svg)$/i,
            //     use: [
            //         'file-loader',
            //         {
            //             loader: 'image-webpack-loader',
            //             options: {
            //                 disable: true, // webpack@2.x and newer
            //             },
            //         },
            //     ],
            // },
            // {
            //     test: /\.(gif|png|jpe?g|svg)$/i,
            //     use: [
            //         {
            //             loader: 'url-loader',
            //             options: {
            //                 limit: 10000,
            //                 esModule: false
            //             },
            //         },
            //     ]
            // }
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