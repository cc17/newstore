/**
 * Created by pc on 13-12-28.
 */
define("src/js/libs/FixAppstatus", [ "./Observer", "./reportValue", "./needUpdate", "./mainNavItem" ], function(require) {
    var Observer = require("./Observer");
    var reportValue = require("./reportValue");
    var needUpdate = require("./needUpdate");
    var mainNavItem = require("./mainNavItem");
    var statusHooks = {
        AllowInstall: function($installBtn) {
            $installBtn.html("安装中");
        },
        //点击取消后，文字恢复默认
        InstallUIAbort: function($installBtn) {
            $installBtn.html("安装");
        },
        //点击确定后，文字恢复安装
        ReportSuccessFromFileThread: function($installBtn, uuid) {
            $installBtn.html("已安装");
            $installBtn.addClass("app-installed");
            //$installBtn.attr( 'href','###');
            Observer.trigger("updateData", uuid);
            //更新安装数
            FixAppstatus.updateInstalledNum();
        },
        UninstallExtension: function($installBtn, uuid) {
            $installBtn.removeClass("app-installed").html("安装");
            //更新安装数
            FixAppstatus.updateInstalledNum(true);
            Observer.trigger("updateData", uuid, true);
        }
    };
    //安装按钮，如果已经安装，阻止默认事件
    $(document.body).on("click", "a.install", function(e) {
        if ($(this).hasClass("app-installed")) {
            return false;
        }
    });
    var FixAppstatus = {
        doneApps: external.getExtionsList(),
        getDoneApps: function() {
            return external.getExtionsList();
        },
        //通过接口获取已经安装的app
        fixAppData: function(data) {
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i], list;
                //已经安装
                if ((list = FixAppstatus.doneApps) && list.indexOf(item.app_uuid) > -1) {
                    item.installed = true;
                } else {
                    item.installed = false;
                }
                //修正数据，看是否需要显示更新提示
                item.updateBrowser = item.updateBrowser && !!needUpdate(item.updateBrowser);
            }
            return data;
        },
        showInstalledNum: function() {
            var $extCount = $("#J-ext-count");
            if ($extCount.length == 0) {
                return;
            }
            var installed = FixAppstatus.doneApps.split(";");
            if (!(installed.length - 1)) {
                $extCount.hide();
                return;
            }
            $extCount.parent().addClass("init-ext-manage");
            $extCount.html(installed.length - 1).show();
        },
        //subtraction是否做减法，比如：删除插件的时候
        updateInstalledNum: function(subtraction) {
            //TODO:external.getExtionsList 应该用这个动态获取的，但不知道为啥有时候不准确
            var $extCount = $("#J-ext-count");
            if ($extCount.length == 0) {
                return;
            }
            $extCount.hide();
            var $parent = $extCount.parent();
            $parent.removeClass("ext-manage").addClass("ext-manage");
            var now_count = parseInt($extCount.html() || 0, 10);
            now_count = subtraction ? now_count - 1 : now_count + 1;
            if (!now_count) {
                $extCount.html(0);
                return;
            }
            $extCount.html(now_count).fadeIn();
        },
        OnExtensionsChanged: function() {
            window.OnExtensionsChanged = function(uuid, status) {
                var fn, $installBtn = $('.install[data-installUUID="' + uuid + '"]');
                if ($installBtn.length > 0) {
                    var name = $installBtn.attr("data-appname");
                    var isDialog = $installBtn.attr("data-dialog");
                    reportValue(138, 1, isDialog ? 1 : 0, uuid, name);
                }
                (fn = statusHooks[status]) && $installBtn.length && fn($installBtn, uuid);
            };
        }
    };
    //立即注册监听
    FixAppstatus.OnExtensionsChanged();
    //显示已经安装数
    FixAppstatus.showInstalledNum();
    return FixAppstatus;
});