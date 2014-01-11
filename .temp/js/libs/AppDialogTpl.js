/**
 * Created by pc on 13-12-25.
 */
define("src/js/libs/AppDialogTpl", [ "./template", "./jquery" ], function(require) {
    var template = require("./template");
    var tpl = [ "<% var is_installed = data.installed; %>", '<div class="popup cl">', '<div class="popup_header">', '<div class="popup_icon fl">', '<img src="<%= data.app_icon %>" />', "</div>", '<div class="popup_info fl">', '<h3 class="text-overflow"><%= data.app_name %></h3>', "<p>", "作者：<%= data.app_author %>&emsp;|&emsp;", "版本号：<%= data.app_version %>", "</p>", "<% if(data.app_tags && data.app_tags.length){ %>", '<p class="tags">', "类别: ", "<% for(var i =0; i< data.app_tags.length;i++){ %>", "<% var tag = data.app_tags[i]; %>", "<% if(tag && tag.id){ %> ", '<a href="cat.html?cat=<%= tag.id %>"><%=tag.name%></a>', "<%}%>", "<% } %>", "</p>", "<% } %>", "</div>", '<div class="popup_install_area">', "<% if(data.updateBrowser){ %>", '<a class="install" href="http://www.liebao.cn/" target="_blank">升级浏览器后可用</a>', "<% }else{ %>", "<% if(data.app_uuid && data.app_downloadURL){ %>", '<a data-dialog="1" data-appname="<%= data.app_name %>" data-installUUID="<%=data.app_uuid %>" class="dialog-install install <% if(data.installed){ %> app-installed <% }%>"' + ' href="<%= data.app_downloadURL %>" ><% if(data.installed){ %>已安装 <% }else{ %> 安装 <% } %></a>', "<% } %>", "<% } %>", "</div>", "</div>", '<div class="popup_content cl">', '<div class="popup_content_images fl">', '<div class="popup_slider">', '<div class="ws_images">', "<% if (data.app_prview){%>", "<ul>", "<% for (var i =0;i<data.app_prview.slice(0,1).length;i++){ %>", "<li>", '<img src="<%- data.app_prview[i]%>" />', "</li>", "<% } %>", "</ul>", "<%}%>", "</div>", '<div class="ws_bullets">', "<% if( data.app_prview && data.app_prview.slice(0,1).length > 1){%>", "<% for(var i=0;i<data.app_prview.length;i++){ %>", "<a><%= i %></a>", "<% } %>", "<% } %>", '<div class="ws_shadow"></div></div>', "</div>", "</div>", '<div class="popup_content_intro fl">', '<div class="scrollbar">', '<div class="track">', '<div class="thumb">', '<div class="end"></div>', "</div>", "</div>", "</div>", '<div class="viewport">', '<div class="overview">', "<%=data.app_info%>", "</div>", "</div>", "</div>", "</div>", "</div>" ].join("");
    var render = function render(data) {
        return template(tpl, data);
    };
    return {
        tpl: tpl,
        render: render
    };
});