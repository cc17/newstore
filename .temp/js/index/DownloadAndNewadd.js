/**
 * Created by pc on 13-12-23.
 */
define("src/js/index/DownloadAndNewadd", [ "src/js/libs/jquery", "src/js/libs/subbyte", "src/js/libs/template", "src/js/libs/FixAppstatus", "src/js/libs/Observer", "src/js/libs/reportValue", "src/js/libs/needUpdate", "src/js/libs/mainNavItem" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var subbyte = require("src/js/libs/subbyte");
    var template = require("src/js/libs/template");
    var FixAppstatus = require("src/js/libs/FixAppstatus");
    var DownloadAndNewadd = function(opts) {
        this.cache = {};
        this.url = opts.url;
        this.week = opts.week;
        this.recent = opts.recent;
        this.hookDiv = opts.hookDiv;
        this.getData();
    };
    DownloadAndNewadd.prototype = {
        constructor: DownloadAndNewadd,
        getData: function() {
            var me = this;
            $.ajax({
                url: this.url + (this.url.indexOf("?") > 0 ? "&t=" : "?t=") + new Date().getTime(),
                beforeSend: function() {
                    me.week.wrap.html('<div class="loading"></div>');
                    me.recent.wrap.html('<div class="loading"></div>');
                }
            }).done($.proxy(me.fixData, me));
        },
        fixData: function(res) {
            res = typeof res == "string" ? JSON.parse(res) : res;
            var me = this;
            if (!res.res) {
                return;
            }
            var info = res.info, hook, //最新下载数量
            recentnum = info.recentnum;
            delete info.recentnum;
            for (var key in info) {
                var data = info[key];
                //判断app是否已经安装
                data = FixAppstatus.fixAppData(data);
                this.renderUi(key, data);
                //显示最新下载的数量
                if (hook = this.hookDiv[key]) {
                    hook.html('<a href="top.html?type=recent"  >本周更新' + recentnum + "款</a>");
                }
                this.cacheData(data);
            }
            //触发cache到全局
            this.getCache(this._getCache());
        },
        renderUi: function(key, data) {
            var html = template(this[key].tpl, {
                data: data
            });
            this[key].wrap.html(html);
        },
        cacheData: function(res) {
            var me = this;
            $.each(res, function(i, item) {
                me.cache[item.app_uuid] = item;
            });
        },
        _getCache: function() {
            return this.cache;
        },
        events: {
            mouseover: "mouseoverHandle",
            mouseout: "mouseoutHandle"
        },
        mouseoverHandle: function() {
            var $this = $(this);
            $this.addClass("hover");
            $this.find(".install").show();
        },
        mouseoutHandle: function() {
            var $this = $(this);
            $this.removeClass("hover");
            $this.find(".install").hide();
        },
        bindEvt: function($wrap) {
            var me = this;
            for (var type in this.events) {
                var handler = me[this.events[type]];
                $wrap.on(type, ".item", handler);
            }
        }
    };
    return DownloadAndNewadd;
});