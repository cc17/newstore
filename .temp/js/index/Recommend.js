/**
 * Created by pc on 13-12-23.
 */
define("src/js/index/Recommend", [ "src/js/libs/jquery", "src/js/libs/subbyte", "src/js/libs/Slider", "src/js/libs/template", "src/js/libs/FixAppstatus", "src/js/libs/Observer", "src/js/libs/reportValue", "src/js/libs/needUpdate", "src/js/libs/mainNavItem" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var subbyte = require("src/js/libs/subbyte");
    var Slider = require("src/js/libs/Slider");
    var template = require("src/js/libs/template");
    var FixAppstatus = require("src/js/libs/FixAppstatus");
    var OnlineMust = function(opts) {
        this.$listWrap = opts.listWrap;
        this.$lists = opts.lists;
        this.$pager = opts.pager;
        this.step = 716;
        this.tpl = $(opts.tpl).html();
        this.url = opts.url;
        this.cache = [];
        this.getData.apply(this, arguments);
    };
    OnlineMust.prototype = {
        constructor: OnlineMust,
        getData: function() {
            var me = this;
            $.ajax({
                url: this.url + (this.url.indexOf("?") > 0 ? "&t=" : "?t=") + new Date().getTime(),
                beforeSend: function() {
                    me.$lists.html('<div class="loading"></div>');
                }
            }).done($.proxy(me.renderUi, me));
        },
        renderUi: function(res) {
            res = typeof res == "string" ? JSON.parse(res) : res;
            var me = this;
            if (res.res) {
                var data = res.info;
                var html = [];
                //判断app是否已经安装
                data = FixAppstatus.fixAppData(data);
                if (data && data.length > 9) {
                    me.$pager.show();
                }
                //如果不是9的倍数，需用空白格子补齐
                if (data.length % 9 != 0) {
                    var count = Math.ceil(data.length / 9) * 9 - data.length;
                    for (var i = 0; i < count; i++) {
                        data.push({
                            is_blank: true
                        });
                    }
                }
                //缓存
                this.cacheData(data);
                var html = template(me.tpl, {
                    data: data
                });
                me.$lists.html(html);
                //触发cache到全局
                me.getCache(me._getCache());
                me.bindEvt();
            } else {
                me.$lists.html("暂无数据");
            }
        },
        bindEvt: function() {
            var $pager = this.$pager;
            //翻页
            var unslider = this.$listWrap.unslider({
                //dots:true,
                autoplay: false,
                loop: false,
                maxWidth: 714,
                complete: onComplete,
                items: ".main-list",
                // slides container selector
                item: ".reco-row"
            });
            var instace_key = this.$listWrap.data("key");
            var instance = this.$listWrap.data(instace_key);
            var len = instance.li.length;
            $pager.on("click", "span", function() {
                var fn = $(this).attr("data-action");
                instance[fn]();
            });
            //边界判断
            var $next = $pager.find(".next");
            var $prev = $pager.find(".prev");
            function onComplete() {
                if (len == 2) {
                    if (instance.i == len - 1) {
                        $next.addClass("disabled");
                        $prev.removeClass("disabled");
                    }
                    if (instance.i == 0) {
                        $prev.addClass("disabled");
                        $next.removeClass("disabled");
                    }
                } else {
                    if (instance.i > 0 && instance.i < len - 1) {
                        $pager.find(".disabled").removeClass("disabled");
                    }
                    if (instance.i == len - 1) {
                        $next.addClass("disabled");
                    }
                    if (instance.i == 0) {
                        $prev.addClass("disabled");
                    }
                }
            }
        },
        cacheData: function(res) {
            var me = this;
            $.each(res, function(i, item) {
                me.cache[item.app_uuid] = item;
            });
        },
        _getCache: function() {
            return this.cache;
        }
    };
    return OnlineMust;
});