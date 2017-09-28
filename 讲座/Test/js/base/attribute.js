// JavaScript Document

define('base.attribute', 'base.util', function(require, exports){
	
	var util = require('base.util'),
		cached;

	exports.initAttrs = function(config, instance) {
    	// initAttrs 是在初始化时调用的，默认情况下实例上肯定没有 attrs，不存在覆盖问题
    	var attrs = this.attrs = {},
			readOnlyAttrs = this.readOnlyAttrs || {},//存储只读属性的数组
			specialProps = this.propsInAttrs || [],//特殊属性
			cached = instance;
		
		mergeInheritedAttrs(attrs, readOnlyAttrs, this, specialProps);
		
		if (config) {
			mergeAttrs(attrs, normalize(config), readOnlyAttrs);//将config里的属性复制到实例的attrs属性对象里，并且被复制的config里的属性都是只读的
		}
		
		//把attr属性绑定到this的属性以及方法
		copySpecialProps(specialProps, this, attrs, true);
	};
	/**
	 * 根据key获取属性值
	 * @param key 属性名
	 * @param once 无用
	 * @returns {*} 返回属性值数组
	 */
	exports.get = function(key, once) {
		var attr;
		if(this.attrs[key] !== undefined){
			attr = util.type.isEmptyObject(this.attrs[key]) ? null : this.attrs[key];
		} else {
			return null;
		}
		return attr;
	};
	/**
	 * 设置对象的属性及属性值
	 * @param key 属性名或属性名数组
	 * @param val 属性值或属性值数组
	 * @param options {object} 形如{override:true,readyOnly:true}对象
	 * @returns {exports}
	 */
	exports.set = function(key, val, options) {
		var attrs = {};
		
		// set("key", val, options)
		// set({ "key": val, "key2": val2 }, true)
		if (util.type.isString(key)) {
			attrs[key] = val;
		} else {
			attrs = key;
			options = val;
		}
		
		var options = options || {},
			override = options.override,
			readOnly = !!options.readyOnly,
			now = this.attrs,
			read = this.readOnlyAttrs;
		for (key in attrs) {
			if (!attrs.hasOwnProperty(key)) continue;
			var attr = now[key] || (now[key] = {}),
				val = attrs[key];
			
			if (read[key]) {
				throw new Error('不能修改属性: ' + key);
			}
			
			// 获取设置前的 prev 值
			var prev = this.get(key);
			readOnly && (read[key] = true);
			
			// 获取需要设置的 val 值
			// 如果设置了 override 为 true，表示要强制覆盖，就不去 merge 了
			// 都为对象时，做 merge 操作，以保留 prev 上没有覆盖的值
			if (!override && util.type.isPlainObject(prev) && util.type.isPlainObject(val) && !val.jquery) {
				val = util.merge(util.merge({}, prev), val);
			}
			now[key] = val;
			
			// 触发事件改变
			// 初始化时对 set 的调用，不触发任何事件
			if (!this._initializingAttrs && !util.type.isEqual(prev, val)) {
				this.trigger('change:' + key, val, prev, key);
			}
		}
		return this;
	};
	/***
	 * 合并已继承的属性
	 * @param attrs 实例的attrs属性
	 * @param read 实例的readOnlyAttrs属性
	 * @param instance 实例
	 * @param specialProps 实例的propsInAttrs属性，应该是特殊属性
	 */
	function mergeInheritedAttrs(attrs, read, instance, specialProps) {
		var inherited = [],//已继承的
			readOnlys = [],//只读的
			proto = instance.constructor.prototype;//实例构造函数的原型，如editResume类型就是editResume.prototype
			
		while (proto) {//此循环是从实例类型及父辈类型的原型里拷贝继承属性和只读属性到对应的数组里
			if (!proto.hasOwnProperty('attrs')) {
				proto.attrs = {};
			}
			if (!proto.hasOwnProperty('readOnlyAttrs')){
				proto.readOnlyAttrs = {};
			}
			// 将 proto 上的特殊 properties 放到 proto.attrs 上，以便合并
			copySpecialProps(specialProps, proto.attrs, proto);
			copySpecialProps(specialProps, proto.readOnlyAttrs, proto);
			
			// 不是空对象则只需插入
			if (!util.type.isEmptyObject(proto.attrs)) {
				inherited.unshift(proto.attrs);
				readOnlys.unshift(proto.readOnlyAttrs);
			}
			
			// 向上回溯一级
			proto = proto.constructor.superclass;
		}
		
		// 将继承属性和只读属性合并到实例的attrs上
		for (var i = 0, len = inherited.length; i < len; i++) {
			mergeAttrs(attrs, normalize(inherited[i]));
			mergeAttrs(read, normalize(readOnlys[i]));
		}
	}
	
	function copySpecialProps(specialProps, receiver, supplier, isAttrProp) {
		for (var i = 0, len = specialProps.length; i < len; i++) {
			var key = specialProps[i];
			if (supplier.hasOwnProperty(key)) {
				receiver[key] = isAttrProp ? receiver.get(key) : supplier[key];
			}
		}
	}
	// 专用于 attrs 的 merge 方法
	function mergeAttrs(attrs, inheritedAttrs, read){
		var key, value;
		for (key in inheritedAttrs) {
			if (inheritedAttrs.hasOwnProperty(key)) {
				value = inheritedAttrs[key];
				if (!attrs[key]) {
					attrs[key] = {};
				}
				if(value != undefined){
					if(value.jquery){//如果是$dom就直接赋值引用
						attrs[key] = value;
					} else {//否则拷贝值的副本
						attrs[key] = util.clone(value, attrs[key]);//value对象拷贝attr[key]对象的属性，同名属性不会被覆盖
					}
					if(read && read[key]){
						read[key] = true;
					}
				}
			}
    	}
    	return attrs;
	}

	/**
	 * 将数组或对象标准化(即转为key-value对象)
	 * @param attrs
	 * @returns {{}}
	 */
	function normalize(attrs) {
		var newAttrs = {};
		
		for (var key in attrs) {
			newAttrs[key] = attrs[key];
		}
		return newAttrs;
	}
	
	function hasOwnProperties(object, properties) {
		for (var i = 0, len = properties.length; i < len; i++) {
			if (object.hasOwnProperty(properties[i])) {
				return true;
			}
		}
		return false;
	}
});