// JavaScript Document
/**
 * 此模块用于面向切面编程
 */
define('base.aspect', function(require, exports){
	/**
	 *
	 * @param methodName
	 * @param callback
	 * @returns {*}
	 */
	exports.before = function(methodName, callback){
		return aop.call(this, 'before', methodName, callback);
	}
	/**
	 *
	 * @param methodName
	 * @param callback
	 * @returns {*}
	 */
	exports.after = function(methodName, callback){
		return aop.call(this, 'after', methodName, callback);
	}
	
	var eventSplitter = /\s+/;
	
	function aop(status, methodName, callback){
		var names = methodName.split(eventSplitter),
			name, method;
			
		while(name = names.shift()){
			method = this[name];
			if(!method){
				throw new Error('base.aspect: 无效方法[' + methodName + ']');
			}
			if(!method._isAop){//是否支持Aop，支持则进行Aop包裹
				wrap.call(this, name);
			}
			this.on(status + ":" + name, callback);
		}
		return this;
	}
	function wrap(methodName){
		var method = this[methodName];
		this[methodName] = function(){
			
			var args = Array.prototype.slice.call(arguments),
				beforeArgs = ['before:' + methodName].concat(args);
			if(!this.trigger.apply(this, beforeArgs));
			var ret = method.apply(this, arguments),
				afterArgs = ['after:' + methodName].concat(args);
			if(!this.trigger.apply(this, afterArgs));
			
			return ret;
		}
		this[methodName]._isAop = true;
	}
});