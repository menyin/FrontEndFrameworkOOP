// JavaScript Document

define('base.shape', [
	'base.event', 'base.aspect', 'base.attribute','base.util', 'base.class', 'jquery'
], function(require, exports, module){

	var util = require('base.util'),
		aspect = require('base.aspect'),
		attribute = require('base.attribute'),
		events = module['base.event'],
		$ = module['jquery'],
		Class = require('base.class').Class,
		cidCounter = 0,
		cachedInstances = [],
		/**
		 * 构造出shape类型，
		 */
		shape = Class(function(config){
			this.cid = uniqueCid();
			this.initAttrs(config);//initAttrs是从base.attribut模块实现过来的
			cachedInstances.push(this);
		});
	
	function uniqueCid() {
    	return 'shape-' + cidCounter++;
  	}

	/**
	 * 为shope类型实现一些类型的属性和方法
	 * 其实是为当前类型或其子类型的原型扩展其他类型原型属性，或者称之为实现
	 */
	shape.implement([events, aspect, attribute, {
		destory: function(f){
			this.off();
			if(f){
				for (var p in this) {
					if (this.hasOwnProperty(p)) {
						delete this[p];
					}
				}
				this.destory = function(){}
			}
		}
	}]);
	
	$(window).unload(function() {
		for(var i=0, len=cachedInstances.length; i<len; i++){
			cachedInstances[i].destory && cachedInstances[i].destory(true);
		}
		cachedInstances = null;
	});

	/**
	 * 向外界暴露：将目标o类型继承shape类型的工厂
	 */
	return function(o){//o为一个类型，可以是匿名类型
		if(!util.type.isFunction(o) && !util.type.isObject(o)){
			throw new Error('base.shape: 类型不符合');
		}
		return Class(o).extend(shape);	
	};
});