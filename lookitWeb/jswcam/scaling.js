 /*
 * * Copyright (C) MIT Early Childhood Cognition Lab
 *
 */
var resizeText = function() {
		var preferredArea = 800;
	    var maxSize = 32;
	    var minSize =  10;
	    var factor = 1.3;

		var displayArea = $('#contentPane > div:first-child').width();
        var percentage = displayArea/preferredArea;
	    var newFontSize = Math.floor(16*percentage)-1;

	    if (newFontSize < minSize) { newFontSize = minSize;}
	    else if (newFontSize > maxSize) {newFontSize = maxSize;}

	    $("h1").css("font-size", newFontSize*factor*factor);
	    $("h2").css("font-size", newFontSize*factor);
	};

(function() {
    $(document).ready(function() {
	
	$(window).resize(function(evt) {
	    console.log("resize");
	    resizeText();
	    var h = window.innerHeight - $('#jswcam').outerHeight(true);
	    h -= $('#topbar').outerHeight(true) + 25;
	    $('.sidebar_frag').height(h);
	});
	
    });
})();