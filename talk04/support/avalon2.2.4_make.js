/*!
built in 2017-1-10:21:14 version 2.2.4 by 司徒正美
https://github.com/RubyLouvre/avalon/tree/2.2.4
修正IE下 orderBy BUG
更改下载Promise的提示
修复avalon.modern 在Proxy 模式下使用ms-for 循环对象时出错的BUG
修复effect内部传参 BUG
重构ms-validate的绑定事件的机制
*/(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.avalon = factory();
})(this, function () {
	'use strict';

	var win = typeof window === 'object' ? window : typeof global === 'object' ? global : {};

	var inBrowser = !!win.location && win.navigator;
	/* istanbul ignore if  */

	var document$1 = inBrowser ? win.document : {
		createElement: Object,
		createElementNS: Object,
		documentElement: 'xx',
		contains: Boolean
	};
	var root = inBrowser ? document$1.documentElement : {
		outerHTML: 'x'
	};

	var versions = {
		objectobject: 7, //IE7-8
		objectundefined: 6, //IE6
		undefinedfunction: NaN, // other modern browsers
		undefinedobject: NaN };
	/* istanbul ignore next  */
	var msie = document$1.documentMode || versions[typeof document$1.all + typeof XMLHttpRequest];

	var modern = /NaN|undefined/.test(msie) || msie > 8;

    // if (1) {
        var delayCompile = {};

        var window$1 = win;
        function avalon(el) {
            return new avalon.init(el);
        }

        avalon.init = function (el) {
            this[0] = this.element = el;
        };

        avalon.fn = avalon.prototype = avalon.init.prototype;

    // }/*(1)*/

    // if (2) {
    
        function shadowCopy(destination, source) {
            for (var property in source) {
                destination[property] = source[property];
            }
            return destination;
        }
        var rword = /[^, ]+/g;
        var rnowhite = /\S+/g; //存在非空字符
        var platform = {}; //用于放置平台差异的方法与属性

        var op = Object.prototype;
        function quote(str) {
            return avalon._quote(str);
        }
        var inspect = op.toString;
        var ohasOwn = op.hasOwnProperty;
        var ap = Array.prototype;

        var hasConsole = typeof console === 'object';
        avalon.config = { debug: true };

        function log() {
            if (hasConsole && avalon.config.debug) {
                Function.apply.call(console.log, console, arguments);
            }
        }
        function warn() {
            if (hasConsole && avalon.config.debug) {
                var method = console.warn || console.log;
                // http://qiang106.iteye.com/blog/1721425
                Function.apply.call(method, console, arguments);
            }
        }
        function error(str, e) {
            throw (e || Error)(str);
        }
        function noop() {}
        function isObject(a) {
            return a !== null && typeof a === 'object';
        }

    // }/*(2)*/

    // if (7) {
        var rhashcode = /\d\.\d{4}/;
        //生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        function makeHashCode(prefix) {
            /* istanbul ignore next*/
            prefix = prefix || 'avalon';
            /* istanbul ignore next*/
            return String(Math.random() + Math.random()).replace(rhashcode, prefix);
        }
    // }/*(7)*/

    // if (3) {
        var rescape = /[-.*+?^${}()|[\]\/\\]/g;
        function escapeRegExp(target) {
            //http://stevenlevithan.com/regex/xregexp/
            //将字符串安全格式化为正则表达式的源码
            return (target + '').replace(rescape, '\\$&');
        }

        window$1.avalon = avalon;

        //============== config ============
        function config(settings) {
            for (var p in settings) {
                var val = settings[p];
                if (typeof config.plugins[p] === 'function') {
                    config.plugins[p](val);
                } else {
                    config[p] = val;
                }
            }
            return this;
        }

        var plugins = {
            interpolate: function interpolate(array) {
                // console.log(array);
                var openTag = array[0];
                var closeTag = array[1];
                if (openTag === closeTag) {
                    throw new SyntaxError('interpolate openTag cannot equal to closeTag');
                }
                var str = openTag + 'test' + closeTag;

                if (/[<>]/.test(str)) {
                    throw new SyntaxError('interpolate cannot contains "<" or ">"');
                }

                config.openTag = openTag;
                config.closeTag = closeTag;
                var o = escapeRegExp(openTag);
                var c = escapeRegExp(closeTag);

                // console.log(o); // \{\{
                // console.log(c); // \}\}

                config.rtext = new RegExp(o + '(.+?)' + c, 'g');
                config.rexpr = new RegExp(o + '([\\s\\S]*)' + c);
                // console.log(config.rtext); // /\{\{(.+?)\}\}/g
                // console.log(config.rexpr); // /\{\{([\s\S]*)\}\}/
            }
        };
        function createAnchor(nodeValue) {
            return document$1.createComment(nodeValue);
        }
        config.plugins = plugins;
        config({
            interpolate: ['{{', '}}'],
            debug: true
        });
        // console.dir(config);

        shadowCopy(avalon, {
            shadowCopy: shadowCopy,

            version: "2.2.4",
            vmodels: {},

            log: log,
            noop: noop,
            warn: warn,
            error: error,
            config: config,

            makeHashCode: makeHashCode
        });

        //============== end config ============
    // }/*(3)*/


    // if (8) {
        /**
        *
        与Computed等共享UUID
        */
        var obid = 1;
        function Mutation(expr, value, vm) {
            //构造函数
            this.expr = expr;
            if (value) {
                var childVm = platform.createProxy(value, this);
                if (childVm) {
                    value = childVm;
                }
            }
            this.value = value;
            this.vm = vm;
            try {
                vm.$mutations[expr] = this;
            } catch (ignoreIE) {}
            this.uuid = ++obid;
            this.updateVersion();
            this.mapIDs = {};
            this.observers = [];
        }

        Mutation.prototype = {
            get: function get() {
                if (avalon.trackingAction) {
                    this.collect(); //被收集
                    var childOb = this.value;
                    if (childOb && childOb.$events) {
                        if (Array.isArray(childOb)) {
                            childOb.forEach(function (item) {
                                if (item && item.$events) {
                                    item.$events.__dep__.collect();
                                }
                            });
                        } else if (avalon.deepCollect) {
                            for (var key in childOb) {
                                if (childOb.hasOwnProperty(key)) {
                                    var collectIt = childOb[key];
                                }
                            }
                        }
                    }
                }
                return this.value;
            },
            collect: function collect() {
                avalon.track(name, '被收集');
                reportObserved(this);
            },
            updateVersion: function updateVersion() {
                this.version = Math.random() + Math.random();
            },
            notify: function notify() {
                transactionStart();
                propagateChanged(this);
                transactionEnd();
            },
            set: function set(newValue) {
                var oldValue = this.value;
                if (newValue !== oldValue) {
                    if (avalon.isObject(newValue)) {
                        var hash = oldValue && oldValue.$hashcode;
                        var childVM = platform.createProxy(newValue, this);
                        if (childVM) {
                            if (hash) {
                                childVM.$hashcode = hash;
                            }
                            newValue = childVM;
                        }
                    }
                    this.value = newValue;
                    this.updateVersion();
                    this.notify();
                }
            }
        };
    // }


    // if (4) {

        /**
         * 这里放置ViewModel模块的共用方法
         * avalon.define: 全框架最重要的方法,生成用户VM
         * IProxy, 基本用户数据产生的一个数据对象,基于$model与vmodel之间的形态
         * modelFactory: 生成用户VM
         * canHijack: 判定此属性是否该被劫持,加入数据监听与分发的的逻辑
         * createProxy: listFactory与modelFactory的封装
         * createAccessor: 实现数据监听与分发的重要对象
         * itemFactory: ms-for循环中产生的代理VM的生成工厂
         * fuseFactory: 两个ms-controller间产生的代理VM的生成工厂
         */

        /*var vm = avalon.define({
            $id: "test",
            name: "司徒正美",
            array: [11,22,33]
        });*/

        avalon.define = function (definition) {
            var $id = definition.$id;
            if (!$id) {
                avalon.error('vm.$id must be specified');
            }
            if (avalon.vmodels[$id]) {
                avalon.warn('error:[' + $id + '] had defined!');
            }
            var vm = platform.modelFactory(definition);
            /*return avalon.vmodels[$id] = vm;*/
        };
    // }/*(4)*/


    // if (5) {
    
        /**
         * 在未来的版本,avalon改用Proxy来创建VM,因此
         */

        function IProxy(definition, dd) {
            avalon.mix(this, definition);
            avalon.mix(this, $$skipArray);
            this.$hashcode = avalon.makeHashCode('$');
            this.$id = this.$id || this.$hashcode;
            // console.log(this); //IProxy {$id: "test", name: "司徒正美", array10: Array[3], a: 1, $b: 2…}
            this.$events = {
                __dep__: dd || new Mutation(this.$id)
            };
            /*if (avalon.config.inProxyMode) {
                delete this.$mutations;
                this.$accessors = {};
                this.$computed = {};
                this.$track = '';
            } else {
                this.$accessors = {
                    $model: modelAccessor
                };
            }
            if (dd === void 0) {
                this.$watch = platform.watchFactory(this.$events);
                this.$fire = platform.fireFactory(this.$events);
            } else {
                delete this.$watch;
                delete this.$fire;
            }*/
        }

        platform.modelFactory = function modelFactory(definition, dd) {
            // definition = {
            //      $id: "test",
            //      name: "司徒正美",
            //      array: [11,22,33]
            //  }
            var $computed = definition.$computed || {}; //从definition中提出$computed对象
            delete definition.$computed;

            var core = new IProxy(definition, dd);
            var $accessors = core.$accessors;
            var keys = [];

            platform.hideProperty(core, '$mutations', {});

            for (var key in definition) {
                if (key in $$skipArray) continue;
                var val = definition[key];
                keys.push(key);
                if (canHijack(key, val)) {
                    $accessors[key] = createAccessor(key, val);
                }
            }
            for (var _key in $computed) {
                if (_key in $$skipArray) continue;
                var val = $computed[_key];
                if (typeof val === 'function') {
                    val = {
                        get: val
                    };
                }
                if (val && val.get) {
                    val.getter = val.get;
                    val.setter = val.set;
                    avalon.Array.ensure(keys, _key);
                    $accessors[_key] = createAccessor(_key, val, true);
                }
            }
            //将系统API以unenumerable形式加入vm,
            //添加用户的其他不可监听属性或方法
            //重写$track
            //并在IE6-8中增添加不存在的hasOwnPropert方法
            var vm = platform.createViewModel(core, $accessors, core);
            platform.afterCreate(vm, core, keys, !dd);
            return vm;
        };
    // }/*(5)*/


    // if (9) {
        var $proxyItemBackdoorMap = {};

        function canHijack(key, val, $proxyItemBackdoor) {
            if (key in $$skipArray) return false;
            if (key.charAt(0) === '$') {
                if ($proxyItemBackdoor) {
                    if (!$proxyItemBackdoorMap[key]) {
                        $proxyItemBackdoorMap[key] = 1;
                        avalon.warn('ms-for\u4E2D\u7684\u53D8\u91CF' + key + '\u4E0D\u518D\u5EFA\u8BAE\u4EE5$\u4E3A\u524D\u7F00');
                    }
                    return true;
                }
                return false;
            }
            if (val == null) {
                avalon.warn('定义vmodel时' + key + '的属性值不能为null undefine');
                return true;
            }
            if (/error|date|function|regexp/.test(avalon.type(val))) {
                return false;
            }
            return !(val && val.nodeName && val.nodeType);
        }

        function createProxy(target, dd) {
            if (target && target.$events) {
                return target;
            }
            var vm;
            if (Array.isArray(target)) {
                vm = platform.listFactory(target, false, dd);
            } else if (isObject(target)) {
                vm = platform.modelFactory(target, dd);
            }
            return vm;
        }

        platform.createProxy = createProxy;
    // }/*(9)*/


    // if (10) {
        var _splice = ap.splice;
        var __array__ = {
            set: function set(index, val) {
                if (index >>> 0 === index && this[index] !== val) {
                    if (index > this.length) {
                        throw Error(index + 'set方法的第一个参数不能大于原数组长度');
                    }
                    this.splice(index, 1, val);
                }
            },
            toJSON: function toJSON() {
                //为了解决IE6-8的解决,通过此方法显式地求取数组的$model
                return this.$model = platform.toJson(this);
            },
            contains: function contains(el) {
                //判定是否包含
                return this.indexOf(el) !== -1;
            },
            ensure: function ensure(el) {
                if (!this.contains(el)) {
                    //只有不存在才push
                    this.push(el);
                    return true;
                }
                return false;
            },
            pushArray: function pushArray(arr) {
                return this.push.apply(this, arr);
            },
            remove: function remove(el) {
                //移除第一个等于给定值的元素
                return this.removeAt(this.indexOf(el));
            },
            removeAt: function removeAt(index) {
                //移除指定索引上的元素
                if (index >>> 0 === index) {
                    return this.splice(index, 1);
                }
                return [];
            },
            clear: function clear() {
                this.removeAll();
                return this;
            },
            removeAll: function removeAll(all) {
                //移除N个元素
                var size = this.length;
                var eliminate = Array.isArray(all) ? function (el) {
                    return all.indexOf(el) !== -1;
                } : typeof all === 'function' ? all : false;

                if (eliminate) {
                    for (var i = this.length - 1; i >= 0; i--) {
                        if (eliminate(this[i], i)) {
                            _splice.call(this, i, 1);
                        }
                    }
                } else {
                    _splice.call(this, 0, this.length);
                }
                this.toJSON();
                this.$events.__dep__.notify();
            }
        };

        function hijackMethods(array) {
            for (var i in __array__) {
                platform.hideProperty(array, i, __array__[i]);
            }
        }

        function listFactory(array, stop, dd) {
            if (!stop) {
                hijackMethods(array);
                if (modern) {
                    Object.defineProperty(array, '$model', platform.modelAccessor);
                }
                platform.hideProperty(array, '$hashcode', avalon.makeHashCode('$'));
                platform.hideProperty(array, '$events', { __dep__: dd || new Mutation() });
            }
            var _dd = array.$events && array.$events.__dep__;
            for (var i = 0, n = array.length; i < n; i++) {
                var item = array[i];
                if (isObject(item)) {
                    array[i] = platform.createProxy(item, _dd);
                }
            }
            return array;
        }

        platform.listFactory = listFactory;
    // } /*(10)*/


    // if (11) {
        //如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
        //标准浏览器使用__defineGetter__, __defineSetter__实现
        var canHideProperty = true;
        try {
            Object.defineProperty({}, '_', {
                value: 'x'
            });
            delete $$skipArray.$vbsetter;
            delete $$skipArray.$vbthis;
        } catch (e) {
            /* istanbul ignore next*/
            canHideProperty = false;
        }

        var protectedVB = { $vbthis: 1, $vbsetter: 1 };
        /* istanbul ignore next */
        function hideProperty(host, name, value) {
            if (canHideProperty) {
                Object.defineProperty(host, name, {
                    value: value,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
            } else if (!protectedVB[name]) {
                /* istanbul ignore next */
                host[name] = value;
            }
        }
    // }/*(11)*/

    // if (12) {
        platform.hideProperty = hideProperty;
    // }/*(12)*/

    // if (6) {
    
        var rfunction = /^\s*\bfunction\b/;

        avalon.isFunction = typeof alert === 'object' ? function (fn) {
            try {
                return rfunction.test(fn + '');
            } catch (e) {
                return false;
            }
        } : function (fn) {
            return inspect.call(fn) === '[object Function]'; // inspect 等于 Object.prototype.toString
        };

        // 利用IE678 window == document为true,document == window竟然为false的神奇特性
        // 标准浏览器及IE9，IE10等使用 正则检测
        function isWindowCompact(obj) { //判断IE678
            if (!obj) {
                return false;
            }
            return obj == obj.document && obj.document != obj; //jshint ignore:line
        }

        var rwindow = /^\[object (?:Window|DOMWindow|global)\]$/;

        function isWindowModern(obj) {
            return rwindow.test(inspect.call(obj));
        }

        avalon.isWindow = isWindowModern(avalon.window) ? isWindowModern : isWindowCompact; //返回判断isWindow函数

        var enu;
        var enumerateBUG;
        for (enu in avalon({})) {
            break;
        }

        enumerateBUG = enu !== '0'; //IE6下为true, 其他为false

        /*判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例*/
        function isPlainObjectCompact(obj, key) {
            if (!obj || avalon.type(obj) !== 'object' || obj.nodeType || avalon.isWindow(obj)) {
                return false;
            }
            try {
                //IE内置对象没有constructor
                if (obj.constructor && !ohasOwn.call(obj, 'constructor') && !ohasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                    return false;
                }
                var isVBscript = obj.$vbthis;
            } catch (e) {
                //IE8 9会在这里抛错
                return false;
            }
            if (enumerateBUG) {
                for (key in obj) {
                    return ohasOwn.call(obj, key);
                }
            }
            for (key in obj) {}
            return key === undefined$1 || ohasOwn.call(obj, key);
        }

        function isPlainObjectModern(obj) {
            // 简单的 typeof obj === 'object'检测，会致使用isPlainObject(window)在opera下通不过
            return inspect.call(obj) === '[object Object]' && Object.getPrototypeOf(obj) === Object.prototype;
        }

        //返回 判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例
        avalon.isPlainObject = /\[native code\]/.test(Object.getPrototypeOf) ? isPlainObjectModern : isPlainObjectCompact;

        var rcanMix = /object|function/;

        //与jQuery.extend方法，可用于浅拷贝，深拷贝
        avalon.mix = avalon.fn.mix = function () {
            var n = arguments.length,
                isDeep = false,
                i = 0,
                array = [];
            if (arguments[0] === true) {
                isDeep = true;
                i = 1;
            }
            //将所有非空对象变成空对象
            for (; i < n; i++) {
                var el = arguments[i];
                el = el && rcanMix.test(typeof el) ? el : {};
                array.push(el);
            }
            if (array.length === 1) {
                array.unshift(this);
            }
            // console.log('mix_array', array);
            // console.log('innerExtend', innerExtend(isDeep, array));
            return innerExtend(isDeep, array);
        };

        var undefined$1;

        //类似JQuery的Extend
        function innerExtend(isDeep, array) {
            var target = array[0],
                copyIsArray,
                clone,
                name;
            for (var i = 1, length = array.length; i < length; i++) {
                //只处理非空参数
                var options = array[i];
                var noCloneArrayMethod = Array.isArray(options);
                for (name in options) {
                    if (noCloneArrayMethod && !options.hasOwnProperty(name)) {
                        continue;
                    }
                    try {
                        var src = target[name];
                        var copy = options[name]; //当options为VBS对象时报错
                    } catch (e) {
                        continue;
                    }

                    // 防止环引用
                    if (target === copy) {
                        continue;
                    }
                    if (isDeep && copy && (avalon.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];
                        } else {
                            clone = src && avalon.isPlainObject(src) ? src : {};
                        }

                        target[name] = innerExtend(isDeep, [clone, copy]);
                    } else if (copy !== undefined$1) {
                        target[name] = copy;
                    }
                }
            }
            return target;
        }

        /**
         $$skipArray:是系统级通用的不可监听属性
         $skipArray: 是当前对象特有的不可监听属性

        不同点是
        $$skipArray被hasOwnProperty后返回false
        $skipArray被hasOwnProperty后返回true
        */
        var falsy;
        var $$skipArray = {
            $id: falsy,
            $render: falsy,
            $track: falsy,
            $element: falsy,
            $computed: falsy,
            $watch: falsy,
            $fire: falsy,
            $events: falsy,
            $accessors: falsy,
            $hashcode: falsy,
            $mutations: falsy,
            $vbthis: falsy,
            $vbsetter: falsy
        };

        //二级以上的元素get set会被监听
        //第一个参数设置是否深拷贝
        // console.log( innerExtend(true, [{a: 123, b: 666, c: {c1: 555}}, {a: 222, c: {c2: 333}, g: 333, d: 999}]) );
        // console.log( innerExtend(false, [{a: 123, b: {b1: 666, b2: {b12: 888}}, c: {c1: 555}}, {a: 222, c: {c2: 333}, g: 333, d: 999}]) );
        var obj01 = {$element: true, $accessors: true};
        console.log(avalon.mix(obj01, $$skipArray)); //{$element: true, $accessors: true}

    // }/*(6)*/

    console.dir(avalon);
	return avalon;
});