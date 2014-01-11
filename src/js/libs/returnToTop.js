define(function (require) {
	var $ = require('./jquery');
	var throttle = require('./throttle');
	var debounce = require('./debounce');

	
	var returnToTop = {
		config:{
			container_width: null 
		},
		init:function(){
			var doc = document.compatMode == 'CSS1Compat' ? document.documentElement : document.body;

			//create dom and set position
			var $toTop = $('<div class="to-top"/>').appendTo($(document.body)),
				_w;

			if(!(_w = returnToTop.config.container_width) ){
				this.container_width = _w = $('.J-container').width();
			}
			this.setPos($toTop);

			//bind event
			$toTop.on('click',onClick);
			function onClick(){
				//document.body.scrollTop = 0;
				var id = null;
				var loop = function(){
					document.body.scrollTop -= 400;
					if(document.body.scrollTop <= 0){
						cancelAnimationFrame(id);
						id = null;
						loop = null;
						return;
					}
					id = requestAnimationFrame(loop);
				};
				loop();
			};
			//双屏切换时，屏幕尺寸变化导致位置计算有误
			window.addEventListener('resize',debounce(resizeHandle,50),false);
			function resizeHandle(){
				returnToTop.setPos($toTop);
			};
			//采用函数节流方式，避免太频繁计算
			window.addEventListener('scroll',throttle(updatePosition, 50),false);
			function updatePosition(){
				var sc = document.body.scrollTop;
				if(sc > 20){
					$toTop.fadeIn();
				}else{
					$toTop.fadeOut();
				}
			};
			//fixed footer
			//this.fixedFooter();
		},
		setPos:function($toTop){
			var pos_l = ($(window).width() - this.container_width)/2 + this.container_width + 20;
			$toTop.css('left',pos_l + 'px');
		},
		fixedFooter:function(){
			if($('.J-container').height() < $(window).height()){ //屏幕内容太少了，bottom固定
				setTimeout(function(){
					$('.footer').css({position:'fixed',bottom:0});
				},3000);
				
			}
		}
	};
	return returnToTop;
});