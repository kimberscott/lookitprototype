/*                                                                                                                                                                                                                                    
 * * Copyright (C) MIT Early Childhood Cognition Lab                                                                                                                                                                                   
 *                                                                                                                                                                                                                                     
 */

// Global variables (available in all functions)
var currentElement = -1; // State variable: which html element we're on	
var htmlSequence;
var vidSequence;
var experiment;
var DELAY;
var tested = false; // whether the audio has been tested
var trialCounter = 1;

// Use a shorter version of the study just for testing?
var shortTest = false;

// If sandbox is true, we skip all the calls to jswcam (to start/stop recording, etc.).
var sandbox = false;
var record_whole_study = false; // records entire study, but retains segmentation indicated (just records in between too)--so clip #s doubled

var conditionSet = false;


// The function 'main' must be defined and is called when the consent form is submitted 
// (or from sandbox.html)
function main(mainDivSel, expt) {
	
	mainDivSelector = mainDivSel;
	experiment = expt;
	experiment.endedEarly = false;
	experiment.minAgeDays = 11*30; // 11 months
	experiment.maxAgeDays = 365+31; //  13 months
	experiment.tic = new Date();
	experiment.eventArray = []; // appended to by addEvent to keep track of things that happen
	experiment.recordingSet = RECORDINGSET;

	console.log("Starting experiment: ", experiment.name);
	$(mainDivSelector).attr('id', 'maindiv'); // so we can select it in css as #maindiv
	addEvent(  {'type': 'startLoading'});

	// Black out the screen until waitforassets returns	
	var box = bootbox.dialog(
		"Please wait while the experiment loads.", 
		[]); 
		
	if(sandbox) {
		// Just use a specific arbitrary condition number (0 through 7)
		condition = prompt('Please enter a condition (0 through 7)', '0');
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
			});
 	}
	}
	
function startExperiment(condition, box) {

	if (record_whole_study) { 
		jswcam.startRecording();
		addEvent(  {'type': 'startRecording'});
	}	

	experiment.condition = condition;
	
	testMovieLists = [ ['lottoProb3C1S_blueC', 'lottoProb3C1S_yellS', 
						'lottoProb3C1S_yellC', 'lottoProb3C1S_blueS'], 
					   ['lottoProb1C3S_blueS', 'lottoProb1C3S_yellC', 
						'lottoProb3C1S_blueC', 'lottoProb3C1S_yellS'], 
					   ['lottoProb1C3S_yellS', 'lottoProb1C3S_blueC', 
						'lottoProb1C3S_blueS', 'lottoProb1C3S_yellC'], 
					   ['lottoProb3C1S_yellC', 'lottoProb3C1S_blueS', 
						'lottoProb1C3S_yellS', 'lottoProb1C3S_blueC'],
					   ['lottoProb1C3S_blueC', 'lottoProb1C3S_yellS', 
						'lottoProb1C3S_yellC', 'lottoProb1C3S_blueS'], 
					   ['lottoProb3C1S_blueS', 'lottoProb3C1S_yellC', 
						'lottoProb1C3S_blueC', 'lottoProb1C3S_yellS'], 
					   ['lottoProb3C1S_yellS', 'lottoProb3C1S_blueC', 
						'lottoProb3C1S_blueS', 'lottoProb3C1S_yellC'], 
					   ['lottoProb1C3S_yellC', 'lottoProb1C3S_blueS', 
						'lottoProb3C1S_yellS', 'lottoProb3C1S_blueC']];
			
	// Familiarization: 
	
	DELAY = 15; // Seconds to display still screen after pausing
	if (shortTest) {
		DELAY = 2;
	}
	famMovies =  [ 		['fix_space', '', 'loop'],
						['lotto2C2S_B_F', '', 0], 	
						['lotto2C2S_B_mid1', 'first_trial', 'click'], 
						['lotto2C2S_B_S', '', DELAY], 
						['fix_space', '', 'loop'],
						['lotto2C2S_Y_F', '', 0],
						['lotto2C2S_Y_mid1', 'first_trial', 'click'], 	
						['lotto2C2S_Y_S', '', DELAY], 
						['fix_space', '', 'loop'],
						['lotto2C2S_B_F', '', 0], 	
						['lotto2C2S_B_mid2', 'second_trial', 'click'], 	
						['lotto2C2S_B_S', '', DELAY], 
						['fix_space', 'all_done', 'loop'],
						['lotto2C2S_Y_F', '', 0], 	
						['lotto2C2S_Y_mid2', 'close_eyes', 'click'], 	
						['lotto2C2S_Y_S', '', DELAY]];					
					
	for (i=0; i<4; i++) { 
		famMovies.push(['fix_space', 'all_done', 'loop']);
		famMovies.push([testMovieLists[condition][i]+'_F', '', 0]);
		famMovies.push(['instruction', 'close_eyes', 'click']);
		famMovies.push([testMovieLists[condition][i]+'_S', '', DELAY]);
	}
	
	if (shortTest) {
	famMovies =  [ 		['fix_space', '', 'loop'],
						['lotto2C2S_B_F', '', 0], 	
						['lotto2C2S_B_mid1', 'first_trial', 'click'], 
						['lotto2C2S_B_S', '', DELAY]];
	}
	
	famMovies.push(['alldone', 'all_done', 'click']);
						
	vidElement = buildVideoElement('vidElement');
	$('video').detach();
	conditionSet = true;
	
	// Sequence of sections of the experiment, corresponding to html sections.
	htmlSequence = [['instructions'],
					['positioning'],
					['positioning2'],
					['famMovies', vidElement],
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
$('#maindiv').removeClass('whitebackground');
	
	switch(segmentName) {
		case "formPoststudy":
		case "positioning2":
		case "positioning":
		case "instructions":
			$('#maindiv').append('<div id="'+segmentName+'"></div>');
			break;
		case "famMovies":
			$('#maindiv').append('<div id="fsdiv"></div>');
		default:
			$('#fsdiv').addClass('playingVideo');
			$('#fsdiv').append('<div id="'+segmentName+'"></div>');
			break;
	}
	
	$('#'+segmentName).load(experiment.path+'html/'+segmentName+'.html', 
	function() {
	
	if($.browser.safari) {bodyelem = $("body");}
	else {bodyelem = $("html,body");}
	bodyelem.scrollTop(0);

	switch(segmentName){
	
		case "formPoststudy":
			$("body").css("background-color","#FFFFFF");
			$('#fsdiv').detach();
			$('#fsbutton').detach();
			$("#flashplayer").remove();
			$("#widget_holder").css("display","none"); // Removes the widget at the end of the experiment
			$(function() {
				$('#'+segmentName).submit(function(evt) {
					evt.preventDefault();
					if (record_whole_study) {
						jswcam.stopRecording();
					}
					var formFields = $('#'+segmentName+' input, #'+segmentName+' select, #'+segmentName+' textarea');
					console.log(segmentName + ':  '+JSON.stringify(formFields.serializeObject()));
					experiment[segmentName] = formFields.serializeObject();
					validArray = validateForm(segmentName, experiment[segmentName]);
					if (validArray) {
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
			show_cam("position","webcamdiv");	
			
		case "pretest":
		case "instructions":
		case "instructions2":

			$(function() {
				$('#' + segmentName + ' #next').click(function(evt) {
					hide_cam("webcamdiv");
					evt.preventDefault();
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
	}});
	
	switch(segmentName) {
		case "famMovies":
			addFsButton('#maindiv', '#fsdiv');
			goFullscreen($('#fsdiv')[0]);
			$("body").css("background-color","#000000");		
			$('#fsdiv').append(htmlSequence[currentElement][1]);
			function endHandler(event){
				addEvent(  {'type': 'endMovie',
							'src': vidSequence[lastVid]});
					
				if (!video.paused) {video.pause();}
				
				if (vidSequence[lastVid][2] != 'click') {
					addEvent(  {'type': 'startDelay'});
					setTimeout(function(){
									addEvent(  {'type': 'endDelay'});
									if (!sandbox) {
										jswcam.stopRecording();
										addEvent(  {'type': 'endRecording'});
									}
									if (record_whole_study) {
										jswcam.startRecording();
									}
									if (lastVid == (vidSequence.length - 1)){
										advanceSegment(); // done playing all videos, move on
									} else {
										advanceVideoSource(); // load and play next video
									}
								}, 1000*vidSequence[lastVid][2]);
				}

				return false;
			}
			
			function keypressHandler(event){
			
				event.preventDefault();
				console.log('click');
				event = event.charCode || event.keyCode;
				console.log(event);
				if (event==32 && audio.paused) { // Space bar
			
					addEvent(  {'type': 'click',
								'fn': 'advancevideo'});
					document.removeEventListener("keydown", keypressHandler, false);
					if (vidSequence[lastVid][2]=='loop') {
						addEvent(  {'type': 'endMovie',
							'src': vidSequence[lastVid]});
						if (!video.paused) {video.pause();}
					}
					if (lastVid == (vidSequence.length - 1)){
						advanceSegment(); // done playing all videos, move on
					} else {
						advanceVideoSource(); // load and play next video
					}
				}
			}
			
			function loadedHandler(){
				console.log('loaded handler');
				video.removeEventListener('emptied', loadedHandler, false);
				video.removeEventListener('canplaythrough', loadedHandler, false);

				if (!sandbox && vidSequence[lastVid][2]==DELAY) { // only for the test looking-time portions
					if (record_whole_study) {
						jswcam.stopRecording();
						addEvent( {'type': 'endRecording'});
					}
					jswcam.startRecording();
					addEvent(  {'type': 'startRecording'});
				}
				
				video.play();
				
				if (vidSequence[lastVid][2] == 'loop') {
					$('video').attr('loop', 'loop');
					video.style.cursor = 'auto'; // show the cursor again
					document.addEventListener("keydown", keypressHandler, false);
					console.log('looping');
					}
				else if (vidSequence[lastVid][2] == 'click') {
					video.style.cursor = 'auto'; // show the cursor again
					document.addEventListener("keydown", keypressHandler, false);
					$('video').removeAttr('loop');
					console.log('click delay');
					}
				else {
					video.style.cursor = 'none'; // hide the cursor
					$('video').removeAttr('loop');
					console.log('regular delay');
					}
				
				addEvent(  {'type': 'startMovie',
							'src': vidSequence[lastVid]});
			}
			
			function advanceVideoSource(){
				lastVid++;
				
				if (vidSequence[lastVid][0] == 'fix_space') {
					$('#indicatorText').html('<p> Trial ' + trialCounter + ' of 8</p>');
					trialCounter++;
				} else {
					$('#indicatorText').html('');
				}
				
				if (vidSequence[lastVid][2] != 'loop') {
					video.addEventListener('timeupdate', timeUpdateHandler);
					}
				else {
					video.removeEventListener('timeupdate', timeUpdateHandler);
					}
				video.addEventListener('emptied', loadedHandler, false);
				video.addEventListener('canplaythrough', loadedHandler, false);
				
				video.src = experiment.path + "videos/" + videotype + "/" + vidSequence[lastVid][0] + '.' + videotype;
								video.addEventListener('emptied', loadedHandler, false);
				video.addEventListener('canplaythrough', loadedHandler, false);
				
				// Play the audio for this segment at the start if there is any
				if (vidSequence[lastVid][1] != '') {
					music.pause();
					audio.src = experiment.path + "sounds/" + vidSequence[lastVid][1] + '.' + audiotype;
					audio.load();
					audio.play();
					audio.addEventListener("ended", switchToMusic, false);
				} else {audio.src = '';}
				
				video.load(); // plays upon loading completely ('canplaythrough' listener)
				console.log(video.src);
			}
			
			function switchToMusic() {
				audio.pause();
				music.play();
			}
			
			
			// Fires when the current playback position has changed.  This is in place of a
			// direct 'ended' handler because of issues in Safari and IE.  See 
			// http://www.longtailvideo.com/html5/playback for a chart of current play/pause
			// events in various browsers.
			function timeUpdateHandler() {
				// Note: >= rather than == important for IE
				if (video.currentTime >= video.duration - 0.1) {
					setTimeout(endHandler, 100);
					video.removeEventListener('timeupdate', timeUpdateHandler);
				}
			}
		
			if(segmentName=='famMovies') {var vidSequence = famMovies;}
			else if(segmentName=='testMovies') {var vidSequence = testMovies;}
			
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
			var music = $('#vidElementMusic')[0];
			music.type = audiotype;
			music.src= experiment.path + "sounds/lasting-memories." + audiotype;
			music.play();

			var audio = $('#vidElementAudio')[0];
					
			$('.videoDiv').attr('id', segmentName);
		
			var lastVid = -1;
			var delay = 0;
			var video = $('video')[0];
			video.type = videotype;
			advanceVideoSource();
			

			break; }
}



function buildVideoElement(videoID) {

    //Video Tag, no controls specified, autoloading for use
    //with jswcam.waitForAssets function
    var video = $('<video id="thevideo" class="thevideo center"/>', {
	'height': 400,
	'width': 800,
	'wmode': "opaque", // This allows the HTML to hide the flash content
	'preload': 'auto'});

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
	
	var musicsegment = $('<audio/>', {
	'id': 'vidElementMusic', 
	'volume': 0.25,
	'loop': 'loop'});
	
	var audiosegment = $('<audio/>', {
	'id': 'vidElementAudio', 
	'volume': 1.0});

	// stick video and button into one div
	var videoDiv = $('<div/>', {
	'id': videoID,
	'class': 'videoDiv'});
	videoDiv.append(video);
	videoDiv.append(musicsegment);
	videoDiv.append(audiosegment);
	videoDiv.append($('<div/>', {'id': 'indicatorText'}));

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
			if (formData.hearing.length==0) {
				valid = false;
				$('#errorHearingMissing').removeClass('hidden');
			} else {$('#errorHearingMissing').addClass('hidden');}
			return valid;
			break;
		case 'formDemographic':
			return valid;
			break;
	}
}

function generate_debriefing() {


	var DEBRIEFHTML = "<p> Some more information about this study... \
				<p>This is one of the early studies we are using to find out what sorts of methods will work online as well as \
				in the lab.  We are trying to replicate the finding of <a href='http://www.pnas.org/content/104/48/19156.long' \
				target='_blank'> Teglas , Girotto, Gonzalez, and Bonatti (2007) </a> that by about 12 months of age, infants \
				have expectations about the probabilities of physical events--even events they have never seen before! ";
	if (conditionSet) {
		DEBRIEFHTML += "The first four machines we showed were warm-up trials, just to get you and your child used to the procedure.  \
				The last four machines each had three shapes of one color and one shape of a different color.  During two trials, \
				the more common shape came out of the machine.  During the other two trials, the less common shape came out of the \
				machine.  We predict that infants will find it more surprising when the less common shape comes out of the machine, \
				and may look longer at that outcome before looking away from the screen. \
				<p> Individual children may look to and away from the screen for many different reasons during the study.  However, \
				over many children these effects average out and we can look for effects of the probability of the outcome.";
				}
				
	
	return DEBRIEFHTML;

}