/**
 * 此模块用于修复语言的底层缺陷
 */
import { avalon, ohasOwn, ap, _slice } from './core'

function isNative(fn) {
    return /\[native code\]/.test(fn)
}

/* istanbul ignore if*/
if (!isNative('司徒正美'.trim)) {
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
    String.prototype.trim = function() {
        return this.replace(rtrim, '')
    }
}
if (!Object.create) {
    Object.create = (function() {
        function F() {}

        return function(o) {
            if (arguments.length != 1) {
                throw new Error('Object.create implementation only accepts one parameter.');
            }
            F.prototype = o;
            return new F()
        }
    })()
}

/* istanbul ignore next*/
function iterator(vars, body, ret) {
    var fun = 'for(var ' + vars + 'i=0,n = this.length; i < n; i++){' +
        body.replace('_', '((i in this) && fn.call(scope,this[i],i,this))') +
        '}' + ret
        /* jshint ignore:start */
    return Function('fn,scope', fun)
        /* jshint ignore:end */
}
/* istanbul ignore if*/
if (!isNative(ap.map)) {
    avalon.shadowCopy(ap, {
        //定位操作，返回数组中第一个等于给定参数的元素的索引值。
        indexOf: function(item, index) {
            var n = this.length,
                i = ~~index
            if (i < 0)
                i += n
            for (; i < n; i++)
                if (this[i] === item)
                    return i
            return -1
        },
        //定位操作，同上，不过是从后遍历。
        lastIndexOf: function(item, index) {
            var n = this.length,
                i = index == null ? n - 1 : index
            if (i < 0)
                i = Math.max(0, n + i)
            for (; i >= 0; i--)
                if (this[i] === item)
                    return i
            return -1
        },
        //迭代操作，将数组的元素挨个儿传入一个函数中执行。Prototype.js的对应名字为each。
        forEach: iterator('', '_', ''),
        //迭代类 在数组中的每个项上运行一个函数，如果此函数的值为真，则此元素作为新数组的元素收集起来，并返回新数组
        filter: iterator('r=[],j=0,', 'if(_)r[j++]=this[i]', 'return r'),
        //收集操作，将数组的元素挨个儿传入一个函数中执行，然后把它们的返回值组成一个新数组返回。Prototype.js的对应名字为collect。
        map: iterator('r=[],', 'r[i]=_', 'return r'),
        //只要数组中有一个元素满足条件（放进给定函数返回true），那么它就返回true。Prototype.js的对应名字为any。
        some: iterator('', 'if(_)return true', 'return false'),
        //只有数组中的元素都满足条件（放进给定函数返回true），它才返回true。Prototype.js的对应名字为all。
        every: iterator('', 'if(!_)return false', 'return true')
    })

}