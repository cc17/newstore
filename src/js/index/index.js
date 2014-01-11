define(function(require){
	var $ = require('jQuery');

    var Tasks = require('./Tasks');
    require('returnToTop').init();






    //init
    function start(){
        var tasks = new Tasks();
        tasks.init();
    };
	return {start:start};
});