define(function(){
	//escape
	var escapeEntries = {
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
        '<': '&lt;',
        '>': '&gt;'
    };
    var escapeReg = /([&"'\<\>])/g;
    //escape
    return function (str){
    	return str.replace(escapeReg,function(match,s1){
    		return escapeEntries[s1];		
    	});
    };
});