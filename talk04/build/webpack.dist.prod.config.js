'use strict'

let path = require('path');
let webpack = require('webpack');
let merge = require('webpack-merge');
let webpackBaseConfig = require('./webpack.base.config.js');

process.env.NODE_ENV = 'production';

module.exports = merge(webpackBaseConfig, {
    entry: {
        main: './src/avalon.js'
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/dist/',
        filename: 'avalon.min.js',
        library: 'avalon',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    externals: {
        avalon: {
            root: 'avalon',
            commonjs: 'avalon',
            commonjs2: 'avalon',
            amd: 'avalon'
        }
    },
    plugins: [
        // @todo
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': '"production"'
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
});
