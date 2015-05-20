/*                                                                          
 * * Copyright (C) MIT Early Childhood Cognition Lab                                                                           
 */

var experiment;

var audiotype = 'none';
var videoNames = {};
var storyNames = {};
var condition = 0;
var tested=false;
var isRecording=false;
var conditionSet = false;
var videotype = 'none';
var vidElement;

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
		// Just use a specific arbitrary condition number (0 through 31)
		condition = prompt('Please enter a number (0-31)', '0');
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
	
	$('#maindiv').append('<div id="sessioncode"></div>');
	$('#sessioncode').html('Session ID: ' + experiment.recordingSet);
	experiment.mturkID = getQueryVariable('workerId');
	
	if (experiment.record_whole_study) {
		jswcam.startRecording();
		addEvent(  {'type': 'startRecording'});
	}
	
	// Counterbalancing condition
	
	var accuracyCond = (condition % 8); // 0 through 7
	var cbCond = (condition - accuracyCond) / 8; // 0 through 3
	
	var accuracyCondList = [[0, 75],
							[0, 100],
							[25, 75],
							[25, 100],
							[75, 25],
							[75, 0],
							[100,25],
							[100,0]];
							
	experiment.accuracyCond = accuracyCond;
	experiment.cbCond = cbCond;
	experiment.accuracies = accuracyCondList[accuracyCond];
	conditionSet = true;
	
	
	
	// Counterbalance which object both people get wrong or both people get right,
	// if necessary.
	for(var i=0; i<4; i++) {
		var thisAccuracyVideo = 'pair1_obj' + i + '_';
		
		if ((accuracyCondList[accuracyCond][0] == 100) || 
			((accuracyCondList[accuracyCond][0] == 75) && (i != cbCond)) || 
			((accuracyCondList[accuracyCond][0] == 25) && (i == cbCond))) {
			thisAccuracyVideo += 'C';
		} else {
			thisAccuracyVideo += 'I';
		}
		
		if ((accuracyCondList[accuracyCond][1] == 100) || 
			((accuracyCondList[accuracyCond][1] == 75) && (i != cbCond)) || 
			((accuracyCondList[accuracyCond][1] == 25) && (i == cbCond))) {
			thisAccuracyVideo += 'C';
		} else {
			thisAccuracyVideo += 'I';
		}
		
		videoNames['accuracy'+i] = thisAccuracyVideo;
		videoNames['novel'+i] = 'pair1_novel'+i;
	}
	
	videoNames['intro'] = 'pair1_intro';
	videoNames['black'] = 'black';
				  
	// element ID: [image name, audio name]
	storyNames = {'object0': 		['fam_spoon', 'letsask'],
				  'object1':		['fam_bottle', 'letsask'],
				  'object2':		['fam_brush', 'letsask'],
				  'object3':		['fam_doll', 'letsask'],
				  'object4':		['novel_g', 'letsask'], //a
				  'object5':		['novel_h', 'letsask'], //d
				  'object6':		['novel_e', 'letsask'], //f
				  'object7':		['novel_a', 'letsask'], //c
				  'whoWasGoodFam' : ['',  'pair1_whowasgood'],
				  'whoWasGoodNov' : ['',  'pair1_whowasgood']};

	for(var i=0; i<4; i++) {
		storyNames['summaryFam'+i] = [storyNames['object'+i][0],     'pair1_summary_obj' + i + '_' + videoNames['accuracy'+i].substr(videoNames['accuracy'+i].length - 2)];
		storyNames['summaryNov'+i] = [storyNames['object'+(i+4)][0], 'pair1_summary_novel' + i];
	}
	
	
	vidElement = buildVideoElement('intro', 'vidElement');
					
	// Sequence of sections of the experiment, corresponding to html sections.
	experiment.htmlSequence = [['instructions', 'html'],
					['positioning', 'html'],
					['positioning2', 'html'],
					
					['intro', 'vid'],
					
					['object0', 'story'],
					['accuracy0', 'vid'], 
					['summaryFam0',  'question'],
					
					['object1', 'story'],
					['accuracy1', 'vid'], 
					['summaryFam1', 'question'],
					
					['object2', 'story'],
					['accuracy2',    'vid'], 
					['summaryFam2',  'question'],
					
					['object3', 'story'],
					['accuracy3', 'vid'], 
					['summaryFam3', 'question'],
					
					['whoWasGoodFam', 'question'],
					
					['object4', 'story'],
					['novel0', 'vid'], 
					['summaryNov0', 'question'],
					
					['object5', 'story'],
					['novel1', 'vid'], 
					['summaryNov1', 'question'],
					
					['object6', 'story'],
					['novel2', 'vid'], 
					['summaryNov2', 'question'],
										
					['object7', 'story'],
					['novel3', 'vid'], 
					['summaryNov3', 'question'],
					
					['whoWasGoodNov', 'question'],
					
					['formPoststudy', 'html']];

					

	// Then remove the dialog box blacking out the screen.
	// Force it to close, because ajax call has occurred in between, as per
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

	addEvent(  {'type': 'htmlSegmentDisplayed', 'segment': segmentName});
	$("body").removeClass('playingVideo');
	
	// In general, append to the main div, but for story/video elements, 
	// append to a special full-screen div that will be left in throughout
	if (experiment.htmlSequence[experiment.currentElement][1] == 'html') {
		$('#maindiv').append('<div id='+experiment.htmlSequence[experiment.currentElement][0]+'/>');
		$('#'+segmentName).load(experiment.path+'html/'+segmentName+'.html', 
			function() {
			
			// Scroll to the top of the text
			if($.browser.safari) {bodyelem = $("body");}
			else {bodyelem = $("html,body");}
			bodyelem.scrollTop(0);

			switch(segmentName){
				
				case "formPoststudy":

					$(function() {
						$('#'+segmentName).submit(function(evt) {
							evt.preventDefault();
							if (experiment.record_whole_study) {
								jswcam.stopRecording();
								addEvent(  {'type': 'endRecording'});
							}
							var formFields = $('#'+segmentName+' input, #'+segmentName+' select, #'+segmentName+' textarea');
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
					
					$('#fsdiv').detach();
					leaveFullscreen();
					$('#fsbutton').detach();
					//$("#flashplayer").remove();
					$("#widget_holder").css("display","none"); // Removes the widget at the end of the experiment
	
					break;
					
				case "positioning2":
					
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
					show_getting_setup_widget();
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
			}
		});
	} 
	
	else if (experiment.htmlSequence[experiment.currentElement][1] == 'vid') {
		if (segmentName == "intro") {
			$('#maindiv').append('<div id=fsdiv/>');
			addFsButton('#maindiv', '#fsdiv');
			goFullscreen($('#fsdiv')[0]);
		}
		$('#fsdiv').append(vidElement);
		
		if (segmentName == "intro") {
			var video = $('video')[0];
		
			if (video.canPlayType("video/webm")) {
				videotype = 'webm';
			} else if (video.canPlayType("video/mp4")) {
				videotype = 'mp4';
			} else if(video.canPlayType("video/ogg")) {
				videotype = 'ogv';
			} 
			video.type = 'video/'+videotype;
			video.style.height = screen.availHeight + 'px';
			video.style.width  = screen.availWidth  + 'px';
		}
		
		function endHandler(event){
				addEvent(  {'type': 'endMovie',
							'src': segmentName});
				
				video.style.cursor = 'auto'; // show the cursor again
				
				if (!video.paused) {video.pause();}
				
				advanceSegment();
				
				return false;
			}
			
			
			function loadedHandler(){
			// Moved here from below removing event listeners--doesn't work there.(???)
				video.play();
				video.currentTime = 0;
			
				video.removeEventListener('canplaythrough', loadedHandler, false);
				video.removeEventListener('emptied', loadedHandler, false);
				
				video.style.cursor = 'none'; // hide the cursor
				video.play();

				addEvent(  {'type': 'startMovie',
							'src': segmentName});
			}
			
			// Fires when the current playback position has changed.  This is in place of a
			// direct 'ended' handler because of issues in Safari and IE.  See 
			// http://www.longtailvideo.com/html5/playback for a chart of current play/pause
			// events in various browsers.
			function timeUpdateHandler() {
				// Note: >= rather than == important for IE
				if (video.currentTime >= video.duration) {
					video.removeEventListener('timeupdate', timeUpdateHandler);
					endHandler();
				}
			}
	
			$('.vidElement').attr('id', segmentName);
			
			var video = $('video')[0];
			
			var newSrc = experiment.path + "videos/" + videotype + "/" + videoNames[segmentName] + '.' + videotype;
			// For IE: also set currentSrc, otherwise it stays the same!
			video.src = newSrc;
			video.currentSrc = newSrc;
			
			video.addEventListener('timeupdate', timeUpdateHandler);
			video.addEventListener('emptied', loadedHandler, false);
			video.addEventListener('canplaythrough', loadedHandler, false);
			
			video.load(); // plays upon loading completely ('canplaythrough' listener)
	
	} 
	
	else if (experiment.htmlSequence[experiment.currentElement][1] === 'story' || 
			 experiment.htmlSequence[experiment.currentElement][1] === 'question') {
			 
		$('#fsdiv').append(buildStoryPage(experiment.htmlSequence[experiment.currentElement][0]));
		
		if (experiment.record_whole_study) {
			jswcam.stopRecording();
			addEvent(  {'type': 'endRecording'});
		}
		jswcam.startRecording();
		isRecording = true;
		addEvent(  {'type': 'startRecording'});
		
		// If this is a 'question' page, display the webcamdiv.
		$("#widget_holder").detach().prependTo('#fsdiv');
		$('#widget_holder').css({'position':'absolute',
								 'top':'0px', 
								 'right':'-275px',
								 'visibility':'visible',
								 'float':'right',
								 'clear':'none'});
		$('#flashplayer').css({'height':'330px', 
							   'width':'585px',
							   'margin-left':'-125px', 
							   'margin-top':'-31px'});

		// Note: need to move it back!
		
		
		// Check what type of audio file to use, store in global variable
		var audio = $('#storyAudio')[0];
		if (audio.canPlayType('audio/ogg;')) {
			audiotype = 'ogg';
			audioTypeString = 'audio/ogg';
		} else if( audio.canPlayType('audio/mp3')) {
			audiotype = 'mp3';
			audioTypeString = 'audio/mpeg';
		}

		// Next button
		$(function() {
			$('#nextPage').click(function(evt) {
			
				var audio = $('#storyAudio')[0];
			
				addEvent({'type': 'startPage', 
					  'storySegment': segmentName});
				
				if (!LOOKIT.sandbox && isRecording) {
					jswcam.stopRecording();
					isRecording = false;
					addEvent(  {'type': 'endRecording'});
					if (experiment.record_whole_study) {
						jswcam.startRecording();
						addEvent(  {'type': 'startRecording'});
					}
				}
				
				advanceSegment();
					
				return false;
			});
		});
			
		// Have the "replay" button start the audio over
		$(function() {
			
			$('#replay').click(function(evt) {
				addEvent({'type': 'replayPage', 
					  'storySegment': segmentName});
				var audio = $('#storyAudio')[0];
				audio.currentTime = 0;
				audio.play();
				return false;
			});
		});
		
		// While playing audio, disable 'next' and 'replay' buttons			
		audio.addEventListener('play', function() {
			$('input').prop('disabled', true);
			}, false)
		
		// Once audio ends, enable both buttons
		audio.addEventListener('ended', function() {
			$('input').prop('disabled', false);
			}, false)
		
		audioName = segmentName;
		
		// Insert the parent text
		parenthtml = parentText(segmentName);
		if(parenthtml == '') {
			$('#parentText').hide();
		} else {
			$('#parentText').html(parenthtml);
			$('#parentText').show();
		}
		
		newSrc = experiment.path + 'img/' + storyNames[segmentName][0] + '.png';
		$('#objectPic').attr('src', newSrc);
		
		if(storyNames[segmentName][0].length) {
			$('#objectPic').show();
		}
		else {
			$('#objectPic').hide();
		}

		var audioSource = experiment.path + "sounds/" + storyNames[segmentName][1] + '.' + audiotype;
		$('#storyAudio').attr('src', audioSource);
		$('#storyAudio').attr('type', audioTypeString);
		
		
		audio.load();
		audio.play();
		addEvent({'type': 'startPage', 
					  'storySegment': segmentName});
	}
			
}

// Build story page with first image and sound.  Expects to find first image under
// experimentpath/img/imageName01.png, audio similarly under
// experimentpath/sounds/audioName01.mpg and .ogg
function buildStoryPage(id) {

	return "<div id='"+id+"' class='storysegment'> \
		<div id='webcamdiv' style='display:none;'></div> \
		<img id='characterPic' 	src='ex/ex06/img/pair1.png' 	class='center'> \
		 <img id='objectPic' 	src='' 	class='center'> \
		 <audio id='storyAudio' class='hidecontrols'> </audio> \
		<input type='button' value='Replay' id='replay'/> \
		<input type='button' value='Next' id='nextPage'/> \
		<div id='parentText'></div>\
		</div>";

}	
	
function buildVideoElement(videoName, videoID) {

    //Video Tag, no controls specified, autoloading for use
    //with jswcam.waitForAssets function
    var video = $('<video id="thevideo" class="center hidecontrols"/>', {
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
	
	// stick video and button into one div
	var videoDiv = $('<div/>', {
	'id': videoID,
	'class': 'vidElement'});
	videoDiv.append(video);

    return videoDiv;
};


function parentText(segmentName) {

baseTextSummary = "<p><b>Parents:</b> \
<ul> \
<li> To encourage your child to answer, feel free to hit 'Replay' or ask \
'What do you think it's called?'  But please don't repeat the two options. \
<li> If your child gives an answer that wasn't one of the two options, you can say \
'Actually, it's one of those two names.' and replay the question. \
<li> Once your child answers, <b> please repeat the answer he/she gave without confirming or \
correcting it. </b>  (For instance, 'Okay, a blargit!') \
<li> If your child doesn't want to answer, it's okay!  Just move on. \
<li> Click 'Next' to proceed. </ul>";

whoWasGoodText = "<p><b>Parents:</b> \
	<ul> \
	<li> To encourage your child to answer, feel free to hit 'Replay' or ask \
'Who do you think was better at it?'  But please don't repeat the two options. \
<li> If your child gives an answer that wasn't one of the two options, you can say \
'Which one of these two girls?' or replay the question. \
<li> Once your child answers, <b> please repeat the answer he/she gave without confirming or \
correcting it. </b>  (For instance, 'Okay, the girl in the yellow shirt!')  If he/she points, please \
say where! \
<li> If your child doesn't want to answer, it's okay!  Just move on. \
<li> Click 'Next' to proceed. </ul>";

switch(segmentName) {
		case "summaryFam0":
			return baseTextSummary + "<p> (Familiar object 1 of 4)";
		case "summaryFam1":
			return baseTextSummary + "<p> (Familiar object 2 of 4)";
		case "summaryFam2":
			return baseTextSummary + "<p> (Familiar object 3 of 4)";
		case "summaryFam3":
			return baseTextSummary + "<p> (Familiar object 4 of 4)";
		case "summaryNov0":
			return baseTextSummary + "<p> (Novel object 1 of 4)";
		case "summaryNov1":
			return baseTextSummary + "<p> (Novel object 2 of 4)";
		case "summaryNov2":
			return baseTextSummary + "<p> (Novel object 3 of 4)";
		case "summaryNov3":
			return baseTextSummary + "<p> (Novel object 4 of 4)";
		case "whoWasGoodFam":
		case "whoWasGoodNov":
			return whoWasGoodText;
		default:
			return '';
	}


}


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
			if (formData.informant.length==0) {
				valid = false;
				$('#errorInformantMissing').removeClass('hidden');
			} else {$('#errorInformantMissing').addClass('hidden');}
			return valid;
			break;
		case 'formDemographic':
			return valid;
			break;
	}
}

function generate_debriefing() {

	var DEBRIEFHTML = 	"<p> Some more information about this study... </p> \
	<p> This is one of the \
	early studies we are using to find out what sorts of methods will work online as well as \
	in the lab.  We are trying to replicate the finding of <a href='http://psycnet.apa.org/psycinfo/2007-12595-012' target='_blank'> \
	Pasquini et al. (2007) </a> that preschoolers keep track of how reliable people are in naming objects, and use that  \
	information to decide whom to trust.   The authors also found an interesting developmental trend: younger children distrusted \
	anyone who ever made a mistake, but older children made use of the actual percentages correct.<p>";
	
	if (conditionSet) {
		DEBRIEFHTML += "<p> Your child first saw four naming events where one woman was " + experiment.accuracies[0] + "% correct and the other was " + experiment.accuracies[1] + "% correct.  Then, the same women labeled four new objects that your child probably didn't know \
	the names for.  We're predicting that on average, children--especially older preschoolers--will trust the answers given by the \
	woman who was more accurate during the familiar-object trials.  There are many reasons individual children would choose specific names \
	for objects--for instance, maybe one sounds like a friend's name, or just 'feels right' for the object.  However, over many children, \
	these additional effects average out. "	
	}
	
	return DEBRIEFHTML;

}
