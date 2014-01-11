/**
 * Created by pc on 13-12-23.
 */
define(function () {
    var getByteLength = function(str){
        return String(str).replace(/[^\x00-\xff]/g,'xx').length;
    };
    var subByte = function(source, length, tail){
        source = String(source);
        tail = tail || '...';
        if (length < 0 || getByteLength(source) <= length) {
            return source + tail;
        }

        //thanks 加宽提供优化方法
        source = source.substr(0,length).replace(/([^\x00-\xff])/g,"\x241 ")//双字节字符替换成两个
            .substr(0,length)//截取长度
            .replace(/[^\x00-\xff]$/,"")//去掉临界双字节字符
            .replace(/([^\x00-\xff]) /g,"\x241");//还原
        return source + tail;
    };

    return {
        getByteLength:getByteLength,
        subByte:subByte
    };
});