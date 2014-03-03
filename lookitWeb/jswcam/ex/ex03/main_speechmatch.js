
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
	<p> The 'Talking Faces' study uses a method called preferential looking.  Researchers \
	will record how long your child was looking towards the left face, the right face, and away from \
	the screen during each movie.  We are expecting that infants and toddlers will have a preference \
	for the faces that match the story audio.  However, parents may have a preference \
	for these 'matching faces' or inadvertently direct their children to attend to the matching faces.  \
	That's why parents are given various instructions--to close their eyes, to attend to the non-matching face, \
	and so on.  This gives us a measure of how much of an effect parents' deliberate attention has on infants' \
	looking behavior.  </p> \
	<p> Individual children may look left or right for all sorts of reasons during the study--for instance, other interesting \
	things going on at home, or a preference for the movements of one face versus the other.  However, over many \
	children, these effects average out.  We show each child a random sequence of two left and two right matching \
	faces to ensure that we do not just learn about infants' interest in left versus right! </p> ";

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
		condition = prompt('Please enter a condition number (0-5)', '0');
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
	$('#maindiv').append('<div id="'+segmentName+'"></div>');
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
			show_cam("","webcamdiv");
		
		case "instructions":
		case "instructions2":
			console.log(segmentName);
			console.log($('#' + segmentName + ' :input'));
			$(function() {
				$('#' + segmentName + ' #next').click(function(evt) {
					evt.preventDefault();
					hide_cam("webcamdiv");
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
				if (!sandbox) {
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
					video.addEventListener("click", clickHandler, false); 
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
				video.removeEventListener("click", clickHandler, false);
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
				video.play();
				video.currentTime = 0;

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
			
			var vidElement = buildVideoElement('start', 'vidElement');
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
		
			addFsButton('#maindiv', '#thevideo');
			goFullscreen($('#thevideo')[0]);
			var lastVid = -1;
			var delay = 0;
			var video = $('video')[0];
			video.type = 'video/'+videotype;
			$("body").addClass('playingVideo');
			advanceVideoSource();

	} 
	else if (segmentName=='formPoststudy') {
		$('#vidElement').detach();
		$("#widget_holder").css("display","none"); // Removes the widget at the end of the experiment
		leaveFullscreen();
	}
}

function startExperiment(condition, box) {
	experiment.condition = condition;

	// Counterbalancing condition sets
	// condition is a single number 0<=condition<64
	// condition = (iSideCondition * 16) + versionCondition
	// movies are named [storyLeft]_[storyRight]_s[WhichSoundIsOn]
	
	// the ith character of the side condition says which face is talking during
	//  the ith test movie (e.g. B_E_sB is right/R)
	var sideConditions = ['LLRR', 'LRLR', 'LRRL', 'RLLR', 'RLRL', 'RRLL'];
	var sides = sideConditions[condition];
	var movieReference = [	['B_E_sB', 'B_E_sE'], 
						    ['A_C_sA', 'A_C_sC'],
						    ['L_N_sL', 'L_N_sN'],
						    ['J_M_sJ', 'J_M_sM']];

	// Using condition arrays, make a list of the movies to play for this subject
	var movieList = new Array(4);
	for (var iTest=0; iTest<4; iTest++){
		var thisSide = (sides.charAt(iTest) === 'R');
		movieList[iTest] = movieReference[iTest][1.0*thisSide];
	}
	
	console.log(movieList);
	experiment.movieList = movieList;
	experiment.sides = sides;
	
	// List of videos to play in the single video element for this experiment
	
	vidSequence = [['start', '', 'click'],
					['attentiongrabber', '', 'click'], 
					[movieList[0], '', 'click'], 
					['attentiongrabber','', 'click'], 
					[movieList[1], '', 'click'], 
					['attentiongrabber','', 'click'], 
					[movieList[2], '', 'click'], 
					['attentiongrabber','', 'click'], 
					[movieList[3], '', 'click']];

	// Sequence of sections of the experiment, corresponding to html sections.
	htmlSequence = [['instructions'],
					['instructions2'],
					['positioning'],
					['positioning2'],
					['vidElement'],
					['formPoststudy']];
		
	// Once all the videos are loaded...
	// (currently not used because we're putting all videos in a single container
	// and loading them one by one, rather than putting in separate html5 video 
	// containers and attaching/detaching.  the latter would be better but makes it harder
	// to do fullscreen without asking repeatedly.)

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
			if (formData.distance.length==0 ||
				formData.distance == 'e.g. 18 inches') {
				valid = false;
				$('#errorDistanceMissing').removeClass('hidden');
			} else {$('#errorDistanceMissing').addClass('hidden');}
			if (formData.monitor.length==0 ||
				formData.monitor == 'e.g. 12 inches') {
				valid = false;
				$('#errorMonitorMissing').removeClass('hidden');
			} else {$('#errorMonitorMissing').addClass('hidden');}
			return valid;
			break;
		case 'formDemographic':
			return valid;
			break;
	}
}
