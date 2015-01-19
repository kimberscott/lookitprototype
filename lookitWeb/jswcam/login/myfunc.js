 /*

 * * Copyright (C) MIT Early Childhood Cognition Lab
 *
 */
//Function to serialise the recieved data and return the object
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

function handleprivacyclick(event) {
		console.log('privacy click handler');
		var val = $('input[name=participant_privacy]:radio:checked').val();
		var textbox = $('#confirmfreediv');
		if (val=="free") {
			textbox.show();
		} else {
			textbox.hide();
		}
}

// Function to Send a call to the database script and get the responce data back
function call(str,url){
var result;
var json_string = JSON.stringify($('form').serializeObject());

if(json_string != "" && str == "check"){
    json_string = "{\"email_label\":\""+$("#email").val()+"\"}";
}
$.ajax({
        'type': 'POST',
        'url': url,
        async: false,
        'data': {
            'table'    : 'users',
            'json_data': json_string,
            'function' : str  
        },
        success: function(resp) {
            if(resp)
            {
                if(str == "login" || str == "reset_pass"){
            	   $("#reg,#log,.login_form").css("display", "none");
            	   $("#reg1,#log1").css("display", "block");
                }
                result = resp;
            }
            else{
                $("#error").css("display","block");
            }
        },
        failure: function(resp) {
            result = false;
        }
        });
return result;
}

var consent_recording_completed = 0;
$(document).ready(function(){
    $("#log1").click(function (){
        $.ajax({
            'url'   : 'login.php',
            'type'  : 'post',
            'data'  : {
                'sure' :'1'
                }, //send a value to make sure we want to destroy it.
            success: function(data){

                $("#reg1,#log1,.login_form").css("display", "none");
                $("#reg,#log").css("display", "block");
                page.show("about");
            }
        });
    });

    setInterval(function(){
// prevent server to end the session due to inactivity
	var refresh = call('refresh','./user.php');
    }, 300000);

    $('#log').click(function(){
            var req = new XMLHttpRequest();
            req.open("POST", "./login/login.html", false);
            req.send(null);
            var login_page = req.responseText;
            login(login_page,"","");
    });
    
    if($("#reset").val()){
        var email = $("#reset").val();
        var key = $("#reset_key").val();
        var req = new XMLHttpRequest();
            req.open("POST", "./login/reset.php?email="+email+"&key="+key, false);
            req.send(null);
            var reset_page = req.responseText;
            save_pass(reset_page);
    }

    $("#reg").click(function(){
        register();
    });

    $("#reg1").click(function(){
	show_participated_page();
	if($("#experi div").hasClass("row-fluid"))
	{
            $('#past_studies').addClass('disabled');
            $('#acc_edit').removeClass('disabled');
            $("#past_studies").css("color","gray");
            $("#acc_edit").css("color","#003366");
	}
	else{
            $('#acc_edit').addClass('disabled');
            $('#past_studies').removeClass('disabled');
            $("#acc_edit").css("color","gray");
            $("#past_studies").css("color","#003366");
	}

    });

    $("#demo a").click(function(){
        page.show("account");
    });

// Clicking on the Edit Details link on the My Accounts page
    // adds disabled class to it, while enables the past studies link, if disabled.
    $(document).on("click","#acc_edit",function(){
        if($(this).hasClass("disabled")){
            return false;
        }
        else{
            show_edit_page();
            if($("#experi div").hasClass("row-fluid"))
            {
                $('#past_studies').addClass('disabled');
                $('#acc_edit').removeClass('disabled');
                $("#past_studies").css("color","gray");
                $("#acc_edit").css("color","#003366");
            }
            else{
                $('#acc_edit').addClass('disabled');
                $('#past_studies').removeClass('disabled');
                $("#acc_edit").css("color","gray");
                $("#past_studies").css("color","#003366");
            }
        }
    });

    // Clicking on the View Past Studies link on the My Accounts page
    // adds disabled class to it, while enables the Edit Details link, if disabled.
    $(document).on("click","#past_studies",function(){
        if($(this).hasClass("disabled")){
            return false;
        }
        else{
            show_participated_page();
            if($("#experi div").hasClass("row-fluid"))
            {
                $('#past_studies').addClass('disabled');
                $('#acc_edit').removeClass('disabled');
                $("#past_studies").css("color","gray");
                $("#acc_edit").css("color","#003366");
            }
            else{
                $('#acc_edit').addClass('disabled');
                $('#past_studies').removeClass('disabled');
                $("#acc_edit").css("color","gray");
                $("#past_studies").css("color","#003366");
            }
        }
    });

    get_params('params');
    $('.bootbox').css('margin-top',(-$('.bootbox').height())/2);
    $('.bootbox').css('margin-left',(-$('.bootbox').width())/2);
    
});
var responce;

// Function to display the Edit registration details, on the My Accounts page.
function show_edit_page(){
    var req = new XMLHttpRequest();
    req.open("POST", "./edit_register.php", false);
    req.send(null);
    var register_page = req.responseText;

    $("#experi").html(register_page);

    $('body').bind('showhome', function(evt) {
        page.buildExperimentGallery('#experiments', experiments);
    });
}

// Function to display the Previous participated studies, on the My Accounts page.
function show_participated_page(){
    page.show("account");
    var participated=get_list();
    if(participated != ""){
	$("#experi").html("");
        page.buildExperimentGallery('#experi', participated);
	$("#experi").prepend("<div><h3>Previous Studies</h3></div>");
    }
    else{
        $("#experi").html("<div class='row-fluid' style='text-align: center;'><br /><br /><b>You have not participated in any studies.</b></div>");
    }
}


// Get the list of participated experiments for the logged in user in the "My Accounts page"
function get_list(){
    $.ajax({
        'type': 'POST',
        'url': './user.php',
        async: false,
        'data': {
            'table'     : 'users',
            'function'  : 'account',
            'json_data' : experiments  
        },
        success: function(resp) {
            if(resp)
            {
                responce = eval("(" + resp + ')');
            }
            else{
                $("#error").css("display","block");
            }
        },
        failure: function(resp) {
            result = false;
        }
    });
    return responce;
}

var reg_page;

// Get the content to be populated in the registration page.
function get_reg_page(){
    $.ajax({
        'type'  :  'POST',
        'url'   :  './register.php',
        async   :  false,
        'data'  :  session,
        success: function(resp) {
            if(resp){
                reg_page = resp;
            }
            else{
                $("#error").css("display","block");
            }
        },
        failure: function(resp) {
            result = false;
        }
    });
    return reg_page;
}

// Function to tpopulate the registration pop-up and its controls
function register(is_new){

    is_new = (typeof is_new=='undefined');

    var too_many_accounts = false;
    // if (is_new) {
    // // First check if we already have too many user accounts
		// $.ajax({
			// 'type': 'POST',
			// 'url': 'user.php',
			// async: false,
			// 'data': {
			    // 'experiment_id' : "users",
			    // 'function' : 'checknumber',
			    // 'table': "users",
			// },
			// 'success': function(resp) {
				// too_many_accounts = resp;
			// },
			// 'failure': function(resp) {
			// }
		    // });
	// }

    if (!too_many_accounts) {
		$(".bootbox").remove();
		$(".modal-backdrop").remove();
		
		var continue_clicked = 0;
		var cancel_clicked = 0;
		var register_page = get_reg_page();

		bootbox.dialog(register_page,[
			{
				'label': 'Cancel',
				'class': 'btn-danger regis-close',
				'callback': function() {
					if(!cancel_clicked){
						$('body').bind('showhome', function(evt) {
							page.buildExperimentGallery('#experiments', experiments);
						});

					if($("#reg1").css("display") != "block"){
						$("#reg,#log").css("display", "block");
					}
					cancel_clicked =1;
					continue_clicked = 0;
					return true;
					}
				}
			},
			{
				'label': 'Register',
				'class': 'btn-success btn-send btn-ok',
				'callback': function() {
					
					$("#dob_error").css("display","none");
					$("#gender_error").css("display","none");
					if(continue_clicked == 2){
							
							var myname = call('','./user.php');
							$("#reg1,#log1").css("display", "block");
							$("#reg,#log,.login_form").css("display", "none");
							$("#reg1").html("<a href='#'' > Hi "+myname+" </a>");							
							
							if(!cancel_clicked){
								
								$('body').bind('showhome', function(evt) {
									page.buildExperimentGallery('#experiments', experiments);
								});

							}
							$(".bootbox").remove();
							$(".modal-backdrop").remove();
							get_params('params');
							var data = get_params("get_demogra");
							if(data == ""){
								display_modal();
							}
							continue_clicked = 0;

							return true;

						}

					return false;
				}
			},
			{
				'label': 'Continue',
				'class': 'btn-primary btn-continue btn-ok',
				'callback': function() {
				
				    $("#dob_error").css("display","none");
				    $("#gender_error").css("display","none");
				    if(continue_clicked == 0 && next()){
					$("#error2").html("");
					$(".registor").css("display","none");
					$("#registration").css("display","block");
					$('.modal-body').jScrollPane();
					$('.jspContainer').width($('.jspContainer').width() - 31);
					$('.jspPane').css({'margin-left':'0px','width':'590px'});
					continue_clicked = 1;
				    }
				    else if(continue_clicked == 1 && validation_2()){
					$("#error2").html("");
					$('.btn-send').css("display", 'inline-block');
					$('.btn-continue').css("display", 'none');
					$("#registration_communication").css("display","block");
					$("#registration").css("display","none");
					continue_clicked = 2;
				    }
				    if(continue_clicked == 1){
					var element = $('.modal-body').jScrollPane({});
					var api = element.data('jsp');
					api.destroy();
					$('.modal-body').scrollTop(0);
					$('.modal-body').jScrollPane();
					$('.jspContainer').width($('.jspContainer').width() - 31);
				    }
				    else if(continue_clicked == 2){
					var element = $('.modal-body').jScrollPane({});
					var api = element.data('jsp');
					api.destroy();
				    }	
				    return false;
				}
			}
			]);
			       $('.bootbox').css("width","600px");
			       $('.btn-send').css("display", 'none');
			       $(this).keyup(function(event){
				   if(event.keyCode == 13){
				       $(".btn-ok").click();
				   }
			       });
			      }
	else {
            bootbox.alert('We\'re still in the early stages of testing Lookit, and currently have as many users \
            as we can handle!  Thanks for your interest, and please check back in a few days to see if sign-up is open again.  \
In the meantime, check out our \'Resources\' page for fun activities you can try at home!');
	}
    }




var session;

// Function to populate the login pop-up and its functionality.
function login(html,expr,obje){

    bootbox.dialog(html,[
        {
            'label': 'Cancel',
            'class': 'btn-danger login-close',
            'callback': function() {
                return true;
            }
        },
        {
            'label': 'Login',
            'class': 'btn-primary btn-stop',
            'callback': function() {
                
                $("#pass_error").css("display","none");
                $("#email_error").css("display","none");
                $("#error").css("display","none");

                if($("#email").val() && $("#password").val()){
                    var x = call('login','./user.php');
                    var count = x.indexOf('error'); // Check for Database error
                    if(count == -1){
                        var responce = eval("(" + x + ')');
                        session = responce;
                        $("#reg1").html("<a href='#'' > Hi "+responce['name']+" </a>");
                        if(obje){
                            $(".bootbox").remove();
                            $(".modal-backdrop").remove();
                            if(check_browser_support()){
                                select_child(expr,obje);
                            }
                        }
                        else{
                            check_browser_support();
                        }
                        return true;
                    }
                    else{
                        $(".bootbox").remove();
                        $(".modal-backdrop").remove();
                        $("#reg1,#log1").css("display", "none");
                        $("#reg,#log").css("display", "block");
                        bootbox.alert("Error in database connection--please try again.");
                    }
                    return false;
                }
                else{
                    if($("#email").val() && ($("#password").val() == "")){
                        $("#pass_error").css({"display":"inline-block","margin-left":"10px","font-weight": "700"});
                    }
                    else if($("#password").val() && ($("#email").val() == "")){
                        $("#email_error").css({"display":"inline-block","margin-left":"10px","font-weight": "700"});
                    }
                    else{
                        $("#email_error").css({"display":"inline-block","margin-left":"10px","font-weight": "700"});
                        $("#pass_error").css({"display":"inline-block","margin-left":"10px","font-weight": "700"});
                    }
                    return false;
                }
            }
        }
    ]);
    $(this).keyup(function(event){
        if(event.keyCode == 13){
            $(".btn-stop").click();
        }
    });
}   

// Function to populate the reset password pop-up and its functionalites
function reset_pass(){
    
    $(".bootbox").remove();
    $(".modal-backdrop").remove();
    
    forgot_page = page.html('forgot_password');
    bootbox.dialog(forgot_page,[
    {
        'label': 'Cancel',
        "class": 'btn-danger reset-close',
        'callback': function() {
            return true;
        }
    },
    {
        'label': 'Send',
        'class': 'btn-primary btn-stop',
        'callback': function() {
            $("#email_blank").css("display","none");
            $("#email_error").css("display","none");
            
            var confirm_page = "";
            if($("#email").val()){
                var x = call('check','./user.php'); // Check if the entered email exists in db
                if(x){ // Show the confirmation pop-up
                    $.ajax({
                        'type': 'POST',
                        'url': './login.php',
                        async: false,
                        'data': {
				'email' : $("#email").val()
                        },
                        success: function(resp) {
                            confirm_page = resp;
                        }
                    });
                    $(".bootbox").remove();
                    $(".modal-backdrop").remove();
                    bootbox.alert(confirm_page);
                }
                else{
                    $("#email_error").css("display","block");
                    return false;
                }
            }
            else{
                    $("#email_blank").css("display","inline-block");
                    return false;
            }
        }
    }
    ]);
}

// Function to populate and display the Password reset pop-up to let the user enter his new password.
function save_pass(html){
    bootbox.dialog(html,[
    {
        'label': 'Cancel',
        "class": 'btn-danger',
        'callback': function() {
            return true;
        }
    },
    {
        'label': 'Save',
        'class': 'btn-primary btn-stop',
        'callback': function() {
            if(validation() == 1){
                var x = call('reset_pass','./user.php');
                if(x){
        			x1 = eval("(" + x + ')');
        			session = x1;
                    $("#reg1").html("<a href='#'' > Hi "+x1['name']+" </a>");
                    return true;
                }
            }
            else
            {
                $("#error").css("display","inline-block");
                $("#error").find("label").css({"font-weight": "700"});
                return false;
            }
        }
    }
    ]);


}

// Function to display the confirmation pop-up for displaying the demographic page after registration
function display_modal(){
    html = "Do you want to take the demographic survey now?";
    bootbox.dialog(html,[
    {
        'label': 'No',
        "class": 'btn-danger',
        'callback': function() {
            $(".bootbox").remove();
            $(".modal-backdrop").remove();
            check_browser_support();
            return true;
        }
    },
    {
        'label': 'Yes',
        'class': 'btn-primary btn-stop',
        'callback': function() {
            show_demographic();
            $(".bootbox").remove();
            $(".modal-backdrop").remove();
            check_browser_support();
        }
    }
    ]);
}

// Function to display and populate the demographic survey page
function show_demographic(){
    page.show("formDemographic");
    var data = get_params("get_demogra");
    console.log(data);
    populateForm(data);
}

// Fuction to populate the child and privacy selection pop-up for the experiment being participated
function select_child(expr,obje){
    //Create the child selection dropdown
    var new_page = "<form id = 'child_select'><label>Please select a child:</label><select id='child_list' name = 'participant'>";
    if(session.child_name instanceof Array){
        for(var i = 0; i < session.child.length; i++){
            new_page += "<option name = 'participants ' id = participant"+i+" value = "+session.child[i]+" >" + session.child_name[i] +"</option>";
        }
    }
    else{
        new_page += "<option name = 'participants' id = 'participant' value = "+session.child+" disabled = 'disabled' selected> " + session.child_name +" </option>";
    }
    new_page += "</select><input type = 'hidden' name='expriment_id' value="+expr.id+" /> </br></br>";
    new_page += "</form>";
    new_page += "<p>You will select a privacy level for your recordings at the end of the study.  Unless you allow the recordings to be used, no video except for the consent video will be viewed by anyone.</p>";
    show_childs(new_page,expr,obje);
}
var object_new;
var experiment_new;
// Function to create the child and privacy selection pop-up
function show_childs(html,expr,obje){
    object_new = obje;
    experiment_new = expr;

     bootbox.dialog(html,[
    {
        'label': 'Cancel',
        "class": 'btn-danger',
        'callback': function() {
            return true;
        }
    },
    {
        'label': 'Continue',
        'class': 'btn-primary btn-stop',
        'callback': function() {
            var json_string = JSON.stringify($('form').serializeObject());
            var new_var = JSON.parse(json_string);
            session['participant'] = new_var['participant'];
            session['expriment_id'] = new_var['expriment_id'];
            session['participant_privacy'] = 'INCOMPLETE';
            check_age(json_string,expr,obje);
        }
    }
    ]);
     $('input:radio[value = '+session["privacy"]+']').attr('checked', true);
}

// Function to check if the selected chiold is eligible to participate in the experiment
// and displaying the corresponding error pop-up.
function check_age(string,expr,obje){
     $.ajax({
        'type': 'POST',
        'url': './user.php',
        async: false,
        'data': {
            'table'     : 'users',
            'function'  : 'experiment_age',
            'json_data' : string
        },
        success: function(resp) {
            switch(resp){
                case '11':
                    var error_html = $('#child_list :selected').text()+" has already participated in this study.  Do you want to participate again anyway?";
                    get_permission(error_html,expr,obje);
                    break;
                case '00':
                    var error_html = $('#child_list :selected').text()+" does not meet the target age range for this study.  Do you want to participate anyway?";
                    get_permission(error_html,expr,obje);
                    break;
                case '01':
                    var error_html = $('#child_list :selected').text()+" has already participated in this study.  Do you want to participate again anyway?";
                    get_permission(error_html,expr,obje);
                    break;
                default:
                    var check_cam = "<p><h2 style='text-align:center'>Test your webcam and microphone </h2></p><div id='cam_setup'></div>";
                    $(".bootbox").remove();
                    $(".modal-backdrop").remove();
                    obje.loadExperiment(expr, '.content_pane');
                    break;
            }
        },
        failure: function(resp) {
            console.log(resp);
            result = false;
        }
    });
}

// Function to display the camera setup page and get user permission to access them.
function get_permission(err_html,expr,obje){
    bootbox.dialog(err_html,[
    {
        'label': 'No',
        "class": 'btn-danger',
        'callback': function() {
            return true;
        }
    },
    {
        'label': 'Yes',
        'class': 'btn-primary btn-stop',
        'callback': function() {
            var check_cam = "<p><h1 style='text-align:center'>Test your webcam and microphone </h1></p><div id='cam_setup'></div>";
            $(".bootbox").remove();
            $(".modal-backdrop").remove();
            obje.loadExperiment(expr, '.content_pane');
        }
    }
    ]);
}

// Function to set session array to a javascript variable
function set_to_session(){
    $.ajax({
        'type': 'POST',
        'url': './user.php',
        async: false,
        'data': {
            'table'     : 'users',
            'function'  : 'params',
            'json_data' : 'string'
        },
        success: function(resp) {
            //alert(resp);
        }
    });
}

// Function to set the session dat and the demographic form data
function get_params(fun){
    var sending;
    var flag = 1;
     $.ajax({
        'type': 'POST',
        'url': './user.php',
        async: false,
        'data': {
            'function'  : fun,
        },
        success: function(resp) {
            if (resp) {
                var x = eval( '(' + resp + ')' );
                if(fun == "get_demogra"){// Check if demographic form data
                    for (var prop in x){
                        if(prop == "_id"){
                            continue;
                        }
                        else{
                            if(((x[prop]) != "" && (x[prop]) != "Select..." && (x[prop]) != session['id'] && x[prop] != session['email'])){
                                flag = 0;
                                break;
                            }
                        }
                    }
                    if(flag == 0){
                        sending = x;
                    }
                    else{
                        sending = "";
                    }
                }
                else{// Check if session data
                    session = x;
                }
            }
            else{
                sending ="";
            }
        }
    });
    return sending;
}

// Function to display the camera widget on the screen
function show_cam(caller,div_c){

    $("#"+div_c).wrap("<div id='widget_holder1'></div>");
    div_c = "widget";

    start_cam(div_c);

    $("#setup_message").append($("#message"));                                                                   
    $("#message").css({'display':'block'});                                                                        
    $("#message").css({'visibility':'visible'});

    $(".bootbox").css({"width":"790px","height":"650px"});
    $(".modal-body").css({"max-height":"550px","height":"550px"});
    $('.bootbox').css('margin-top',(-$('.bootbox').height())/2);
    $('.bootbox').css('margin-left',(-$('.bootbox').width())/2);
    $("#widget_holder").css({"height":"400px","width":"733px","display":"block","visibility":"visible"});
    $('#cam_setup').height($('#widget_holder').height());
    $("#widget_holder1").css({"margin-left":"5px"});
    $('#widget_holder').offset($('#widget_holder1').offset());
    $("#widget_holder").css({"position":"relative","z-index":"1051","overflow":"hidden"});
    $('body').css("overflow","hidden");
    $("#widget").css("height","400px");
    $("#widget_holder").offset($("#widget_holder1").offset());
}
/* Widget to be setup once the consent is recorded for further recording throughout the study */
function show_cam_widget(caller,div_c){
    if(div_c == 'webcamdiv'){
	div_c = "widget_holder";
	$("#"+div_c).wrap("<div id='widget_holder1'></div>");
	$("#widget_holder1").css({"height":"0px"});
	$("#widget_holder1").css({"width":"50%"});
	$("#message").css({'display':'none'});
    }
    start_cam(div_c);
    $("#setup_message").append($("#message"));
    $('.btn-record').attr('disabled', 'disabled');
}

function start_cam(div_c){
    var no_flash = "<p>To view this page ensure that Adobe Flash Player version </br>11.1.0 or greater is installed. </p></br>";
    no_flash += "<a href='https://www.adobe.com/go/getflashplayer'><img src='https://www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player' /></a>";
    $("#"+div_c).html(no_flash);
    // For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection. 
    var swfVersionStr = "11.1.0";
    // To use express install, set to playerProductInstall.swf, otherwise the empty string. 
    var xiSwfUrlStr = "playerProductInstall.swf";
    var flashvars = {
                        'width'  :  450, // Set the width and height of the widget here
                        'height' :  300
                    };
    var params = {};
    params.quality = "high";
    params.bgcolor = "#ffffff";
    params.wmode = "transparent";
    params.allowscriptaccess = "always";
    params.allowfullscreen = "true";
    var attributes = {};
    attributes.id = "flashplayer";
    attributes.name = "flashplayer";
    attributes.align = "middle";
    swfobject.embedSWF("./camera/Flashms.swf", div_c, "100%", "400px", swfVersionStr, xiSwfUrlStr, flashvars, params, attributes);    
    swfobject.createCSS("#"+div_c, "display:block;text-align:center;");
}

// Function to remove the camera widget from the screen
function hide_cam(div_c){
    $("body").append($("#message"));
    $("#widget_holder").css({'visibility':'hidden'});
    $("#message").css({'visibility':'hidden'});
    $("#widget_holder").css("height","0px");
    $("#widget").css("height","0px");
    $("body").css("overflow","auto");
    //swfobject.getObjectById('flashplayer').setup();
}

//Function to show widget in getting setup page
function show_getting_setup_widget(caller,div_c){
    $("#widget_holder").css({"height":"400px"});
    $('#webcamdiv').height($('#widget_holder').height());
    $('#widget_holder').offset($('#webcamdiv').offset());
    $('#widget_holder').css({'position':'absolute','top':'200px','visibility':'visible','z-index':'1040'});

}


// Function to check if the entered date is in the correct format
function isValidDate(date)
{
    var matches = /^(\d{2})[\/](\d{2})[\/](\d{4})$/.exec(date);
    if (matches == null) return "format";
    //else return true;
    var d = matches[2];
    var m = matches[1] - 1;
    var y = matches[3];
    var today = new Date();
    var composedDate = new Date(y, m, d);

    if(!(composedDate.getDate() == d && composedDate.getMonth() == m && composedDate.getFullYear() == y)){
        return "date";
    }
    else if(!(9)){
        return "date";
    }
    
}

//Function to submit the demographic survey form data to the database
function demographic(param){
    var json_string = JSON.stringify($('form').serializeObject());
    $.ajax({
        'type': 'POST',
        'url': './user.php',
        async: false,
        'data': {
            'table'    : 'users',
            'json_data': json_string,
            'function' : 'demogra'  
        },
        success: function(resp) {
            if(resp)
            {
                if(param == "expr"){
                    advanceSegment();
                }
                else{
                    page.show("about");
                }
            }
        },
        failure: function(resp) {
        }
    });
}

// Function to populate a form with the data provided.
function populateForm(data, form) {
    $.each( data, function(name, value) {
        var input = $(":input[name='" + name + "']:not(:button,:reset,:submit,:image)", form );
        input.val( ( !$.isArray( value ) && ( input.is(':checkbox') || input.is(':radio') ) ) ? [ value ] : value );
    } );
};

_connected = 0;

// Function to check when the mic and camera setup is completed. 
function connected_mic_cam(){
    if(consent_recording_completed == 0){
	_connected = 1;
	$('.btn-continue').css("display","inline-block");
    }
    else{
	if(record_whole_study != undefined && record_whole_study){
	    $('.modal').remove();
	    $('body').removeClass('modal-open');
	    $('.modal-backdrop').remove();

	    addEvent( {'type': 'endLoading'});

 // Allow the user to end the experiment by pressing 'Home' or 'End' keys.
	    document.addEventListener('keydown', getKeyCode, false);

		jswcam.startRecording();
		addEvent( {'type': 'startRecording'});

	    consent_recording_completed = 1;
 // Start the experiment
	    advanceSegment();
	}
    }
}


// Function to display the popup to allow user to withdraw the recordings at the end of experiment
function done_or_withdraw(experiment,DEBRIEFHTML){
    //$("#flashplayer").remove();
    $("#widget_holder1").attr('id','widget_holder');
	
	// FIRST do the privacy information, INCLUDING withdraw option.
	var post_data;
	var privacy_page = page.html("privacy");
	
	bootbox.dialog(privacy_page,[{
		'label': 'Submit',
		"class": 'btn-primary reset-close',
		'callback': function() {
			if($('input[name=participant_privacy]:checked').length > 0){
				var privacy_level = $("input[type='radio'][name='participant_privacy']:checked").val();
				experiment.privacy_confirmation = $('#confirmfree').val();
				experiment.privacy_level = privacy_level;
				post_data = {
					'continue' : 'true',
					'privacy'  : privacy_level
				};
				if (privacy_level=='withdraw') {
					post_data =  {'withdraw' : 'true'};
				}
				send_post_data(post_data);
				show_debrief_dialog();
				return true;
			}
			else{
				$("#error").html("<b style='color: #FF0000'>Please select a privacy level for the experiment.</b>");
				return false;
			}
		}
	}]);

	}
	
function show_debrief_dialog(post_data) {
    window.onbeforeunload = [];
    bootbox.dialog(generate_debriefing(), [{
        'label': 'Done',
        "class": 'btn-primary reset-close',
        'callback': function() {
            // Return back to the accounts page
            $("body").css("background-color","#FFFFFF");
            $(".bootbox").remove();
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            page.toggleMenu(true);
            page.show('account');
            return true;
        }
    }]);
    
    send_post_data(post_data);
    return true;
}



function send_post_data(post_data){
    // Use the privacy settings to name videos accordingly.
    $.ajax({
        'type': 'POST',
        'url': './camera/convert.php',
        'data': post_data,
        'success': function(resp) {
            console.log(resp);
        },
        'failure': function(resp) {
            window.onbeforeunload = [];
            console.log(resp);
        }
    });

    // As long as the user did not withdraw, also do a final DB update.
    if ('continue' in post_data) {
        $.ajax({
            'type': 'POST',
            'url': './user.php',
            'data': {
                'table'        : 'users',
                'json_data'    : experiment,
                'function'     : 'set_account'
            },
            success: function(resp) {
                console.log('Final database update');
            }
        });
    }
    $("#flashplayer").remove();
    $("#widget_holder").append("<div id='widget'></div>");
    $("#widget_holder").css("display","none");
    return true;
}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {
    }

}

// Receiving the average brightness of the feed being displayed.
function avarageBrightness(brightness){

}

function audioVideoData(audioData,videoData){
    if((audioData < 100 || videoData < 100) && $('body').hasClass('modal-open') && $("div#experiments").length == 1){
        hide_cam('consent');
        $(".bootbox").remove();
        $(".modal-backdrop").remove();
        object_new.loadExperiment(experiment_new, '.content_pane');
        $("#message").after("<span class='error' style='color:red;'>It seems that either your video or audio was missing in the recorded message, please try again.</span>");
        $('.btn-continue').attr('disabled', false);
        $('.btn-continue').css("display","inline-block");
        $("#widget_holder").css({'pointer-events':'all'});
        swfobject.getObjectById('flashplayer').setup();
    }
    else{
        done = 1;
        $('.btn-send').attr('disabled', false);
        $('.waiting').remove();
        return done;
    }
}

function check_browser_support(){
    var browser = (new WhichBrowser()).browser.name.toString();
    var os = (new WhichBrowser()).os.name.toString();

    if($.inArray(browser,unsupportedBrowsers) >= 0 && $.inArray(os,unsupportedOS) >= 0){
        var html = "This is not a supported browser. To participate in an experiment please access using any of the following browsers: Chrome, Firefox, or Internet Explorer 11+";
        bootbox.alert(html);
    }
    else{
        return true;
    }
}

// Function to determine the visible height of a div on scrolling up or down inside the modal pop-up.
function computeVisibleHeight ($t) {
    $t = $($t);
    var top = $($t).position().top;
    var windowHeight = $("modal-body").height();
    var scrollTop = $("modal-body").scrollTop();
    var height = $t.height();

    if (top < scrollTop && height - scrollTop >= windowHeight) {
        // first case: the top and the bottom of the element is outside of the window
        return windowHeight;
    } else if (top < scrollTop) {
        // second: the top is outside of the viewport but the bottom is visible
        return height - (scrollTop - top);
    } else if (top > scrollTop && top + height < windowHeight) {
        // the whole element is visible
        return height;
    } else {
        // the top is visible but the bottom is outside of the viewport
        return windowHeight - (top - scrollTop);
    }
}
