var sandbox = true;

$(document).ready(function(){
 	
 	$("#start_exp").click(function() {
 		
 		var which_exp = $('#choose_exp').val();
 		packaging = exp[which_exp];
 		console.log(packaging);

		$('body').html('<div id="maindiv"></div>');
		page.loadExperiment(packaging, '#maindiv', true);
	
 	 	});
 	
 	for (iExp=0;iExp<exp.length;iExp++) {
 		console.log(exp[iExp].id);
 		$("#choose_exp").append($("<option/>")
 			.text(exp[iExp].id)
 			.val(iExp) 
 		);
 			
 	}

 	
});
