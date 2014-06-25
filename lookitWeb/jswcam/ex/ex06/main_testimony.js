/*                                                                          
 * * Copyright (C) MIT Early Childhood Cognition Lab                                                                           
 */

// Global variables (available in all functions)
var currentElement = -1; // State variable: which html element we're on	
var htmlSequence;
var experiment;
var vidSequence;
var audiotype = 'none';
var videoNames = {};
var storyNames = {};
var condition = 0;
var tested=false;
var isRecording=false;
var conditionSet = false;
var sandbox = false;
var videotype = 'none';

// The function 'main' must be defined and is called when the consent form is submitted 
// (or from sandbox.html)
function main(mainDivSel, expt) {
	
	mainDivSelector = mainDivSel;
	experiment = expt;
	experiment.endedEarly = false;
	experiment.minAgeDays = 3*365; // 3 years
	experiment.maxAgeDays = 6*366; // 6 years
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
				
			console.log(jsonresp);
			startExperiment(jsonresp.condition, box);
			}
		);
	}
	}
	
	
function startExperiment(condition, box) {
    console.log('condition = ' + condition);
	experiment.condition = condition;
	
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
	
	console.log(videoNames);
	console.log(storyNames);
	
	var vidElement = buildVideoElement('intro', 'vidElement');
					
	// Sequence of sections of the experiment, corresponding to html sections.
	htmlSequence = [['instructions', ''],
					['positioning', ''],
					['positioning2', ''],
					
					['intro', vidElement],
					
					['object0', ''],
					['accuracy0', vidElement], 
					['summaryFam0',  ''],
					
					['object1', ''],
					['accuracy1', vidElement], 
					['summaryFam1', ''],
					
					['object2', ''],
					['accuracy2',    vidElement], 
					['summaryFam2',  ''],
					
					['object3', ''],
					['accuracy3', vidElement], 
					['summaryFam3', ''],
					
					['whoWasGoodFam', ''],
					
					['object4', ''],
					['novel0', vidElement], 
					['summaryNov0', ''],
					
					['object5', ''],
					['novel1', vidElement], 
					['summaryNov1', ''],
					
					['object6', ''],
					['novel2', vidElement], 
					['summaryNov2', ''],
										
					['object7', ''],
					['novel3', vidElement], 
					['summaryNov3', ''],
					
					['whoWasGoodNov', ''],
					
					['formPoststudy', '']];

					

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

	addEvent(  {'type': 'htmlSegmentDisplayed'});
	$("body").removeClass('playingVideo');
	
	switch(segmentName){
	// In general, append to the main div, but for story/video elements, 
	// append to a special full-screen div that will be left in throughout
		case "formPoststudy":
		case "positioning":
		case "positioning2":
		case "instructions":
			$('#maindiv').append('<div id='+htmlSequence[currentElement][0]+'/>');
			$('#'+segmentName).load(experiment.path+'html/'+segmentName+'.html', 
				function() {
				
				// Scroll to the top of the text
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
			break;
		case "intro":
			$('#maindiv').append('<div id=fsdiv/>');
			$('#fsdiv').append(htmlSequence[currentElement][1]);
			addFsButton('#maindiv', '#fsdiv');
			goFullscreen($('#fsdiv')[0]);
			break;
		case "black":
		case "accuracy0":
		case "accuracy1":
		case "accuracy2":
		case "accuracy3":
		case "novel0":
		case "novel1":
		case "novel2":
		case "novel3":
			$('#fsdiv').append(htmlSequence[currentElement][1]);
			break;
		default:
			$('#fsdiv').append(buildStoryPage(htmlSequence[currentElement][0]));
			break;
	}

	switch(segmentName) {
		case "intro":
		
			var video = $('video')[0];
		
			if (video.canPlayType("video/webm")) {
				videotype = 'webm';
			} else if (video.canPlayType("video/mp4")) {
				videotype = 'mp4';
			} else if(video.canPlayType("video/ogg")) {
				videotype = 'ogv';
			} 
			
			console.log(videotype);
			video.type = 'video/'+videotype;
			video.style.height = screen.availHeight + 'px';
			video.style.width  = screen.availWidth  + 'px';
		
		case "black":
		case "accuracy0":
		case "accuracy1":
		case "accuracy2":
		case "accuracy3":
		case "novel0":
		case "novel1":
		case "novel2":
		case "novel3":
		
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
					endHandler();
					video.removeEventListener('timeupdate', timeUpdateHandler);
				}
			}
	
			$('.vidElement').attr('id', segmentName);
			
			var video = $('video')[0];
			
			var newSrc = experiment.path + "videos/" + videotype + "/" + videoNames[segmentName] + '.' + videotype;
			// For IE: also set currentSrc, otherwise it stays the same!
			video.src = newSrc;
			video.currentSrc = newSrc;
			console.log(video.currentSrc);
			
			video.addEventListener('timeupdate', timeUpdateHandler);
			video.addEventListener('emptied', loadedHandler, false);
			video.addEventListener('canplaythrough', loadedHandler, false);
			
			video.load(); // plays upon loading completely ('canplaythrough' listener)
			break;
			
		// Story pages (image + audio)
		
		case "summaryFam0":
		case "summaryFam1":
		case "summaryFam2":
		case "summaryFam3":
		case "summaryNov0":
		case "summaryNov1":
		case "summaryNov2":
		case "summaryNov3":
		case "whoWasGoodFam":
		case "whoWasGoodNov":
		
			if (!sandbox) {
				jswcam.startRecording();
				isRecording = true;
				addEvent(  {'type': 'startRecording'});
			}
		
		case "object0":
		case "object1":
		case "object2":
		case "object3":
		case "object4":
		case "object5":
		case "object6":
		case "object7":
			
			// Check what type of audio file to use, store in global variable
			var audio = $('#storyAudio')[0];
			if (audio.canPlayType('audio/ogg;')) {
				audiotype = 'ogg';
				audioTypeString = 'audio/ogg';
			} else if( audio.canPlayType('audio/mp3')) {
				audiotype = 'mp3';
				audioTypeString = 'audio/mpeg';
			} else {
				console.log('no audio type playable');
			}

			// Only attach the functions one time (in 'baseline' case)!
			
			// Next button
			$(function() {
				$('#nextPage').click(function(evt) {
				
					var audio = $('#storyAudio')[0];
				
					addEvent({'type': 'startPage', 
						  'storySegment': segmentName});
					
					if (!sandbox && isRecording) {
						jswcam.stopRecording();
						isRecording = false;
						addEvent(  {'type': 'endRecording'});
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
			
			var audio = $('#storyAudio')[0];
			
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
			console.log(newSrc);
			
			if(storyNames[segmentName][0].length) {
				$('#objectPic').show();
			}
			else {
				$('#objectPic').hide();
			}

			var audioSource = experiment.path + "sounds/" + storyNames[segmentName][1] + '.' + audiotype;
			$('#storyAudio').attr('src', audioSource);
			$('#storyAudio').attr('type', audioTypeString);
			console.log(audioSource);
			
			
			audio.load();
			audio.play();
			addEvent({'type': 'startPage', 
						  'storySegment': segmentName});

			break;
	}
			
	if (segmentName=="formPostStudy") {
		$('#fsdiv').detach();
		$('#fsbutton').detach();
		$("#flashplayer").remove();
		$("#widget_holder").css("display","none"); // Removes the widget at the end of the experiment
	};

}

// Build story page with first image and sound.  Expects to find first image under
// experimentpath/img/imageName01.png, audio similarly under
// experimentpath/sounds/audioName01.mpg and .ogg
function buildStoryPage(id) {

	return "<div id='"+id+"' class='storysegment'> \
		<img id='characterPic' 	src='ex/ex06/img/pair1.png' 	class='center'> \
		 <img id='objectPic' 	src='' 	class='center'> \
		 <audio id='storyAudio'> </audio> \
		<input type='button' value='Replay' id='replay'/> \
		<input type='button' value='Next' id='nextPage'/> \
		<div id='parentText'></div>\
		</div>";

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
	'id': videoID,
	'class': 'vidElement'});
	videoDiv.append(video);

    return videoDiv;
};


function parentText(segmentName) {

baseTextSummary = "<p><b>Parents:</b> To encourage your child to answer, feel free to hit 'Replay' or ask 'What do you think it's called?'  But please do NOT repeat the options. <p>Click 'Next' once your child answers. ";

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
			return "<p><b>Parents:</b> To encourage your child to answer, feel free to hit 'Replay' or ask 'Who do you think was better at it?'  But please do NOT repeat the options. <p>Click 'Next' once your child answers.";	
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
