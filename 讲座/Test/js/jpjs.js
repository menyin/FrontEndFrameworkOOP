// JavaScript Document

(function(global,doc){
	
	if (global['jpjs']) {
		return;
	}
	var jpjs = global.jpjs = {
			version: '1.382',
			autohor: 'jon',
			mailto: ''
		},
		html = doc.documentElement,
		head = doc.head || doc.getElementsByTagName("head")[0],
		baseElement = head.getElementsByTagName("base")[0],
		charset = 'utf-8',
		isDebug = false,
		regReady = /(loaded|complete)/i,
		preloadMods = [],
		globalMods = [],
		preComboMods = {},
		comboMods = {},
		comboExports = {},
		comboModsVer = {},
		comboVersion = {},
		normailzeNames = {},
		comboHost = '',
		comboPath = '',
		basepath = '', 
		maps = {},
		nodeCache = {},
		timeout = 50,
		waitCount = 3000,
		moduleType = {
			loaded: '@loaded:',
			module: '@module:',
			define: '@define:',
			defineId: '@defineId:',
			factory: '@factory:',
			exports: '@exports:',
			init: '@init:',
			initId: '@initId:',
			initArgs: '@initArgs:',
			initList: '@initList:',
			count: '@count:',
			combo: '@combo:'
		},
		indexOf = Array.prototype.indexOf,
		filter = Array.prototype.filter,
		isObject = jpjs.isObject = isType("Object"),
		isString = jpjs.isString = isType("String"),
		isArray = jpjs.isArray = Array.isArray || isType("Array"),
		isFunction = jpjs.isFunction = isType("Function"),
		isBoolean = jpjs.isBoolean = isType("Boolean"),
		array = jpjs.arrayUtil = {
			filter : filter ? function(arr, fn, scope){
				return filter.call(arr, fn, scope);
			} : function (arr, fn, scope) {
				var a = [];
				for (var i = 0, j = arr.length; i < j; ++i) {
					if (!fn.call(scope, arr[i], i, arr)) {
						continue;
					}
					a.push(arr[i]);
				}
				return a;
			},
			indexOf: indexOf ? function(el, arr){
				return indexOf.call(arr, el);
			} : function(el, arr){
				for(var i = 0, len = arr.length; i < len; i++){
					if(arr[i] === el)
						return i;
				}
				return -1;
			},
			unique:function(arr){
				if(arr.length == 0 || !arr)
					return;
				return this.filter(arr, function(name, i, that){
					return this.indexOf(name, that) >= i;
				}, this);
			}
		},
		debug = jpjs.debug = function(msg, type){
			return window.console && console[type || 'log'](msg) || null;
		},
		debugIndex = 0,
		debugCount = 50;
		
	function trim(str){
		if(isString(str)){
			return str.replace(/\s+/g, '');
		}
	}
	function isType(type) {
		return function(obj) {
			return {}.toString.call(obj) == "[object " + type + "]";
		}
	}
	function onLoadJS(node, callback, module){
		var supportOnload = "onload" in node;
		if (supportOnload) {
			node.onload = onload;
			node.onerror = function(){
				onload();
			}
		} else {
			node.onreadystatechange = function() {
				if (regReady.test(node.readyState)) {
					onload();
				}
			}
		}
		function onload(){
			callback && callback(module[1] || module[0]);
			nodeCache[moduleType.loaded + module[0]] = true;
			node.onload = node.onerror = node.onreadystatechange = null;
			if(!isDebug){
				head.removeChild(node);
			}
			node = null;
		}
	}
	function loadJS(path, callback, isAsync){
		var module = ('' + path ).split('::'),
			modulePath = module[0],
			none;
			
			if(isBoolean(callback)){
				isAsync = callback;
				callback = null;
			}
			
			if(!nodeCache[moduleType.loaded + modulePath]){
				node = nodeCache[moduleType.module + modulePath] || doc.createElement('script');
				onLoadJS(node, callback, module, debug);
				if(!nodeCache[moduleType.module + modulePath]){
					nodeCache[moduleType.module + modulePath] = node;
					node.src   = modulePath;
					node.type  = "text/javascript";
					node.charset = charset;
					node.async = isAsync != undefined ? isAsync : true;
					if(baseElement){ 
						head.insertBefore(node, baseElement)
					} else {
						head.appendChild(node);
					}
				}
			} else {
				callback && callback(module[1] || modulePath);
			}
	}
	
	function checkModule(moduleName){
		var cache = package['#module:cache'];
		cache[moduleType.count + moduleName] = (cache[moduleType.count + moduleName] || 0) + 1;
		if(cache[moduleType.count + moduleName] > waitCount){
			debug('找不到模块名或者加载超时:' + moduleName, 'error');
			deleteCache(moduleName);
			return false;
		}
		return true;
	}
	function resetCheck(moduleName, initId, time){
		setTimeout(function(){
			if(!checkModule(moduleName)){
				return;
			}
			if(initId != undefined){
				checkLoaded(moduleName, initId);
			} else {
				checkDefinedLoaded(moduleName);
			}
		}, time != null ? time : timeout);
	}
	function takeGlobalModule(moduleName, isArray){
		var mods = isArray ? [] : {},
			type = isArray ? moduleType.init : moduleType.module,
			cache = package['#module:cache'],
			deplist = cache[ type + moduleName ].depend,
			status = true;
			
		saveModule(array.unique(deplist.concat(globalMods)));
		function saveModule(name){
			for(var factory, i = 0, len = name.length; i < len; i++){
				factory = cache[ moduleType.factory + name[i] ];
				
				if(isArray){
					if( !factory ){
						return status = false;
					}
					mods.push(factory);
				} else {					
					mods[name[i]] = factory;
				}
			}
		}
		return status ? mods : false;
	}
	function deleteCache(moduleName, isClearErr){
		var cache = package['#module:cache'];

		delete cache[ moduleType.module + moduleName ];
		delete cache[ moduleType.define + moduleName ];
		delete cache[ moduleType.defineId + moduleName ];
		delete cache[ moduleType.exports + moduleName ];
		delete cache[ moduleType.factory + moduleName ];
		delete cache[ moduleType.init + moduleName ];
		delete cache[ moduleType.initList + moduleName ];
		delete cache[ moduleType.loaded + moduleName ];
		delete cache[ moduleType.initArgs + moduleName ];
		delete cache[ moduleType.combo + moduleName ];
	}
	function checkDefinedLoaded(moduleName){
		var cache = package['#module:cache'],
			status = cache[ moduleType.loaded + moduleName ] || checkDefinedList(moduleName),
			factory, result;
		
 		if(status){
			if(factory = cache[ moduleType.module + moduleName ].factory){
				cache[moduleType.define + moduleName] = cache[moduleType.define + moduleName] || takeGlobalModule(moduleName);
				var args = factory.length <= 1 ? [
					cache[ moduleType.define + moduleName ]
				] : [
					package['#provide:require'], 
					cache[ moduleType.exports + moduleName ],
					cache[ moduleType.define + moduleName ]
				];
				result = cache[ moduleType.factory + moduleName ];
				if(!result && !isBoolean(result)){
					comboExports[moduleName]
					 = cache[ moduleType.factory + moduleName ]
					 = factory.apply(jpjs, args) || factory;
				}
				cache[ moduleType.loaded + moduleName ] = true;
				delete cache[moduleType.count + moduleName];
			}
		} else {
			resetCheck(moduleName);
		}
	}
	function checkDefinedList(moduleName){
		var cache = package['#module:cache'],
			module = cache[ moduleType.module + moduleName ],
			deplist = module.depend;

		if(!cache[moduleType.loaded + moduleName]) {
			for(var i = 0, len = deplist.length; i < len; i++){
				if(!cache[moduleType.loaded + deplist[i]]){
					return false;
				}
			}
		}
		return true;
	}
	function getUseFactorys(moduleName, id){
		var cache = package['#module:cache'],
			factorys = cache[moduleType.initList + moduleName];
		if(!factorys){
			cache[moduleType.initList + moduleName] = [];
		}
		if(!cache[moduleType.init + moduleName + id]){
			return;
		}
		cache[moduleType.initList + moduleName][id] = cache[moduleType.initList + moduleName][id] ||
		cache[moduleType.init + moduleName + id].factory;
		
		return cache[moduleType.initList + moduleName];
	}
	function isCombo(moduleName, i){
		return package['#module:cache'][moduleType.init + moduleName + i] && package['#module:cache'][moduleType.init + moduleName + i].isCombo;
	}
	function checkLoaded(moduleName, id){
		var cache = package['#module:cache'],
			status = cache[moduleType.loaded + moduleName],
			factorys = getUseFactorys(moduleName, id);
		
		if(!factorys){return;}
		if(!status ){
			var moduleNames = cache[moduleType.init + moduleName],
				i = 0, deplist;
			if(isCombo(moduleName, i)){
				status = !moduleNames ? true : status;	
			}
			for( ; deplist = moduleNames && moduleNames[i]; i++ ){
				if( status  = cache[moduleType.loaded + deplist] ) {
					cache[moduleType.init + moduleName].splice(i, 1);
				} else { 
					break; 
				} 
			}
		}
		if( status ){
			var save = cache[moduleType.initArgs + moduleName];

			if(!save){
				save = takeGlobalModule( moduleName + id, true );
				if(!save){
					resetCheck(moduleName, id);
					return;
				}
				cache[moduleType.initArgs + moduleName] = save;
				delete cache[moduleType.init + moduleName];
			}
			for(var i=0; i<factorys.length; i++){
				if(isCombo(moduleName, i)){
					factorys[i] && factorys[i].call(jpjs, comboExports);
				} else {
					factorys[i] && factorys[i].apply(jpjs, save);
				}
				delete cache[moduleType.init + moduleName + i];
			}
			
			cache[moduleType.loaded + moduleName] = true;
			delete cache[moduleType.initList + moduleName];
			delete cache[moduleType.initId + moduleName];
			delete cache[moduleType.count + moduleName];
			return;
		}
		resetCheck(moduleName, id);
	}
	function getComboMods(name){
		if(isString(name)){ name = [name]; }
		var mods = [], modName;
		for(var i = 0, len = name.length; i < len; i++){
			modName = normalizeComboMods(comboMods[name[i]]);
			if(!modName) return;
			mods = mods.concat(comboMods[name[i]]);
		}
		return mods;
	}
	function normalizeComboMods(value){
		if(!value){return;}
		var ret = value;
		if(isArray(value)){
			var len = ret.length;
			for(var i=0; i<len; i++){
				if(!value[i] || preComboMods[value[i]]){
					continue;
				}
				if(value[i].indexOf('@') != -1){
					var combos = normalizeComboMods(comboMods[value[i]]);
					Array.prototype.splice.apply(ret, [i, 1].concat(combos));
				}
				len = ret.length;
			}
		}
		return ret;
	}
	function normailzeVer(key){
		if(normailzeNames){
			var ext = '.js',
				lastIndex = key.lastIndexOf('.') + 1;
			comboModsVer[key] = Number(normailzeNames[key.substr(lastIndex) + ext]);
		}
	}
	var package = {
		'#module:cache':{},
		'#module:getPath': function(path){
			path = path.replace('jpjs.','');
			if(val = maps[path]){
				return basepath + val + '.js::' + path;
			}
            return basepath + path.replace(/\./g,'/') + '.js::' + path;
        },
		'#module:getCombosPath': function(module){
			if(!isObject(module)) return;
			var dependPaths = module.depend,
				moduleName = module.module,
				path = "", val, version = 0;
			for(var i=0, len = dependPaths.length; i<len; i++){
				val = dependPaths[i];
				if(preComboMods[val]){
					continue;
				}
				normailzeVer(val);
				preComboMods[val] = true;
				if(maps[val]){
					path += comboPath + maps[val] + '.js,';
				} else {
					path += comboPath + val.replace(/\./g, '/') + '.js,';
				}
				if(comboModsVer[val]){
					version += comboModsVer[val];
				}
			}
			if(path.lastIndexOf(',') != -1){
				if(moduleName.indexOf('|kk|') != -1){
					moduleName = moduleName.split('|kk|').join('');
				}
				return path.substr(0, path.length - 1) + '?v=' + (version || comboVersion[moduleName] || (new Date).getTime());
			}
			return path;
		},
		'#provide:require' : function(module){
            return package['#module:cache'][moduleType.exports + module] || {};
        },
		require : function(module){
			var cache = this['#module:cache'],
				moduleName = module['module'],
				initId = module.initId;
			
			if(initId != undefined) {
				cache[moduleType.init + moduleName + initId]  = module;
				var combo = getComboMods(module.depend);
				if(combo){
					var comboPath = "";
					module.depend = combo;
					comboPath += this['#module:getCombosPath'](module);
					cache[moduleType.init + moduleName + initId].isCombo = true;
					if(comboPath){
						loadJS((comboHost || basepath) + comboPath, function(){
							var i = 0, depend;
							while(depend = combo[i++]){
								cache[moduleType.exports + depend] = cache[moduleType.exports + depend] || {};
								cache[moduleType.combo + depend] = true;
								i++;
							}
							cache[moduleType.init + moduleName] = combo;
							resetCheck(moduleName, initId, 0);
						});
					} else {
						resetCheck(moduleName, initId, 0);
					}
					return;
				}
				cache[moduleType.init + moduleName] = moduleName.split('|kk|');
				
			} else {
				cache[moduleType.exports + moduleName] = cache[moduleType.exports + moduleName] || {};
				cache[moduleType.module + moduleName] = module;
			}
			resetCheck(moduleName, initId, 0);
			
			for(var i = 0, len = module.depend.length; i < len; ){
				var depend = module.depend[i++];
				if(preComboMods[depend]){
					cache[moduleType.exports + depend] = cache[moduleType.exports + depend] || {};
				} else {
					var path = this['#module:getPath'](depend);
					preComboMods[depend] = true;
					loadJS(path, function(name){
						!initId && (cache[moduleType.exports + name] = cache[moduleType.exports + name] || {});
					});
				}
			}
		},
		define: function(module, deplist, factory){
			var cache = package['#module:cache'];
			if(((!isString(module) || !module) && !deplist) || cache[moduleType.defineId + module]){
				return;
			}
			if( isFunction(deplist)){
				factory = deplist;
				deplist = [];
			} else if( isString(deplist) ){
				deplist = trim(deplist).split(',');
			}
			cache[moduleType.defineId + module] = true;
			package.require({
				module : module,
				depend : deplist,
				factory : factory
			}); 
		},
		use: function(deplist, factory){
			if(!deplist || isFunction(deplist) ) return;
			if( isString(deplist) ){
				deplist = trim(deplist).split(',');
			}
			var moduleName = deplist.join('|kk|'),
				cache = this['#module:cache'];
			cache[moduleType.initId + moduleName] = cache[moduleType.initId + moduleName] + 1 || 0;
			this.require({
				module : moduleName, 
				depend : deplist,
				factory : factory,
				initId : cache[moduleType.initId + moduleName]
			});
		}
	},
	setBasePath = function(path){
		if(!path){
			var result = "", m;
			try{
				a.b.c();
			} catch(e) {
				if(e.fileName){ //firefox
					result = e.fileName;
				}
				else if(e.sourceURL){ //safari
					result = e.sourceURL;
				}
				else if(e.stacktrace){ //opera9
					m = e.stacktrace.match(/\(\) in\s+(.*?\:\/\/\S+)/m);
					if(m && m[1])
						result = m[1];
				}
				else if(e.stack){ //chrome 4+
					m = e.stack.match(/\(([^)]+)\)/);
					if (m && m[1])
						result = m[1];
				}
			}
			if(!result){ //IE与chrome4 - opera10+
				var scripts = doc.getElementsByTagName("script"),
				reg = /jpjs.js(\W|$)/i,src;
				for(var i=0, el; el = scripts[i++]; ){
					src = !!doc.querySelector ? el.src : el.getAttribute("src", 4);
					if(src && reg.test(src)){
						result = src;
						break;
					}
				}
			}
			basepath = result.substr(0,result.lastIndexOf('/')+1);
		} else {
			basepath = path;
		}
	},
	preload = function(callback){
		var len = preloadMods.length;
		if(len){
			package.use(preloadMods, function(){
				preloadMods.splice(0, len);
				preload(callback);
			});
		} else {
			callback && callback();
		}
	};
	setBasePath();
	var curLoadMods = [];
	jpjs.use = function(ids, callback){
		if(isFunction(ids)){//如果没有传递ids参数
			callback = ids;
			ids = null;
		}
		curLoadMods.push({id: ids, callback: callback});
		var curMod;
		preload(function(){
			while(curMod = curLoadMods.shift()){
				if(curMod.id){
					package.use(curMod.id, curMod.callback);
				} else {
					if(globalMods.length){
						package.use(globalMods[0], curMod.callback);
					} else {
						curMod.callback();
					}
				}
			}
		});
		return jpjs;
	}
	jpjs.config = function(configData) {
		for (var key in configData) {
			switch(key){
				case "comboHost":
					comboHost = configData[key];
					break;
				case "comboPath":
					comboPath = configData[key];
					break;
				case "preCombo":
					var data = configData[key],
						mods;
					if(isString(data)){
						mods = trim(data).split(',');
					} else if(isArray(data)){
						mods = data;
					}
					for(var len = mods.length - 1; len >= 0; len--){
						preComboMods[mods[len]] = true;
					}
					break;
				case "combos":
					var data = configData[key];
					if (data && isObject(data)) {
						for (var k in data) {
							comboMods[k] = data[k];
						}
					}
					break;
				case "normailzeNames":
					normailzeNames = configData[key];
				case "version":
					var data = configData[key];
					if(isObject(data)){
						for(var k in data){
							comboVersion[k] = data[k];
						}
					}
					break;
				case "basepath":
					setBasePath(configData[key]);
					break;
				case "preload":
					var data = configData[key];
					if(isString(data)){
						preloadMods = trim(data).split(',');
					} else if(isArray(data)){
						preloadMods = data;
					}
					if(isArray(preloadMods = array.unique(preloadMods))){
						globalMods = array.unique(globalMods.concat(preloadMods));
					}
					break;
				case "isDebug":
					isDebug = !!configData[key];
				case "map":
					var map;
					if ((map = configData[key]) && isObject(map)) {
						for (var k in map) {
							maps[k] = map[k];
						}
					}
					break;
				case "charset":
					var data = configData[key];
					if(isString(data)) {
						charset = data;
					}
			}
		}
		return jpjs;
	}
	
	/*jpjs.config({
		//isDebug: true,
		preload: 'jquery, base.util, base.class, base.shape',
		preCombo: 'jquery, base.util, base.class, base.shape, base.event, base.attribute, base.aspect, tools.cookie',
		map: {
			jquery: 'jquery.min',
			uploadify: 'jpjob/uploadify/uploadify'
		}
	});*/

	global.define = package.define;
	jpjs.loadJS = loadJS;
	
})(window, document);