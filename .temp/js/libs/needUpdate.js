define("src/js/libs/needUpdate", [], function() {
    var lb_version;
    try {
        lb_version = external.LiebaoGetVersion().split(".");
    } catch (e) {}
    return function(require_version, current_version) {
        current_version = current_version || lb_version;
        var ret = false;
        if (!require_version) {
            return false;
        }
        try {
            var require_version = require_version.split(".");
            for (var i = 0; i < current_version.length; ++i) {
                if (parseInt(require_version[i]) > parseInt(current_version[i])) {
                    ret = true;
                }
            }
            return ret;
        } catch (e) {
            return false;
        }
    };
});