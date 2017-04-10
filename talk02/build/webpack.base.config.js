'use strict'
/**
 * 公共配置
 */
let webpack = require('webpack');
let path = require('path');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    // 加载器
    module: {
        // https://doc.webpack-china.org/guides/migrating/#module-loaders-module-rules
        rules: [
            // {{#lint}}
            {
                test: /\.(js|vue)$/,
                loader: 'eslint-loader',
                enforce: "pre",
                include: [resolve('src'), resolve('test')],
                // options: {
                //     formatter: require('eslint-friendly-formatter')
                // }
            },
            // {{/lint}}
            {
                // https://vue-loader.vuejs.org/en/configurations/extract-css.html
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        css: 'vue-style-loader!css-loader',
                        less: 'vue-style-loader!css-loader!sass-loader'
                    },
                    postLoaders: {
                        html: 'babel-loader'
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'] //加入.babelrc的babel配置
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader']
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader', 'postcss-loader']
                })
            },
            { test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/, loader: 'url-loader?limit=8192'},
            { test: /\.(html|tpl)$/, loader: 'html-loader' }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
          'vue': 'vue/dist/vue.esm.js',
          '@': resolve('src')
        }
    },
    plugins: [
        //将样式统一发布到master.css中
        new ExtractTextPlugin({
            filename: 'master.css',
            allChunks: true
        })
    ]
};
