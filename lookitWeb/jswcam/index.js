 /*
 * * Copyright (C) MIT Early Childhood Cognition Lab
 *
 */
 
// Single global variable containing data that needs to be available across the session
var LOOKIT = {};
LOOKIT.RECORDINGSET = "";
LOOKIT.DBID = "";
LOOKIT.sandbox = false;

// Don't allow participation from users using BOTH an unsupported browser AND an 
// unsupported OS (conjunction is the problem).  
LOOKIT.unsupportedBrowsers  = ["Safari"];
LOOKIT.unsupportedOS = ["Mac OS X", "Mac OS", "iOS", "OS X"];
LOOKIT.recording_count = '0';
LOOKIT.doneWithExperiment = false;
LOOKIT.is_recording = false;
LOOKIT.consent_recording_completed = false;

// I don't understand what these do--they're used for loading a new experiment
// (object_new.loadExperiment(experiment_new, '.content_pane') and seem to have been made
// global because audioVideoData (which is called from Flash) uses them to reset the 
// experiment.  This is one of many VERY sloppy practices I'm trying to sort out after 
// ending the contract with WebIntensive... sigh.  At least the global definition of 
// 'object_new' isn't buried in the middle of 'myfunc.js' anymore.  -ks 3/2015
LOOKIT.object_new = None;
LOOKIT.experiment_new = None;

LOOKIT._connected = false;

var session;

// Make a safe dummy function to replace console.log.
// Calls are removed for production code anyway using grunt-strip
if ((typeof console === "undefined")){
		console= {};
		console.log = function(){
			return;
		}
		window.console = console;
}
 
if(!$.isFunction(Function.prototype.createDelegate)) {
    Function.prototype.createDelegate = function (scope) {
	var fn = this;
	return function() {
	    fn.apply(scope, arguments);
	};
    }
}

if(!$.isFunction(String.prototype.hashCode)) {
    String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
	    char = this.charCodeAt(i);
	    hash = ((hash<<5)-hash)+char;
	    hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
    }
}

function handleprivacyclick(event) {
	var val = $('input[name=participant_privacy]:radio:checked').val();
	var textbox = $('#confirmfreediv');
	if (val=="free") {
		textbox.show();
	} else {
		textbox.hide();
	}
}

(function() {
    $(document).ready(function() {

	$('body').bind('showhome', function(evt) {
	    page.buildExperimentGallery('#experiments', experiments);
	});
	$(".loginDiv").hide();
	$(".login_hide").show(300);

	if(window.location.hash) {
      		page.show(window.location.hash.substring(1));
  	}	

	});
 })();



var jswcam = (function() {

    function Library() {}
    Library.prototype.getParameterInfo = function() {
	return document.jswcam.getParemeterInfo();
    }

    Library.prototype.getExemptIdList = function() {
	if(!this.exemptIds) {
	    this.exemptIds = [];
	}
	return this.exemptIds;
    };

    Library.prototype.exemptId = function(id) {
	if(id == null || id == false) return;
	this.getExemptIdList().push(id);
    };
    /**/
    Library.prototype.startRecording = function(caller) {
		if(LOOKIT.is_recording){
			this.stopRecording("stopping");
			console.log('Tried to start recording, but was already recording!  Stopped instead.');
		}

		if (!session.hasOwnProperty('user_id'))
		{
			// This was originally (thanks WI...) a non-async call made EVERY recording start, 
			// which was causing problems.
			// All it does it set the value of the variable 'session', which we should 
			// already have.  TODO: should also do more input checking in recordToCamera
			// before using client-accessible vars to set filenames...
			get_params('params'); // Resetting the session variable to access the filename
		}
		swfobject.getObjectById("flashplayer").recordToCamera(session['experiment_id'],session['user_id']+'_'+LOOKIT.RECORDINGSET,session['participant'],session['participant_privacy'],caller,LOOKIT.recording_count);
		LOOKIT.recording_count++;
		LOOKIT.is_recording = true;
		console.log("Recording Started");
    };

    /*
     * This function will only take effect the next time startRecording
     * is called. It will specify the width and height in pixels that
     * the webcam should be writing to.
     */
    Library.prototype.setRecordingSize = function(width, height) {
	this.rec_width = width;
	this.rec_height = height;
    };

	/* jswcam.stopRecording stops recording and returns frame rate in FPS of previous 
	recording (or -1 if no recording was in progress).  */
    Library.prototype.stopRecording = function(caller) {
    	var fps = -1;
		if(LOOKIT.is_recording){
			fps = swfobject.getObjectById("flashplayer").stop_record("");
		}
		LOOKIT.is_recording = false;
		console.log("Recording Stopped");
		return fps;
    };

    Library.prototype.pageFrameGrab = function() {
		return document.jswcam.pageFrameGrab();
    };

    Library.prototype.toggleWebCamView = function(visible) {
		page.toggleMenu(visible);
    };

    Library.prototype.verifyAndUpload = function(json, exemptList) {

		page.showVerifyDialog(function() {
			//clear and show uploading dialog
			page.getUploadingDialog(true);

			var json_string = JSON.stringify(json);
			document.jswcam.upload(exemptList);
			$.ajax({
			'type': 'POST',
			'url': 'mongo.php',
			'data': {
				'experiment_id' : document.jswcam.getExperiment(),
				'user_id' : document.jswcam.getUser(),
				'json_data': json_string
			},
			'success': function(resp) {
				window.onbeforeunload = [];
				console.log(resp);
			},
			'failure': function(resp) {
				window.onbeforeunload = [];
				console.log(resp);
			}
		});
	});
	
    };
    
    return new Library();
})();


// Callback for the list of labs by state widget on the 'Resources' page
function show_state_labs() {
	var state_id = $('#state_selector option:selected').val();
	var state_name = $('#state_selector option:selected').text();
	var none_text = "<p>Sorry, we don't know of any child development labs in " +state_name+" yet!</p>"
	

	var lab_list ={"NA":"","AL":"<p><a href='http://www.ches.ua.edu/hdfs/cdrc/'target='_blank'>University of Alabama Child Development Research Center</a></p><p><a href='http://monaelsheikh.com/'target='_blank'>Auburn University Child Sleep, Health, and Development Lab</a></p>","AK":"<p><a href=''target='_blank'></a></p>","AZ":"<p><a href='http://web.arizona.edu/~tigger/'target='_blank'>University of Arizona Child Cognition Lab (Tigger Lab)</a></p><p><a href='http://web.arizona.edu/~tweety/'target='_blank'>University of Arizona Language Development Lab (Tweety Lab)</a></p><p><a href='http://nau.edu/SBS/IHD/Research/CDLL/'target='_blank'>Northern Arizona University Child Development and Language Lab</a></p>","AR":"<p><a href='http://acnc.uamsweb.com/research-2/our-laboratories-2/early-diets-and-long-term-health-lab/'target='_blank'>Arkansas Children's Nutrition Center Growth and Development Laboratory</a></p>","CA":"<p><a href='http://www-psych.stanford.edu/~babylab/'target='_blank'>Stanford’s Center for Infant Studies</a></p><p><a href='http://www-cogsci.ucsd.edu/~deak/cdlab/'target='_blank'>UCSD Cognitive Development Lab</a></p><p><a href='http://babytalk.psych.ucla.edu/home.htm'target='_blank'>UCLA Language and Cognitive Development Lab</a></p><p><a href='http://psychology.berkeley.edu/participant-recruitment/rsvp-research-subject-volunteer-pool'target='_blank'>UC Berkeley Psychology Department (list of studies)</a></p><p><a href='http://babycenter.berkeley.edu/'target='_blank'>UC Berkeley Infant Studies Center</a></p><p><a href='http://bungelab.berkeley.edu/participate/'target='_blank'>UC Berkeley Building Blocks of Cognition Lab</a></p><p><a href='http://www.cogsci.uci.edu/cogdev/information.html'target='_blank'>UC Irvine Sarnecka Cognitive Development Lab</a></p><p><a href='https://labs.psych.ucsb.edu/german/tamsin/'target='_blank'>UCSB Cognition & Development Laboratory</a></p><p><a href='http://www.csus.edu/indiv/a/alexanderk/lab.htm'target='_blank'>CSU Sacramento Cognitive Development Lab</a></p><p><a href='http://mindbrain.ucdavis.edu/labs/Rivera/'target='_blank'>UC Davis Neurocognitive Development Lab</a></p><p><a href='http://dornsife.usc.edu/labs/mid-la/participate/'target='_blank'>USC Minds in Development Lab</a></p><p><a href='http://www.ccl.ucr.edu/'target='_blank'>UC Riverside Childhood Cognition Lab</a></p>","CO":"<p><a href='http://sleep.colorado.edu/'target='_blank'>UC Boulder Sleep and Development Lab</a></p><p><a href='http://www.ucdenver.edu/academics/colleges/medicalschool/departments/psychiatry/Research/developmentalresearch/Pages/Overview.aspx'target='_blank'>University of Colorado Denver Developmental Psychiatry Research Group</a></p><p><a href='http://www.du.edu/psychology/child_health_and_development/'target='_blank'>University of Colorado Denver Child Health & Development Lab</a></p><p><a href='http://psych.colorado.edu/~cdc/whoweare.htm'target='_blank'>University of Colorado Denver Cognitive Development Center</a></p>","CT":"<p><a href='http://cogdev.research.wesleyan.edu/'target='_blank'>Wesleyan University Cognitive Development Labs</a></p><p><a href='http://cogdevlab.sites.yale.edu/'target='_blank'>Yale Cognition and Development Lab</a></p><p><a href='http://www.yale.edu/infantlab/Welcome.html'target='_blank'>Yale Infant Cognition Center</a></p><p><a href='http://www.yale.edu/minddevlab/'target='_blank'>Yale Mind and Development Lab</a></p><p><a href='http://www.yale.edu/cnl/faculty.html'target='_blank'>Yale Child Neuroscience Lab</a></p>","DE":"<p><a href='http://www.udel.edu/ILP/about/team.html'target='_blank'>University of Delaware Infant Language Project</a></p>","FL":"<p><a href='http://casgroup.fiu.edu/dcn/pages.php?id=3636'target='_blank'>FIU Developmental Cognitive Neuroscience Lab</a></p><p><a href='http://online.sfsu.edu/devpsych/fair/index.html'target='_blank'>FSU Family Interaction Research Lab</a></p><p><a href='http://psy2.fau.edu/~lewkowicz/cdlfau/default.htm'target='_blank'>FAU Child Development Lab</a></p><p><a href='http://infantlab.fiu.edu/Infant_Lab.htm'target='_blank'>FIU Infant Development Lab</a></p>","GA":"<p><a href='http://www.gcsu.edu/psychology/currentresearch.htm#Participate'target='_blank'>Georgia College Psychology Department</a></p>","HI":"<p><a href='http://www.psychology.hawaii.edu/concentrations/developmental-psychology.html'target='_blank'>University of Hawaii Developmental Psychology</a></p>","ID":"<p><a href=''target='_blank'></a></p>","IL":"<p><a href='http://internal.psychology.illinois.edu/~acimpian/'target='_blank'>University of Illinois Cognitive Development Lab</a></p><p><a href='http://internal.psychology.illinois.edu/infantlab/'target='_blank'>University of Illinois Infant Cognition Lab</a></p><p><a href='http://bradfordpillow.weebly.com/cognitive-development-lab.html'target='_blank'>Northern Illinois University Cognitive Development Lab</a></p><p><a href='http://www.childdevelopment.northwestern.edu/'target='_blank'>Northwestern University's Project on Child Development</a></p><p><a href='http://woodwardlab.uchicago.edu/Home.html'target='_blank'>University of Chicago Infant Learning and Development Lab</a></p>","IN":"<p><a href='http://www.iub.edu/~cogdev/'target='_blank'>Indiana University Cognitive Development Lab</a></p><p><a href='http://www.psych.iupui.edu/Users/kjohnson/cogdevlab/INDEX.HTM'target='_blank'>IUPUI Cognitive Development Lab</a></p><p><a href='http://www.evansville.edu/majors/cognitivescience/language.cfm'target='_blank'>University of Evansville Language and Cognitive Development Laboratory</a></p>","IA":"<p><a href='http://www.medicine.uiowa.edu/psychiatry/cognitivebraindevelopmentlaboratory/'target='_blank'>University of Iowa Cognitive Brain Development Laboratory</a></p>","KS":"<p><a href='http://www2.ku.edu/~lsi/labs/neurocognitive_lab/staff.shtml'target='_blank'>KU Neurocognitive Development of Autism Research Laboratory</a></p><p><a href='http://healthprofessions.kumc.edu/school/research/carlson/index.html'target='_blank'>KU Maternal and Child Nutrition and Development Laboratory</a></p>","MN":"<p><a href='http://greenhoot.wordpress.com/meet-the-research-team/'target='_blank'>KU Memory and Development Lab</a></p>","KY":"<p><a href='http://www.wku.edu/psychological-sciences/labs/cognitive_development/index.php'target='_blank'>Western Kentucky University Cognitive Development Lab</a></p>","LA":"<p><a href=''target='_blank'></a></p>","ME":"<p><a href='http://people.usm.maine.edu/bthompso/Site/Development%20Lab.html'target='_blank'>USM Human Development Lab</a></p><p><a href='http://www.colby.edu/psychology/labs/cogdev1/LabAlumni.html'target='_blank'>Colby Cognitive Development Lab</a></p>","MD":"<p><a href='http://education.umd.edu/HDQM/labs/Fox/'target='_blank'>University of Maryland Child Development Lab</a></p><p><a href='http://ncdl.umd.edu/'target='_blank'>University of Maryland Neurocognitive Development Lab</a></p>","MA":"<p><a href='http://eccl.mit.edu/'target='_blank'>MIT Early Childhood Cognition Lab</a></p><p><a href='http://gablab.mit.edu/'target='_blank'>MIT Gabrieli Lab</a></p><p><a href='http://saxelab.mit.edu/people.php'target='_blank'>MIT Saxelab Social Cognitive Neuroscience Lab</a></p><p><a href='https://software.rc.fas.harvard.edu/lds/'target='_blank'>Harvard Laboratory for Developmental Sciences</a></p><p><a href='http://www.bu.edu/cdl/'target='_blank'>Boston University Child Development Labs</a></p><p><a href='babies.umb.edu'target='_blank'>UMass Boston Baby Lab</a></p><p><a href='http://people.umass.edu/lscott/lab.htm'target='_blank'>UMass Amherst Brain, Cognition, and Development Lab</a></p><p><a href='http://www.northeastern.edu/berentlab/research/infant/'target='_blank'>Northeastern Infant Phonology Lab</a></p>","MI":"<p><a href='http://www.educ.msu.edu/content/default.asp?contentID=903'target='_blank'>MSU Cognitive Development Lab</a></p><p><a href='http://ofenlab.wayne.edu/people.php'target='_blank'>Wayne State University Cognitive Brain Development Lab</a></p>","MN":"<p><a href='http://www.cehd.umn.edu/icd/research/seralab/'target='_blank'>University of Minnesota Language and Cognitive Development Lab</a></p><p><a href='http://www.cehd.umn.edu/icd/research/cdnlab/'target='_blank'>University of Minnesota Cognitive Development & Neuroimaging Lab</a></p><p><a href='http://www.cehd.umn.edu/icd/research/carlson/'target='_blank'>University of Minnesota Carlson Child Development Lab</a></p>","MS":"<p><a href=''target='_blank'></a></p>","MO":"<p><a href='http://www.artsci.wustl.edu/~children/'target='_blank'>Washington University Cognition and Development Lab</a></p><p><a href='http://mumathstudy.missouri.edu/#content'target='_blank'>University of Missouri-Columbia Math Study</a></p>","MT":"<p><a href='http://www.montana.edu/wwwpy/brooker/html/meet.html'target='_blank'>Montana State University DOME Lab</a></p>","NE":"<p><a href='http://www.boystownhospital.org/research/clinicalbehavioralstudies/Pages/LanguageDevelopmentLaboratory.aspx'target='_blank'>Boys Town National Research Hospital Language Development Laboratory</a></p><p><a href='http://research.unl.edu/dcn/'target='_blank'>University of Nebraska-Lincoln Developmental Cognitive Neuroscience Laboratory</a></p>","NV":"<p><a href='http://www.unl.edu/dbrainlab/'target='_blank'>University of Nebraska-Lincoln Developmental Brain Lab</a></p>","NH":"<p><a href='http://cola.unh.edu/news/frl'target='_blank'>University of New Hampshire Family Research Lab</a></p>","NJ":"<p><a href='http://www.shu.edu/academics/gradmeded/ms-speech-language-pathology/dlc-lab.cfm'target='_blank'>Seton Hall University  Developmental Language and Cognition Laboratory</a></p><p><a href='http://www.ramapo.edu/sshs/childlab/'target='_blank'>Ramapo College Child Development Lab</a></p><p><a href='http://ruccs.rutgers.edu/~aleslie/'target='_blank'>Rutgers University Cognitive Development Lab</a></p><p><a href='http://babylab.rutgers.edu/HOME.html'target='_blank'>Rutgers University Infancy Studies Lab</a></p><p><a href='http://ruccs.rutgers.edu/languagestudies/people.html'target='_blank'>Rutgers University Lab for Developmental Language Studies</a></p>","NM":"<p><a href=''target='_blank'></a></p>","NY":"<p><a href='http://www.columbia.edu/cu/needlab/'target='_blank'>Columbia Neurocognition, Early Experience, and Development (NEED) Lab</a></p><p><a href='https://www.facebook.com/pages/Child-Development-Lab-the-City-University-of-New-York/42978619994'target='_blank'>CUNY Child Development Lab</a></p>","NC":"<p><a href='http://people.uncw.edu/nguyens/'target='_blank'>UNCW Cognitive Development Lab</a></p>","ND":"<p><a href='http://www.cvcn.psych.ndsu.nodak.edu/labs/woods/'target='_blank'>NDSU Infant Cognitive Development Lab</a></p>","OH":"<p><a href='http://cogdev.cog.ohio-state.edu/'target='_blank'>OSU Cognitive Development Lab</a></p><p><a href='http://www.ohio.edu/chsp/rcs/csd/research/dplab.cfm'target='_blank'>Ohio University Developmental Psycholinguistics Lab</a></p>","OK":"<p><a href=''target='_blank'></a></p>","OR":"<p><a href='http://bdl.uoregon.edu/Participants/participants.php'target='_blank'>University of Oregon Brain Development Lab</a></p><p><a href='http://www.uolearninglab.com'target='_blank'>University of Oregon Learning Lab</a></p>","PA":"<p><a href='http://www.temple.edu/infantlab/'target='_blank'>Temple Infant & Child Lab</a></p><p><a href='http://lncd.pitt.edu/wp/'target='_blank'>University of Pittsburgh Laboratory of Neurocognitive Development</a></p><p><a href='https://sites.sas.upenn.edu/cogdevlab/'target='_blank'>UPenn Cognition & Development Lab</a></p><p><a href='http://babylab.psych.psu.edu/'target='_blank'>Penn State Brain Development Lab</a></p>","RI":"<p><a href='http://www.brown.edu/Research/dcnl/'target='_blank'>Brown University Developmental Cognitive Neuroscience Lab</a></p>","SC":"<p><a href='http://academicdepartments.musc.edu/joseph_lab/'target='_blank'>MUSC Brain, Cognition, & Development Lab</a></p>","SD":"<p><a href=''target='_blank'></a></p>","TN":"<p><a href='http://web.utk.edu/~infntlab/'target='_blank'>UT Knoxville Infant Perception-Action Lab</a></p><p><a href='http://peabody.vanderbilt.edu/departments/psych/research/research_labs/educational_cognitive_neuroscience_lab/index.php'target='_blank'>Vanderbilt Educational Cognitive Neuroscience Lab</a></p>","TX":"<p><a href='http://www.ccdlab.net/'target='_blank'>UT-Austin Culture, Cognition, & Development Lab</a></p><p><a href='http://homepage.psy.utexas.edu/HomePage/Group/EcholsLAB/'target='_blank'>UT-Austin Language Development Lab</a></p><p><a href='http://www.utexas.edu/cola/depts/psychology/areas-of-study/developmental/Labs--Affiliations/CRL.php'target='_blank'>UT-Austin Children's Research Lab</a></p><p><a href='http://www.uh.edu/class/psychology/dev-psych/research/cognitive-development/index.php'target='_blank'>University of Houston Cognitive Development Lab</a></p>","UT":"<p><a href=''target='_blank'></a></p>","VT":"<p><a href='http://www.uvm.edu/psychology/?Page=developmental_labs.html&SM=researchsubmenu.html'target='_blank'>University of Vermont Developmental Laboratories (overview)</a></p>","VA":"<p><a href='http://people.jmu.edu/vargakx/'target='_blank'>James Madison University Cognitive Development Lab</a></p><p><a href='http://www.psyc.vt.edu/labs/socialdev'target='_blank'>Virginia Tech Social Development Lab</a></p><p><a href='http://faculty.virginia.edu/childlearninglab/'target='_blank'>University of Virginia Child Language and Learning Lab</a></p><p><a href='http://denhamlab.gmu.edu/labmembers.html'target='_blank'>George Mason University Child Development Lab</a></p>","WA":"<p><a href='http://depts.washington.edu/eccl/'target='_blank'>University of Washington Early Childhood Cognition</a></p><p><a href='https://depts.washington.edu/uwkids/'target='_blank'>University of Washington Social Cognitive Development Lab</a></p><p><a href='http://ilabs.uw.edu/institute-faculty/bio/i-labs-andrew-n-meltzoff-phd'target='_blank'>University of Washington Infant and Child Studies Lab</a></p>","WV":"<p><a href='http://www.wvuadolescentlab.com/'target='_blank'>WVU Adolescent Development Lab</a></p>","WI":"<p><a href='https://sites.google.com/site/haleyvlach/'target='_blank'>University of Wisconsin Learning, Cognition, & Development Lab</a></p>", "WY":"<p><a href=''target='_blank'></a></p>"};
	
	if (state_name==='[Select a state...]') {
		state_name="";
	}

	$('#labs_in_state').html(lab_list[state_id]);
	$('#state_name').text(state_name);
	
	if ($('#labs_in_state a')[0].text.length==0) {
		$('#labs_in_state').html(none_text);
	}
	
}

// Generate a random string of length len made up of the characters in charSet (optional)
//Thanks to CaffGeek,
// http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
function randomString(len, charSet) {
    charSet = charSet || 'BDGHJKLMNPQRTVWXYZbdghjklmnpqrtvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

// Retrieve a value in the URL (currently used for MTurk ID passed from the HIT):
// Thanks to: css-tricks.com/snippets/javascript/get-url-variables/?
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

// Installing WhichBrowser to detect browser configuration.
// See https://github.com/WhichBrowser/WhichBrowser
(function(){var p=[],w=window,d=document,e=f=0;p.push('ua='+encodeURIComponent(navigator.userAgent));e|=w.ActiveXObject?1:0;e|=w.opera?2:0;e|=w.chrome?4:0;
    e|='getBoxObjectFor' in d || 'mozInnerScreenX' in w?8:0;e|=('WebKitCSSMatrix' in w||'WebKitPoint' in w||'webkitStorageInfo' in w||'webkitURL' in w)?16:0;
    e|=(e&16&&({}.toString).toString().indexOf("\n")===-1)?32:0;p.push('e='+e);f|='sandbox' in d.createElement('iframe')?1:0;f|='WebSocket' in w?2:0;
    f|=w.Worker?4:0;f|=w.applicationCache?8:0;f|=w.history && history.pushState?16:0;f|=d.documentElement.webkitRequestFullScreen?32:0;f|='FileReader' in w?64:0;
    p.push('f='+f);p.push('r='+Math.random().toString(36).substring(7));p.push('w='+screen.width);p.push('h='+screen.height);var s=d.createElement('script');
    s.src='whichbrowser/detect.js?' + p.join('&');d.getElementsByTagName('head')[0].appendChild(s);})();