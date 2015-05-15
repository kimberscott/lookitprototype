// Formerly experimentFunctions.js in each study directory:
function promptBeforeClose() {
    // During an experiment, prompt before user refreshes page, uses back/forward buttons, etc.
    // (These will probably not have the desired effect, but shouldn't and can't be blocked.)
    // This is canceled after ending the experiment.
    window.onbeforeunload = function (e) {
        promptEarlyEnd();
        return '';
    };
}

// Helper function to set a global variable DBID to a unique timestamp + random number
// string so we can identify records in the database
function setDBID() {
    LOOKIT.DBID = "";
    LOOKIT.DBID = +new Date;
    LOOKIT.DBID = LOOKIT.DBID.toString() + '-' + Math.random().toString();
}

// Standard function used in sending experiment object to server
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();

    $.each(a, function () {
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

function initializeExperiment() {
    experiment.currentElement = -1; // State variable: which html element we're on	
    experiment.htmlSequence = [];
    experiment.vidSequence = [];
    experiment.record_whole_study = false; // records entire study, 
    // but retains segmentation indicated (just records in between too)--so clip #s doubled
    experiment.INCLUDE_IN_ANALYSIS = 'NOT YET VIEWED';
    experiment.endedEarly = false;
    experiment.tic = new Date();
    experiment.eventArray = []; // appended to by addEvent to keep track of things that happen
    experiment.recordingSet = LOOKIT.RECORDINGSET;
    experiment.consentData = LOOKIT.consentData;
}

// Standard function for adding an event to the array.
// Convention: events have at least a 'type' attribute, e.g.
// we could addEvent({'type': 'goFullscreen'})
function addEvent(event) {
    if (typeof experiment != 'undefined') {
        // Add time relative to global time defined initially
        event.time = (new Date()) - experiment.tic;
        // Which part of the experiment we're in (which html is displayed)
        if (!experiment.htmlSequence || experiment.currentElement < 0) {
            event.segment = 'initExperiment';
        } else if (experiment.currentElement >= experiment.htmlSequence.length) {
            event.segment = 'endOfExperiment';
        } else {
            event.segment = experiment.htmlSequence[experiment.currentElement]
                [0];
        }
        experiment.eventArray.push(event);
    }
    console.log('Event logged: ' + event.type);
}

function advanceSegment() {

    experiment['dbid'] = LOOKIT.DBID;
    var subsetData = {};
    subsetData['dbid'] = experiment['dbid'];
    subsetData['tic'] = experiment['tic'];
    subsetData['eventArray'] = experiment['eventArray'];
    subsetData['condition'] = experiment['condition'];
    subsetData['mturkID'] = experiment['mturkID'];
    subsetData['recordingSet'] = experiment['recordingSet'];
    subsetData['currentSegment'] = experiment.currentElement;
    subsetData['browserStr'] = experiment['browserStr'];

    $.ajax({
        'type': 'POST',
        'url': 'php/user.php',
        'async': true,
        'data': {
            'table': 'users',
            'json_data': subsetData,
            'function': 'set_account'
        },
        success: function (resp) {
            console.log('Updated database');
        }
    });

    jswcam.toggleWebCamView(false);
    // Detach the current html, if any
    if (experiment.currentElement >= 0) {
        // Avoid removing data--detach not remove!
        $('#' + experiment.htmlSequence[experiment.currentElement][0]).detach();
    }
    // Increment the state 
    experiment.currentElement++;
    console.log(experiment.currentElement);
    // Generate and append next html
    if (experiment.currentElement < experiment.htmlSequence.length) {
        console.log(experiment.htmlSequence[experiment.currentElement][0]);
        generateHtml(experiment.htmlSequence[experiment.currentElement][0]);
        return false;
    } else { // End of experiment -- submit data
        addEvent({
            'type': 'promptUpload'
        });
        console.log(experiment);
        done_or_withdraw(experiment, generate_debriefing()); // Function to check if user wants to withdraw from the experiment or not
        addEvent({
            'type': 'endUpload'
        });
        return false;
    }
}

function previousSegment() {
    jswcam.toggleWebCamView(false);
    // Detach the current html, if any
    if (experiment.currentElement >= 0) {
        // Avoid removing data--detach not remove!
        $('#' + experiment.htmlSequence[experiment.currentElement][0]).detach();
    }
    // Increment the state 
    experiment.currentElement--;
    console.log(experiment.currentElement);
    // Generate and append next html
    if (experiment.currentElement >= 1) {
        console.log(experiment.htmlSequence[experiment.currentElement][0]);
        generateHtml(experiment.htmlSequence[experiment.currentElement][0]);
        return false;
    } else { // Start of experiment--went back to homepage
        page.toggleMenu(true);
        page.show('home');
        return false;
    }
}

// Event listener used for allowing the user to end the experiment early.

function getKeyCode(e) {
    e = e.charCode || e.keyCode;
    if (e == 112 || e == 35) { // F1 and end keys
        promptEarlyEnd();
    }
}

function promptEarlyEnd() {
    addEvent({
        'type': 'promptEarlyUpload'
    });
    document.removeEventListener('keydown', getKeyCode, false);
    bootbox.prompt('Are you sure you want to end the study now?',
        'No, continue', 'Yes, end now',
        function (comments) {
            if (comments != null) {
                experiment.endedEarly = true;
                experiment.endEarlyComments = comments;
                console.log(experiment);
                if (!LOOKIT.sandbox) {
                    done_or_withdraw(experiment, generate_debriefing()); // Function to check if user wants to withdraw from the experiment or not
                    addEvent({
                        'type': 'endUpload'
                    });
                } else {
                    alert('ending study');
                }
            }
            document.addEventListener('keydown', getKeyCode, false);
            return false;
        },
        '[Optional] Did you experience any problems with this study?');
}

function restoreForm(formData, formId) {

    if (!(typeof (formData) == 'undefined')) {
        for (var propt in formData) {
            elem = $(formId + ' [name=' + propt + ']');
            if (elem.prop('type') == 'radio') {
                $(formId + ' [value="' + formData[propt] + '"]').attr(
                    'checked', true);
            } else {
                elem.prop('value', formData[propt]);
            }
        }
    }
}