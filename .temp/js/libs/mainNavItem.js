define("src/js/libs/mainNavItem", [ "./needUpdate" ], function(require) {
    //external.OpenChromeSchemePage("chrome://settings-frame/extensions")
    var needUpdate = require("./needUpdate");
    var lb_version = external.LiebaoGetVersion();
    //其实这个地方是故意 传反的，目的是要让当前版本大于预期的版本，否则都为false
    var flag = needUpdate(lb_version, "4.4.39.6840".split("."));
    if (flag) {
        var $mainNav = $(".main-nav");
        var $extManager = $('<a  href="###" target="_blank">我的应用<span class="extension-count" id="J-ext-count"></span></a>');
        $extManager.appendTo($mainNav).on("click", function(evt) {
            external.OpenChromeSchemePage("chrome://settings-frame/extensions");
            return false;
        });
    }
});