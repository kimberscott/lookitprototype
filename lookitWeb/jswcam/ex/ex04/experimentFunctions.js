/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
 
var DEBRIEFHTML = "<p> Thanks so much for participating!  To confirm your participation, please press 'Done' below.  (If you \
				wish to withdraw from the study at this point and delete your data, please press 'Cancel and withdraw.'  But \
				please note that we are very grateful for your recordings even if you think the study didn't 'work'--if kids just \
				aren't interested, that means we need to fix something!)";

// During an experiment, prompt before user refreshes page, uses back/forward buttons, etc.
// (These will probably not have the desired effect, but shouldn't and can't be blocked.)
// This is canceled after ending the experiment.
window.onbeforeunload = function(e) {
	return '';
};

// Standard function used in sending experiment object to server
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
	
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Standard function for adding an event to the array.
// Convention: events have at least a 'type' attribute, e.g.
// we could addEvent({'type': 'goFullscreen'})
function addEvent(event) {
	// Add time relative to global time defined initially
	event.time = (new Date()) - experiment.tic;
	// Which part of the experiment we're in (which html is displayed)
	if(!htmlSequence || currentElement < 0) {
		event.segment = 'initExperiment';
	} else if(currentElement >= htmlSequence.length){
		event.segment = 'endOfExperiment';
	} else{
		event.segment = htmlSequence[currentElement][0];
	}
	experiment.eventArray.push(event);
	console.log('Event logged: ' + event.type);
	console.log(event);
}

function advanceSegment(){
	jswcam.toggleWebCamView(false);
	// Detach the current html, if any
	if (currentElement >= 0){
		// Avoid removing data--detach not remove!
		$('#' + htmlSequence[currentElement][0]).detach();
	}
	// Increment the state 
	currentElement++;
	console.log(currentElement);
	// Generate and append next html
	if (currentElement < htmlSequence.length){
		console.log(htmlSequence[currentElement][0]);
		generateHtml(htmlSequence[currentElement][0]);
		return false;
	} 
	else{ // End of experiment -- submit data
		addEvent(  {'type': 'promptUpload'});
		console.log(experiment);
		done_or_withdraw(experiment,DEBRIEFHTML); // Function to check if user wants to withdraw from the experiment or not
		addEvent(  {'type': 'endUpload'});
		return false;
	}
}

function previousSegment(){
	jswcam.toggleWebCamView(false);
	// Detach the current html, if any
	if (currentElement >= 0){
		// Avoid removing data--detach not remove!
		$('#' + htmlSequence[currentElement][0]).detach();
	}
	// Increment the state 
	currentElement--;
	console.log(currentElement);
	// Generate and append next html
	if (currentElement >= 1){
		console.log(htmlSequence[currentElement][0]);
		generateHtml(htmlSequence[currentElement][0]);
		return false;
	} else{ // Start of experiment--went back to homepage
		page.toggleMenu(true);
		page.show('home');
		return false;
	}
}

// Event listener used for allowing the user to end the experiment early.

function getKeyCode(e){
	e = e.charCode || e.keyCode;
	if (e==112 || e==35) { // F1 and end keys
		addEvent(  {'type': 'promptEarlyUpload'});
		document.removeEventListener('keydown', getKeyCode, false);
		bootbox.prompt('Are you sure you want to end the study now?', 'No, continue', 'Yes, end now',
			function(comments) {
				if (comments!=null) {
					experiment.endedEarly = true;
					experiment.endEarlyComments = comments;
					console.log(experiment);
					if (!sandbox){
						//jswcam.verifyAndUpload(experiment, jswcam.getExemptIdList());
						done_or_withdraw(experiment,DEBRIEFHTML); // Function to check if user wants to withdraw from the experiment or not
						addEvent(  {'type': 'endUpload'});
					} else {
						alert('ending study');
					}
				}
				document.addEventListener('keydown', getKeyCode, false);
				return false;
			},
			'[Optional] Did you experience any problems with this study?');
		}
}

function restoreForm(formData, formId) {
			
	if(!(typeof(formData) == 'undefined')) {
		for(var propt in formData){
			elem = $(formId + ' [name=' + propt + ']');
			if(elem.prop('type') == 'radio'){
				$(formId + ' [value="' + formData[propt] +'"]').attr('checked', true);
			} else {
				elem.prop('value', formData[propt]);
			}
		}
	}
}

function advanceIfInAgeRange(validArray) {
	if (validArray[0]) {
		if (!validArray[1]) {
			box = bootbox.dialog("Your child is out of the age range to participate in this study.  If you'd like to proceed \
				anyway, press 'Continue'.", [{
				'label': 'Return to experiments',
				"class": 'btn-danger',
				'callback': function() {
					page.show('home');
					jswcam.toggleWebCamView(true);
					box.modal('hide');
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
					return false;
				}
			}, {
				'label': 'Continue',
				"class": "primary"
			}
			]);
		}
		advanceSegment();
	}
}
