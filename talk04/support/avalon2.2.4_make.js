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

	var delayCompile = {};

	var window$1 = win;
	function avalon(el) {
		return new avalon.init(el);
	}

	avalon.init = function (el) {
		this[0] = this.element = el;
	};

	avalon.fn = avalon.prototype = avalon.init.prototype;

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
	//============== end config ============

	shadowCopy(avalon, {
		shadowCopy: shadowCopy,

		version: "2.2.4",
		vmodels: {},

		log: log,
		noop: noop,
		warn: warn,
		error: error,
		config: config
	});

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
		//var vm = platform.modelFactory(definition);
        /*return avalon.vmodels[$id] = vm;*/
	};

    /**
     * 在未来的版本,avalon改用Proxy来创建VM,因此
     */

    /*function IProxy(definition, dd) {
        avalon.mix(this, definition);
        avalon.mix(this, $$skipArray);
        this.$hashcode = avalon.makeHashCode('$');
        this.$id = this.$id || this.$hashcode;
        this.$events = {
            __dep__: dd || new Mutation(this.$id)
        };
        if (avalon.config.inProxyMode) {
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
        }
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
    };*/

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
        console.log('mix_array', array);
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

    //二级以上的元素get set会被监听
    //第一个参数设置是否深拷贝
    console.log( innerExtend(true, [{a: 123, b: 666, c: {c1: 555}}, {a: 222, c: {c2: 333}, g: 333, d: 999}]) );
    console.log( innerExtend(false, [{a: 123, b: {b1: 666, b2: {b12: 888}}, c: {c1: 555}}, {a: 222, c: {c2: 333}, g: 333, d: 999}]) );
    var obj01 = {}
    avalon.mix(obj01, $$skipArray);
    console.log(obj01);

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

    console.dir(avalon);
	return avalon;
});