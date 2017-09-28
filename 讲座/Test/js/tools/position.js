// JavaScript Document

define('tools.position', function(require, exports, module){

	var viewport = { _id: 'viewport', nodeType: 1 },
		util = require('base.util'),
        $ = module['jquery'],
        isPinFixed = false,
		win = window,
		doc = document,
        isIE6 = !-[1,] && !win.XMLHttpRequest;
	
	exports.pin = function(pinObject, baseObject, topObject, callback){
		
		if(util.type.isFunction(topObject)) {
			callback = topObject;
			topObject = null;
		}
		
		pinObject = normalize(pinObject);
        baseObject = normalize(baseObject);
		topObject = topObject && normalize(topObject);
		
		var pinElement = $(pinObject.element);
		
		if (pinElement.css('position') !== 'fixed' || isIE6) {
            pinElement.css('position', 'absolute');
            isPinFixed = false;
        }
        else {
            isPinFixed = true;
        }
		
		posConverter(pinObject);
        posConverter(baseObject);
		topObject && posConverter(topObject);
		
		var parentOffset = getParentOffset(pinElement),
			baseOffset = baseObject.offset(),
			topOffset = topObject && topObject.offset();
			
		// 计算目标元素的位置
        var top = ((topOffset && (topOffset.top + topObject.y)) || (baseOffset.top + baseObject.y)) -
                pinObject.y - parentOffset.top;

        var left = baseOffset.left + baseObject.x -
                pinObject.x - parentOffset.left;
        // 定位目标元素
		if(callback){
			callback.call(this, {
				target: pinElement,
				left: left,
				top: top
			});
		} else {
        	pinElement.css({ left: left, top: top });
		}
	}
	// 将目标元素相对于基准元素进行居中定位
    // 接受两个参数，分别为目标元素和定位的基准元素，都是 DOM 节点类型
    exports.center = function(pinElement, baseElement) {
        this.pin({
            element: pinElement,
            x: '50%',
            y: '50%'
        }, {
            element: baseElement,
            x: '50%',
            y: '50%'
        });
    };
	
	exports.viewport = viewport;
	
	function normalize(posObject) {
		
        posObject = $(posObject)[0] || {};
		
        if (posObject.nodeType) {
            posObject = { element: posObject };
        }
		
        var element = $(posObject.element)[0] || viewport;
        if (element.nodeType !== 1) {
            throw new Error('assists.position: 无效HTML标签');
        }

        var result = {
            element: element,
            x: posObject.x || 0,
            y: posObject.y || 0
        };
        var isViewport = (element === viewport || element._id === 'viewport');
        // 归一化 offset
        result.offset = function() {
            // 若定位 fixed 元素，则父元素的 offset 没有意义
            if (isPinFixed) {
                return {
                    left: 0,
                    top: 0
                };
            } else if (isViewport) {
                return {
                    left: $(doc).scrollLeft(),
                    top: $(doc).scrollTop()
                };
            } else {
                return getOffset($(element)[0]);
            }
        };

        // 归一化 size, 含 padding 和 border
        result.size = function() {
            var el = isViewport ? $(win) : $(element);
            return {
                width: el.outerWidth(),
                height: el.outerHeight()
            };
        };
        return result;
    }
	
	// 对 x, y 两个参数为 left|center|right|%|px 时的处理，全部处理为纯数字
    function posConverter(pinObject) {
        pinObject.x = xyConverter(pinObject.x, pinObject, 'width');
        pinObject.y = xyConverter(pinObject.y, pinObject, 'height');
    }
	
	// 处理 x, y 值，都转化为数字
    function xyConverter(x, pinObject, type) {
        // 先转成字符串再说！好处理
        x = x + '';

        // 处理 px
        x = x.replace(/px/gi, '');

        // 处理 alias
        if (/\D/.test(x)) {
            x = x.replace(/(?:top|left)/gi, '0%')
                 .replace(/center/gi, '50%')
                 .replace(/(?:bottom|right)/gi, '100%');
        }

        // 将百分比转为像素值
        if (x.indexOf('%') !== -1) {
            //支持小数
            x = x.replace(/(\d+(?:\.\d+)?)%/gi, function(m, d) {
                return pinObject.size()[type] * (d / 100.0);
            });
        }

        // 处理类似 100%+20px 的情况
        if (/[+\-*\/]/.test(x)) {
            try {
                // eval 会影响压缩
                // new Function 方法效率高于 for 循环拆字符串的方法
                x = (new Function('return ' + x))();
            } catch (e) {
                throw new Error('assists.position: 无效数值: ' + x);
            }
        }

        // 转回为数字
        return numberize(x);
    }
	
	// 获取 offsetParent 的位置
    function getParentOffset(element) {
		
        var parent = element.offsetParent();

        // IE7 下，body 子节点的 offsetParent 为 html 元素，其 offset 为
        // { top: 2, left: 2 }，会导致定位差 2 像素，所以这里将 parent
        // 转为 document.body
        if (parent[0] === doc.documentElement) {
            parent = $(doc.body);
        }

        // 修正 ie6 下 absolute 定位不准的 bug
        if (isIE6) {
            parent.css('zoom', 1);
        }

        // 获取 offsetParent 的 offset
        var offset;

        // 当 offsetParent 为 body，
        // 而且 body 的 position 是 static 时
        // 元素并不按照 body 来定位，而是按 document 定位
        // 因此这里的偏移值直接设为 0 0
        if (parent[0] === doc.body &&
            parent.css('position') === 'static') {
                offset = { top:0, left: 0 };
        } else {
            offset = getOffset(parent[0]);
        }
            
        // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
        offset.top += numberize(parent.css('border-top-width'));
        offset.left += numberize(parent.css('border-left-width'));

        return offset;
    }
	
	function numberize(s) {
        return parseFloat(s, 10) || 0;
    }
	
	function getOffset(element) {
        var box = element.getBoundingClientRect(),
            docElem = doc.documentElement;

        // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
        return {
            left: box.left + (win.pageXOffset || docElem.scrollLeft) -
                  (docElem.clientLeft || doc.body.clientLeft  || 0),
            top: box.top  + (win.pageYOffset || docElem.scrollTop) -
                 (docElem.clientTop || doc.body.clientTop  || 0)
        };
    }
	return exports;
});