/**
 * Created by pc on 13-12-25.
 */
define(function () {
    var Observer = {
        _callbacks:{},
        register:function(name,fn,context){
            if(!name){
                return;
            }
            fn = fn || function(){};
            if(!Observer._callbacks[name]){
                var list = Observer._callbacks[name] = [];
            }
            list.push({fn:fn,context:context});
        },
        trigger:function(name){
            var lists = [];
            if(!name){ //触发所有
                for(var key in Observer._callbacks){
                    lists.concat(Observer._callbacks[key]);
                }
            }else{ //触发指定
                lists = Observer._callbacks[name];
            }
            for(var i = 0,len =lists.length;i<len;i++){
                var list = lists[i];
                var _fn = list.fn;
                return _fn.apply(list.context || this,[].slice.call(arguments,1));
            }
        }
    };
    return Observer;
});