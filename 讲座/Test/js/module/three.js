/**
 * Created by Administrator on 2017/9/12.
 */
define('module.three',['module.three0','module.three1'],function (require, exports, module) {
    var three0 = module['module.three0'], three1 = module['module.three1'];
    exports.showName = function () {
        console.log('three....');
        three0.showName();
        three1.showName();
    };
    return exports;
});