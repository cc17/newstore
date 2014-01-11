/**
 * Created with JetBrains PhpStorm.
 * User: irou
 * Date: 13-7-1
 * Time: 下午4:39
 * To change this template use File | Settings | File Templates.
 */
define(function (require,exports,module) {
    /**
     * jQuery的Dialog插件。
     *
     * @param object content
     * @param object options 选项。
     * @return
     */
    var $ = require('./jquery');

    function Dialog(content, options){
        Dialog.__count++;
        var me = this;
        var obj = {};
        Dialog.instance[Dialog.__count] = this;
        var defaults = { // 默认值。
            title:'文件夹',       // 标题文本，若不想显示title请通过CSS设置其display为none
            content:"测试",
            contentClass:"",
            w:'80%',
            h:'400',
            zoomFlag:0,   //是否需要zoom效果
            fixClass:'',
            zIndex:4,
            showTitle:true,     // 是否显示标题栏。
            closeText:'[关闭]', // 关闭按钮文字，若不想显示关闭按钮请通过CSS设置其display为none
            draggable:true,     // 是否移动
            modal:true,         // 是否是模态对话框
            center:true,        // 是否居中。
            fixed:true,         // 是否跟随页面滚动。
            time:0,             // 自动关闭时间，为0表示不会自动关闭。
            id:false            // 对话框的id，若为false，则由系统自动产生一个唯一id。
        };
        var options = this.options = $.extend(defaults, options);
        options.id = options.id ? options.id : 'dialog-' + Dialog.__count; // 唯一ID
        this.overlayId = options.id + '-overlay'; // 遮罩层ID
        var timeId = null;  // 自动关闭计时器
        this.isShow = false;
        /* 对话框的布局及标题内容。*/
        var barHtml = !options.showTitle ? '' :
            '<div class="bar"><span class="title" contenteditable="false">' + options.title + '</span><a class="close">' + options.closeText + '</a></div>';
        this.createOverlay();
        var dialog = this.dialog = $('<div style="width:'+ parseInt(options.w) +'px;height:'+ parseInt(options.h) + 'px;z-index:'+ options.zIndex +'" id="'
            + options.id + '" class="dialog '+ options.fixClass +'">'+barHtml+'<div class="content '+ options.contentClass +'">'+ options.content +'</div></div>').hide();
        $('body').append(dialog);
        this.init();
    };

    Dialog.prototype = {
        show:function(){
            var options = this.options;
            $('#' + options.id).show().animate({opacity:1},30);
            this._show();
        },
        _show:function(){
            var options = this.options;
            if(undefined != options.beforeShow && !options.beforeShow()){
                return;
            }
            //遮罩层显示
            $("#" + this.overlayId).show().animate({opacity:0.5},200, function(){});
            setTimeout(function(){
                $(document.body).addClass('open-folder-dialog');
            },100);
            if(undefined != options.afterShow){
                options.afterShow()
            }
        },
        zoomIn:function(origin){
            this._show();
            this.dialog[0].style.display = 'block';
            var origin_pos = this.origin_pos = origin.getBoundingClientRect();
            var target_box = this.target_box = this.dialog[0].getBoundingClientRect();
            $.zoom_in(this.dialog[0],origin_pos,target_box);
        },
        zoomOut:function(cb){
            var origin_pos = this.origin_pos,
                target_box = this.target_box;
            $.zoom_out(this.dialog[0],origin_pos,target_box,400,cb);
        },
        init:function(){
            var options = this.options;
            this.setContent(options.content);
            this.upPosition();
            this.bindClose();
            this.onResize();
        },
        onResize:function(){
            var self = this;
            $(document).resize(function(){
                self.createOverlay();
            });
        },
        bindClose:function(){
            var self = this;
            var div = this.dialog.find('.close');
            div.unbind('click');
            div.bind('click',function(){
                self.close();
            });
        },
        updateDialogSize:function(func){
            this.dialog.css({width:this.options.w + 'px',height:this.options.h + 'px'});
            typeof func == 'function' && func();
        },
        upPosition:function(){
            var _doc = document.documentElement;
            !this.options.noFixPos && this.dialog.css({left:(_doc.clientWidth - parseInt(this.options.w))/2 -20 + 'px',top:(_doc.clientHeight - parseInt(this.options.h))/2 + 'px'});
            this.dialog.find('.content').css({height:(parseInt(this.options.h) - 60) + 'px'});
        },
        createOverlay:function(){
            var self = this;
            if(!$("#" + self.overlayId)[0]){
                $('body').append('<div id="' + self.overlayId + '" class="dialog-overlay"></div>');
            }
            $('#' + self.overlayId).css({'left':0, 'top':0,
                /*'width':$(document).width(),*/
                'width':'100%',
                "zIndex":this.options.zIndex - 1,
                'height':'100%',
                /*'height':$(document).height() + 'px',*/
                'position':'absolute'});
        },
        setContent : function(c){
            var div = this.dialog.find('.content');
            if('object' == typeof(c)){
                switch(c.type.toLowerCase()){
                    case 'id': // 将ID的内容复制过来，原来的还在。
                        div.html($('#' + c.value).html());
                        break;
                    case 'img':
                        div.html('加载中...');
                        $('<img alt="" />').load(function(){
                            div.empty().append($(this));
//                            resetPos();
                        }).attr('src',c.value);
                        break;
                    case 'url':
                        div.html('加载中...');
                        $.ajax({url:c.value,
                            success:function(html){
                                div.html(html);
//                                resetPos();
                            },
                            error:function(xml,textStatus,error){div.html('出错啦')}
                        });
                        break;
                    case 'iframe':
                        div.append($('<iframe src="' + c.value + '" />'));
                        break;
                    case 'text':
                    default:
                        div.html(c.value);
                        break;
                }
            }
            else
            {   div.html(c); }
        },
        close:function(){
            $(document.body).removeClass('open-folder-dialog');
            var options = this.options;
            if(undefined != options.beforeClose && !options.beforeClose()){
                return;
            }
            var me = this;

            this.dialog.animate({opacity:0},100, function(){
                me.isShow = false;
                me.dialog.hide();
                if(undefined != options.afterClose){   options.afterClose(); }
            });
            $("#" + this.overlayId).animate({opacity:0},100, function(){
                $(this).hide();
            });
        }
    };

    Dialog.__count = 1;
    Dialog.instance = {};
    Dialog.getDialogInstance = function(id){
        return Dialog.instance[id];
    };

    return Dialog;
});