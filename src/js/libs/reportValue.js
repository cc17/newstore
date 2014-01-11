define(function(require){
	return function(name,type,value,value1,value2){
        var api = ["h","t","t","p",":","/","/","l","i","e","b","a",
                    "o",".","t","j","w","e","b",".","i","j","i","n","s","h",
                    "a","n",".","c","o","m","/","c","l","i","c","k","/","_",
                    "_","i","n","f","o","c",".","g","i","f","?","a","c","t",
                    "i","o","n","n","a","m","e","=","l","i","e","b","a","o","_",name,"&","t","y","p","e","=",type,
                    "&","v","a","l","u","e","="].join('')
                    +(name?1:0)+'&value1='+ encodeURIComponent(value1)+'&value2='+escape(value2);
        var img = new Image(0, 0);
        img.src = api + "&random=" + new Date().getTime();
    };
});