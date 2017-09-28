// JavaScript Document

define('tools.iframe', ['tools.position'], function(require, exports, module) {

    var $ = module['jquery'],
		position = require('tools.position'),
		isIE6 = (window.navigator.userAgent || '').toLowerCase().indexOf('msie 6') !== -1;
		
    // target 是需要添加垫片的目标元素，可以传 `DOM Element` 或 `Selector`
    function iframe(target) {
        // 如果选择器选了多个 DOM，则只取第一个
        this.target = $(target).eq(0);
    }
	iframe.prototype.resize = function(width, height){
		var target = this.target;
		if(!target.length) return;
		
		height = height || target.outerHeight();
		width = width || target.outerWidth();
		this.iframe && this.iframe.css({
			'height': height,
			'width': width
		});
	}
	iframe.prototype.hide = function(){
		var target = this.target;
		if (!target.length) return this;
			this.iframe && this.iframe.hide();
	}
    // 根据目标元素计算 iframe 的显隐、宽高、定位
    iframe.prototype.shim = function() {
        var target = this.target;
        var iframe = this.iframe;

        // 如果未传 target 则不处理
        if (!target.length) return this;

        var height = target.outerHeight();
        var width = target.outerWidth();

        // 如果目标元素隐藏，则 iframe 也隐藏
        // jquery 判断宽高同时为 0 才算隐藏，这里判断宽高其中一个为 0 就隐藏
        if (!height || !width || target.is(':hidden')) {
            this.hide();
        } else {
            // 第一次显示时才创建
            iframe || (iframe = this.iframe = createIframe(target));
            iframe.css({
                'height': height,
                'width': width,
				'background': '#ff0'
            });
            position.pin(iframe[0], target[0]);
            iframe.show();
        }
        return this;
    };

    // 销毁 iframe 等
    iframe.prototype.destory = function() {
        if (this.iframe) {
            this.iframe.remove();
            delete this.iframe;
        }
        delete this.target;
    };

    if (isIE6) {
        exports.shim = iframe;
    } else {
        // 除了 IE6 都返回空函数
        function noop(){}

        noop.prototype.shim = 
		noop.prototype.resize = function() {return this};
        noop.prototype.destory = noop;

        exports.shim = noop;
    }

    // 在 target 之前创建 iframe，这样就没有 z-index 问题
    // iframe 永远在 target 下方
    function createIframe(target) {
        var css = {
            display: 'none',
            border: 'none',
            opacity: 0,
            position: 'absolute'
        };

        // 如果 target 存在 zIndex 则设置
        var zIndex = target.css('zIndex');
        if (zIndex && zIndex > 0) {
            css.zIndex = zIndex - 1;
        }

        return $('<iframe>', {
            src: 'javascript:', 
            frameborder: 0,
            css: css
        }).insertBefore(target);
    }

});