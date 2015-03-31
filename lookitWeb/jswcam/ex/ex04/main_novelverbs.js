/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
 
var experiment;

// The function 'main' must be defined and is called when the consent form is submitted 
function main(mainDivSelector, expt) {
	
	promptBeforeClose();
	setDBID();
	
	experiment = expt; 
	initializeExperiment();

	$(mainDivSelector).attr('id', 'maindiv'); // so we can select it in css as #maindiv
	addEvent(  {'type': 'startLoading'});

	// Black out the screen until waitforassets returns	
	
	var box = bootbox.dialog(
		"Please wait while the experiment loads.", 
		[]); 
		
	if(LOOKIT.sandbox) {
		condition = prompt('Please enter a condition number (0-31)', '0');
		startExperiment(condition, box);
	} else {
		// Get the appropriate condition from the server by checking which ones we 
		// already have
		$.getJSON(
			'counterbalance.php',
			{'experiment_id': experiment.id},
			function(jsonresp) {
				startExperiment(jsonresp.condition, box);
			}
		);
	}
	}


function startExperiment(condition, box) {
	experiment.condition = condition;
	// Counterbalancing condition sets
	// condition is a single number 0<=condition<32
	
	$('#maindiv').append('<div id="sessioncode"></div>');
	$('#sessioncode').html('Session ID: ' + experiment.recordingSet);
	experiment.mturkID = getQueryVariable('workerId');
	
	if (experiment.record_whole_study) {
		jswcam.startRecording();
		addEvent(  {'type': 'startRecording'});
	}
	
	var whichVerb = (condition % 4); // 0, 1, 2, 3: blick, glorp, meek, pimm
	var remCondition = (condition - whichVerb) / 4;
	experiment.question = remCondition % 2; // 0 or 1: what's happening vs find verb
	remCondition = (remCondition - experiment.question) / 2;
	var order = remCondition % 2; // 0 or 1: 1,2 vs 2,1
	experiment.transitive = (remCondition - order) / 2; // 0 or 1
	
	// List of videos to play in the single video element for this experiment
	
	var warmup1 = 'clapping_sleeping';
	var warmup2 = 'feeding_tickling';
	
	var testMovieList = [['intrans1_trans1', 'trans1_intrans1'], 
						 ['intrans2_trans2', 'trans2_intrans2'], 
						 ['intrans3_trans3', 'trans3_intrans3'], 
						 ['intrans4_trans4', 'trans4_intrans4']];
	
	var testMovie = testMovieList[whichVerb][order];
	
	var dialogVideoList = [['Blick_Transitive',   'Glorp_Transitive',   'Meek_Transitive',   'Pimm_Transitive'],
						   ['Blick_Intransitive', 'Glorp_Intransitive', 'Meek_Intransitive', 'Pimm_Intransitive']];
	var dialogVideo = dialogVideoList[experiment.transitive][whichVerb];
	
	var warmupaudio = ['clap1', 	'clap2', 	'clap3', 
					   'tickle1', 	'tickle2', 	'tickle3'];
					   
	var verbs = ['blick', 'glorp', 'meek', 'pimm'];
	experiment.thisVerb = verbs[whichVerb];
	
	var testAudioAll = [['Whatshappening2x', 		'Whatshappening2x', 		'Whatshappening2x'], 
						[experiment.thisVerb + '1', 	experiment.thisVerb + '2', 	experiment.thisVerb + '3']];
	var testAudio = testAudioAll[experiment.question];
			
	// Sequence of videos to proceed through during the 'vidSegment' portion of the
	// study (in htmlSquence).  Format [baseVideoName, baseAudioName, endOfVideoAction]
	// where endOfVideoAction can either be an number of seconds to wait before proceeding
	// or 'click' to require the parent to click to proceed.
	experiment.vidSequence = [		['fam1', '', 'click'], 
						['attentiongrabber',  '', 1],
						[warmup1, warmupaudio[0], 3],
						[warmup1, warmupaudio[1], 3],
						[warmup1, warmupaudio[2], 0],
						['fam2', '', 'click'],
						['attentiongrabber',  '', 0],
						['closeeyes',  '', 'click'],
						[warmup2, warmupaudio[3], 3],
						[warmup2, warmupaudio[4], 3],
						[warmup2, warmupaudio[5], 0],
						['novel', 'beep', 'click'],
						[dialogVideo, '', 0], // Was a 7-second delay with just black; now use attentiongrabber (12 s) instead
						['attentiongrabber',  '', 0],
						['closeeyes',  '', 'click'],
						[testMovie, testAudio[0], 3], 
						[testMovie, testAudio[1], 3],
						[testMovie, testAudio[2], 0],
						['end', 'beep', 'click']				];

	// stick all of this in the experiment object so it will be sent to the database
	experiment.vidSequence = experiment.vidSequence;
	experiment.whichVerb = whichVerb;
	experiment.order = order;
	experiment.conditionIsSet = true; // have set condition; can use for debriefing now

	// Sequence of sections of the experiment, corresponding to html sections.
	experiment.htmlSequence = [['instructions'],
					['positioning'],
					['positioning2'],
					['vidElement'],
					['formPoststudy']];
	
	// Immediately remove them from the html canvas
	$('video').detach();

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

// When proceeding to a new element of experiment.htmlSequence, advanceSegment (defined in
// experimentFunctions.js) will call generateHtml.  This grabs any appropriate html
// from the exNN/html/ directory and adds any necessary JS.
function generateHtml(segmentName){

	addEvent(  {'type': 'htmlSegmentDisplayed'});
	$("body").removeClass('playingVideo');
	
	$('#maindiv').append('<div id="'+segmentName+'"></div>');
	$('#'+segmentName).load(experiment.path+'html/'+segmentName+'.html', 
	function() {
	
	// Scroll to the top of the page
	if($.browser.safari) {bodyelem = $("body");}
	else {bodyelem = $("html,body");}
	bodyelem.scrollTop(0);
	
	// Segment-specific JS additions
	switch(segmentName){
	
		case "formPoststudy":

			$('#fsbutton').detach();
			$(function() {
				$('#'+segmentName).submit(function(evt) {
					evt.preventDefault();
					// If we were recording the whole time, finally stop when the poststudy form
					// is submitted.
					if (experiment.record_whole_study) {
						jswcam.stopRecording();
						addEvent(  {'type': 'endRecording'});
					}	
					// Get the text entered in the fields in this form.
					var formFields = $('#'+segmentName+' input, #'+segmentName+' select, #'+segmentName+' textarea');
					experiment[segmentName] = formFields.serializeObject();
					validArray = validateForm(segmentName, experiment[segmentName]);
					
					if (validArray) {
						advanceSegment(); // Since it's the end of the study this will actually end the experiment.
					}
					return false;
				});
			});
			
			break;
			
		case "positioning2": // Special case to deal with requirement that user should test audio
			var testaudio = $('#testaudio')[0];

			$.data(testaudio, "tested", false);

			function setTestedTrue(event){
				$.data(testaudio, "tested", true);
			}
			testaudio.addEventListener('play', setTestedTrue, false);

			$(function() {
				$('#' + segmentName + ' #next').click(function(evt) {
					evt.preventDefault();
					if($.data(testaudio, "tested")){
						advanceSegment();
					}
					else{
						bootbox.alert('Please play the chime so you\'ll know what it sounds like.');
					}
					return false;
				});
			});
			break;		
			
		case "positioning":
			show_getting_setup_widget(); // fall through
		case "instructions":
		case "instructions2":

			$(function() {
				$('#' + segmentName + ' #next').click(function(evt) {
					evt.preventDefault();
					hide_cam("webcamdiv");
					advanceSegment();
					return false;
				});
			});
			break;
			
		}
		});
		
	// Enter/exit fullscreen outside of callback function to deal with browser constraints on
	// doing fullscreen actions without a direct link to something the user did
	if (segmentName=='formPoststudy') {
		$("#widget_holder").css("display","none"); // Removes the widget at the end of the experiment
		leaveFullscreen();
	}
	else if (segmentName=='vidElement') {
			function endHandler(event){
				addEvent(  {'type': 'endMovie',
							'src': experiment.vidSequence[lastVid]});

				if (!video.paused) {video.pause();}
				video.removeEventListener('playing', setCurrentTime, false);
				
				if (experiment.vidSequence[lastVid][2] == 'click') {
					// At end of the movie (but only then!), click to continue.
					// This handler removes itself (don't do it here)
					video.style.cursor = 'auto'; // show the cursor again
					video.addEventListener("click", clickHandler, false); 
				} else {
					jswcam.stopRecording();
					addEvent(  {'type': 'endRecording'});
					if (experiment.record_whole_study) {
						jswcam.startRecording();
						addEvent(  {'type': 'startRecording'});
					}
					addEvent(  {'type': 'startDelay'});
					setTimeout(function(){
									addEvent(  {'type': 'endDelay'});
									if (lastVid == (experiment.vidSequence.length - 1)){
										advanceSegment(); // done playing all videos, move on
									} else {
										advanceVideoSource(); // load and play next video
									}
								}, 1000*experiment.vidSequence[lastVid][2]);
				}

				return false;
			}
			
			function clickHandler(event){
				event.preventDefault();
				addEvent(  {'type': 'click',
							'fn': 'advancevideo'});
				video.removeEventListener("click", clickHandler, false);
				if (lastVid == (experiment.vidSequence.length - 1)){
					$('#vidElement').detach(); // I don't understand why this doesn't just work from advanceSegment, but it doesn't.
					advanceSegment(); // done playing all videos, move on
				} else {
					advanceVideoSource(); // load and play next video
				}
			}
			
			function setCurrentTime() {
				video.currentTime = 0;
			}
			
			function loadedHandler(){				
				// Moved here from below removing event listeners--doesn't work there.(???)
				audio.play();
				
				video.addEventListener('playing', setCurrentTime);
				video.play();
				
				video.removeEventListener('canplaythrough', loadedHandler, false);
				video.removeEventListener('emptied', loadedHandler, false);
				if (experiment.vidSequence[lastVid][2]!='click') {
					if (experiment.record_whole_study) {
						jswcam.stopRecording();
						addEvent(  {'type': 'endRecording'});
					}
					
					jswcam.startRecording();
					
					addEvent(  {'type': 'startRecording'});
				}
				
				video.style.cursor = 'none'; // hide the cursor
				
				addEvent(  {'type': 'startMovie',
							'src': experiment.vidSequence[lastVid]});
			}
			

			
			function advanceVideoSource(){
				lastVid++;
				
				video.addEventListener('timeupdate', timeUpdateHandler);
				video.addEventListener('emptied', loadedHandler, false);
				video.addEventListener('canplaythrough', loadedHandler, false);
				
				video.src = experiment.path + "videos/" + videotype + "/" + experiment.vidSequence[lastVid][0] + '.' + videotype;
				
				if (experiment.vidSequence[lastVid][1] != '') {
					audio.src = experiment.path + "sounds/" + audiotype + "/" + experiment.vidSequence[lastVid][1] + '.' + audiotype;
				} else {audio.src = '';}
				
				audio.load();
				video.type = 'video/'+videotype;
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
			
			var vidElement = buildVideoElement('start', 'vidElement');
			$('#maindiv').append(vidElement);
			
			var videotype = 'none';
			if ($('video')[0].canPlayType("video/webm")) {
				//$('video').data('videotype', 'webm');
				videotype = 'webm';
			} else if ($('video')[0].canPlayType("video/mp4")) {
				videotype = 'mp4';
			} else if($('video')[0].canPlayType("video/ogg")) {
				videotype = 'ogv';
			} 
			
			var audiotype = 'none';
			if ($('audio')[0].canPlayType("audio/mpeg")) {
				//$('video').data('videotype', 'webm');
				audiotype = 'mp3';
			} else if($('audio')[0].canPlayType("audio/ogg")) {
				audiotype = 'ogg';
			} 
		
			addFsButton('#maindiv', '#thevideo');
			goFullscreen($('#thevideo')[0]);
			var lastVid = -1;
			var delay = 0;
			var video = $('video')[0];
			video.type = 'video/'+videotype;
			var audio = $('audio')[0];
			audio.type = 'audio/'+audiotype;
			$("body").addClass('playingVideo');
			advanceVideoSource();
	}
}

function buildVideoElement(videoName, videoID) {

    //Video Tag, no controls specified, autoloading for use
    //with jswcam.waitForAssets function
    var video = $('<video id="thevideo" class="center"/>', {
	'height': 400,
	'width': 800,
	'preload': 'auto',
	'poster' : experiment.path + "/videos/blackposter.jpg"
    });

    //Fall Through Failure Message
    video.append($('<p/>', {
	'class': 'warning',
	'text' : 'Your browser does not support HTML5.'
    }));
	
	// Don't allow right-clicking on the video to get controls
	video[0].addEventListener('contextmenu', function(evt) {
		evt.preventDefault();
	});
	
	// Audio to go along with silent videos
	var audiosegment = $('<audio/>', {
	'id': 'vidElementAudio'});

	// stick video and button into one div
	var videoDiv = $('<div/>', {
	'id': videoID});
	videoDiv.append(video);
	videoDiv.append(audiosegment);

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
			if (formData.bilingual.length==0) {
				valid = false;
				$('#errorBilingualMissing').removeClass('hidden');
			} else {$('#errorBilingualMissing').addClass('hidden');}
			return valid;
			break;
		case 'formDemographic':
			return valid;
			break;
	}
}

function generate_debriefing() {

	if (experiment.conditionIsSet) {
		// Get debriefing dialog ready: Used by index.js when generating upload dialog
		var debriefTransitiveList = [	'a transitive verb (one that takes a direct object)', 
										'an intransitive verb (one that doesn\'t take a direct object)'];
		var debriefVerbType = debriefTransitiveList[experiment.transitive];
		var debriefOtherVerbType = debriefTransitiveList[1-experiment.transitive];
		var debriefQuestionList = ["CONTROL question: What's happening?  Children in another condition hear \
								   'Find " + experiment.thisVerb + "ing' instead.", 
								   "prompt: 'FIND " + experiment.thisVerb + "ing.  Children in another condition \
								   hear 'What's happening?' instead."];

		var DEBRIEFHTML = "	<p> Some more information about this study... </p> \
		<p> This is one of the early studies we are using to test what sorts of methods will work \
		online as well as  in the lab.  We are trying to replicate the finding of <a href= \
		'http://pss.sagepub.com/content/20/5/619.short' target='_blank'> Yuan and Fisher (2009) \
		</a> that 2-year-old store information about whether a verb is transitive or intransitive \
		even before they know what the verb means. <p> \
		<p> Your child heard some short dialogs in which the new verb '" + experiment.thisVerb + "ing' \
		was used as " + debriefVerbType + ". We use a variety of different new verbs, and some children \
		hear them used as " + debriefOtherVerbType + " verbs instead. We then showed two different actions: \
		one with just one participant, and one with two participants.  Your child heard \
		a " + debriefQuestionList[experiment.question] + " We are expecting that on average, when \
		actually prompted to find the novel verb, children who hear the transitive dialogs will \
		look more to the two-participant actions than do children who hear the intransitive \
		dialogs. </p> \
		<p> Individual children may look left or right for all sorts of reasons during the study--\
		for instance, other interesting things going on at home, or a preference for the particular \
		actions.  However, over many children, these effects average out.</p> ";
	}
	else {
		var DEBRIEFHTML = "	<p> Some more information about this study... </p> \
		<p> This is one of the early studies we are using to test what sorts of methods \
		will work online as well as in the lab.  We are trying to replicate the finding of <a \
		href='http://pss.sagepub.com/content/20/5/619.short' target='_blank'> \
		Yuan and Fisher (2009) </a> that 2-year-old store information about whether a verb is \
		transitive or intransitive even before they know what the verb means. <p>";
	}
	
	return DEBRIEFHTML;

}