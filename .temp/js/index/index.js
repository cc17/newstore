define("src/js/index/index", [ "src/js/libs/jquery", "./Tasks", "./OnlineMust", "src/js/libs/subbyte", "src/js/libs/template", "./Recommend", "src/js/libs/Slider", "src/js/libs/FixAppstatus", "src/js/libs/Observer", "src/js/libs/reportValue", "src/js/libs/needUpdate", "src/js/libs/mainNavItem", "./DownloadAndNewadd", "./AppSlide", "src/js/libs/urls_config", "src/js/libs/searchForm", "src/js/libs/xss", "src/js/libs/queryString", "src/js/libs/Dialog", "src/js/libs/AppDialogTpl", "src/js/libs/returnToTop", "src/js/libs/throttle", "src/js/libs/debounce" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var Tasks = require("./Tasks");
    require("src/js/libs/returnToTop").init();
    //init
    function start() {
        var tasks = new Tasks();
        tasks.init();
    }
    return {
        start: start
    };
});