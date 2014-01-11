/**
 * Created by pc on 13-12-24.
 */
define("src/js/top/top", [ "src/js/libs/jquery", "src/js/libs/subbyte", "src/js/libs/template", "src/js/libs/Dialog", "src/js/libs/AppDialogTpl", "src/js/libs/FixAppstatus", "src/js/libs/Observer", "src/js/libs/reportValue", "src/js/libs/needUpdate", "src/js/libs/mainNavItem", "src/js/libs/returnToTop", "src/js/libs/throttle", "src/js/libs/debounce", "src/js/libs/searchForm", "src/js/libs/xss", "src/js/libs/queryString", "src/js/libs/urls_config" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var subbyte = require("src/js/libs/subbyte");
    var template = require("src/js/libs/template");
    var Dialog = require("src/js/libs/Dialog");
    var AppDialogTpl = require("src/js/libs/AppDialogTpl");
    var FixAppstatus = require("src/js/libs/FixAppstatus");
    var Observer = require("src/js/libs/Observer");
    require("src/js/libs/returnToTop").init();
    var searchForm = require("src/js/libs/searchForm");
    var urls = require("src/js/libs/urls_config");
    //用于调试
    var url = urls.offlineStatus ? urls.offline.topRank + "?t=" + new Date().getTime() : urls.online.topRank + "&t=" + new Date().getTime();
    //本地缓存数据,便于dialog获取数据
    var cacheMap = {};
    function TopRank(opts) {
        this.cache = {};
        var $wrap = this.$wrap = $(opts.wrap);
        this.tpl = $(opts.tpl).html();
        this.body = {
            week: $wrap.find(".ranks_body_week"),
            recent: $wrap.find(".ranks_body_recent")
        };
        this.getData.apply(this, arguments);
    }
    TopRank.prototype = {
        constructor: TopRank,
        getData: function() {
            var me = this;
            $.ajax({
                url: url,
                beforeSend: function() {
                    me.body.week.html('<div class="loading"></div>');
                }
            }).done($.proxy(me.fixData, me));
        },
        fixData: function(res) {
            //var dfd = new $.Deferred();
            res = typeof res == "string" ? JSON.parse(res) : res;
            if (!res.res) {
                return;
            }
            var info = res.info;
            //删除没用的数据类型
            delete info.recentnum;
            for (var key in info) {
                var data = info[key];
                //判断app是否已经安装
                data = FixAppstatus.fixAppData(data);
                this.cache[key] = data;
                //修正数据，变成一个hash表格，
                this.cacheData(key, data);
            }
            //render
            this.renderUi(this.cache);
        },
        cacheData: function(kdy, data) {
            $.each(data, function(i, item) {
                cacheMap[item.app_uuid] = item;
            });
        },
        getCacheByuuid: function(uuid) {
            return cacheMap[uuid];
        },
        renderUi: function(res) {
            var me = this;
            var body = this.body;
            if (!$.isEmptyObject(res)) {
                for (var type in res) {
                    var data = res[type];
                    var html = [];
                    $.each(data, function(i, item) {
                        if ((i + 1) % 3 == 0) {
                            item["hideBorder"] = true;
                        }
                        if (item.app_summary) {
                            item.app_summary = subbyte.subByte(item.app_summary, 56);
                        }
                    });
                    var _html = template(me.tpl, {
                        data: data
                    });
                    body[type].html(_html);
                }
                this.bindEvt();
            }
        },
        bindEvt: function() {
            //根据search query按需展示内容模块
            var lastType = this.initTabBySearchQuery();
            var body = this.body, $lastBody = body[lastType], $tabWrap = $(".ranks_header"), $tabLast = $tabWrap.find("." + lastType);
            //根据search显示默然tab及内容
            this.initTab($lastBody, $tabLast);
            $tabWrap.on("click", "h3", function() {
                var $this = $(this);
                var type = $this.attr("data-type");
                if (lastType == type) {
                    return;
                }
                $tabLast.removeClass("current");
                $this.addClass("current");
                $tabLast = $this;
                $lastBody.hide();
                body[type].show();
                $lastBody = body[type];
                lastType = type;
            });
            //所有扩展，点击出弹窗
            this.$wrap.on("click", "a.J-show-dialog", function() {
                var $this = $(this), app_data;
                var uuid = $this.attr("data-uuid");
                if (!(uuid && (app_data = cacheMap[uuid]))) {
                    return;
                }
                var html = AppDialogTpl.render({
                    data: app_data
                });
                var dialog = new Dialog("x", {
                    zIndex: 20,
                    title: "",
                    w: 952,
                    h: 580,
                    noFixPos: true,
                    //不需要js调整坐标
                    content: html,
                    fixClass: "add-dialog",
                    contentClass: "add-dialog-outer"
                });
                dialog.show();
            });
            //更新本地缓存数据
            Observer.register("updateData", this.updateData, this);
        },
        updateData: function(uuid, subtraction) {
            cacheMap[uuid] && (cacheMap[uuid].installed = subtraction ? false : true);
        },
        initTabBySearchQuery: function() {
            var search = location.search;
            if (!(search && search.indexOf("type") > 0)) {
                this.type = "week";
            } else {
                this.type = search.split("&")[0].slice(6);
            }
            var flag = $.inArray(this.type, [ "recent", "week" ]) >= 0;
            !flag && (this.type = "week");
            return this.type;
        },
        initTab: function($lastBody, $tabLast) {
            $lastBody.show();
            $tabLast.addClass("current");
        }
    };
    function start(opts) {
        new TopRank(opts);
    }
    return {
        start: start
    };
});
