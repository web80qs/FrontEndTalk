'use strict'
/**
 * 本地预览
 */

let path = require('path');
let webpack = require('webpack');
// let ExtractTextPlugin = require('extract-text-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let merge = require('webpack-merge');
let webpackBaseConfig = require('./webpack.base.config.js');
let FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');


module.exports = merge(webpackBaseConfig, {
    // devtool: '#cheap-module-eval-source-map',
    // devtool: '#eval-source-map',
    devtool: '#source-map',
    // 入口
    entry: {
        main: './src/avalon',
    },
    // 输出
    output: {
        path: path.join(__dirname, '../dist'),
        publicPath: '',
        filename: '[name].js',
        chunkFilename: '[name].chunk.js'
    },
    resolve: {
        alias: {
            // vue: 'vue/dist/vue.js'
        }
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({ name: 'vendors', filename: 'vendor.bundle.js' }),
        /*new HtmlWebpackPlugin({
            inject: true,
            filename: path.join(__dirname, '../examples/dist/index.html'),
            template: path.join(__dirname, '../examples/index.html')
        }),*/
        new FriendlyErrorsPlugin()
    ]
});
