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

// Function to Send a call to the database script and get the responce data back
function call(str,url){
var result;
var json_string = JSON.stringify($('form').serializeObject());

if(json_string != "" && str == "check"){
    json_string = "{\"email\":\""+$("#email").val()+"\"}";
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

    $('#log').click(function(){
            var req = new XMLHttpRequest();
            req.open("POST", "./login/login.html", false);
            req.send(null);
            var login_page = req.responseText;
            login(login_page,"","");
    });
    
    if($("#reset").val()){
        var email = $("#reset").val();
        var req = new XMLHttpRequest();
            req.open("POST", "./login/reset.php?email="+email, false);
            req.send(null);
            var reset_page = req.responseText;
            save_pass(reset_page);
    }

    $("#reg").click(function(){
        register();
    });

    $("#reg1").click(function(){
        page.show("account");
    });

    $("#demo a").click(function(){
        page.show("account");
    });

    $('body').bind('showaccount', function(evt) {
        var participated=get_list();
        if(participated != ""){
            page.buildExperimentGallery('#experi', participated);
        }
        else{
            $("#message").html("<b>You have not participated in any studies.</b>");
        }
    });

    get_params('params');
    $('.bootbox').css('margin-top',(-$('.bootbox').height())/2);
    $('.bootbox').css('margin-left',(-$('.bootbox').width())/2);
});
var responce;

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
    if (is_new) {
    // First check if we already have too many user accounts
		$.ajax({
			'type': 'POST',
			'url': 'user.php',
			async: false,
			'data': {
			    'experiment_id' : "users",
			    'function' : 'checknumber',
			    'table': "users",
			},
			'success': function(resp) {
				too_many_accounts = resp;
			},
			'failure': function(resp) {
			}
		    });
	}

    if (!too_many_accounts) {
		$(".bootbox").remove();
		$(".modal-backdrop").remove();
		
		var continu = 0;
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
						if($("#reg1").css("display") == "block"){
							$('body').bind('showaccount', function(evt) {
								var participated=get_list();
								if(participated != ""){
									page.buildExperimentGallery('.account', participated);
								   
								}
								else{
									$("#message").html("<b>You have not participated in any studies yet.</b>");
								}
							});
						}
					}
					if($("#reg1").css("display") != "block"){
						$("#reg,#log").css("display", "block");
					}
					cancel_clicked =1;
					continu = 0;
					return true;
				}
			},
			{
				'label': 'Register',
				'class': 'btn-success btn-send btn-ok',
				'callback': function() {
					
					$("#dob_error").css("display","none");
					$("#gender_error").css("display","none");
					if(continu == 1){
						if(validation_2() == 1){
							
							var myname = call('','./user.php');
							
							$("#reg1,#log1").css("display", "block");
							$("#reg,#log,.login_form").css("display", "none");
							$("#reg1").html("<a href='#'' > Hi "+myname+" </a>");
							
							if(!cancel_clicked){
								
								$('body').bind('showhome', function(evt) {
									page.buildExperimentGallery('#experiments', experiments);
								});
								$('body').bind('showaccount', function(evt) {
									var participated=get_list();
									if(participated != ""){
										page.buildExperimentGallery('.account', participated);
								
									}
									else{
										$("#message").html("<b>You have not participated in any studies.</b>");
									}
								});
							}
							$(".bootbox").remove();
							$(".modal-backdrop").remove();
							get_params('params');
							var data = get_params("get_demogra");
							if(data == ""){
								display_modal();
							}
							continu = 0;

							return true;

						}
						else{
							$('.modal-body').scrollTop(0);
							$("#error2").html($("#error").html());
							$("#error2").find("label").css({"font-weight": "700"});
							return false;
						}
					}
					return false;
				}
			},
			{
				'label': 'Continue',
				'class': 'btn-primary btn-continue btn-ok',
				'callback': function() {
					$("#error").html("");
					
					$("#dob_error").css("display","none");
					$("#gender_error").css("display","none");
					if(next()){
						$('.btn-send').css("display", 'inline-block');
						$('.btn-continue').css("display", 'none');
					}
					continu = 1;
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
		if (!is_new) {
					$('#registrationTitle').text('Confirm account details');
					$('#regPromptText').text('');
				 }
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
                            select_child(expr,obje);
                        }
                        return true;
                    }
                    else{
                        $(".bootbox").remove();
                        $(".modal-backdrop").remove();
                        $("#reg1,#log1").css("display", "none");
                        $("#reg,#log").css("display", "block");
                        bootbox.alert("Error in database connection, Please Try again.");
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
            return true;
        }
    },
    {
        'label': 'Yes',
        'class': 'btn-primary btn-stop',
        'callback': function() {
            show_demographic();
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
     $.ajax({
        'type': 'POST',
        'url': './user.php',
        async: false,
        'data': {
            'table'     : 'users',
            'function'  : 'child'
        },
        success: function(resp) {
            if(resp)
            {
                var responce = eval("(" + resp + ')');
                //Create the child selection dropdown
                var new_page = "<form id = 'child_select'><label>Please Select a child:</label><select id='child_list' name = 'participant'>";
                if(responce.child_name instanceof Array){
                    for(var i = 0; i < responce.child.length; i++){
                        new_page += "<option name = 'participants ' id = participant"+i+" value = "+responce.child[i]+" >" + responce.child_name[i] +"</option>";
                    }
                }
                else{
                    new_page += "<option name = 'participants ' id = participant"+i+" value = "+responce.child+" disabled = 'disabled' selected> &nbsp;&nbsp;" + responce.child_name +" </option>";
                }
                new_page += "</select><input type = 'hidden' name='expriment_id' value="+expr.id+" /> </br></br>";
                new_page += page.html("privacy");
                new_page += "</form>";
                show_childs(new_page,expr,obje);
                
            }
            else{
                $("#error").css("display","block");
            }
        },
        failure: function(resp) {
		  alert("failed");
        }
    });
}

// Function to create the child and privacy selection pop-up
function show_childs(html,expr,obje){
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
            session['participant_privacy'] = new_var['participant_privacy'];
            session['expriment_id'] = new_var['expriment_id'];
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
                    var error_html = $('#child_list :selected').text()+" has already participated in this trial.  Do you want to participate again anyways?";
                    get_permission(error_html,expr,obje);
                    break;
                case '00':
                    var error_html = $('#child_list :selected').text()+" does not meet the target age range of this trial.  Do you want to participate anyways?";
                    get_permission(error_html,expr,obje);
                    break;
                case '01':
                    var error_html = $('#child_list :selected').text()+" has already participated in this trial.  Do you want to participate again anyways?";
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
            var check_cam = "<p><h1 style='text-align:center'>Test Your Webcam and Microphone </h1></p><div id='cam_setup'></div>";
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
    $('#'+div_c).append($('#widget_holder'));
    $("#message").css({'visibility':'visible'});
    $(".bootbox").css({"width":"790px"});
    $(".bootbox").css({"height":"650px"});
    $("#widget_holder").css({'visibility':'visible'});
    $("#widget_holder").css("height","450px");
    $("#widget").css("height","450px");
    $(".modal-body").css("max-height","550px");
    $(".modal-body").css("height","550px");
    $('.bootbox').css('margin-top',(-$('.bootbox').height())/2);
    $('.bootbox').css('margin-left',(-$('.bootbox').width())/2);
}

// Function to remove the camera widget from the screen
function hide_cam(div_c){
    var cloning = $("#widget_holder").clone();
    $('body').append($('#widget_holder'));
    $("#widget_holder").css({'visibility':'hidden'});
    $("#message").css({'visibility':'hidden'});
    $("#widget_holder").css("height","0px");
    $("#widget").css("height","0px");
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
    _connected = 1;
    $('.btn-continue').css("display","inline-block");
}
