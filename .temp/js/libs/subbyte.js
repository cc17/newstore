/**
 * Created by pc on 13-12-23.
 */
define("src/js/libs/subbyte", [], function() {
    var getByteLength = function(str) {
        return String(str).replace(/[^\x00-\xff]/g, "xx").length;
    };
    var subByte = function(source, length, tail) {
        source = String(source);
        tail = tail || "...";
        if (length < 0 || getByteLength(source) <= length) {
            return source + tail;
        }
        //thanks 加宽提供优化方法
        source = source.substr(0, length).replace(/([^\x00-\xff])/g, "$1 ").substr(0, length).replace(/[^\x00-\xff]$/, "").replace(/([^\x00-\xff]) /g, "$1");
        //还原
        return source + tail;
    };
    return {
        getByteLength: getByteLength,
        subByte: subByte
    };
});