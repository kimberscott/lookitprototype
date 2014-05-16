/*                                                                                                                                                                                                                                    
 * * Copyright (C) MIT Early Childhood Cognition Lab                                                                                                                                                                                   
 *                                                                                                                                                                                                                                     
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
var conditionSet = false;

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
	experiment.minAgeDays = 365*3;
	experiment.maxAgeDays = 366*6;
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
	// Counterbalancing condition 0 through 8 --> 3xbinary
	var storyConds = [	['basebunny', 'bambi'],
				['basebambi', 'bunny']];
	var questions = ['a', 'b'];
	var whichStory = (condition % 2); // 0 or 1, bambi/bunny
	
	var remCondition = (condition - whichStory) / 2;
	var ab_baseline = remCondition % 2; // 0 or 1
	
	var ab_story = (remCondition - ab_baseline) / 2; // 0 or 1
	
	audioNames = {'baseline': storyConds[whichStory][0], 
				  'baselinequestion': storyConds[whichStory][0] + questions[ab_baseline],
				  'story': storyConds[whichStory][1],
				  'storyquestion': storyConds[whichStory][1] + questions[ab_story],
				  'storyend':  storyConds[whichStory][1] + 'end'};
				  
	characterNames = {	'baseline': 		storyConds[whichStory][0].substr(4),
				'baselinequestion': 	storyConds[whichStory][0].substr(4),
				'story': 		storyConds[whichStory][1],
				'storyquestion': 	storyConds[whichStory][1],
				'storyend': 		storyConds[whichStory][1]};
					  
	// How many pages in each segment
	seqLengths = {'baseline': 3, 
				  'baselinequestion': 1,
				  'story': 16,
				  'storyquestion': 1,
				  'storyend': 1};
					  
	console.log(audioNames);
	// Store the counterbalancing information in the experiment structure
	experiment.condition = condition;
	experiment.whichStory = whichStory;
	experiment.ab_baseline = ab_baseline;
	experiment.ab_story = ab_story;
	experiment.characterNames = characterNames;
	conditionSet = true;
	

	// Sequence of sections of the experiment, corresponding to html sections.
	
	htmlSequence = [['instructions'],
					['positioning'],
					['positioning2'],
					['baseline'],
					['notice1'],
					['baselinequestion'],
					['story'],
					['notice2'],
					['storyquestion'],
					['storyend'],
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
	$('#maindiv').append('<div id="'+segmentName+'"></div>');
	$('#'+segmentName).load(experiment.path+'html/'+segmentName+'.html', 
	function() {
	
		// Scroll to the top of the page
		if($.browser.safari) bodyelem = $("body")
		else bodyelem = $("html,body")
		bodyelem.scrollTop(0);

		switch(segmentName){			
			case "formPoststudy": // fall through
				$('#fsbutton').detach();			
				var questionTexts = {'bambi': 'Speckles gets itchy spots on his legs', 
					  'bunny': 'Bunny gets tummyaches'};
				var thisQuestionText = questionTexts[audioNames['story']];
				$('#questionText').html(thisQuestionText);
				
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
					$('#' + segmentName + ' #back').click(function(evt) {
						evt.preventDefault();
						previousSegment();
						return false;
					});
				});
				break;
			
			
			// First time we display a story page...
			case "baseline":
			
				$('#'+segmentName).addClass('storysegment');
				
				// Check what type of audio file to use, store in global variable
				var audio = $('#storyAudio')[0];
				if (audio.canPlayType('audio/ogg;')) {
								audiotype = 'ogg';
								audioTypeString = 'audio/ogg';
							} else if( audio.canPlayType('audio/mp3')) {
								audiotype = 'mp3'
								audioTypeString = 'audio/mp3';
							} else {
								alert('no audio');
							}
				
				// Only attach the functions one time (in 'baseline' case)!
				
				// Next button
				$(function() {
					$('#nextPage').click(function(evt) {
					
						var audio = $('#storyAudio')[0];
						addEvent({'type': 'startPage', 
							  'storySegment': thisSegment,
							  'storyPage': currentPage+1});
							  
						// Only show parent text on the first page of a segment
						$('#parentText').hide();					
							  
						// Switches out the audio and image sources for the next page
						if (currentPage < seqLengths[thisSegment]) {
							currentPage++;
							var storyPage = $('#storyPage')[0];
							var newSrc = storyPage.src;
							numString = currentPage.toString();
							if (numString.length < 2) { numString = '0' + numString;}
							
							newSrc = experiment.path + 'img/' + audioName + numString + '.png';
							$('#storyPage').attr('src', newSrc);

							var audioSource = experiment.path + "sounds/" + audioName + numString + '.' + audiotype;
							$('#storyAudio').attr('src', audioSource);
							
							console.log($('#storyAudio').attr('src'));
							console.log(numString);

							audio.load();
							audio.play();
						}
						
						// At the end of the story, either move to the next segment or the next story
						else {
							if(thisSegment=='storyend'){
								advanceSegment();
							} else {
								currentElement++;
								generateHtml(htmlSequence[currentElement][0]);
							}
						}
						return false;
					});
				});
				
	// to start the audio over
				$(function() {
					
					$('#replay').click(function(evt) {
						addEvent({'type': 'replayPage', 
							  'storySegment': thisSegment,
							  'storyPage': currentPage});
					
						console.log('replay');
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
				
			case "story":
			case "storyend":
			
			
			case "baselinequestion":
			case "storyquestion":
			

				thisSegment = segmentName;
				currentPage = 1;
				$('.storysegment').attr('id', thisSegment);
				audioName = audioNames[thisSegment];
				$('#replay').show();
				// Insert the parent text
				parenthtml = parentText(thisSegment);
				if(parenthtml == '') {
					$('#parentText').hide();
				} else {
					$('#parentText').html(parenthtml);
					$('#parentText').show();
				}
				
				newSrc = experiment.path + 'img/' + audioName + '01.png';
				$('#storyPage').attr('src', newSrc);

				var audioSource = experiment.path + "sounds/" + audioName + '01.' + audiotype;
				$('#storyAudio').attr('src', audioSource);
				$('#storyAudio').attr('type', audioTypeString);				
				
				var audio = $('#storyAudio')[0];
				audio.load();
				audio.play();
				addEvent({'type': 'startPage', 
							  'storySegment': thisSegment,
							  'storyPage': 1});

				break;
				
			case "notice1":
			case "notice2":
				thisSegment = segmentName;
				currentPage = 1;
				$('.storysegment').attr('id', thisSegment);
				
				// Insert the parent text
				parenthtml = parentText(thisSegment);
				if(parenthtml == '') {
					$('#parentText').hide();
				} else {
					$('#parentText').html(parenthtml);
					$('#parentText').show();
				}
				$('#replay').hide();
				newSrc = experiment.path + 'img/notice.png';
				$('#storyPage').attr('src', newSrc);

				addEvent({'type': 'startPage', 
							  'storySegment': thisSegment,
							  'storyPage': 1});

				break;
		}
	});
	
	// Enter/exit fullscreen outside of callback function to deal with browser constraints
	if (segmentName=='baseline') {
		// Enter fullscreen (will be retained throughout story segments)
		addFsButton('#maindiv', '.storysegment');
		console.log('#baseline');
		goFullscreen($('#baseline')[0]);
	} else if (segmentName=='formPoststudy') {
		$("#flashplayer").remove();
		$("#widget_holder").css("display","none"); // Removes the widget at the end of the experiment
		leaveFullscreen();
	}
	
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


// Generate the text that is shown to parents in the corner of the story.
function parentText(segmentName) {
	switch(segmentName){
		case 'storyquestion':
		case 'baselinequestion':
			switch(characterNames[segmentName]) {
				case 'bambi':
					return "<p><b>Parents:</b> To encourage your child to answer, feel free to hit replay or ask..." + 
							'<ul><li>"Which one do you think it is?"</li>\
							<li>"Why do you think Speckles has itchy spots?"</li></ul>\
							Click "Next" once your child answers.';
				case 'bunny':
					return "<p><b>Parents:</b> To encourage your child to answer, feel free to hit replay or ask..." + 
							'<ul><li>"Which one do you think it is?"</li>\
							<li>"Why do you think Bunny has a tummy ache?"</li></ul>\
							Click "Next" once your child answers.';
			}
			break;
		case 'story':
			switch(characterNames[segmentName]) {
					case 'bambi':
						return "<p><b>Parents:</b> This is the longer story, and will cover Speckles' week \
						from Monday through Sunday morning.  During the story, please try not to discuss with \
						your child why Speckles gets itchy spots.  <p>It's okay to just listen or to engage \
						with your child in other ways--for instance, say 'Oh, I'm glad Speckles doesn't have \
						itchy spots today!' but not 'I wonder if rollerskating gave him spots.'";
					case 'bunny':
						return "<p><b>Parents:</b> This is the longer story, and will cover Bunny's week from \
						Monday through Sunday morning.  During the story, please try not to discuss with your \
						child why Bunny gets a tummyache.  <p>It's okay to just listen or to engage with your \
						child in other ways--for instance, say 'Oh, I'm glad Bunny doesn't have a tummyache \
						today!' but not 'I wonder if eating the sandwich made him sick.'";
				}
				break;
			}
	return '';
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
			if (formData.enjoy.length==0) {
				valid = false;
				$('#errorEnjoyMissing').removeClass('hidden');
			} else {$('#errorEnjoyMissing').addClass('hidden');}
			if (formData.cause.length==0) {
				valid = false;
				$('#errorCauseMissing').removeClass('hidden');
			} else {$('#errorCauseMissing').addClass('hidden');}
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
				in the lab.  We are trying to replicate the finding of <a href='http://psycnet.apa.org/psycinfo/2007-12595-006' \
				target='_blank'> Schulz, Bonawitz, and Griffiths (2007) </a> that between 3 and 5 years, children start to take \
				into account patterns of evidence to learn about causal relationships--for instance, \
				to figure out that Bunny gets a stomachache from feeling scared, not just from eating a particular food. ";
				
	if (conditionSet) {
	
		if(experiment.characterNames['baseline']=='bambi') {
			var debriefBaseline = "Speckles's itchy spots";
			var debriefStory = "Bunny, and when he gets a tummyache."
			} 
		else {
			var debriefBaseline = "Bunny's tummyache";
			var debriefStory = "Speckles, and when he gets itchy spots."
		}
		
		var DEBRIEFHTML += "<p> We first asked your child a baseline question about the cause of " + debriefBaseline + ", to see what children think before hearing any \
				evidence.  We then read a story about a different character, " + debriefStory + " Some children hear a baseline question about Speckles and a \
				story about Bunny, and other children hear a baseline question about Bunny and a story about Speckles.  \
				<p> We are expecting that younger children will rely primarily \
				on what they already know for both questions (cattails and gardens are about equally likely to cause itchy spots--who knows?--but a sandwich is more likely to cause a tummyache than feeling scared is), and older children will start to accommodate the statistical evidence. Individual children may attribute causes to Bunny's tummyache or Speckles' itchy spots for all \
				sorts of reasons, such as personal experience.  However, over many children these effects average out. </p> ";
	}
	
	return DEBRIEFHTML;

}
