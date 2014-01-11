/**
 * Created by pc on 13-12-23.
 */
define(function(require){
    var $ = require('jQuery');
    var subbyte = require('subbyte');
    var template = require('template');
    var Dialog = require('Dialog');
    var AppDialogTpl = require('AppDialogTpl');
    var FixAppstatus = require('FixAppstatus');
    var Slider = require('Slider');
    var Observer = require('Observer');
    var returnToTop = require('returnToTop');
    returnToTop.config.container_width = 980;
    returnToTop.init();
    var searchForm = require('searchForm');

    var urls = require('urls_config');
    //用于调试
    var url = urls.offlineStatus ? urls.offline.subject + '?t=' + new Date().getTime() : urls.online.subject + '&t=' + new Date().getTime();


    var Zt = function(opts){
        this.cache = {};
        this.url = opts.url;
        this.tpl = opts.tpl;
        this.$wrap = opts.wrap;
        this.getData();

    };
    Zt.prototype = {
        constructor:Zt,
        getData:function(){
            var id = location.search.slice(4);
            var me = this;
            if(!/\d/.test(id)){
                return;
            }
            $.ajax({url:url + '&subject=' + id}).done($.proxy(me.fixData,me));
        },
        fixData:function(res){
            var me = this;
            if(!res.res){
                return;
            }
            var info = res.info,
                header = info.header,
                body = info.body,
                hook;

            for(var i = 0,len = body.length;i<len;i++){
                var item = body[i];
                var list = item.list;
                //判断app是否已经安装
                if(!(list &&list.length ) ){
                    continue;
                }
                list = FixAppstatus.fixAppData(list);
                me.cacheData(list);
            }
            this.renderAll(header,body);
        },
        renderOne:function(name,data,odd){
            return template(this.tpl,{data:data,name:name,odd:odd});
        },
        renderAll:function(header,body){
            this.renderHeader(header);
            var html = [];

            for(var i=0,len = body.length;i<len;i++){
                var cur = body[i];
                if( !( cur.list && cur.list.length ) ){
                    continue;
                }
                html.push(this.renderOne(cur.name,cur.list, (i % 2) ));
            }

            this.$wrap.html(html.join(''));
            this.bindEvt();
        },
        renderHeader:function(header){
            $('.top-banner').css({
                "background": header.color + " url("+ header.headimg +") no-repeat center center"
            });
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
            var me = this;
            //翻页
            this.pagerHandle();


            //所有扩展，点击出弹窗
            this.$wrap.on('click','a.J-show-dialog',function(e){
                var $this = $(this),
                    app_data;
                var uuid = $this.attr('data-uuid');
                if(!(uuid && (app_data = me.cache[uuid]) )){
                    return;
                }
                var html = AppDialogTpl.render({data:app_data});
                var dialog = new Dialog('x',{
                    zIndex:20,
                    title:'',
                    w:952,
                    h:580,
                    noFixPos:true,  //不需要js调整坐标
                    content:html,
                    fixClass:'add-dialog',
                    contentClass:'add-dialog-outer'
                });
                dialog.show();
                e.stopPropagation();
                return false;
            });
            //更新本地缓存数据
            Observer.register('updateData',this.updateData,this);
        },
        updateData:function(uuid,subtraction){
            this.cache[uuid] && (this.cache[uuid].installed = subtraction ? false : true);
        },
        pagerHandle:function(){
            var wraps = $('.zt-list-wrap');
            $.each(wraps,function(i,item){
                var $item = $(item);
                //翻页
                var unslider = $item.unslider({
                    //dots:true,
                    autoplay:false,
                    loop:false,
                    complete:onComplete,
                    items: '.zt-list-bd',   // slides container selector
                    item: '.list-row'   // slidable items selector
                });
                var instace_key = $item.data('key');
                var instance = $item.data(instace_key);
                var len = instance.li.length;

                var $pager = $item.prev().find('.list-pager');
                $item.find('.list-row').length > 1 ? ($pager.show()) : '';

                if($pager.length){
                    $pager.on('click','span',function(){
                        var fn = $(this).attr('data-action');
                        //$(this).addClass('current').siblings().removeClass('current');
                        //  Either do unslider.data('unslider').next() or .prev() depending on the className
                        instance[fn]();
                    });
                    //边界判断
                    var $next = $pager.find('.next');
                    var $prev = $pager.find('.prev');
                    function onComplete(){
                        if(len == 2){
                            if(instance.i == len -1){
                                $next.addClass('disabled');
                                $prev.removeClass('disabled');
                            }
                            if(instance.i == 0){
                                $prev.addClass('disabled');
                                $next.removeClass('disabled');
                            }    
                        }else{
                            if(instance.i > 0 && instance.i < len -1){
                                $pager.find('.disabled').removeClass('disabled');
                            }
                            if(instance.i == len -1){
                                $next.addClass('disabled');
                            }
                            if(instance.i == 0){
                                $prev.addClass('disabled');
                            }    
                        }
                    };
                }
                


            });



        }
    };
    function init(opts){
        new Zt(opts);
    };
    return {
        init:init
    };
});