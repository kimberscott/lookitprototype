/*                                                                                                                                                                                                                                    
 * * Copyright (C) MIT Early Childhood Cognition Lab                                                                                                                                                                                   
 *                                                                                                                                                                                                                                     
 */
// Global variables (available in all functions)
var experiment;
var DELAY;
var tested = false; // whether the audio has been tested
var trialCounter = 1;

// The function 'main' must be defined and is called when the consent form is submitted 
function main(mainDivSelector, expt) {

    promptBeforeClose();
    setDBID();

    experiment = expt;
    initializeExperiment();

    $(mainDivSelector).attr('id', 'maindiv'); // so we can select it in css as #maindiv
    addEvent({
        'type': 'startLoading'
    });

    // Black out the screen until waitforassets returns	
    var box = bootbox.dialog(
        "Please wait while the experiment loads.", []);

    if (LOOKIT.sandbox) {
        // Just use a specific arbitrary condition number (0 through 7)
        startExperiment('Remy', 'M', box);
    } else {
        // Get the appropriate condition from the server by checking which ones we 
        // already have
        // TODO: grab name, gender.
        $.getJSON(
            'counterbalance.php', {
                'experiment_id': experiment.id
            },
            function (jsonresp) {
                startExperiment(jsonresp.condition, box);
            });
    }
}

function startExperiment(childname, childgender, box) {

    $('#maindiv').append('<div id="sessioncode"></div>');
    $('#sessioncode').html('Session ID: ' + experiment.recordingSet);
    experiment.mturkID = getQueryVariable('workerId');

    // Sequence of sections of the experiment, corresponding to html sections.
    experiment.htmlSequence = [
        ['instructions1'],
        ['instructions2'],
        ['instructions3'],
        ['instructions4'],
        ['instructions5'],
        ['numbertest'],
        ['formPoststudy']
    ];

    // Then remove the dialog box blacking out the screen.
    // Force it to close because ajax call has occurred in between, as per
    // http://stackoverflow.com/questions/11519660/
    box.modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();

    addEvent({
        'type': 'endLoading'
    });

    // Allow the user to end the experiment by pressing 'Home' or 'End' keys.
    document.addEventListener('keydown', getKeyCode, false);

    // Start the experiment
    advanceSegment();

}

function generateHtml(segmentName) {

    addEvent({
        'type': 'htmlSegmentDisplayed'
    });
    $('#maindiv').removeClass('whitebackground');

    switch (segmentName) {
    case "instructions1":
    case "instructions2":
    case "instructions3":
    case "instructions4":
    case "instructions5":
    case "formPoststudy":
        $('#maindiv').append('<div id="' + segmentName + '"></div>');
        break;
    case "numbertest":
        $('#maindiv').append('<div id="fsdiv"></div>');
        $('#fsdiv').append('<div id="' + segmentName + '"></div>');
        break;
    }

    $('#' + segmentName).load(experiment.path + 'html/' + segmentName +
        '.html',
        function () {

            var bodyelem = "";
            if ($.browser.safari) {
                bodyelem = $("body");
            } else {
                bodyelem = $("html,body");
            }
            bodyelem.scrollTop(0);

            switch (segmentName) {

				case "formPoststudy":
					$("body").css("background-color", "#FFFFFF");
					$('#fsdiv').detach();
					$('#fsbutton').detach();
					$("#widget_holder").css("display", "none"); // Removes the widget at the end of the experiment
					$(function () {
						$('#' + segmentName).submit(function (evt) {
							evt.preventDefault();
							if (experiment.record_whole_study) {
								jswcam.stopRecording();
							}
							var formFields = $('#' +
								segmentName +
								' input, #' +
								segmentName +
								' select, #' +
								segmentName +
								' textarea');
							experiment[segmentName] =
								formFields.serializeObject();
							var validArray = validateForm(
								segmentName, experiment[
									segmentName]);
							if (validArray) {
								advanceSegment();
							}
							return false;
						});
					});

					break;

				case "instructions4":
					show_getting_setup_widget();

				case "instructions1":
				case "instructions2":
				case "instructions3":
				case "instructions5":

					$(function () {
						$('#' + segmentName + ' #next').click(
							function (evt) {
								hide_cam("webcamdiv");
								evt.preventDefault();
								advanceSegment();
								return false;
							});
						$('#' + segmentName + ' #back').click(
							function (evt) {
								evt.preventDefault();
								previousSegment();
								return false;
							});
					});
					break;
				}
        });

}


function validateForm(segmentName, formData) {
    var valid = true;
    switch (segmentName) {
    case 'formBasic':
        return validateFormBasic(formData);

    case 'formPoststudy':
        if (formData.birthmonth == '[Month]' ||
            formData.birthyear == '[Year]' ||
            formData.birthday.length === 0) {
            valid = false;
            $('#errorBirthdateMissing').removeClass('hidden');
        } else {
            var bd = parseInt(formData.birthday);
            if (isNaN(bd) || bd < 1 || bd > 31) {
                $('#errorBirthdateMissing').removeClass('hidden');
                valid = false;
            } else {
                var birthdateObj = new Date(parseInt(formData.birthyear),
                    parseInt(formData.birthmonth), bd);
                var ageInDays = (experiment.tic - birthdateObj) / (24 * 60 * 60 *
                    1000);
                formData.ageInDays = ageInDays;
                // Birthdate is in the future
                if (ageInDays < 0) {
                    valid = false;
                    $('#errorBirthdateMissing').removeClass('hidden');
                } else {
                    $('#errorBirthdateMissing').addClass('hidden');
                }
            }
        }
        if (formData.hearing.length === 0) {
            valid = false;
            $('#errorHearingMissing').removeClass('hidden');
        } else {
            $('#errorHearingMissing').addClass('hidden');
        }
        return valid;
    case 'formDemographic':
        return valid;
    }
}

function generate_debriefing() {

	DEBRIEFHTML = "PLACEHOLDER FOR NKNOWER DEBRIEFING";

    return DEBRIEFHTML;

}