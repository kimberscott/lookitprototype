 /*
 * * Copyright (C) MIT Early Childhood Cognition Lab
 *
 */
var RECORDINGSET = "";
var DBID = "";
 
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

(function() {
    $(document).ready(function() {

	$('body').bind('showhome', function(evt) {
	    page.buildExperimentGallery('#experiments', experiments);
	});
	$(".loginDiv").hide();
	$(".login_hide").show(300);

	if(window.location.hash) {
      		page.show(window.location.hash.substring(1));
  	} //else {
    //  		page.show('about');
  	//}
	
	

	});

 })();

var unsupportedBrowsers = ["Safari"];
var unsupportedOS = ["Mac OS X", "Mac OS", "iOS", "OS X"];
var recording_count = '0';
var done = 0;
var page = (function() {
	
    function Library() {
	this.fragments = {};
    }

    default_config = {
	'jq_selector': '#jswcam',

	'app_width' : 200,
	'app_height': 200,

	'basepath'  : '/webcam/',
	'codebase'  : 'java/', //or '/full/path/to/java/'
	'archive'   : 'webcam-0.1.jar',
	
	'libpath'   : 'lib/',
	'uploadpath': 'upload.php',
	
	'rec_width' : 320,
	'rec_height': 240,

	'dll_archive_64'  : 'windows-x86_64.jar',
	'dll_archive_32'  : 'windows-x86_64.jar',
	'so_archive_64'   : 'linux-x86_64.jar',
	'so_archive_32'   : 'linux-x86_64.jar',
	'dylib_archive_64': 'osx-x86_64.jar'
    };

    Library.prototype.init = function(config) {
	this.config = $.extend({}, default_config, config);
    };
	Library.prototype.showVerbalConsentDialog = function(callback, expt) {
		// Look up the file '[expt.id].html' under 'fragments' and sub into dialog
		var html = this.html(expt.id);
		var recording = 0;
		
		var initial = 0; 
 		var initial_height = 0; 
 		var ready = 0;
		
		if(done == 1){
	       	done = 0;
	    }
		var startTime;
		var difference;
		// A short random string to identify THIS SET of videos to the user.
		RECORDINGSET = randomString(6);
		// Limit the length of recording using window.setTimeout.
		var timeoutID = 0;
		var check_cam = "<div id = 'top_bar'><p><h1 style='text-align:center'>Test Your Webcam and Microphone </h1></p></div><div id='cam_setup'></div><div id = 'setup_message'></div>";
		bootbox.dialog(check_cam, [
		{
			'label': 'Cancel',
			"class": 'btn-danger',
			'callback': function() {
				if (recording == 1){
					jswcam.stopRecording();
					window.clearTimeout(timeoutID);
					$('#recording-indicator').css({'background-color': '#666666'});
					recording = 0;
				}
				$("#widget_holder").css("display","none");
				hide_cam();
				return true;
			}
		},
		{
			'label': 'Send video (0 seconds)',
			"class": "btn-success btn-send",
			'callback': function() {
				if(done == 1){
					get_params('params'); // Resetting the session variable to access the filename
			//		var filename = session['filename'][0];
                    $.post("./camera/convert.php", {
                        'continue': 'true',
                        'privacy' : 'INCOMPLETE'
                    });
                    console.log(session);
                    consent_recording_completed = 1;
					done = 0;
					recording = 0;
					hide_cam("consent");
					callback(); //start experiment loading
					return true; //allow to close
				}
				return false;
			}
		}, 		
		{
			'label': 'Done',
			'class': 'btn-primary btn-stop',
			'callback': function() {
				if(recording == 2){
					window.clearTimeout(timeoutID);
					var endTime = (new Date()).getTime();
					difference = (endTime - startTime)/1000;
					startTime = null;
					recording = 0;
					//done = 1;
					$('.btn-record').attr('disabled', 'disabled');
					$('.btn-stop').attr('disabled', 'disabled');
					$('#recording-indicator').css({'background-color': '#666666'});
					//$('.btn-send').attr('disabled', false);
					$(".modal-footer").prepend("<span class='waiting'>Please Wait...</span>");
					jswcam.stopRecording();
					$('.btn-send').html('Send video (' + parseInt(difference) + ' seconds)')
					return false;
				}
				return false;
			}
		}, 
		{
			'label': 'Record',
			'class': 'btn-primary btn-record',
			'callback': function() {
				if ($('.btn-record').attr('disabled')) {
					return false;
				} else {
			
				if(recording == 0 && done == 0){
					recording = 1;
					done = 0;
					$('.btn-send').attr('disabled', 'disabled');
					$('.btn-record').attr('disabled', 'disabled');
					$('#recording-indicator').css({'background-color': '#FF0000'});
					// This timeout function is copied from 'done' and should just be named
					timeoutID = window.setTimeout(function() {
						window.clearTimeout(timeoutID);
						recording = 2;
						$('.btn-stop').attr('disabled', false);
						return false;
					}, 5000); // 5 second min recording
					recording_count = '0';
					jswcam.startRecording('');
					startTime = (new Date()).getTime();
				}
				return false;
				}
			}
		},
		{
			'label': 'Continue',
			'class': 'btn-primary btn-continue',
			'callback': function() {
				initial = 0; 
 				initial_height = 400; 
 				ready = 0; 
 				var first_scroll = 0; 
 				var delta = 0;
				swfobject.getObjectById('flashplayer').consent();
				$('#top_bar').html(html);
				$('#top_bar').append(page.html('consent_verbal'));
				$('#message').css({'visibility':'hidden'});
				$('body').append($('#message'));
				$('.btn-send').css('display','inline-block');
				$('.btn-stop').css('display','inline-block');
				$('.btn-record').css('display','inline-block');
			    $("#widget_holder1").append('<div style="position: absolute; z-index: 10000; width: 750px; margin-top: -400px; height: 400px; "></div>');
			    $("#widget_holder").offset($("#widget_holder1").offset());
				// Only allow recording once user has scrolled down!
				$('.modal-body').scroll(function() {
	                if (($('.modal-body').scrollTop() + $('.modal-body').height() + 10 > $('#top_bar').height() + $('#widget_holder1').height()) && ready == 0) {
	                    initial = computeVisibleHeight("#widget_holder1");
	                    $('.btn-record').attr('disabled', false);
	                    $("#widget_holder").offset($("#widget_holder1").offset());
	                    $("#widget_holder").css('visibility','visible');
	                    ready = 1;
	                }
	                if(ready == 1){
	                    var val = computeVisibleHeight("#widget_holder1");
                        delta = initial - val;
                        height = initial_height - delta;
                        $("#widget_holder").height(height);
                        $("#widget_holder").offset($("#widget_holder1").offset());
	                }
	                if(($('.modal-body').scrollTop() >= $("#top_bar").height() - $('.modal-body').height())){
                        if(ready == 0){
	                        $("#widget_holder").offset($("#widget_holder1").offset());
	                        $("#widget_holder").css('visibility','visible');
	                        if(delta == 0 ){
	                        	first_scroll = computeVisibleHeight("#widget_holder1");
	                        }
	                        var val = computeVisibleHeight("#widget_holder1") + 1;
	                        delta = val - first_scroll;
	                        $("#widget_holder").height(delta);
                        }
	                }
	                else{
	                    $("#widget_holder").height(0);
	                }
        		});
        $('.btn-continue').css('display','none');
        $('.error').remove();

				return false;
			}
		}
		]);
		
		$('.btn-continue').css("display","none");
		$('.btn-send').attr('disabled', 'disabled');
		$('.btn-stop').attr('disabled', 'disabled');
		$('.btn-send').css("display","none");
		$('.btn-stop').css("display","none");
		$('.btn-record').css("display","none");
		$('.btn-record').attr('disabled', 'disabled');
	    consent_recording_completed = 0;
		show_cam("consent","cam_setup");

    };

    Library.prototype.showVerifyDialog = function(acceptFunc) {
	var html = this.html('upload');
	//TODO: OK -> SEND (confirm -> dialog)
	bootbox.confirm(html, function(result) {
	    if(result) {
		acceptFunc();
	    } else {
		// KS 2/5/13: switched to page.show from this.show to fix bug in FF
		// 		also re-show sidebar.
		jswcam.toggleWebCamView(true);
		page.show('home');
	    }
	});
    };

    Library.prototype.isMenuCollapsed = function() {
	return !$('#menu-container').is(':visible');
    };

    Library.prototype.toggleMenu = function(setVisible) {
	if(typeof setVisible == "undefined") {
	    var setVisible = this.isMenuCollapsed();
	}
	//do not use jquery show(), hide() or reload applet in chrome
	//KS 2/5/13: use left rather than right to avoid scrollbar;
	//           set top value for menu as well to hide
	if(setVisible) {
	    $('#menu-container').css('position', '');
	    $('#menu-container').css('left', '');
	    $('#menu-container').css('top', '');
	    $('#menu').css('position', '');
	    $('#menu').css('margin-top', '');
	    $('#topbar').css('position', '');
	    $('#topbar').css('margin-top', '');
	    $('#page-container').addClass('skip-fixed-sidebar');
	} else {
	    $('#menu-container').css('position', 'absolute');
	    $('#menu-container').css('left', '-500px');
	    $('#menu-container').css('top', '0px');
	    $('#menu').css('position', 'absolute');
	    $('#menu').css('margin-top', '-100px');
	    $('#topbar').css('position', 'absolute');
	    $('#topbar').css('margin-top', '-100px');
	    $('#page-container').removeClass('skip-fixed-sidebar');
	}
    };

    Library.prototype.clear = function(divSel) {
	this._removeTempFiles();
	divSel = divSel || '.content_pane';
	$(divSel).children().remove().end();
    };

    Library.prototype.show = function(key) {

	$('.active').removeClass('active');
	$('.' + key).addClass('active');
	this.clear('.content_pane');
	$('.content_pane').html(this.html(key));

	$('body').trigger('show'+key);

	var bodyelem;
	if($.browser.safari) {bodyelem = $("body");}
	else {bodyelem = $("html,body");}
	bodyelem.scrollTop(0);
	
	// make this a response to the 'showhome' event instead?
	if (key=='home') {
		window.onbeforeunload = [];
	}
	


    };
    
    Library.prototype.html = function(key, html) {
	if(!key) {
	    return null;
	}
	if(html) {
	    this.fragments[key] = html;
	}
	return (key in this.fragments) ? this.fragments[key] : null;
    }

    Library.prototype._getTempFiles = function(exp) {
	if($.isArray(exp)) {
	    this.list = exp;
	}
	if(!this.list) {
	    this.list = [];
	}
	return this.list;
    };

    Library.prototype._removeTempFiles = function() {
	var tmp = this._getTempFiles();
	function removeScript(src) {
	    var item = $('script[src="' + src + '"]');
	    if(!item) return false;
	    item.remove();
	}
	function removeCSS(href) {
	    var item = $('link[href="' + href + '"]');
	    if(!item) return false;
	    item.remove();
	}
	
	for(var i in tmp) {
	    if(tmp.hasOwnProperty(i)) {
		var item = tmp[i];
		removeScript(item);
		removeCSS(item);
	    }
	}

	//clear temp files since we just removed them
	this._getTempFiles([]); 
    };

    Library.prototype._replaceExperiment = function(callback, scripts, css) {
	this.clear(); //removes old experiment files too
	
	var num_scripts = 0;
	for(var script in scripts) {
	    if(scripts.hasOwnProperty(script)) {
		num_scripts = num_scripts + 1;
		var src = scripts[script];

		var node = document.createElement('script');
		node.type="text/javascript";
		node.src=src;

		(function(_node) { //todo: IE support if onload is unavailable
		    //ensure listeners are binding 
		    //and unbinding the correct nodes
		    //since js loops don't define a new scope
		    var onloadfn = function(evt) {
			num_scripts = num_scripts - 1;
			//_node.removeEventListener('load', onloadfn);
			_node.onload = null;
			if(num_scripts == 0) callback();
		    }
		    //_node.addEventListener('load', onloadfn);
		    _node.onload = onloadfn;
		})(node);

		document.getElementsByTagName('head')[0].appendChild(node);
	    }
	}
	
	css = css || [];
	for(link in css) {
	    if(css.hasOwnProperty(link)) {
		var src = css[link];
		$('head').append($('<link/>', {
		    'rel': "stylesheet",
		    'type': "text/css",
		    'href' : src
		}));
	    }
	}
	
	
	var arr = [];
	Array.prototype.push.apply(arr, scripts);
	Array.prototype.push.apply(arr, css);
	this._getTempFiles(arr);
    };

    Library.prototype.loadExperiment = function(packaging, divSel) {
	 try {
		console.log(packaging);		
//jswcam.setExperiment(packaging['id']);
		if(typeof userId == 'undefined') userId = 'test_user';
		//document.jswcam.setUser(userId);		
	 } catch(e) {
		console.log(e);
	 }

	function loadExp() {
	    var includePath = function(element, index) {
		return packaging['path'] + element;
	    };
	    
	    divSel = divSel || ".content_pane";
	    var scripts = $.map(packaging['scripts'], includePath);
	    var css = [];
	    if('css' in packaging && $.isArray(packaging['css']))
		css = $.map(packaging['css'], includePath);
	    //TODO: path/img
	    var callback = function() {
			//main must be defined in one of
			//the included experiment scripts
			//var browser = new WhichBrowser();
			//packaging.browserObj = browser;
			//packaging.browserStr = browser.toString();
			packaging.browserStr = (new WhichBrowser()).toString();
			main(divSel, packaging);		 
	    };
	    this._replaceExperiment(callback, scripts, css);
	}
	var delegate = loadExp.createDelegate(this);

	this.showVerbalConsentDialog(delegate, packaging);
    };

    Library.prototype.buildExperimentGallery = function(jqSelector, experiments) {
	var columns = 3;
	var rows = 3;
	var offset = rows * columns;
	var index = 0;
	
	var next = $('<a/>', {
	    'class': "btn pull-right btn-success",
	    'text' : "Next",
	    'href' : "#"
	});
	var prev = $('<a/>', {
	    'class': "btn pull-left btn-success",
	    'text' : "Prev",
	    'href' : "#"
	});

	var update_display = function() {
	    console.log(index);
	    for(i = 0; i < rows; i++) {
		var arow = $('<div/>', {
		    'class': ["row-fluid"]
		});
		for(j = 0; j < columns; j++) {
		    if(index + i*columns + j >= experiments.length) {
				break;
		    }
		    (function(info) {
			var exprBlock = $('<div/>', {
			    'class': "span" + 12/columns + " expr_block" 
			});

			var header = $('<a><h2>' + info.name +'</h2>');
			exprBlock.append(header);
			
			var img = $('<img/>', {
			    'src' : info.img,
			    'alt' : "Could not load image" 
			});
			exprBlock.append(header);
			exprBlock.append(img);
			exprBlock.append(info.desc);
			exprBlock.append('</a>');
			exprBlock.click(function() {
				if($("#reg1").css("display") == "none")
				{
					var req = new XMLHttpRequest();
		            req.open("POST", "./login/login.html", false);
		            req.send(null);
		            login_page = req.responseText;
		            login_page += '<div id = "force_login"><b>Please login or <a href="#" onclick="register();">register</a> to participate in this study.</b></div>';
		            login_page = login_page.replace('"register"','"register"\ style="display:none"');
					login_page = login_page.replace("If your family is new to Lookit, please", "");
		            login(login_page,info,this);
				}
				else
				{
					if(check_browser_support()){
						select_child(info,this);
					}
				}
			}.createDelegate(this));
			

			arow.append(exprBlock);
		    }).createDelegate(this)(experiments[index+(i*columns)+j]);


		}
		$(jqSelector).append(arow);
	    }
	    arow = $('<div/>', {
		'class': ['row-fluid']
	    });
	    var cell = $("<div/>", {
		'class': ['span12']
	    });

	    if(experiments.length > offset){
		    cell.append(prev);
		    cell.append(next);
		}
	    arow.append(cell);
	    $(jqSelector).append(arow);

	    if(index == 0) {
		prev.addClass("disabled");
		prev.click(function() {
			return true;
		});
	    } else {
		if(prev.hasClass("disabled")) 
		    prev.removeClass("disabled");
		prev.click(function () {
			$(jqSelector).children().remove().end();
		    index = Math.max(0, index-offset);
		    update_display();
		});
	    }
	    if(index >= experiments.length-offset) {
		next.addClass("disabled");
		next.click(function(){
			return true;
		});	
	    } 
	    else {
		if(next.hasClass("disabled")) 
		    next.removeClass("disabled");
		next.click(function() {
			$(jqSelector).children().remove().end();
		    index = Math.min(index+offset, experiments.length-1);
		    update_display();
		});
	    }
	}.createDelegate(this);
	
	update_display();
    };

    Library.prototype.getUploadingDialog = function(generate) {
	if(!this.uploading) { //undefined -> false
	    this.uploading = false;
	}
	
	if(generate) {
	    this.uploading = true;
	    var uploadingdialog = $('<div/>', {
		// KS 2/13: use the uploading dialog to give more information about completed experiment.
		//    DEBRIEFHTML is global variable set by each experiment.
		'html' : DEBRIEFHTML
	    });
	    var box = bootbox.dialog('', [{
		        'label': 'Close',
		        "class": 'btn-danger reset-close',
		        'callback': function() {
		        	$.ajax({
						'type': 'POST',
						'url': './user.php',
						'data': {
						    'table'	   : 'users',
						    'function' : 'set_account'
						},
						'success': function(resp) {
							window.onbeforeunload = [];
						    console.log(resp);
							alert(experiment);
		            		window.location.replace("./index.php");
						},
						'failure': function(resp) {
							window.onbeforeunload = [];
						    console.log(resp);
						}
					});
		            return true;
		        }
		    }]);
	    box.children('.modal-body').append(uploadingdialog);
	} else if(typeof generate == "undefined") {
	    return this.uploading;
	} else {
	    this.uploading = false;
	}
	return this.uploading
    };

    Library.prototype.getUploadingMap = function(reset) {
	if(!this.upmap || reset) {
	    this.upmap = {};
	}
	return this.upmap;
    }

    
    Library.prototype._nextBarColor = function() {
	if(!this.currentBarColor) {
	    this.currentBarColor = 0;
	}
	var colors = [
//	    'progress-success',
//	    'progress-warning',
//	    'progress-danger',
	    'progress-info'
	];
	this.currentBarColor = (this.currentBarColor + 1) % colors.length;
	return ' ' + colors[this.currentBarColor];
    };

    Library.prototype.makeProgressBar = function(barId) {
	var outer = $('<div/>', {
	    'class': 'progress' + this._nextBarColor()
	});
	outer.append($('<div/>', {
	    'id': barId.hashCode(),
	    'class': 'bar',
	    'style': 'width: 0%',
	    'text' : barId
	}));
	return outer;
    };

    Library.prototype.updateUpload = function(name, progress, size) {
	console.log(name, progress, size);
	var percentage = (progress / size) * 100;
	var map = this.getUploadingMap();
	if(!(name in map)) {
	    $('.uploading').append(this.makeProgressBar(name));
	} else {
	    $('#' + name.hashCode()).css('width', percentage + '%');
	}
	
	map[name] = {
	    'percentage': percentage,
	    'progress': progress,
	    'size': size
	};
	
	var done = true;
	for(var key in map) {
	    if(map.hasOwnProperty(key)) {
		var prog = map[key];
		done = done && (prog.size == prog.progress);
	    }
	}
	if(done) {
	    setTimeout(function() {
		this.getUploadingMap(true); //reset
		var doneexp = this.getUploadingDialog();
		if(doneexp) {
		    bootbox.hideAll();
		    this.getUploadingDialog(false);
		    this.show('home');
		    //jswcam.toggleWebCamView(true);
		}
	    }.createDelegate(this), 1000);
	}
    };

    var _lib = new Library();
    return _lib;
})();
var is_recording = '0';
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
		if(is_recording == '1'){
			this.stopRecording("stopping");
			console.log('Tried to start recording, but was already recording!  Stopped instead.');
		}
		get_params('params'); // Resetting the session variable to access the filename
		swfobject.getObjectById("flashplayer").recordToCamera(session['experiment_id'],session['user_id']+'_'+RECORDINGSET,session['participant'],session['participant_privacy'],caller,recording_count);
		recording_count++;
		is_recording = '1';
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

	/* jswcam.stopRecording returns {} if no recording is in progress, or stops recording and returns 
	* {'video': videoID, 'audio': audioID} (including whichever keys are available)
	* if recording was in progress. */
    Library.prototype.stopRecording = function(caller) {
    if(is_recording == '1'){
		swfobject.getObjectById("flashplayer").stop_record("");
	}
	is_recording = '0';
    console.log("Recording Stopped");
    };

    //arguments: (fn, vidId0, vidId1, ..., vidIdN)
    //See http://www.w3.org/TR/html5/the-iframe-element.html#media-elements
    //for more details about html5 video buffering events
    Library.prototype.waitForAssets = function() {
	if(arguments.length == 0) return false;
	
	var callback = arguments[0];
	if(!$.isFunction(callback)) {
	    return false;
	}

	var assets = arguments.length-1;
	for(var i = 1; i < arguments.length; i++) {
	    var id = arguments[i];
	    var tag = document.getElementById(id);

	    //TODO: use jquery for events instead of browser
	    //    : in order to support IE 7, etc
	    
	    //wrapped in closure to preserve the correct tag
	    //for the corrent listener
	    (function(_tag) {
		var _listener = function(evt) {
		    assets = assets - 1;
		    _tag.removeEventListener('canplaythrough', _listener);
		    //ensure we only decrement once per video by removing
		    
		    if(assets == 0) callback();
		};
		_tag.addEventListener('canplaythrough', _listener);
	    })(tag);
	}
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

    /**
     * Returns a unique id referencing an image taken from
     * the webcam or false, if none was able to be retrieved.
     */
    Library.prototype.camFrameGrab = function() {
	return document.jswcam.camFrameGrab();
    };

    /**
     * Returns a jquery <img> list for the specified id if valid
     */
    Library.prototype.putFrame = function(selectorId, name, frameId, width, height) {

	var path = null;
	if(frameId) {
	    path = document.jswcam.getFrame(frameId);
	}
	page.loadApplet(selectorId, name, width, height, 'org/mit/webcam/applet/ImageViewer');
	if(path != null) {
	    setTimeout(function() {
		document[name].setPath(path);
	    }, 500);
	}
    };

    Library.prototype.updateFrame = function(name, frameId) {
	if(document[name]) {
	    var path = document.jswcam.getFrame(frameId);
	    document[name].setPath(path);
	}
    };

    Library.prototype.detectMic = function() {
	return document.jswcam.detectMic();
    };

    Library.prototype.detectVideo = function() {
	return document.jswcam.detectVideo();
    };
    
    return new Library();
})();

function show_state_labs() {
	var state_id = $('#state_selector option:selected').val();
	var state_name = $('#state_selector option:selected').text();
	var none_text = "<p>Sorry, we don't know of any child development labs in " +state_name+" yet!</p>"
	

	var lab_list ={"NA":"","AL":"<p><a href='http://www.ches.ua.edu/hdfs/cdrc/'target='_blank'>University of Alabama Child Development Research Center</a></p><p><a href='http://monaelsheikh.com/'target='_blank'>Auburn University Child Sleep, Health, and Development Lab</a></p>","AK":"<p><a href=''target='_blank'></a></p>","AZ":"<p><a href='http://web.arizona.edu/~tigger/'target='_blank'>University of Arizona Child Cognition Lab (Tigger Lab)</a></p><p><a href='http://web.arizona.edu/~tweety/'target='_blank'>University of Arizona Language Development Lab (Tweety Lab)</a></p><p><a href='http://nau.edu/SBS/IHD/Research/CDLL/'target='_blank'>Northern Arizona University Child Development and Language Lab</a></p>","AR":"<p><a href='http://acnc.uamsweb.com/research-2/our-laboratories-2/early-diets-and-long-term-health-lab/'target='_blank'>Arkansas Children's Nutrition Center Growth and Development Laboratory</a></p>","CA":"<p><a href='http://www-psych.stanford.edu/~babylab/'target='_blank'>Stanford’s Center for Infant Studies</a></p><p><a href='http://www-cogsci.ucsd.edu/~deak/cdlab/'target='_blank'>UCSD Cognitive Development Lab</a></p><p><a href='http://babytalk.psych.ucla.edu/home.htm'target='_blank'>UCLA Language and Cognitive Development Lab</a></p><p><a href='http://psychology.berkeley.edu/participant-recruitment/rsvp-research-subject-volunteer-pool'target='_blank'>UC Berkeley Psychology Department (list of studies)</a></p><p><a href='http://babycenter.berkeley.edu/'target='_blank'>UC Berkeley Infant Studies Center</a></p><p><a href='http://bungelab.berkeley.edu/participate/'target='_blank'>UC Berkeley Building Blocks of Cognition Lab</a></p><p><a href='http://www.cogsci.uci.edu/cogdev/information.html'target='_blank'>UC Irvine Sarnecka Cognitive Development Lab</a></p><p><a href='https://labs.psych.ucsb.edu/german/tamsin/'target='_blank'>UCSB Cognition & Development Laboratory</a></p><p><a href='http://www.csus.edu/indiv/a/alexanderk/lab.htm'target='_blank'>CSU Sacramento Cognitive Development Lab</a></p><p><a href='http://mindbrain.ucdavis.edu/labs/Rivera/'target='_blank'>UC Davis Neurocognitive Development Lab</a></p><p><a href='http://dornsife.usc.edu/labs/mid-la/participate/'target='_blank'>USC Minds in Development Lab</a></p><p><a href='http://www.ccl.ucr.edu/'target='_blank'>UC Riverside Childhood Cognition Lab</a></p>","CO":"<p><a href='http://sleep.colorado.edu/'target='_blank'>UC Boulder Sleep and Development Lab</a></p><p><a href='http://www.ucdenver.edu/academics/colleges/medicalschool/departments/psychiatry/Research/developmentalresearch/Pages/Overview.aspx'target='_blank'>University of Colorado Denver Developmental Psychiatry Research Group</a></p><p><a href='http://www.du.edu/psychology/child_health_and_development/'target='_blank'>University of Colorado Denver Child Health & Development Lab</a></p><p><a href='http://psych.colorado.edu/~cdc/whoweare.htm'target='_blank'>University of Colorado Denver Cognitive Development Center</a></p>","CT":"<p><a href='http://cogdev.research.wesleyan.edu/'target='_blank'>Wesleyan University Cognitive Development Labs</a></p><p><a href='http://cogdevlab.sites.yale.edu/'target='_blank'>Yale Cognition and Development Lab</a></p><p><a href='http://www.yale.edu/infantlab/Welcome.html'target='_blank'>Yale Infant Cognition Center</a></p><p><a href='http://www.yale.edu/minddevlab/'target='_blank'>Yale Mind and Development Lab</a></p><p><a href='http://www.yale.edu/cnl/faculty.html'target='_blank'>Yale Child Neuroscience Lab</a></p>","DE":"<p><a href='http://www.udel.edu/ILP/about/team.html'target='_blank'>University of Delaware Infant Language Project</a></p>","FL":"<p><a href='http://casgroup.fiu.edu/dcn/pages.php?id=3636'target='_blank'>FIU Developmental Cognitive Neuroscience Lab</a></p><p><a href='http://online.sfsu.edu/devpsych/fair/index.html'target='_blank'>FSU Family Interaction Research Lab</a></p><p><a href='http://psy2.fau.edu/~lewkowicz/cdlfau/default.htm'target='_blank'>FAU Child Development Lab</a></p><p><a href='http://infantlab.fiu.edu/Infant_Lab.htm'target='_blank'>FIU Infant Development Lab</a></p>","GA":"<p><a href='http://www.gcsu.edu/psychology/currentresearch.htm#Participate'target='_blank'>Georgia College Psychology Department</a></p>","HI":"<p><a href='http://www.psychology.hawaii.edu/concentrations/developmental-psychology.html'target='_blank'>University of Hawaii Developmental Psychology</a></p>","ID":"<p><a href=''target='_blank'></a></p>","IL":"<p><a href='http://internal.psychology.illinois.edu/~acimpian/'target='_blank'>University of Illinois Cognitive Development Lab</a></p><p><a href='http://internal.psychology.illinois.edu/infantlab/'target='_blank'>University of Illinois Infant Cognition Lab</a></p><p><a href='http://bradfordpillow.weebly.com/cognitive-development-lab.html'target='_blank'>Northern Illinois University Cognitive Development Lab</a></p><p><a href='http://www.communication.northwestern.edu/departments/csd/research/developmental_cognitive_neuroscience/'target='_blank'>Northwestern University Developmental Cognitive Neuroscience Lab</a></p><p><a href='http://woodwardlab.uchicago.edu/Home.html'target='_blank'>University of Chicago Infant Learning and Development Lab</a></p>","IN":"<p><a href='http://www.iub.edu/~cogdev/'target='_blank'>Indiana University Cognitive Development Lab</a></p><p><a href='http://www.psych.iupui.edu/Users/kjohnson/cogdevlab/INDEX.HTM'target='_blank'>IUPUI Cognitive Development Lab</a></p><p><a href='http://www.evansville.edu/majors/cognitivescience/language.cfm'target='_blank'>University of Evansville Language and Cognitive Development Laboratory</a></p>","IA":"<p><a href='http://www.medicine.uiowa.edu/psychiatry/cognitivebraindevelopmentlaboratory/'target='_blank'>University of Iowa Cognitive Brain Development Laboratory</a></p>","KS":"<p><a href='http://www2.ku.edu/~lsi/labs/neurocognitive_lab/staff.shtml'target='_blank'>KU Neurocognitive Development of Autism Research Laboratory</a></p><p><a href='http://healthprofessions.kumc.edu/school/research/carlson/index.html'target='_blank'>KU Maternal and Child Nutrition and Development Laboratory</a></p>","MN":"<p><a href='http://greenhoot.wordpress.com/meet-the-research-team/'target='_blank'>KU Memory and Development Lab</a></p>","KY":"<p><a href='http://www.wku.edu/psychological-sciences/labs/cognitive_development/index.php'target='_blank'>Western Kentucky University Cognitive Development Lab</a></p>","LA":"<p><a href=''target='_blank'></a></p>","ME":"<p><a href='http://people.usm.maine.edu/bthompso/Site/Development%20Lab.html'target='_blank'>USM Human Development Lab</a></p><p><a href='http://www.colby.edu/psychology/labs/cogdev1/LabAlumni.html'target='_blank'>Colby Cognitive Development Lab</a></p>","MD":"<p><a href='http://education.umd.edu/HDQM/labs/Fox/'target='_blank'>University of Maryland Child Development Lab</a></p><p><a href='http://ncdl.umd.edu/'target='_blank'>University of Maryland Neurocognitive Development Lab</a></p>","MA":"<p><a href='http://eccl.mit.edu/'target='_blank'>MIT Early Childhood Cognition Lab</a></p><p><a href='http://gablab.mit.edu/'target='_blank'>MIT Gabrieli Lab</a></p><p><a href='http://saxelab.mit.edu/people.php'target='_blank'>MIT Saxelab Social Cognitive Neuroscience Lab</a></p><p><a href='https://software.rc.fas.harvard.edu/lds/'target='_blank'>Harvard Laboratory for Developmental Sciences</a></p><p><a href='http://www.bu.edu/cdl/'target='_blank'>Boston University Child Development Labs</a></p><p><a href='babies.umb.edu'target='_blank'>UMass Boston Baby Lab</a></p><p><a href='http://people.umass.edu/lscott/lab.htm'target='_blank'>UMass Amherst Brain, Cognition, and Development Lab</a></p><p><a href='http://www.northeastern.edu/berentlab/research/infant/'target='_blank'>Northeastern Infant Phonology Lab</a></p>","MI":"<p><a href='http://www.educ.msu.edu/content/default.asp?contentID=903'target='_blank'>MSU Cognitive Development Lab</a></p><p><a href='http://ofenlab.wayne.edu/people.php'target='_blank'>Wayne State University Cognitive Brain Development Lab</a></p>","MN":"<p><a href='http://www.cehd.umn.edu/icd/research/seralab/'target='_blank'>University of Minnesota Language and Cognitive Development Lab</a></p><p><a href='http://www.cehd.umn.edu/icd/research/cdnlab/'target='_blank'>University of Minnesota Cognitive Development & Neuroimaging Lab</a></p><p><a href='http://www.cehd.umn.edu/icd/research/carlson/'target='_blank'>University of Minnesota Carlson Child Development Lab</a></p>","MS":"<p><a href=''target='_blank'></a></p>","MO":"<p><a href='http://www.artsci.wustl.edu/~children/'target='_blank'>Washington University Cognition and Development Lab</a></p><p><a href='http://mumathstudy.missouri.edu/#content'target='_blank'>University of Missouri-Columbia Math Study</a></p>","MT":"<p><a href='http://www.montana.edu/wwwpy/brooker/html/meet.html'target='_blank'>Montana State University DOME Lab</a></p>","NE":"<p><a href='http://www.boystownhospital.org/research/clinicalbehavioralstudies/Pages/LanguageDevelopmentLaboratory.aspx'target='_blank'>Boys Town National Research Hospital Language Development Laboratory</a></p><p><a href='http://research.unl.edu/dcn/'target='_blank'>University of Nebraska-Lincoln Developmental Cognitive Neuroscience Laboratory</a></p>","NV":"<p><a href='http://www.unl.edu/dbrainlab/'target='_blank'>University of Nebraska-Lincoln Developmental Brain Lab</a></p>","NH":"<p><a href='http://cola.unh.edu/news/frl'target='_blank'>University of New Hampshire Family Research Lab</a></p>","NJ":"<p><a href='http://www.shu.edu/academics/gradmeded/ms-speech-language-pathology/dlc-lab.cfm'target='_blank'>Seton Hall University  Developmental Language and Cognition Laboratory</a></p><p><a href='http://www.ramapo.edu/sshs/childlab/'target='_blank'>Ramapo College Child Development Lab</a></p><p><a href='http://ruccs.rutgers.edu/~aleslie/'target='_blank'>Rutgers University Cognitive Development Lab</a></p><p><a href='http://babylab.rutgers.edu/HOME.html'target='_blank'>Rutgers University Infancy Studies Lab</a></p><p><a href='http://ruccs.rutgers.edu/languagestudies/people.html'target='_blank'>Rutgers University Lab for Developmental Language Studies</a></p>","NM":"<p><a href=''target='_blank'></a></p>","NY":"<p><a href='http://www.columbia.edu/cu/needlab/'target='_blank'>Columbia Neurocognition, Early Experience, and Development (NEED) Lab</a></p><p><a href='https://www.facebook.com/pages/Child-Development-Lab-the-City-University-of-New-York/42978619994'target='_blank'>CUNY Child Development Lab</a></p>","NC":"<p><a href='http://people.uncw.edu/nguyens/'target='_blank'>UNCW Cognitive Development Lab</a></p>","ND":"<p><a href='http://www.cvcn.psych.ndsu.nodak.edu/labs/woods/'target='_blank'>NDSU Infant Cognitive Development Lab</a></p>","OH":"<p><a href='http://cogdev.cog.ohio-state.edu/'target='_blank'>OSU Cognitive Development Lab</a></p><p><a href='http://www.ohio.edu/chsp/rcs/csd/research/dplab.cfm'target='_blank'>Ohio University Developmental Psycholinguistics Lab</a></p>","OK":"<p><a href=''target='_blank'></a></p>","OR":"<p><a href='http://bdl.uoregon.edu/Participants/participants.php'target='_blank'>University of Oregon Brain Development Lab</a></p>","PA":"<p><a href='http://www.temple.edu/infantlab/'target='_blank'>Temple Infant & Child Lab</a></p><p><a href='http://lncd.pitt.edu/wp/'target='_blank'>University of Pittsburgh Laboratory of Neurocognitive Development</a></p><p><a href='https://sites.sas.upenn.edu/cogdevlab/'target='_blank'>UPenn Cognition & Development Lab</a></p><p><a href='http://babylab.psych.psu.edu/'target='_blank'>Penn State Brain Development Lab</a></p>","RI":"<p><a href='http://www.brown.edu/Research/dcnl/'target='_blank'>Brown University Developmental Cognitive Neuroscience Lab</a></p>","SC":"<p><a href='http://academicdepartments.musc.edu/joseph_lab/'target='_blank'>MUSC Brain, Cognition, & Development Lab</a></p>","SD":"<p><a href=''target='_blank'></a></p>","TN":"<p><a href='http://web.utk.edu/~infntlab/'target='_blank'>UT Knoxville Infant Perception-Action Lab</a></p><p><a href='http://peabody.vanderbilt.edu/departments/psych/research/research_labs/educational_cognitive_neuroscience_lab/index.php'target='_blank'>Vanderbilt Educational Cognitive Neuroscience Lab</a></p>","TX":"<p><a href='http://www.ccdlab.net/'target='_blank'>UT-Austin Culture, Cognition, & Development Lab</a></p><p><a href='http://homepage.psy.utexas.edu/HomePage/Group/EcholsLAB/'target='_blank'>UT-Austin Language Development Lab</a></p><p><a href='http://www.utexas.edu/cola/depts/psychology/areas-of-study/developmental/Labs--Affiliations/CRL.php'target='_blank'>UT-Austin Children's Research Lab</a></p><p><a href='http://www.uh.edu/class/psychology/dev-psych/research/cognitive-development/index.php'target='_blank'>University of Houston Cognitive Development Lab</a></p>","UT":"<p><a href=''target='_blank'></a></p>","VT":"<p><a href='http://www.uvm.edu/psychology/?Page=developmental_labs.html&SM=researchsubmenu.html'target='_blank'>University of Vermont Developmental Laboratories (overview)</a></p>","VA":"<p><a href='http://people.jmu.edu/vargakx/'target='_blank'>James Madison University Cognitive Development Lab</a></p><p><a href='http://www.psyc.vt.edu/labs/socialdev'target='_blank'>Virginia Tech Social Development Lab</a></p><p><a href='http://faculty.virginia.edu/childlearninglab/'target='_blank'>University of Virginia Child Language and Learning Lab</a></p><p><a href='http://denhamlab.gmu.edu/labmembers.html'target='_blank'>George Mason University Child Development Lab</a></p>","WA":"<p><a href='http://depts.washington.edu/eccl/'target='_blank'>University of Washington Early Childhood Cognition</a></p><p><a href='https://depts.washington.edu/uwkids/'target='_blank'>University of Washington Social Cognitive Development Lab</a></p><p><a href='http://ilabs.uw.edu/institute-faculty/bio/i-labs-andrew-n-meltzoff-phd'target='_blank'>University of Washington Infant and Child Studies Lab</a></p>","WV":"<p><a href='http://www.wvuadolescentlab.com/'target='_blank'>WVU Adolescent Development Lab</a></p>","WI":"<p><a href='https://sites.google.com/site/haleyvlach/'target='_blank'>University of Wisconsin Learning, Cognition, & Development Lab</a></p>"};
	
	
	if (state_name==='[Select a state...]') {
		state_name="";
	}

	$('#labs_in_state').html(lab_list[state_id]);
	$('#state_name').text(state_name);
	
	if ($('#labs_in_state a')[0].text.length==0) {
		$('#labs_in_state').html(none_text);
	}
	
}

// Thanks to CaffGeek on http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
function randomString(len, charSet) {
    charSet = charSet || 'BDGHJKLMNPQRTVWXYZbdghjklmnpqrtvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

// Formerly experimentFunctions.js in each study directory:
function promptBeforeClose() {
	// During an experiment, prompt before user refreshes page, uses back/forward buttons, etc.
	// (These will probably not have the desired effect, but shouldn't and can't be blocked.)
	// This is canceled after ending the experiment.
	window.onbeforeunload = function(e) {
		promptEarlyEnd();
		return '';
	};
}

function setDBID() {
	DBID = +new Date;
	DBID = DBID.toString() + '-' + Math.random().toString();
}

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

	experiment['dbid'] = DBID;
	var subsetData = {};
	subsetData['dbid'] = DBID;
	subsetData['tic'] = experiment['tic'];
	subsetData['eventArray'] = experiment['eventArray'];
	subsetData['condition'] = experiment['condition'];
	subsetData['mturkID'] = experiment['mturkID'];
	subsetData['recordingSet'] = experiment['recordingSet'];
	subsetData['currentSegment'] = currentElement;
	subsetData['browserStr'] = experiment['browserStr'];
	
	$.ajax({
                'type': 'POST',
                'url': './user.php',
                'async' : true,
                'data': {
                    'table'        : 'users',
                    'json_data'    : subsetData,
                    'function'     : 'set_account'
                },
                success: function(resp) {
                    console.log('Updated database');
                }
            });

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
		done_or_withdraw(experiment, generate_debriefing()); // Function to check if user wants to withdraw from the experiment or not
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
		promptEarlyEnd();
	}
}

function promptEarlyEnd() {
		addEvent(  {'type': 'promptEarlyUpload'});
		document.removeEventListener('keydown', getKeyCode, false);
		bootbox.prompt('Are you sure you want to end the study now?', 'No, continue', 'Yes, end now',
			function(comments) {
				if (comments!=null) {
					experiment.endedEarly = true;
					experiment.endEarlyComments = comments;
					console.log(experiment);
					if (!sandbox){
						done_or_withdraw(experiment, generate_debriefing()); // Function to check if user wants to withdraw from the experiment or not
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

// css-tricks.com/snippets/javascript/get-url-variables/?
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

// Fullscreen functions

function goFullscreen(element){

	addEvent(  {'type': 'goFullscreen'});
	$('#fsbutton').hide();

	if (element.mozRequestFullScreen && !element.mozFullScreen) { // 
		// This is how to go into fullscren mode in Firefox
		console.log('mozilla fs');
		element.mozRequestFullScreen();
		document.addEventListener("mozfullscreenchange", mozEndFullscreen, false);
		element.style.height = screen.availHeight + 'px';
		element.style.width  = screen.availWidth  + 'px';

	} else if (element.parentNode.webkitRequestFullScreen && !element.parentNode.webkitIsFullScreen) {  // 
		// This is how to go into fullscreen mode in Chrome and Safari
		// Both of those browsers are based on the Webkit project, hence the same prefix.
		console.log('Webkit fs');
		element.parentNode.webkitRequestFullScreen();
		$('#vidElement').addClass('playingVideo');
		element.style.height = screen.availHeight + 'px';
		element.style.width  = screen.availWidth  + 'px';
		
		document.addEventListener("webkitfullscreenchange", webkitEndFullscreen, false);

		}
	else {
		// for IE or other non-supported ...
		// Unfortunately this does make it hard to tell when we leave fs--need to remove whole element.
		addEvent({'type': 'alternative Fullscreen'});
		bootbox.alert("It looks like your browser doesn't support full-screen requests.  Please maximize your browser window or enter fullscreen manually (try pressing F11).  Thanks!");
		element.style.height = screen.availHeight + 'px';
		// Just for IE: to avoid horizontal scroll bar
		element.style.width  = screen.availWidth-20  + 'px';
	}	
	
	function webkitEndFullscreen() {
		
		if(!document.webkitIsFullScreen) {
			document.removeEventListener("webkitfullscreenchange", webkitEndFullscreen, false);
			addEvent({'type': 'endFullscreen'});
			// Restore CSS properties here (TODO: remove magic numbers...)
			element.style.height='400px';
			element.style.width='800px';
			$('#fsbutton').show();
		}
		
	}
	
	function mozEndFullscreen() {
		
		if(!document.mozFullScreen) {
			document.removeEventListener("mozfullscreenchange", mozEndFullscreen, false);
			addEvent({'type': 'endFullscreen'});
			element.style.height='400px';
			element.style.width='800px';
			$('#fsbutton').show();
		}
		
	}

	
	
}

function leaveFullscreen(){
	
	addEvent(  {'type': 'endFullscreen'});
	if (document.mozCancelFullScreen && document.mozFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitCancelFullScreen && document.webkitIsFullScreen) {
		document.webkitCancelFullScreen();
	}
	}


function addFsButton(mainDivSelector, elementSelector) {
	// Make a 'return to full screen' button (will only be visible if the user leaves fs)
	var button = $('<button/>', {
	'id': 'fsbutton', 
	'value': 'Please return to full screen! (click here)', 
	'text': 'Please return to full screen! (click here)'});
	
	button.click(function(evt) {
		addEvent(  {'type': 'click',
					'fn': 'fullscreen'});
		goFullscreen($(elementSelector)[0]);
		return false;
	});

	$(mainDivSelector).append(button);
	$('#fsbutton').hide();
}

// Installing WhichBrowser to detect browser configuration.
// See https://github.com/WhichBrowser/WhichBrowser
(function(){var p=[],w=window,d=document,e=f=0;p.push('ua='+encodeURIComponent(navigator.userAgent));e|=w.ActiveXObject?1:0;e|=w.opera?2:0;e|=w.chrome?4:0;
    e|='getBoxObjectFor' in d || 'mozInnerScreenX' in w?8:0;e|=('WebKitCSSMatrix' in w||'WebKitPoint' in w||'webkitStorageInfo' in w||'webkitURL' in w)?16:0;
    e|=(e&16&&({}.toString).toString().indexOf("\n")===-1)?32:0;p.push('e='+e);f|='sandbox' in d.createElement('iframe')?1:0;f|='WebSocket' in w?2:0;
    f|=w.Worker?4:0;f|=w.applicationCache?8:0;f|=w.history && history.pushState?16:0;f|=d.documentElement.webkitRequestFullScreen?32:0;f|='FileReader' in w?64:0;
    p.push('f='+f);p.push('r='+Math.random().toString(36).substring(7));p.push('w='+screen.width);p.push('h='+screen.height);var s=d.createElement('script');
    s.src='whichbrowser/detect.js?' + p.join('&');d.getElementsByTagName('head')[0].appendChild(s);})();
	