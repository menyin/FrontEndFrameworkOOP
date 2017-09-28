// JavaScript Document
/**
 * 此模块用于事件相关的操作
 */
define('base.event','base.util', function(require, exports){
	
	var util = require('base.util'),  
		eventSplitter = /\s+/,
		eventDispatcher = {

			on: function(type, callback, context){
				this._listeners = this._listeners || {};
				if (!callback) return this;
				var events = type.split(eventSplitter), event;
				while(event = events.shift()){
					if(!this._listeners[event]){
						this._listeners[event] = [];
					}
					callback.cid = this.cid;
					this._listeners[event].push(callback);
				}
				return this;
			},
			off: function(_type, callback){
				if(!_type){
					if(this._listeners){
						for(var __type in this._listeners){
							delete this._listeners[__type];
						}
						this._listeners = {};
					}
					return this;
				}
				if(!this._listeners){
					return this;
				}
				var _events = _type.split(eventSplitter), event;
				while(event = _events.shift()){
					if(this._listeners[event]){
						var list = this._listeners[event];
						if(typeof callback === "undefined"){
							delete this._listeners[event];
						} else {
							for(var i=0, n = list.length; i < n; i++){
								if(list[i] === callback){
									list.splice(i, 1);
									return this;
								}
							}
						}	
					}
				}
				return this;
			},
			trigger: function(){
				var args = Array.prototype.slice.call(arguments),
					type = args.shift();
				if(!this._listeners || !this._listeners[type])
					return;
				var list = this._listeners[type], 
					pass = false;
				for(var i=0, len=list.length; i<len; i++){
					(function(list, self){
						if(self.cid === list.cid){
							pass = list.apply(self, args) || list;
						}
					})(list[i], this);
				}
				return pass;
			}
		}
		
	return eventDispatcher;	
});