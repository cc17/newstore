define(function(require, exports) {
    return {
        stringify: function(obj){
            var arr = [];
            for(var key in obj){
                if(typeof obj[key] === 'string'){
                    arr.push(encodeURIComponent(key) + '='+encodeURIComponent(obj[key]));
                }
            }
            return arr.join('&');
        },
        parse: function(str){
            var arr = str.split('&');
            var obj = {};
            for(var i = 0,len = arr.length;i<len;i++){
                var subStr = arr[i];
                var subArr = subStr.split('=');
                obj[subArr[0]]=subArr[1] || '';
            }
            return obj;
        }
    }
});
