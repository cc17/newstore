/**
 * Created by pc on 13-12-23.
 */
define("src/js/search/search", [ "src/js/libs/jquery", "src/js/libs/subbyte", "src/js/libs/template", "src/js/libs/Dialog", "src/js/libs/AppDialogTpl", "src/js/libs/FixAppstatus", "src/js/libs/Observer", "src/js/libs/reportValue", "src/js/libs/needUpdate", "src/js/libs/mainNavItem", "src/js/libs/Slider", "src/js/libs/returnToTop", "src/js/libs/throttle", "src/js/libs/debounce", "src/js/libs/searchForm", "src/js/libs/xss", "src/js/libs/queryString", "src/js/libs/urls_config" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var subbyte = require("src/js/libs/subbyte");
    var template = require("src/js/libs/template");
    var Dialog = require("src/js/libs/Dialog");
    var AppDialogTpl = require("src/js/libs/AppDialogTpl");
    var FixAppstatus = require("src/js/libs/FixAppstatus");
    var Slider = require("src/js/libs/Slider");
    var Observer = require("src/js/libs/Observer");
    require("src/js/libs/returnToTop").init();
    var searchForm = require("src/js/libs/searchForm");
    var queryString = require("src/js/libs/queryString");
    var xss = require("src/js/libs/xss");
    var urls = require("src/js/libs/urls_config");
    //用于调试
    var urlStats = urls.offlineStatus ? "offline" : "online";
    var params = queryString.parse(location.search.slice(1));
    var searchKey = params["keyword"];
    var Search = function(opts) {
        this.cache = {};
        this.url = urls[urlStats].search;
        this.tpl = opts.tpl;
        this.$wrap = opts.wrap;
        this.getData();
        this.initFill();
    };
    Search.prototype = {
        constructor: Search,
        initFill: function() {
            var params = queryString.parse(location.search.slice(1));
            var keyword;
            if (keyword = params["keyword"]) {
                $(".result-hd").html('"' + xss(decodeURIComponent(keyword)) + '"的搜索结果');
            }
        },
        getData: function() {
            var me = this;
            var search = location.search;
            if (!search) {
                return;
            }
            var search_arr = search.substring(1).split("=");
            var param = {};
            param[search_arr[0]] = search_arr[1];
            $.ajax({
                url: urls[urlStats].search + encodeURIComponent(search_arr[1]) + "&t=" + new Date().getTime(),
                beforeSend: function() {
                    me.$wrap.html('<div class="loading"></div>');
                }
            }).done($.proxy(me.fixData, me));
        },
        fixData: function(res) {
            var me = this;
            res = typeof res == "string" ? JSON.parse(res) : res;
            if (!res.res) {
                this.$wrap.html(this.emptyTips());
                return;
            } else {
                this.$wrap.html(this.emptyTips());
            }
            var data = res.info, hook;
            //判断app是否已经安装
            data = FixAppstatus.fixAppData(data);
            this.cacheData(data);
            this.renderUi(data);
        },
        emptyTips: function() {
            return '<div class="no-result">未找到相符的搜索结果</div>';
        },
        renderUi: function(data) {
            var html = template(this.tpl, {
                data: data
            });
            this.$wrap.html(html);
            this.bindEvt();
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
        bindEvt: function() {
            var me = this;
            //所有扩展，点击出弹窗
            this.$wrap.on("click", "a.J-show-dialog", function(e) {
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
                e.stopPropagation();
                return false;
            });
            //更新本地缓存数据
            Observer.register("updateData", this.updateData, this);
        },
        updateData: function(uuid, subtraction) {
            this.cache[uuid] && (this.cache[uuid].installed = subtraction ? false : true);
        }
    };
    function init(opts) {
        new Search(opts);
    }
    return {
        init: init
    };
});