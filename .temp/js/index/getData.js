/**
 * Created by pc on 13-12-23.
 */
define("src/js/index/getData", [ "src/js/libs/urls_config", "src/js/libs/jquery" ], function(require) {
    var status = "offline";
    var urls_config = require("src/js/libs/urls_config");
    var $ = require("src/js/libs/jquery");
    //上网必备
    var onlineMuster = function() {
        return {
            get: function() {
                var ajax = $.ajax(urls_config[status].onlineMust);
                ajax.onSuccess = function() {};
            }
        };
    }();
    return {
        onlineMuster: onlineMuster
    };
});