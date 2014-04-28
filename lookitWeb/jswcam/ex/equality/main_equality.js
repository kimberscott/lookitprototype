/*                                                                                                                                                                                                                                    
 * * Copyright (C) MIT Early Childhood Cognition Lab                                                                              
 */

// Global variables (available in all functions)
var currentElement = -1; // State variable: which html element we're on	
var htmlSequence;
var experiment; // where all information about experiment and events is stored--to send to server
var audiotype = 'none';
var audioNames;
var seqLengths;
var currentPage;
var thisSegment;
var condition; 		// counterbalancing condition
var tested = false; // whether parent has tried the audio 
var attachToDiv = '#maindiv';

var characterNames;

// If sandbox is true, we skip all the calls to jswcam (to start/stop recording, etc.).
var sandbox = false;

// Used by index.js when generating upload dialog (replace this.html('uploading'))
// Placeholder in case parent cancels before full debrief html is defined
var DEBRIEFHTML = "";

// The function 'main' must be defined and is called when the consent form is submitted 
// (or from sandbox.html)
function main(mainDivSel, expt) {
	
	mainDivSelector = mainDivSel;
	experiment = expt;
	experiment.endedEarly = false;
	experiment.minAgeDays = 11*12/365;
	experiment.maxAgeDays = 14*12/365;
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
		condition = prompt('Please enter a condition number (0-7)', '0');
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

function startExperiment(condition, box) {
    console.log('Condition: ' + condition);
	// Parse out the counterbalancing condition:
	experiment.condition = condition;
	experiment.startMatchSound = condition % 2;
	experiment.startMatchLeft  = condition >= 2;
	
	DEBRIEFHTML = "<p> Thanks so much for participating!  To confirm your participation, please press 'Done' below.  (If you \
				wish to withdraw from the study at this point and delete your data, please press 'Cancel and withdraw.'  But \
				please note that we are very grateful for your recordings even if you think the study didn't 'work'--if kids just \
				aren't interested, that means we need to fix something!)";

	// Sequence of sections of the experiment, corresponding to html sections.
	
	htmlSequence = [['instructions'],
					['positioning'],
					['positioning2'],
					['startfullscreen'],
					['attentiongrabber'],
					['trial', 'L_1', 'match'],
					['attentiongrabber'],
					['trial', 'L_1', 'mismatch_1'],
					['endfullscreen'],
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

	
function generateHtml(segmentName){

	addEvent(  {'type': 'htmlSegmentDisplayed'});
	$(attachToDiv).append('<div id="'+segmentName+'"></div>');
	$('#'+segmentName).load(experiment.path+'html/'+segmentName+'.html', 
	function() {
	
		// Scroll to the top of the page
		if($.browser.safari) bodyelem = $("body")
		else bodyelem = $("html,body")
		bodyelem.scrollTop(0);

		switch(segmentName){			
			case "formPoststudy":

				$(function() {
					
					$('#'+segmentName).submit(function(evt) {
						evt.preventDefault();
						var formFields = $('#'+segmentName+' input, #'+segmentName+' select, #'+segmentName+' textarea');
						console.log(segmentName + ':  '+JSON.stringify(formFields.serializeObject()));
						experiment[segmentName] = formFields.serializeObject();
						validArray = validateForm(segmentName, experiment[segmentName]);
						if (validArray) {
							advanceSegment();
						}
						return false;
					});
				});
				
				break;
				
			case "positioning2": // special case to deal with checking audio
				
				var testaudio = $('#testaudio')[0];
				function setTestedTrue(event){
					tested = true;
				}
				testaudio.addEventListener('play', setTestedTrue, false);
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
				show_cam("position","webcamdiv");
			
			case "instructions":
			
				if(segmentName=='instructions') {
					$('#'+segmentName).addClass('instructions');
					}
				$("body").removeClass('playingVideo');
				$(function() {
					$('#' + segmentName + ' #next').click(function(evt) {
						hide_cam("webcamdiv");
						evt.preventDefault();
						advanceSegment();
						return false;
					});
				});
				break;
			
			case "attentiongrabber":
				
			
				function keypressHandler(event){
				
					event.preventDefault();
					console.log('click');
					event = event.charCode || event.keyCode;
					console.log(event);
					if (event==32) { // Space bar
				
						addEvent(  {'type': 'click',
									'fn': 'advancetotrial'});
						document.removeEventListener("keydown", keypressHandler, false);
						advanceSegment();
					}
				}
			
				document.addEventListener("keydown", keypressHandler, false);
				
				var videotype = 'none';
				if ($('video')[0].canPlayType("video/webm")) {
					videotype = 'webm';
				} else if ($('video')[0].canPlayType("video/mp4")) {
					videotype = 'mp4';
				} else if($('video')[0].canPlayType("video/ogg")) {
					videotype = 'ogv';
				} 
				console.log(videotype);
			
				var audiotype = 'none';
				if ($('audio')[0].canPlayType("audio/mpeg")) {
					audiotype = 'mp3';
				} else if($('audio')[0].canPlayType("audio/ogg")) {
					audiotype = 'ogg';
				} 
				console.log(audiotype);
			
				var video = $('video')[0];
				video.type = videotype;
				video.load(); // plays upon loading completely ('canplaythrough' listener)
				video.play();
				break;
			
			
			case "trial":
			
				// Check what type of audio file to use, store in global variable
				var audio = $('#trialAudio')[0];
				if (audio.canPlayType('audio/ogg;')) {
					audiotype = 'ogg';
					audioTypeString = 'audio/ogg';
				} else if( audio.canPlayType('audio/mp3')) {
					audiotype = 'mp3'
					audioTypeString = 'audio/mp3';
				} else {
					console.log('no audio');
				}
				
				imgSrc = htmlSequence[thisSegment][1];
				$('#trialImage').attr('src', imgSrc);

				audioName = htmlSequence[thisSegment][2];
				var audioSource = experiment.path + "sounds/" + audioName + '.' + audiotype;
				$('#storyAudio').attr('src', audioSource);
				$('#storyAudio').attr('type', audioTypeString);				
				
				var audio = $('#trialAudio')[0];
				audio.load();
				audio.addEventListener("ended", advanceSegment, false);
				setTimeout(function(){audio.play()}, 4000);
				
				addEvent({'type': 'startPage', 
							  'image': imgSrc,
							  'sound': audioName});
				break;
				
		}
	});
	
	// Enter/exit fullscreen outside of callback function to deal with browser constraints
	if (segmentName=='startfullscreen') {
		$(attachToDiv).append('<div id="fs"></div>');
		addFsButton('#maindiv', '#fs');
		goFullscreen($('#fs')[0]);
		attachToDiv = '#fs';
	} else if (segmentName=='endfullscreen') {
		leaveFullscreen();
		$('#fs').detach();
		$('#fsbutton').detach();
		attachToDiv = '#maindiv';
		$("#flashplayer").remove();
		$("#widget_holder").css("display","none"); // Removes the widget at the end of the experiment
	}
	
	// TODO: start/stop recording
	if (!sandbox) {
		switch(segmentName) {
			case "baselinequestion":
				jswcam.startRecording("connect");
				addEvent(  {'type': 'startRecording'});
				break;
			case "storyquestion":
				jswcam.startRecording();
				addEvent(  {'type': 'startRecording'});
				break;
			case "story":
				jswcam.stopRecording();
				addEvent(  {'type': 'endRecording'});
				break;
			case "storyend":
				jswcam.stopRecording("remove");
				addEvent(  {'type': 'endRecording'});
				break;			
		}
	}
}


// Function to validate any of the forms (study-specific)
function validateForm(segmentName, formData) {
	valid = true;
	switch(segmentName){
		case 'formBasic':
			//alert(formData);
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
