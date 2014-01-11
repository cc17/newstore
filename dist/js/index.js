/**
 * Created by pc on 13-12-26.
 */
define("src/js/index/AppSlide", [ "src/js/libs/jquery", "src/js/libs/Slider", "src/js/libs/template", "src/js/libs/urls_config" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var Slider = require("src/js/libs/Slider");
    var template = require("src/js/libs/template");
    var urls = require("src/js/libs/urls_config");
    //用于调试
    var urlStats = urls.offlineStatus ? "offline" : "online";
    var AppSlide = function() {
        this.cache = [];
        this.tpl = [ "<% for(var i=0;i<data.length;i++){ %>", "<% var item = data[i]; %>", "<li   > ", '<a href="<% if(item.app_url){ %><%= item.app_url %><%}else{%>###<%}%> " target="_blank"  <% if(item.app_uuid){%> class="J-show-dialog" data-uuid="<%= item.app_uuid %>" <% } %> >', ' <img src="<%= item.headimg  %>" />', "</a>", "</li>", "<% } %> " ].join("");
        this.$list = $(".slider-list");
        this.getData();
    };
    AppSlide.prototype = {
        constructor: AppSlide,
        getData: function() {
            //test
            //this.bindEvt();
            var me = this;
            $.ajax({
                url: urls[urlStats].slider + (urls[urlStats].slider.indexOf("?") > 0 ? "&t=" : "?t=") + new Date().getTime(),
                beforeSend: function() {
                    me.$list.html('<div class="loading"></div>');
                }
            }).done($.proxy(me.renderUi, me));
        },
        renderUi: function(data) {
            data = typeof data == "string" ? JSON.parse(data) : data;
            if (!data.res) {
                return;
            }
            var info = data.info, headimg = info.headimg, midimg = info.midimg;
            if (!headimg.length && !midimg.length) {
                return;
            }
            this.cacheData(headimg);
            var html = template(this.tpl, {
                data: headimg
            });
            this.$list.html(html);
            //触发cache到全局
            this.getCache(this._getCache());
            this.midBanner(midimg);
            this.bindEvt();
        },
        midBanner: function(midimg) {
            midimg = midimg[0];
            var html = '<a href="' + midimg.app_url + '" target="_blank"><img src="' + midimg.midimg + '" /></a>';
            $(".zt-banner").html(html);
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
            var unslider = $(".slider").unslider({
                dots: true
            });
            $(".unslider-arrow").click(function() {
                var fn = this.className.split(" ")[1];
                //  Either do unslider.data('unslider').next() or .prev() depending on the className
                unslider.data("unslider")[fn]();
            });
        }
    };
    return AppSlide;
});

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

/**
 * Created by pc on 13-12-23.
 */
define("src/js/index/Newadd", [ "src/js/libs/jquery", "src/js/libs/subbyte", "src/js/libs/template" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var subbyte = require("src/js/libs/subbyte");
    var template = require("src/js/libs/template");
    var Newadd = function(opts) {
        this.$wrap = $(opts.wrap);
        this.tpl = $(opts.tpl).html();
        this.url = opts.url;
        this.cache = [];
        this.getData.apply(this, arguments);
    };
    Newadd.prototype = {
        constructor: Newadd,
        getData: function() {
            var me = this;
            $.ajax({
                url: this.url + "?t=" + new Date().getTime()
            }).done($.proxy(me.renderUi, me)).then($.proxy(me.bindEvt, me));
        },
        renderUi: function(res) {
            res = JSON.parse(res);
            var me = this;
            if (res.errno == 0) {
                var data = res.data;
                this.cacheData(data);
                var html = template(me.tpl, {
                    data: data
                });
                this.$wrap.html(html);
                $(".newadd-count").html("最新上架" + data.length + "款");
                //触发cache到全局
                this.getCache(this._getCache());
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
        },
        events: {
            mouseover: "mouseoverHandle",
            mouseout: "mouseoutHandle"
        },
        mouseoverHandle: function() {
            var $this = $(this);
            $this.addClass("hover");
            $this.find(".app-install").show();
        },
        mouseoutHandle: function() {
            var $this = $(this);
            $this.removeClass("hover");
            $this.find(".app-install").hide();
        },
        bindEvt: function() {
            var me = this;
            for (var type in this.events) {
                var handler = me[this.events[type]];
                this.$wrap.on(type, ".item", handler);
            }
        }
    };
    return Newadd;
});

/**
 * Created by pc on 13-12-23.
 */
define("src/js/index/OnlineMust", [ "src/js/libs/jquery", "src/js/libs/subbyte", "src/js/libs/template", "./Recommend", "src/js/libs/Slider", "src/js/libs/FixAppstatus", "src/js/libs/Observer", "src/js/libs/reportValue", "src/js/libs/needUpdate", "src/js/libs/mainNavItem" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var subbyte = require("src/js/libs/subbyte");
    var template = require("src/js/libs/template");
    var OnlineMust = require("./Recommend");
    return OnlineMust;
});

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

/**
 * Created by pc on 13-12-23.
 */
define("src/js/index/getData", [ "src/js/libs/urls_config", "src/js/libs/jquery" ], function(require) {
    var status = "offline";
    var urls_config = require("src/js/libs/urls_config");
    var $ = require("src/js/libs/jquery");
    //上网必备
    var onlineMuster = function() {
        return {
            get: function() {
                var ajax = $.ajax(urls_config[status].onlineMust);
                ajax.onSuccess = function() {};
            }
        };
    }();
    return {
        onlineMuster: onlineMuster
    };
});

define("src/js/index/index", [ "src/js/libs/jquery", "./Tasks", "./OnlineMust", "src/js/libs/subbyte", "src/js/libs/template", "./Recommend", "src/js/libs/Slider", "src/js/libs/FixAppstatus", "src/js/libs/Observer", "src/js/libs/reportValue", "src/js/libs/needUpdate", "src/js/libs/mainNavItem", "./DownloadAndNewadd", "./AppSlide", "src/js/libs/urls_config", "src/js/libs/searchForm", "src/js/libs/xss", "src/js/libs/queryString", "src/js/libs/Dialog", "src/js/libs/AppDialogTpl", "src/js/libs/returnToTop", "src/js/libs/throttle", "src/js/libs/debounce" ], function(require) {
    var $ = require("src/js/libs/jquery");
    var Tasks = require("./Tasks");
    require("src/js/libs/returnToTop").init();
    //init
    function start() {
        var tasks = new Tasks();
        tasks.init();
    }
    return {
        start: start
    };
});
