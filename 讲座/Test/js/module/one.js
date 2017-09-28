/**
 * Created by Administrator on 2017/9/12.
 */
define('module.one',['module.two','module.three'],function (require, exports, module) {
    var two = module['module.two'], three = module['module.three'];
    exports.showName = function () {
        console.log('one....');
        two.showName();
        three.showName();
    };
    return exports;
});

