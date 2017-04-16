// import rollup from 'rollup';
// import fs from 'fs';
import babel from 'rollup-plugin-babel';
// import { transform } from 'es3ify';
import eslint from 'rollup-plugin-eslint';
import sourcemaps from 'rollup-plugin-sourcemaps';

let less = function(a) { return a } //require('semicolon-less')

// used to track the cache for subsequent bundles
let cache;
let json = require('./package.json')
let v = 'version:' + JSON.stringify(json.version)


export default {
    // The bundle's starting point. This file will be
    // included, along with the minimum necessary code
    // from its dependencies

    entry: 'src/avalon.js',
    dest: 'dist/avalon.js',
    // If you have a bundle you want to re-use (e.g., when using a watcher to rebuild as files change),
    // you can tell rollup use a previous bundle as its starting point.
    // This is entirely optional!
    // format: 'iife',
    format: 'umd',
    moduleName: 'avalon',

    sourceMap: 'inline',
    cache: cache,

    plugins: [
        sourcemaps(),
        eslint({
            include: [
                'src/**',
            ]
        }),
        babel({
            exclude: 'node_modules/**',
        }),
    ]
}