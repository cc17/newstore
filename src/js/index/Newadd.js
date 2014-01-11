/**
 * Created by pc on 13-12-23.
 */
define(function(require){
    var $ = require('jQuery');
    var subbyte = require('subbyte');
    var template = require('template');

    
    var Newadd = function(opts){
        this.$wrap = $(opts.wrap);
        this.tpl = $(opts.tpl).html();
        this.url = opts.url;
        this.cache = [];
        this.getData.apply(this,arguments);
    };
    Newadd.prototype = {
        constructor:Newadd,
        getData:function(){
            var me = this;
            $.ajax({url:this.url + '?t=' + new Date().getTime()}).done($.proxy(me.renderUi,me)).then($.proxy(me.bindEvt,me));
        },
        renderUi:function(res){
            res = JSON.parse(res);
            var me = this;
            if(res.errno == 0){
                var data = res.data;
                this.cacheData(data);
                var html =  template(me.tpl,{data:data});
                this.$wrap.html(html);
                $('.newadd-count').html('最新上架' + data.length + '款');
                //触发cache到全局
                this.getCache(this._getCache());
            }
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
        events:{
            'mouseover':'mouseoverHandle',
            'mouseout':'mouseoutHandle'
        },
        mouseoverHandle:function(){
            var $this = $(this);
            $this.addClass('hover');
            $this.find('.app-install').show();
        },
        mouseoutHandle:function(){
            var $this = $(this);
            $this.removeClass('hover');
            $this.find('.app-install').hide();
        },
        bindEvt:function(){
            var me = this;
            for(var type in this.events){
                var handler = me[this.events[type]];
                this.$wrap.on(type, '.item',handler);
            }
        }
    };
    return Newadd;
});