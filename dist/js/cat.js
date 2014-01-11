/**
 * Created by pc on 13-12-25.
 */
/**
 * Created by pc on 13-12-24.
 */
define("src/js/cat/cat", [ "src/js/libs/jquery", "src/js/libs/subbyte", "src/js/libs/template", "src/js/libs/Dialog", "src/js/libs/AppDialogTpl", "src/js/libs/Observer", "src/js/libs/searchForm", "src/js/libs/reportValue", "src/js/libs/xss", "src/js/libs/queryString", "src/js/libs/FixAppstatus", "src/js/libs/needUpdate", "src/js/libs/mainNavItem", "src/js/libs/returnToTop", "src/js/libs/throttle", "src/js/libs/debounce", "src/js/libs/urls_config", "./getCats" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var subbyte = require("src/js/libs/subbyte");
    var template = require("src/js/libs/template");
    var Dialog = require("src/js/libs/Dialog");
    var AppDialogTpl = require("src/js/libs/AppDialogTpl");
    var Observer = require("src/js/libs/Observer");
    var searchForm = require("src/js/libs/searchForm");
    var FixAppstatus = require("src/js/libs/FixAppstatus");
    require("src/js/libs/returnToTop").init();
    var urls = require("src/js/libs/urls_config");
    //用于调试
    var now = new Date().getTime();
    var url = urls.offlineStatus ? urls.offline.cat + "?t=" + now : urls.online.cat;
    //本地缓存数据,便于dialog获取数据
    var cacheMap = {};
    var getCats = require("./getCats");
    function CatList(opts) {
        //用来判断是否需要重新请求
        this.cacheFlag = {};
        //用来存储数据
        this.cache = {};
        this.$tabBdWrap = $(opts.bd);
        this.$tabHdWrap = $(opts.hd);
        this.tpl = $(opts.tpl).html();
        this.inited = false;
        getCats.get().then($.proxy(this.getData, this));
    }
    CatList.prototype = {
        constructor: CatList,
        getData: function(initTabId) {
            initTabId && (this.tabId = initTabId);
            var me = this, data;
            if (data = this.cacheFlag[this.tabId]) {
                //已经缓存过
                this.renderUi(data);
            } else {
                $.ajax({
                    url: urls.offlineStatus ? url : url + initTabId + "&t=" + now,
                    beforeSend: function() {
                        me.$tabBdWrap.find(".cat-bd-" + initTabId).html('<div class="loading"></div>');
                    }
                }).done($.proxy(me.fixData, me));
            }
        },
        fixData: function(res) {
            res = typeof res == "string" ? JSON.parse(res) : res;
            //var dfd = new $.Deferred();
            if (!res.res) {
                this.$tabBdWrap.find(".cat-bd-" + this.tabId).html("暂无数据");
                return;
            }
            var data = res.info;
            //判断app是否已经安装
            data = FixAppstatus.fixAppData(data);
            //修正数据，变成一个hash表格，
            this.cacheData(data);
            this.renderUi(data);
        },
        cacheData: function(data) {
            this.cacheFlag[this.tabId] = data;
            var me = this;
            data.length && $.each(data, function(i, item) {
                me.cache[item.app_uuid] = item;
            });
        },
        getCacheByuuid: function(uuid) {
            return cacheMap[uuid];
        },
        renderUi: function(data) {
            var me = this;
            if (!data.length) {
                return;
            }
            var _html = template(me.tpl, {
                data: data
            });
            this.$tabBdWrap.find(".cat-bd-" + this.tabId).html(_html);
            if (!this.inited) {
                this.inited = true;
                this.bindEvt();
            }
        },
        bindEvt: function() {
            var $tabBdWrap = this.$tabBdWrap, $lastBd = $tabBdWrap.find(".cat-bd-" + this.tabId), $lastHd = this.$tabHdWrap.find('h3[data-type="' + this.tabId + '"]'), lastType = this.dataType, me = this;
            this.$tabHdWrap.on("click", "h3", function() {
                var $this = $(this), type = $this.attr("data-type"), list;
                if (lastType == type) {
                    return;
                }
                //lastType = type;
                me.tabId = type;
                me.getData(type);
                $lastHd.removeClass("current");
                $this.addClass("current");
                $lastHd = $this;
                $lastBd.hide();
                var $curBd = $tabBdWrap.find(".cat-bd-" + type);
                $curBd.show();
                $lastBd = $curBd;
                lastType = type;
            });
            //所有扩展，点击出弹窗
            this.$tabBdWrap.on("click", "a", function() {
                var $this = $(this), app_data;
                var uuid = $this.attr("data-uuid");
                if (!(uuid && (app_data = me.cache[uuid]))) {
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
        updateData: function(uuid) {
            this.cache[uuid] && (this.cache[uuid].installed = true);
        }
    };
    function start(opts) {
        new CatList(opts);
    }
    return {
        start: start
    };
});

define("src/js/cat/getCats", [ "src/js/libs/jquery", "src/js/libs/urls_config" ], function(require) {
    var $ = require("src/js/libs/jquery");
    //用于调试
    var urls = require("src/js/libs/urls_config");
    //用于调试
    var now = new Date().getTime();
    var url = urls.offlineStatus ? urls.offline.getCats + "?t=" + now : urls.online.getCats + "&t=" + now;
    //根据hash获取需要显示tab的内容
    var search = location.search && location.search.match(/\?cat=(\d+)/), init_tabid;
    search && search.length && (init_tabid = search[1]);
    return {
        get: function() {
            var dfd = $.Deferred();
            var me = this;
            $.ajax({
                url: url
            }).done(function(res) {
                res = typeof res == "string" ? JSON.parse(res) : res;
                if (!res.res) {
                    return;
                }
                me.build(res.info);
            }).then(function() {
                dfd.resolve(init_tabid);
            });
            return dfd.promise();
        },
        build: function(data) {
            var html = [];
            var bd_html = [];
            $.each(data, function(i, item) {
                if (!init_tabid) {
                    init_tabid = i;
                }
                var is_init_tab = init_tabid == i;
                html.push('<h3 class="fl ' + (is_init_tab ? "current" : "") + '" data-type="' + i + '">' + item + "</h3>");
                bd_html.push('<div class="J-bd-item cat-bd-' + i + ' cl" style="display: ' + (is_init_tab ? "" : "none;") + '"></div>');
            });
            $(".J-cat-hd").html(html.join(""));
            $(".J-cat-bd").html(bd_html.join(""));
        }
    };
});
