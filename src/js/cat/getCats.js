define(function (require) {
	 var $ = require('jQuery');
	 //用于调试
     var urls = require('urls_config');
    //用于调试
    var now = new Date().getTime();
    var url = urls.offlineStatus ? urls.offline.getCats + '?t=' + now : urls.online.getCats + '&t=' + now;
    //根据hash获取需要显示tab的内容
    var search = location.search && location.search.match(/\?cat=(\d+)/),
		init_tabid;
    search && search.length && (init_tabid = search[1]);
	 return {
	 	get:function(){
	 		var dfd = $.Deferred();
	 		var me = this;
	 		 $.ajax({
                url:url
            }).done(function(res){
            	res = typeof res == 'string' ? JSON.parse(res) : res;
            	if(!res.res){
            		return;
            	}
            	me.build(res.info);
            }).then(function(){
            	dfd.resolve(init_tabid);
            });
	 		return dfd.promise();
	 	},
	 	build:function(data){
	 		var html = [];
	 		var bd_html = [];
	 		$.each(data,function(i,item){
	 			if(!init_tabid){
	 				init_tabid = i;
	 			}
	 			var is_init_tab = init_tabid == i;
	 			html.push('<h3 class="fl '+ (is_init_tab ? 'current' : '') +'" data-type="'+ i +'">'+ item +'</h3>');
	 			bd_html.push('<div class="J-bd-item cat-bd-'+ i +' cl" style="display: '+ (is_init_tab ? '' : 'none;') +'"></div>');
	 		});
	 		$('.J-cat-hd').html(html.join(''));
	 		$('.J-cat-bd').html(bd_html.join(''));
	 	}
	 };
});