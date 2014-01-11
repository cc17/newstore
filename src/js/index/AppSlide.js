/**
 * Created by pc on 13-12-26.
 */
define(function (require) {
    var $ = require('jQuery');
    var Slider = require('Slider');
    var template = require('template');

    var urls = require('urls_config');
    //用于调试
    var urlStats = urls.offlineStatus ? 'offline' : 'online';

    var AppSlide = function(){
        this.cache= [];
        this.tpl = [
            '<% for(var i=0;i<data.length;i++){ %>',
                '<% var item = data[i]; %>',
                '<li   > ' ,
                    '<a href="<% if(item.app_url){ %><%= item.app_url %><%}else{%>###<%}%> " target="_blank"  <% if(item.app_uuid){%> class="J-show-dialog" data-uuid="<%= item.app_uuid %>" <% } %> >',
                    ' <img src="<%= item.headimg  %>" />',
                    '</a>',
                '</li>',
            '<% } %> '].join("");
        this.$list =  $('.slider-list');
        this.getData();
    };
    AppSlide.prototype = {
        constructor:AppSlide,
        getData:function(){
            //test
            //this.bindEvt();
            var me = this;
            $.ajax({
                url: urls[urlStats].slider +  (urls[urlStats].slider.indexOf('?') > 0 ? '&t=' : '?t=') + new Date().getTime(),
                beforeSend:function(){
                    me.$list.html('<div class="loading"></div>');
                }
            }).done($.proxy(me.renderUi,me));
        },
        renderUi:function(data){
            data = typeof data == 'string' ? JSON.parse(data) : data;
            if(!data.res){
                return;
            }
            var info = data.info,
                headimg = info.headimg,
                midimg = info.midimg;
            if(!headimg.length && !midimg.length){
                return;
            }
           

            this.cacheData(headimg);
            var html = template(this.tpl,{data:headimg});
            this.$list.html(html);
            //触发cache到全局
            this.getCache(this._getCache());
            this.midBanner(midimg);
            this.bindEvt();
        },
        midBanner:function(midimg){
            midimg = midimg[0];
            var html = '<a href="'+ midimg.app_url +'" target="_blank"><img src="'+ midimg.midimg +'" /></a>';
            $('.zt-banner').html(html);
        },
        cacheData:function(res){
            var me = this;
            $.each(res,function(i,item){
                me.cache[item.app_uuid] = item;
            });
        },
        _getCache:function(){
            return this.cache;
        },
        bindEvt:function(){

            var unslider = $('.slider').unslider({
                dots:true
            });
            $('.unslider-arrow').click(function() {
                var fn = this.className.split(' ')[1];
                //  Either do unslider.data('unslider').next() or .prev() depending on the className
                unslider.data('unslider')[fn]();
            });
        }
    };
    return AppSlide;
});