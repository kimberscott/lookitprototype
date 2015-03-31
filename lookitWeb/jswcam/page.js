var page = (function() {
	
    function Library() {
	this.fragments = {};
    }

    default_config = {
		'jq_selector': '#jswcam',

		'app_width' : 200,
		'app_height': 200,
	
		'libpath'   : 'lib/',
		'uploadpath': 'upload.php',
	
		'rec_width' : 320,
		'rec_height': 240,
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
		
		if(LOOKIT.doneWithConsent){
	        LOOKIT.doneWithConsent = false;
	    }
		var startTime;
		var difference;
		// A short random string to identify THIS SET of videos to the user.
		LOOKIT.RECORDINGSET = randomString(6);
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
					swfobject.getObjectById('flashplayer').setup();
				}
				$("#flashplayer").remove();
				$("#widget_holder").append("<div id='widget'></div>");
				$("#widget_holder").css("display","none");
				hide_cam();
				return true;
			}
		},
		{
			'label': 'Send video (0 seconds)',
			"class": "btn-success btn-send",
			'callback': function() {
				if(LOOKIT.doneWithConsent){
					get_params('params'); // Resetting the session variable to access the filename
			//		var filename = session['filename'][0];
                    $.post("./camera/convert.php", {
                        'continue': 'true',
                        'privacy' : 'INCOMPLETE'
                    });
                    console.log(session);
                    LOOKIT.consent_recording_completed = true;
					LOOKIT.doneWithConsent = false;
					recording = 0;
					$("#widget_holder").css({'pointer-events':'all'});
					hide_cam("consent");
					callback(); //start experiment loading
					swfobject.getObjectById('flashplayer').setup();
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
					$('.btn-record').attr('disabled', 'disabled');
					$('.btn-stop').attr('disabled', 'disabled');
					$('#recording-indicator').css({'background-color': '#666666'});
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
			
				if(recording == 0 && !LOOKIT.doneWithConsent){
					recording = 1;
					LOOKIT.doneWithConsent = false;
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
					LOOKIT.recording_count = '0';
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

			    // Implementing modal-popup scroll when pointer is on the flash widget.
			    // Since the widget is outside the modal sframe, the pop-up will not scroll.
			    // Added "pointer-events:none" property which works on all browsers except 
			    // IE to transfer the browser scroll propety to the element below the widget i.e. the modal popup
			    // For IE, The pop-up is scrolled on mousewheel scroll.
			    // TODO: check for feature here rather than browser!
				if((new WhichBrowser()).browser.name.toString() == "Internet Explorer"){
                    $("#widget_holder").bind('mousewheel', function(e){
    					if(e.originalEvent.wheelDelta > 0)
    					{
        					$(".modal-body").scrollTop($(".modal-body").scrollTop() - 87);
    					}
    					else
    					{
							$(".modal-body").scrollTop($(".modal-body").scrollTop()+87);
    					}
	                });
                }
                else{
                    $("#widget_holder").css({'pointer-events':'none'});
                    $("#widget_holder1").css("position","relative");
                }
				// Only allow recording once user has scrolled down!
				$('.modal-body').scroll(function() {
					// Check if the scrollbar has hit the bottom of the pop-up and all the 
					// elements are ready. This check is performed only once using the ready flag.
					// The record button is enabled and the ready flag ensures that it 
					// is not re-enabled on scrolling.
	                if (($('.modal-body').scrollTop() + $('.modal-body').height() + 100 > $('#top_bar').height() + $('#widget_holder1').height()) && ready == 0) {
	                    initial = computeVisibleHeight("#widget_holder1");
	                    $('.btn-record').attr('disabled', false);
	                    $("#widget_holder").offset($("#widget_holder1").offset());
	                    $("#widget_holder").css('visibility','visible');
	                    ready = 1;
	                }
	                
	                // Adjust the height of the widget on scrolling the pop-up. 
	                // This ensures widget is not visible outside the modal pop-up.
	                if(ready == 1){
	                    var val = computeVisibleHeight("#widget_holder1");
                        delta = initial - val;
                        height = initial_height - delta;
                        $("#widget_holder").height(height);
                        $("#widget_holder").offset($("#widget_holder1").offset());
	                }

	                // While the pop-up is being scrolled first time, the height of the 
	                // widget is adjusted according to the scrolled down area.
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
		$("#widget_holder").css({'pointer-events':'all'});
		$('.btn-send').attr('disabled', 'disabled');
		$('.btn-stop').attr('disabled', 'disabled');
		$('.btn-send').css("display","none");
		$('.btn-stop').css("display","none");
		$('.btn-record').css("display","none");
		$('.btn-record').attr('disabled', 'disabled');
	    LOOKIT.consent_recording_completed = false;
		show_cam("consent","cam_setup");

    };

    Library.prototype.showVerifyDialog = function(acceptFunc) {
	var html = this.html('upload');
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

    var _lib = new Library();
    return _lib;
})();