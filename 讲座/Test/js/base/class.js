// JavaScript Document

define('base.class', 'base.util', function(require, exports){
	
	var util = require('base.util');

	/**
	 * 检查实例是否为Class类或其子类的实例 或者是否是window对象
	 * @param cls 实例
	 * @returns {boolean}
	 */
	function checkContext(cls){
		return !(cls instanceof Class) || !util.type.isWindow(cls);
	}
	function Class(){}

	/**
	 * 用于当前类型继承其他类型 （Class类型及其子类型的静态方法）
	 * @param o 目标要继承的父类类型
	 * @returns {*} 返回 继承o类型后的Class实例
	 */
	Class.extend = function(o){
		if(!checkContext(this))//检查是否为Class的实例
			throw new Error('class.extends: 类对象的类型不符合');
		return util.extend(this, o);
	}
	/**
	 * 为当前类型或其子类型的原型扩展其他类型原型属性或其它实例的屬性，或者称之为实现
	 * @param items {type | [type]} 目标类型或目标类型数组
	 * @returns {Class} 返回扩展处理后的当前类型
	 * @remark
	 * items里可包含类型或者实例
	 * 当items里的项为类型则拷贝类型的原型属性
	 * 当items里的项为实例时则拷贝实例的属性（此时实例的prototype为undefined）
	 */
	Class.implement = function(items){
		if(!checkContext(this))
			throw new Error('class.implement: 类对象的类型不符合');
			
		util.type.isArray(items) || (items = [items]);
		var proto = this.prototype, item;
		while(item = items.shift()){
			util.mix(proto, item.prototype || item);
		}
		return this;
	}
	/**
	 * 返回Class或子类型的父类型的函数(包括构造函数)
	 * @param method 函数名字符串
	 * @returns {*}
	 * @remark
	 *  当!method || !this.superclass[method]时，返回父类型构造函数
	 */
	Class.parent = function(method){
		if( !checkContext(this) )
			throw new Error('class.parent: 类对象的类型不符合');
		if( !this.superclass ) //superclass是父类型的原型
			throw new Error('class.parent: 找不到父类');
		if(!method || !this.superclass[method]){
			method = 'constructor';
		}
		return this.superclass[method];
	}

	/**
	 * 向外界暴露：将目标类型扩展出Class类型基本静态函数的工厂
	 * @param cls 目标类型
	 * @returns {*} 扩展后的目标类型
	 */
	function classify(cls){
		cls.extend = Class.extend;
		cls.implement = Class.implement;
		cls.parent = Class.parent;
		return cls;
	}
	exports.Class = classify;
});