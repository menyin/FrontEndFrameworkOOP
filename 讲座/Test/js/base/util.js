// JavaScript Document

define('base.util', function(require, exports){

	function isValidParamValue(val) {
		var t = typeof val;
		return val === null || (!jpjs.isObject(t) && !jpjs.isFunction(t));
	}
	var hasEnumBug = !({toString: 1}.propertyIsEnumerable('toString')),//propertyIsEnumerable函数是判断该属性是否是存在并且可以用for-in出来的
		enumProperties = [
			'constructor',
			'hasOwnProperty',
			'isPrototypeOf',
			'propertyIsEnumerable',
			'toString',
			'toLocaleString',
			'valueOf'
		],
		encode = encodeURIComponent,
		decode = decodeURIComponent,
		reg_trim = /^\s+|\s+$/g,
		reg_arr_key = /^(\w+)\[\]$/,
		slice = Array.prototype.slice,
		toString = Object.prototype.toString;

	exports.type = {
		isArray: jpjs.isArray,
		isObject: jpjs.isObject,
		isString: jpjs.isString,
		isBoolean: jpjs.isBoolean,
		isFunction: jpjs.isFunction,
		isWindow: function(o){
			return o != null && o == o.window;
		},
		isDate: function(o){
			return toString.call(o) === '[object Date]';
		},
		isNumber: function(o){
			return toString.call(o) === '[object Number]';
		},
		/**
		 * 判断是否是纯的js对象（即非dom对象）
		 * @param o 对象
		 * @returns {boolean}
		 */
		isPlainObject: function(o){
			return o && this.isObject(o) &&
				!o['noteType'] && !this.isWindow(o);
		},
		/**
		 * 不是空对象或 是Dom对象或 是window对象都返回false
		 * @param o
		 * @returns {boolean}
		 * @remark
		 *  当传入o={}则得到结果为true
		 */
		isEmptyObject: function(o){
			if (!o || !this.isPlainObject(o) ||
				o.nodeType || this.isWindow(o) || !o.hasOwnProperty) {
				return false;
			}
			for (var p in o) {
				if (o.hasOwnProperty(p)) return false;
			}
			return true;
		},
		/**
		 * 对象为null、空字符串、空数组、空对象（即{}）都反胃true
		 * @param o 对象
		 * @returns {boolean|*}
		 */
		isEmptyAttrValue: function(o) {
			return o == null ||
				(this.isString(o) || this.isArray(o)) && o.length === 0 ||
				this.isEmptyObject(o);
		},
		/**
		 * 是否是空字符串
		 * @param s 检测的字符串
		 * @param rev 不传则为false
		 * @returns {boolean} 当rev为false代表空字符串时返回true，当rev为true代表空字符串时返回false
		 */
		isEmptyString: function(s, rev){
			var len = exports.string.trim(s).length,
				rev = rev ? len > 0 : len === 0;
			return this.isString(s) && rev;
		},
		/**
		 * 判断两个对象是否相等
		 * @param a 对象1
		 * @param b 对象2
		 * @returns {boolean}
		 */
		isEqual: function(a, b) {
			if (a === b) return true;
			if (this.isEmptyAttrValue(a) && this.isEmptyAttrValue(b)) return true;

			var className = toString.call(a);
			if (className != toString.call(b)) return false;

			switch (className) {
				case '[object String]':
					return a == String(b);
				case '[object Number]':
					return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
				case '[object Date]':
				case '[object Boolean]':
					return +a == +b;
				case '[object RegExp]':
					return a.source == b.source &&
						a.global == b.global &&
						a.multiline == b.multiline &&
						a.ignoreCase == b.ignoreCase;
				// 简单判断数组包含的 primitive 值是否相等
				case '[object Array]':
					var aString = a.toString(),
						bString = b.toString();
					// 只要包含非 primitive 值，为了稳妥起见，都返回 false
					return aString.indexOf('[object') === -1 &&
						bString.indexOf('[object') === -1 &&
						aString === bString;
			}

			if (typeof a != 'object' || typeof b != 'object')
				return false;
			// 简单判断两个对象是否相等，只判断第一层
			if (this.isPlainObject(a) && this.isPlainObject(b)) {
				// 键值不相等，立刻返回 false
				if (!this.isEqual(exports.object.keys(a), exports.object.keys(b))) {
					return false;
				}
				// 键相同，但有值不等，立刻返回 false
				for (var p in a) {
					if (a[p] !== b[p]) return false;
				}
				return true;
			}
			// 其他情况返回 false, 以避免误判导致 change 事件没发生
			return false;
		}
	};

	exports.array = jpjs.arrayUtil;//包含filter、indexOf、unique三个函数

	exports.object = {
		/**
		 * 获取传入参数对象的非原型属性的属性名数组
		 */
		keys: Object.keys || function (o) {
			var result = [], p, i;
			for (p in o) {
				if (o.hasOwnProperty(p)) {
					result.push(p);
				}
			}
			if (hasEnumBug) {
				for (i = enumProperties.length - 1; i >= 0; i--) {
					p = enumProperties[i];
					if (o.hasOwnProperty(p)) {
						result.push(p);
					}
				}
			}
			return result;
		}
	};
	exports.string = {
		/**
		 * 去除空格
		 * @param str 原字符串
		 * @returns {*} 处理后的字符串
		 */
		trim: function(str){
			return str === undefined ? '' : str.toString().replace(reg_trim, '');
		},
		/**
		 * 对传入字符串进行编码
		 * @param val 字符串
		 * @returns {string|XML} 编码后的字符串
		 */
		escape: function(val) {
			return val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&acute;');
		},
		/**
		 * 对传入字符串进行解码
		 * @param val 字符串
		 * @returns {string|XML} 解码后的字符串
		 */
		unescape: function(val) {
			return val.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&acute;/g, '\'');
		},
		/**
		 * 字符串替换功能
		 * @param string 模板字符串，其中用{name}来表示变量
		 * @param obey 数据对象或被替换的字符串数组
		 * @param aval 替换的付出数组
		 * @returns {*} 被替换处理后的字符串
		 * @remark
		 *  1、当2个参数时，该函数类似但不等于art-template的功能，2个参数依次是模板字符串和数据对象或数组
		 *  2、当3各参数时，该函数功能为：处理模板字符串，将该模板里和obey数组元素匹配的字符串依次
		 *     替换成aval数组里的元素。此时obey和aval应该都是字符串数组，如果obey为字符串，则会被替
		 *     换为[obey]的数组，如果aval为字符串，也是同理。
		 *   注意：模板中只能替换obey和aval中为基本类型的第一层属性值
		 */
		replace: function(string, obey, aval){
			if(arguments.length == 2){
				//简单模板的情况
				return string.replace(/\{([^{}]+)\}/g,function(match,key){
					var value = obey[key];
					return (value !== undefined) ? ''+ value : '';
				});
				//替换情况  ['lvke', 'hehe', 'mama'], ['1', '2', '3']
			} else {
				obey = jpjs.isArray(obey) ? obey : [obey];
				for(var len = obey.length - 1; len >= 0; len--){
					if( exports.type.isPlainObject( obey[len] )){
						continue;
					}
					string = string.replace( obey[len] , jpjs.isArray(aval) ? ( aval[len] || '' ) : aval );
				}
			}
			return string;
		},
		/**
		 * 将参数对象参数转化为字符串
		 * @param o 参数对象
		 * @returns {string} 转化后的字符串
		 * @example
		 *  var str = util.string.param({name: 'cny', age: 11});//输出'name=cny&age=11'
		 */
		param: function(o){
			if(!exports.type.isPlainObject(o)) return '';
			var buf = [], key, val;
			for(key in o){
				val = o[key];
				key = encode(key);
				if(isValidParamValue(val)){
					buf.push(key, '=', encode(val + ''), '&');
				} else if (this.type.isArray(val) && val.length) {
					for(var i=0, len=val.length; i<len; i++){
						if(isValidParamValue(val[i])){
							buf.push(key, '[]=', encode(val[i] + ''), '&');
						}
					}
				}
			}
			buf.pop();
			return buf.join('');
		},
		/**
		 * 将参数字符串转化为对象
		 * @param str 参数字符串
		 * @param sep 参数项的分割符，不传默认'&'
		 * @returns {{}} 生成的参数对象
		 * @example
		 * var str = util.string.unparam('name=cny&age=11');//输出{name: 'cny', age: 11}
		 */
		unparam: function(str, sep){
			if(exports.type.isEmptyString(str) || !exports.type.isString(str))
				return {};
			var ret = {},
				pairs = str.split(sep || '&'),
				pair, key, val, m,
				i = 0, len = pairs.length;

			for(; i < len; i++){
				pair = pairs[i].split('=');
				key = decode(pair[0]);

				try{
					val = decode(pair[1]);
				} catch(e){
					val = pair[1] || '';
				}

				if((m = key.match(reg_arr_key)) && m[1]){
					ret[m[1]] = ret[m[1]] || [];
					ret[m[1]].push(val);
				} else {
					ret[key] = val;
				}
			}
			return ret;
		}
	};
	/**
	 * 在原有的t对象上拷贝s对象的属性，并可以指定是否同名覆盖和属性列表
	 * @param t 要拷贝的原有对象
	 * @param s 被拷贝属性的对象
	 * @param ov {boolea} 默认值true 为true时z表示s在wl指定的属性与t同名时，要用s覆盖t的
	 * @param wl 指定s对象要复制到t对象的属性的数组
	 * @returns {*}
	 * @remark
	 *  1、ov和wl应该要同时出现，用于指定复制的属性及是否覆盖
	 *  2、wl不指定时，则t会复制s所有属性，至于要不要同名覆盖则由ov决定
	 */
	exports.mix = function(t, s, ov, wl){
		if (!s || !t)
			return t;
		if (ov === undefined)
			ov = true;
		var i, p, l;
		if(wl && (l = wl.length)){
			for (i = 0; i < l; i++){
				p = wl[i];
				if(p in s){
					if(ov || !(p in t)){
						t[p] = s[p];
					}
				}
			}
		} else {
			for (p in s){
				if (ov || !(p in t)){
					t[p] = s[p];
				}
			}
		}
		return t;
	};
	/**
	 * 让t类型继承s类型
	 * @param t 目标子类
	 * @param s 目标父类
	 * @returns 返回t继承s后的对象
	 */
	exports.extend = function(t, s){
		if(!s || !t)
			return t;
		var obj = Object.prototype,
			O = function(o){
				function F(){};
				F.prototype = o;
				return new F();
			},
			sp = s.prototype,
			op = O(sp);

		t.prototype = op;
		op.constructor = t;
		t.superclass = sp;

		if(s !== Object && sp.constructor === obj.constructor)
			sp.constructor = s;
		return t;
	};
	/**
	 * 合并两个对象的属性
	 * @param r
	 * @param s
	 * @returns {*}
	 * @remark
	 * 其中s对象的属性会覆盖r的同名属性
	 */
	exports.merge = function(r, s){
		var key, value;
		for (key in s) {
			try {
				if (s.hasOwnProperty(key)) {//判断s是否有key属性
					r[key] = this.clone(s[key], r[key]);
				}
			} catch(ex) {
				delete s[key];
				delete r[key];
			}
		}

		return r;
	};
	/**
	 * 在r对象中拷贝s对象的属性
	 * @param r
	 * @param s
	 * @returns {*}
	 * @remark
	 *  1、r,s必须是纯js对象(非dom对象)
	 *  2、r的同名属性不会被s覆盖
	 *  3、注意以上两点是和merge函数的区别
	 *  4、如果r是数组则直接返回r
	 */
	exports.clone = function(r, s){
		if (this.type.isArray(r)) {
			r = r.slice();
		} else if (this.type.isPlainObject(r) && !r.selector) {
			this.type.isPlainObject(s) || (s = {});
			r = this.merge(s, r);
		}
		return r;
	};
	/**
	 * 获取一个绑定具体对象的委托实例
	 * @param 自由参数，第1参为回调，第2参为对象
	 * @returns {Function}
	 * @example
	 * obj={};
	 * obj.myMethod=function(datas){
	 *   //这个函数相当于一个事件函数
	 *   //datas数组包含了几部分参数
	 *   //1、除了下面util.bind()调用时第一二参数以外的参数(一般没有传一二参以外的参数)
	 *   //2、以下callback所传递的data数组里的参数
	 * }
	 * $.get('test.php',{},function(data){
	 *  var callback= util.bind(obj.myMetod, obj);
	 *  callback(data);
	 * })
	 */
	exports.bind = function(){
		var args = slice.call(arguments) || [],//拷贝一份参数
			fun = args.shift(),//第一参数，回调函数
			obj = args.shift();//第二参数,回调函数的事件参数的部分信息
		return function(e){
			var ar = slice.call(arguments) || null;
			return exports.type.isFunction(fun) &&
				fun.apply(obj, ar.concat(args));
		}
	};
	/**
	 * 将字符串转化为json对象的函数
	 */
	exports.json = window.JSON ? JSON.parse : function(text, mode){
		if(mode){
			return (new Function( "return " + text ) )();
		}
		var match;
		if((match = /\{[\s\S]*\}|\[[\s\S]*\]/.exec(text))){
			text = match[0];
		}
		var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		cx.lastIndex = 0;
		if(cx.test(text)){
			text = text.replace(cx, function(a){
				return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			});
		}
		if (/^[\],:{}\s]*$/.
				test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
					replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
					replace(/(?:^|:|,)(?:\s*\[)+/g, ''))){
			return eval('(' + text + ')');
		}
		throw 'JSON parse error';
	};

	return exports;
});