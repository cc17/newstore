/**
 * Created by pc on 13-12-24.
 */
define("src/js/index/Tasks", [ "src/js/libs/jquery", "./OnlineMust", "src/js/libs/subbyte", "src/js/libs/template", "./Recommend", "src/js/libs/Slider", "src/js/libs/FixAppstatus", "src/js/libs/Observer", "src/js/libs/reportValue", "src/js/libs/needUpdate", "src/js/libs/mainNavItem", "./DownloadAndNewadd", "./AppSlide", "src/js/libs/urls_config", "src/js/libs/searchForm", "src/js/libs/xss", "src/js/libs/queryString", "src/js/libs/Dialog", "src/js/libs/AppDialogTpl" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var OnlineMust = require("./OnlineMust");
    var Recommend = require("./Recommend");
    var DownloadAndNewadd = require("./DownloadAndNewadd");
    var AppSlide = require("./AppSlide");
    var Observer = require("src/js/libs/Observer");
    var searchForm = require("src/js/libs/searchForm");
    var Dialog = require("src/js/libs/Dialog");
    var AppDialogTpl = require("src/js/libs/AppDialogTpl");
    var urls = require("src/js/libs/urls_config");
    //用于调试
    var urlStats = urls.offlineStatus ? "offline" : "online";
    var moduleHook = {
        OnlineMust: OnlineMust,
        Recommend: Recommend,
        DownloadAndNewadd: DownloadAndNewadd,
        AppSlide: AppSlide
    };
    //缓存所有已经下载的数据
    var cacheMap = {};
    //任务管理器
    function Tasks() {
        this.tasks = [];
        this.instance = {};
    }
    Tasks.prototype = {
        constructor: Tasks,
        register: function(tasks) {
            var me = this;
            if ($.isArray(tasks)) {
                $.each(tasks, function(i, task) {
                    me.register(task);
                });
            }
            if ($.isPlainObject(tasks)) {
                this.tasks.push(tasks);
            }
            return this;
        },
        trigger: function(fn) {
            var me = this;
            var len = this.tasks.length;
            var doneCount = 0;
            len && $.each(this.tasks, function(i, item) {
                moduleHook[item.module].prototype.getCache = function(cache) {
                    me.cacheData(cache);
                };
                var _ins = me.instance[doneCount] = new moduleHook[item.module](item.params);
                doneCount++;
                if (doneCount >= len) {
                    //所有任务执行完回调
                    fn();
                }
            });
        },
        cacheData: function(cache) {
            //将所有模块的数据存入本地缓存
            cacheMap = $.extend(cacheMap, cache);
        },
        init: function() {
            var me = this;
            this.register([ {
                module: "OnlineMust",
                params: {
                    listWrap: $(".onlineMust-list-wrap"),
                    lists: $("#J-onlineMust"),
                    pager: $("#J-onlineMust-arrow"),
                    tpl: "#J-main-tpl",
                    url: urls[urlStats].onlineMust
                }
            }, {
                module: "Recommend",
                params: {
                    listWrap: $(".reco-list-wrap"),
                    lists: $("#J-recommend"),
                    pager: $("#J-reco-arrow"),
                    tpl: "#J-main-tpl",
                    url: urls[urlStats].recommend
                }
            }, {
                module: "DownloadAndNewadd",
                params: {
                    url: urls[urlStats].mainSide,
                    hookDiv: {
                        recent: $(".newadd-count")
                    },
                    week: {
                        wrap: $("#J-download"),
                        tpl: $("#J-tpl-download").html()
                    },
                    recent: {
                        wrap: $("#J-newadd"),
                        tpl: $("#J-tpl-newadd").html()
                    }
                }
            }, {
                module: "AppSlide"
            } ]).trigger($.proxy(me.bindEvt, me));
        },
        bindEvt: function() {
            var me = this;
            var _updateText = function(dialog, html) {
                var $dialog = dialog.dialog;
                $dialog.find(".content").html(html);
            };
            //所有扩展，点击出弹窗
            $(document.body).on("click", "a.J-show-dialog", function(e) {
                var $this = $(this), app_data, uuid = $this.attr("data-uuid");
                if (!(uuid && (app_data = cacheMap[uuid]))) {
                    return false;
                }
                var html = AppDialogTpl.render({
                    data: app_data
                });
                if (!me.dialog) {
                    me.dialog = new Dialog("x", {
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
                } else {
                    _updateText(me.dialog, html);
                }
                me.dialog.show();
                return false;
            });
            //更新本地缓存数据
            Observer.register("updateData", this.updateData);
        },
        updateData: function(uuid, subtraction) {
            cacheMap[uuid] && (cacheMap[uuid].installed = subtraction ? false : true);
        }
    };
    return Tasks;
});