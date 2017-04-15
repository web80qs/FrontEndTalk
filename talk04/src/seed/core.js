import { win, document, msie, inBrowser, root, modern } from './browser'
import { Cache } from './cache'
import { directive, directives, delayCompileNodes } from './directive'

let begin = '==========================######==========================='

export var window = win
export function avalon(el) { //首次调用在lang.compact.js 的 for (enu in avalon({}))
    return new avalon.init(el)
}

avalon.init = function (el) {
    this[0] = this.element = el
}

avalon.fn = avalon.prototype = avalon.init.prototype

// console.log( avalon({}) )

export function shadowCopy(destination, source) {
    for (var property in source) {
        destination[property] = source[property]
    }
    return destination
}

export var rword = /[^, ]+/g
export var rnowhite = /\S+/g //存在非空字符
export var platform = {} //用于放置平台差异的方法与属性
export var isArray = function (target) {
    return avalon.type(target) === 'array'
}

//oneObject('div,ul,ol,dl,table,h1,h2,h3,h4,h5,h6,form,fieldset')
//return Object {div: 1, ul: 1, ol: 1, dl: 1, table: 1…}
export function oneObject(array, val) {
    if (typeof array === 'string') {
        array = array.match(rword) || []
    }
    var result = {},
        value = val !== void 0 ? val : 1
    for (var i = 0, n = array.length; i < n; i++) {
        result[array[i]] = value
    }
    return result
}

var op = Object.prototype
export function quote(str) {
    return avalon._quote(str)
}
export var inspect = op.toString
export var ohasOwn = op.hasOwnProperty
export var ap = Array.prototype

var hasConsole = typeof console === 'object'
avalon.config = { debug: true }
export {
    Cache, directive, directives, delayCompileNodes,
    document, root, msie, modern, inBrowser
}

export function log() {
    if (hasConsole && avalon.config.debug) {
        Function.apply.call(console.log, console, arguments)
    }
}

export function warn() {
    if (hasConsole && avalon.config.debug) {
        var method = console.warn || console.log
        // http://qiang106.iteye.com/blog/1721425
        Function.apply.call(method, console, arguments)
    }
}
export function error(str ,e) {
    throw (e || Error)(str)
}
export function noop() { }
export function isObject(a) {
    return a !== null && typeof a === 'object'
}

export var _slice = ap.slice
export function slice(nodes, start, end) {
    return _slice.call(nodes, start, end)
}

var rhashcode = /\d\.\d{4}/
//生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
export function makeHashCode(prefix) {
    /* istanbul ignore next*/
    prefix = prefix || 'avalon'
    /* istanbul ignore next*/
    return String(Math.random() + Math.random()).replace(rhashcode, prefix)
}

var rescape = /[-.*+?^${}()|[\]\/\\]/g
export function escapeRegExp(target) {
    //http://stevenlevithan.com/regex/xregexp/
    //将字符串安全格式化为正则表达式的源码
    return (target + '').replace(rescape, '\\$&')
}

export function createFragment() {
    /* istanbul ignore next  */
    return document.createDocumentFragment()
}

var rentities = /&[a-z0-9#]{2,10};/
var temp = document.createElement('div')
shadowCopy(avalon, {
    Array: {
        merge: function (target, other) {
            //合并两个数组 avalon2新增
            target.push.apply(target, other)
        },
        ensure: function (target, item) {
            //只有当前数组不存在此元素时只添加它
            if (target.indexOf(item) === - 1) {
                return target.push(item)
            }
        },
        removeAt: function (target, index) {
            //移除数组中指定位置的元素，返回布尔表示成功与否
            return !!target.splice(index, 1).length
        },
        remove: function (target, item) {
            //移除数组中第一个匹配传参的那个元素，返回布尔表示成功与否
            var index = target.indexOf(item)
            if (~index)
                return avalon.Array.removeAt(target, index)
            return false
        }
    },
    evaluatorPool: new Cache(888),
    parsers: {
        number: function (a) {
            return a === '' ? '' : parseFloat(a) || 0
        },
        string: function (a) {
            return a === null || a === void 0 ? '' : a + ''
        },
        boolean: function (a) {
            if (a === '')
                return a
            return a === 'true' || a === '1'
        }
    },
    _decode: function _decode(str) {
        if (rentities.test(str)) {
            temp.innerHTML = str
            return temp.innerText || temp.textContent
        }
        return str
    }
})

//============== config ============
export function config(settings) {
    for (var p in settings) {
        var val = settings[p]
        if (typeof config.plugins[p] === 'function') {
            config.plugins[p](val)
        } else {
            config[p] = val
        }
    }
    return this
}


var plugins = {
    interpolate: function (array) {
        var openTag = array[0]
        var closeTag = array[1]
        if (openTag === closeTag) {
            throw new SyntaxError('interpolate openTag cannot equal to closeTag')
        }
        var str = openTag + 'test' + closeTag

        if (/[<>]/.test(str)) {
            throw new SyntaxError('interpolate cannot contains "<" or ">"')
        }

        config.openTag = openTag
        config.closeTag = closeTag
        var o = escapeRegExp(openTag)
        var c = escapeRegExp(closeTag)

        // console.log(o) // \{\{
        // console.log(c) // \}\}

        config.rtext = new RegExp(o + '(.+?)' + c, 'g')
        config.rexpr = new RegExp(o + '([\\s\\S]*)' + c)

        // console.log(config.rtext); // /\{\{(.+?)\}\}/g
        // console.log(config.rexpr); // /\{\{([\s\S]*)\}\}/
    }
}
export function createAnchor(nodeValue){
    return document.createComment(nodeValue)
}
config.plugins = plugins
config({
    interpolate: ['{{', '}}'],
    debug: true
})

/*console.warn('config >>')
console.dir(config)
console.warn('<< config')*/
//============  end config ============

shadowCopy(avalon, {
    shadowCopy: shadowCopy,

    oneObject,
    inspect,
    ohasOwn,
    rword,

    version: "2.2.5",
    vmodels: {},

    directives,
    directive,

    log: log,
    noop: noop,
    warn: warn,
    error: error,
    config: config,

    quote,

    makeHashCode: makeHashCode
});

console.warn('avalon >>')
console.dir(avalon)
console.warn('<< avalon')
window.avalon = avalon