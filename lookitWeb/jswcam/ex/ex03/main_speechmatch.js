
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
 
// Global variables (available in all functions)
var currentElement = -1; // State variable: which html element we're on	
var htmlSequence;
var experiment;
var vidSequence;
var tested = false; // whether the audio has been tested

// If sandbox is true, we skip all the calls to jswcam (to start/stop recording, etc.).
// 9.S93 students--keep to 'true' for testing.
var sandbox = false;

// Used by index.js when generating upload dialog (replace this.html('uploading'))
var DEBRIEFHTML = "<p> Thanks so much for participating!  To confirm your participation, please press 'Done' below.  (If you \
				wish to withdraw from the study at this point and delete your data, please press 'Cancel and withdraw.'  But \
				please note that we are very grateful for your recordings even if you think the study didn't 'work'--if kids just \
				aren't interested, that means we need to fix something!)\
	<p> Some more information about this study... </p> \
	<p> This is one of the \
	early studies we are conducting to test what sorts of methods will work online as well as \
	in the lab.  In this study we are investigating an ability called intermodal matching: children's \
	ability to connect information from different sensory modalities, in this case vision and hearing. \
	Even newborns have some expectations about how their senses work together.  Here we are building on some \
	studies showing that infants match speech sounds to the facial expressions that produce them \
	(see for example <a href='http://www.sciencedirect.com/science/article/pii/S0163638384800508' target='_blank'> \
	Kuhl & Melztoff 1984 </a> or <a href='http://onlinelibrary.wiley.com/doi/10.1111/1467-7687.00271/full' target='_blank'> \
	Patterson & Werker 2003 </a>).	</p> \
	<p> Individual children may look to or away from the screen for all sorts of reasons during the study--for instance, other interesting \
	things going on at home, or a preference for familiar stories!  However, over many \
	children, these effects average out.  We show each child a random sequence of two matching and two non-matching\
	faces. </p> ";

// The function 'main' must be defined and is called when the consent form is submitted 
// (or from sandbox.html)
function main(mainDivSel, expt) {
	
	mainDivSelector = mainDivSel;
	experiment = expt;
	experiment.endedEarly = false;
	experiment.minAgeDays = 3*30; // 3 months
	experiment.maxAgeDays = 2*366; // 24 months
	experiment.tic = new Date();
	experiment.eventArray = []; // appended to by addEvent to keep track of things that happen

	console.log("Starting experiment: ", experiment.name);
	$(mainDivSelector).attr('id', 'maindiv'); // so we can select it in css as #maindiv
	addEvent(  {'type': 'startLoading'});

	// Black out the screen until waitforassets returns	
	var box = bootbox.dialog(
		"Please wait while the experiment loads.", 
		[]); 
		
	if(sandbox) {
		// Manually set the condition number
		condition = prompt('Please enter a condition number (0-3)', '0');
		startExperiment(condition, box);
	} else {
		// Get the appropriate condition from the server by checking which ones we 
		// already have
		$.getJSON(
			'counterbalance.php',
			{'experiment_id': experiment.id},
			function(jsonresp) {
				console.log(jsonresp);
				startExperiment(jsonresp.condition, box);
			}
		);
	}
}

function generateHtml(segmentName){

	addEvent(  {'type': 'htmlSegmentDisplayed'});
	$("body").removeClass('playingVideo');
	
	if (segmentName=='vidElement') {
		var vidElement = buildVideoElement('start', 'vidElement');
		$('#maindiv').append(vidElement);
	} else {
		$('#maindiv').append('<div id="'+segmentName+'"></div>');
	}
	$('#'+segmentName).load(experiment.path+'html/'+segmentName+'.html', 
	function() {
	
	if($.browser.safari) {bodyelem = $("body");}
	else {bodyelem = $("html,body");}
	bodyelem.scrollTop(0);

	switch(segmentName){
	
		case "formPoststudy":

			$('#fsbutton').detach();
			$(function() {
				$('#'+segmentName).submit(function(evt) {
					evt.preventDefault();
					var formFields = $('#'+segmentName+' input, #'+segmentName+' select, #'+segmentName+' textarea');
					console.log(segmentName + ':  '+JSON.stringify(formFields.serializeObject()));
					experiment[segmentName] = formFields.serializeObject();
					validArray = validateForm(segmentName, experiment[segmentName]);
					if(segmentName == 'formBasic') {
						advanceIfInAgeRange(validArray);
						}
					else if (validArray) {
						advanceSegment();
					}
					return false;
				});
				$('#' + segmentName + ' #back').click(function(evt) {
					evt.preventDefault();
					previousSegment();
					return false;
				});
			});
			
			break;
			
		case "positioning2":
			var testaudio = $('#testaudio')[0];

			function setTestedTrue(event){
				tested = true;
			}
			
			testaudio.addEventListener('play', setTestedTrue, false);
			console.log(segmentName);
			console.log($('#' + segmentName + ' :input'));
			$(function() {
				$('#' + segmentName + ' #next').click(function(evt) {
					evt.preventDefault();
					if(tested){
					advanceSegment();
					}
					else{
					bootbox.alert('Please try playing the sample audio before starting the study.');
					}
					return false;
				});
				$('#' + segmentName + ' #back').click(function(evt) {
					evt.preventDefault();
					previousSegment();
					return false;
				});
			});
			break;
			
		case "positioning":
			if (!sandbox) {	show_cam("","webcamdiv");}
		
		case "instructions":
		case "instructions2":
			console.log(segmentName);
			console.log($('#' + segmentName + ' :input'));
			$(function() {
				$('#' + segmentName + ' #next').click(function(evt) {
					evt.preventDefault();
					if (!sandbox) {	hide_cam("webcamdiv"); }
					advanceSegment();
					return false;
				});
				$('#' + segmentName + ' #back').click(function(evt) {
					evt.preventDefault();
					previousSegment();
					return false;
				});
			});
			break;
		}
	});
	
		// Enter/exit fullscreen outside of callback function to deal with browser constraints
	if (segmentName=='vidElement') {
			function endHandler(event){
				addEvent(  {'type': 'endMovie',
							'src': vidSequence[lastVid][0]});
				if (!sandbox && lastVid>0) {
					if (lastVid==(vidSequence.length-1)) {
						jswcam.stopRecording("remove");
					} else {
						jswcam.stopRecording();
					}
					addEvent(  {'type': 'endRecording'});
				}
				if (!video.paused) {video.pause();}
				
				if (vidSequence[lastVid][2] == 'click') {
					// At end of the movie (but only then!), click to continue.
					// This handler removes itself (don't do it here)
					video.style.cursor = 'auto'; // show the cursor again
					// If there's a 4th element, show this image over top until click
					if (vidSequence[lastVid].length>3) {
						$('#thevideo').hide();
						$('#vidElement').prepend('<img class="center clickimage" style="z-index:9999" src="' + experiment.path + 'img/' + vidSequence[lastVid][3] + '.png" >');
						
					}
					$('#vidElement')[0].addEventListener("click", clickHandler, false); 
				} else {
					addEvent(  {'type': 'startDelay'});
					setTimeout(function(){
									addEvent(  {'type': 'endDelay'});
									if (lastVid == (vidSequence.length - 1)){
										advanceSegment(); // done playing all videos, move on
									} else {
										advanceVideoSource(); // load and play next video
									}
								}, 1000*vidSequence[lastVid][2]);
				}

				return false;
				}
			
			
			function clickHandler(event){
				event.preventDefault();
				addEvent(  {'type': 'click',
							'fn': 'advancevideo'});
				vidSeg.removeEventListener("click", clickHandler, false);
				$('.clickimage').remove();
				$('#thevideo').show();
				if (lastVid == (vidSequence.length - 1)){
					$('#vidElement').detach(); // I don't understand why this doesn't just work from advanceSegment, but it doesn't.
					advanceSegment(); // done playing all videos, move on
				} else {
					advanceVideoSource(); // load and play next video
				}
			}
			
			function loadedHandler(){
				console.log('loaded handler');

				// Moved here from below removing event listeners--doesn't work there.(???)
				video.currentTime = 0;
				video.play();
				
				video.removeEventListener('canplaythrough', loadedHandler, false);
				video.removeEventListener('emptied', loadedHandler, false);
				if (!sandbox) {
					jswcam.startRecording(true, true);
					addEvent(  {'type': 'startRecording'});
				}
				video.style.cursor = 'none'; // hide the cursor
				
				addEvent(  {'type': 'startMovie',
							'src': vidSequence[lastVid]});
			}
			
			function advanceVideoSource(){
				lastVid++;
				
				video.addEventListener('timeupdate', timeUpdateHandler);
				video.addEventListener('emptied', loadedHandler, false);
				video.addEventListener('canplaythrough', loadedHandler, false);
				
				video.src = experiment.path + "videos/" + videotype + "/" + vidSequence[lastVid][0] + '.' + videotype;
				
				video.type = 'video/'+videotype;
				console.log(video.src);
				video.load(); // plays upon loading completely ('canplaythrough' listener)
				
			}
			
			// Fires when the current playback position has changed.  This is in place of a
			// direct 'ended' handler because of issues in Safari and IE.  See 
			// http://www.longtailvideo.com/html5/playback for a chart of current play/pause
			// events in various browsers.
			function timeUpdateHandler() {
				// Note: >= rather than == important for IE
				if (video.currentTime >= video.duration) {
					endHandler();
					video.removeEventListener('timeupdate', timeUpdateHandler);
				}
			}
			
			
			$('#maindiv').append(vidElement);
			
			var videotype = 'none';
			if ($('video')[0].canPlayType("video/webm")) {
				videotype = 'webm';
			} else if ($('video')[0].canPlayType("video/mp4")) {
				videotype = 'mp4';
			} else if($('video')[0].canPlayType("video/ogg")) {
				videotype = 'ogv';
			} 
			console.log(videotype);
		
			addFsButton('#maindiv', '#vidElement');
			goFullscreen($('#vidElement')[0]);
			var lastVid = -1;
			var delay = 0;
			var video = $('video')[0];
			var vidSeg = $('#vidElement')[0];
			video.type = 'video/'+videotype;
			$("body").addClass('playingVideo');
			
			// To start with the end-image of the first element.  
			// To start with a movie, use advanceVideoSource();
			lastVid = 0; endHandler();

	} 
	else if (segmentName=='formPoststudy') {
		$('#vidElement').detach();
		$("#widget_holder").css("display","none"); // Removes the widget at the end of the experiment
		leaveFullscreen();
	}
}

function startExperiment(condition, box) {
	experiment.condition = condition;

	var startMatching = condition >= 2;
	var storySet = condition % 2;
	var movieReference = [	[['B_sB', 'B_sE'], ['E_sE', 'E_sB']], 
						    [['A_sA', 'A_sC'], ['C_sC', 'C_sA']], 
						    [['L_sL', 'L_sN'], ['N_sN', 'N_sL']], 
						    [['J_sJ', 'J_sM'], ['M_sM', 'M_sJ']]	];

	// Using condition arrays, make a list of the movies to play for this subject
	var movieList = new Array(4);
	if (startMatching) {
		if (storySet) {
			movieList = ['E_sE', 'C_sA', 'N_sN', 'M_sJ'];
		} else {
			movieList = ['B_sB', 'A_sC', 'L_sL', 'J_sM'];
		}
	} else {
		if (storySet) {
			movieList = ['E_sB', 'C_sC', 'N_sL', 'M_sM'];
		} else {
			movieList = ['B_sE', 'A_sA', 'L_sN', 'J_sJ'];
		}
	}
	
	console.log(movieList);
	experiment.movieList = movieList;
	
	// List of videos to play in the single video element for this experiment
	
	vidSequence = [ ['', '', 'click', 'story1'],
					[movieList[0], '', 'click', 'story2'], 
					[movieList[1], '', 'click', 'story3'], 
					[movieList[2], '', 'click', 'story4'],
					[movieList[3], '', 'click', 'AllDone']];

	// Sequence of sections of the experiment, corresponding to html sections.
	htmlSequence = [['instructions'],
					['instructions2'],
					['positioning'],
					['positioning2'],
					['vidElement'],
					['formPoststudy']];
		
	// Then remove the dialog box blacking out the screen.
	// Force it to close because ajax call has occurred in between, as per
	// http://stackoverflow.com/questions/11519660/
	box.modal('hide');
	$('body').removeClass('modal-open');
	$('.modal-backdrop').remove();
	
	addEvent(  {'type': 'endLoading'});
	
	// Allow the user to end the experiment by pressing 'Home' or 'End' keys.
	document.addEventListener('keydown', getKeyCode, false);
	
	// Start the experiment
	advanceSegment();

}

function buildVideoElement(videoName, videoID) {

    //Video Tag, no controls specified, autoloading for use
    //with jswcam.waitForAssets function
    var video = $('<video id="thevideo" class="center"/>', {
	'height': 400,
	'width': 800,
	'preload': 'auto'
    });

    //Fall Through Failure Message
    video.append($('<p/>', {
	'class': 'warning',
	'text' : 'Your browser does not support HTML5.'
    }));
	
	// Don't allow right-clicking on the video to get controls
	video[0].addEventListener('contextmenu', function(evt) {
		console.log(evt);
		evt.preventDefault();
	});
	
	// stick video and button into one div
	var videoDiv = $('<div/>', {
	'id': videoID});
	videoDiv.append(video);

    return videoDiv;
};



function validateForm(segmentName, formData) {
	valid = true;
	switch(segmentName){
		case 'formBasic':
			return validateFormBasic(formData);
			break;
			
		case 'formPoststudy':
			if (formData.birthmonth == '[Month]' ||
				formData.birthyear == '[Year]'   ||
				formData.birthday.length == 0) {
				valid = false;
				$('#errorBirthdateMissing').removeClass('hidden');} 
			else {
				bd = parseInt(formData.birthday);
				if (isNaN(bd) || bd < 1 || bd > 31){
					$('#errorBirthdateMissing').removeClass('hidden');
					valid = false;}
				else{
					birthdateObj = new Date(parseInt(formData.birthyear), parseInt(formData.birthmonth), bd);
					ageInDays = (experiment.tic - birthdateObj)/(24*60*60*1000);
					formData.ageInDays = ageInDays;
					// Birthdate is in the future
					if (ageInDays < 0) {
						valid = false;
						$('#errorBirthdateMissing').removeClass('hidden');
					}
					else {
						$('#errorBirthdateMissing').addClass('hidden');
					}
				}
			}
			return valid;
			break;
		case 'formDemographic':
			return valid;
			break;
	}
}
