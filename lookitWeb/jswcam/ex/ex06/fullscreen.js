/*                                                                                                                                                                                                                                    
 * * Copyright (C) MIT Early Childhood Cognition Lab                                                                                                                                                                                   
 *                                                                                                                                                                                                                                     
 */

function goFullscreen(element){

	addEvent(  {'type': 'goFullscreen'});
	$('#fsbutton').hide();

	if (element.mozRequestFullScreen && !element.mozFullScreen) { // 
		// This is how to go into fullscren mode in Firefox
		console.log('mozilla fs');
		element.mozRequestFullScreen();
		document.addEventListener("mozfullscreenchange", mozEndFullscreen, false);
		element.style.height = screen.availHeight + 'px';
		element.style.width  = screen.availWidth  + 'px';

	} else if (element.parentNode.webkitRequestFullScreen && !element.parentNode.webkitIsFullScreen) {  // 
		// This is how to go into fullscreen mode in Chrome and Safari
		// Both of those browsers are based on the Webkit project, hence the same prefix.
		console.log('Webkit fs');
		element.parentNode.webkitRequestFullScreen();
		$('#vidElement').addClass('playingVideo');
		element.style.height = screen.availHeight + 'px';
		element.style.width  = screen.availWidth  + 'px';
		
		document.addEventListener("webkitfullscreenchange", webkitEndFullscreen, false);

		}
	else {
		// for IE or other non-supported ...
		// Unfortunately this does make it hard to tell when we leave fs--need to remove whole element.
		addEvent({'type': 'alternative Fullscreen'});
		bootbox.alert("It looks like your browser doesn't support full-screen requests.  Please maximize your browser window or enter fullscreen manually (try pressing F11).  Thanks!");
		element.style.height = screen.availHeight + 'px';
		// Just for IE: to avoid horizontal scroll bar
		element.style.width  = screen.availWidth-20  + 'px';
	}	
	
	function webkitEndFullscreen() {
		
		if(!document.webkitIsFullScreen) {
			document.removeEventListener("webkitfullscreenchange", webkitEndFullscreen, false);
			addEvent({'type': 'endFullscreen'});
			// Restore CSS properties here (TODO: remove magic numbers...)
			element.style.height='400px';
			element.style.width='800px';
			$('#fsbutton').show();
		}
		
	}
	
	function mozEndFullscreen() {
		
		if(!document.mozFullScreen) {
			document.removeEventListener("mozfullscreenchange", mozEndFullscreen, false);
			addEvent({'type': 'endFullscreen'});
			element.style.height='400px';
			element.style.width='800px';
			$('#fsbutton').show();
		}
		
	}

	
	
}

function leaveFullscreen(){
	
	addEvent(  {'type': 'endFullscreen'});
	if (document.mozCancelFullScreen && document.mozFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitCancelFullScreen && document.webkitIsFullScreen) {
		document.webkitCancelFullScreen();
	}
	}


function addFsButton(mainDivSelector, elementSelector) {
	// Make a 'return to full screen' button (will only be visible if the user leaves fs)
	var button = $('<button/>', {
	'id': 'fsbutton', 
	'value': 'Please return to full screen! (click here)', 
	'text': 'Please return to full screen! (click here)'});
	
	button.click(function(evt) {
		addEvent(  {'type': 'click',
					'fn': 'fullscreen'});
		goFullscreen($(elementSelector)[0]);
		return false;
	});

	$(mainDivSelector).append(button);
	$('#fsbutton').hide();
}