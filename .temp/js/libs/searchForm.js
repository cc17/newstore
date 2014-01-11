define("src/js/libs/searchForm", [ "./reportValue", "./xss", "./queryString" ], function(require) {
    var reportValue = require("./reportValue");
    var xss = require("./xss");
    var queryString = require("./queryString");
    var $form = $("#J-search-form"), $searchInput = $form.find(".search-key"), $submit = $form.find('input[type="submit"]');
    //init input value 
    var params = queryString.parse(location.search.slice(1));
    var keyword;
    if (keyword = params["keyword"]) {
        //$searchInput.val(xss( decodeURIComponent(keyword) ) );
        $searchInput.val(decodeURIComponent(keyword));
    }
    $searchInput.on("focus", function() {
        $submit.addClass("wrap-focus");
    }).on("blur", function() {
        $submit.removeClass("wrap-focus");
    });
    $form.on("submit", function(e) {
        reportValue(138, 2, $searchInput.val());
    });
});