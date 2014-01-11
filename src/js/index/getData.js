/**
 * Created by pc on 13-12-23.
 */
define(function (require) {
    var status = 'offline';
    var urls_config = require('urls_config');
    var $ = require('jQuery');
    //上网必备
    var onlineMuster = (function(){
        return {
            get:function(){
                var ajax =  $.ajax(urls_config[status].onlineMust);
                ajax.onSuccess = function(){

                };
            }
        };
    })();

    return {
        onlineMuster : onlineMuster
    };
});