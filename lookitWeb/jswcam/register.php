<?php 

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

session_start();

if(isset($_SESSION['user']['submitted_form_values'])){extract($_SESSION['user']['submitted_form_values']);}
$k = 0;

// Set the  parameter value if there or set the default value.
function set_value($name,$default,$k){
	if(isset($_SESSION['user'][$name])){
		if(count($_SESSION['user'][$name]) > 1){
			print stripslashes($_SESSION['user'][$name][$k]);
		}
		else
		{
			print stripslashes($_SESSION['user'][$name]);
		}
	}
	else{
		print $default;
	}
}

?>   

<link rel="stylesheet/css" type="text/css" href="static/js/jquery-ui-1.10.4.custom/css/ui-lightness/jquery-ui-1.10.4.custom.min.css"></link>
<script src="static/js/jquery-1.8.1.min.js"></script>
<script src="static/js/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.min.js"></script>
<link type="text/css" href="static/css/jquery.jscrollpane.css" rel="stylesheet" media="all" />
<style type="text/css">
input[type="radio"] {
    margin-top: 3px;
    vertical-align: top;
    margin-right: 3px;
}
input[type="checkbox"] {
    margin-top: 3px;
    vertical-align: top;
    margin-right: 3px;
}
.cancel:hover{
	cursor: pointer;
}

div#test input#gender_ {width: 13px;}
div#test input {width: 100px;}
label.mdy{margin-left: -60px;}
.modal-body{overflow:hidden;width:100% !important;}
.jspVerticalBar{ width:7px;}
.jspDrag {background: none repeat scroll 0 0 #666666; border-radius: 5px;}
 #test table{border-collapse: separate; margin-right: 20px;}
</style>
<!-- the mousewheel plugin - optional to provide mousewheel support -->
<script type="text/javascript" src="static/js/jquery.mousewheel.js"></script>

<!-- the jScrollPane script -->
<script type="text/javascript" src="static/js/jquery.jscrollpane.min.js"></script>

<script src="./login/json.js" type="text/javascript"></script>
<script>
var temp;
$(document).ready(function() {
	$(".cancel").bind("contextmenu",function(e){
        e.preventDefault();
        //alert("Right Click is not allowed");
    });

	var count = <?php echo count($_SESSION['user']['dob']) ?>;
	temp = count;	
	if($("#email").val() != ""){
		$("#email").attr("readonly","readonly");
	}
	
	
	$( ".datepicker" ).datepicker({
		changeMonth: true,
		changeYear: true
	});
	
	i = 1;
	j = 1;
	range = 4;
	<?php 
		$count = count($_SESSION['user']['dob']);
		$k=0;
		for($i = 1; $i < $count; $i++){ ?>
			clone("preset");
	<?php $k++;} ?>

});
var i ;
var j;
var range ;
var s = [""];

// Function to copy the child data table when adding more childs and populate the data into it if user is editting the details.
function clone(chck_str){

	if(i <= range){
		s[i] = "";

		var Clonedtable = jQuery("#child").clone(true);
		console.log(Clonedtable);
		Clonedtable.css("display","block");
		Clonedtable.attr("id","child"+j);
		Clonedtable.attr("name","child"+j);
		var date_id;
		Clonedtable.find("*[id]").andSelf().each(function() {
			$(this).attr("id", $(this).attr("id") + j);
			var name = $(this).attr("name");
			if(name == "gender_" )
			{
				$(this).attr("name", $(this).attr("name") + j);
			}

			$(this).find('input[type=text]').val("");
			$(this).find('input[type=radio]').removeAttr('checked');
		});
		Clonedtable.find("tr:first").html('<td colspan="3"><input type="hidden" id="name" name="child" value="child'+j+'"/></td>');

		Clonedtable.find("tr:first").next().html('<td colspan="3"> Child '+(i+1)+'</td>');
		if(chck_str != ""){
			Clonedtable.find("tr:last").children().children().removeClass("cancel");
		}
		Clonedtable.appendTo('#test');
		if(chck_str == ""){
			$(".cancel").css("display","block");
		}
		Clonedtable.find("*[id]").andSelf().each(function() {
			$(this).find('input[type=radio]').removeAttr('checked');
			$(this).removeClass('hasDatepicker');
			if($(this).hasClass('datepicker')) {
				date_id = this.id;
			}
			if($(this).attr('name') == 'days'){
					$(this).val(0);
				}
				if($(this).attr('name') == 'weeks'){
					$(this).val(0);
				}
			if(chck_str == "preset"){

				if($(this).attr('name') == 'child_name'){

				$(this).val(session['child_name'][i]);
				}

				if($(this).attr('name') == 'dob'){

				$(this).val(session['dob'][i]);
				}
				if($(this).attr('name') == 'days'){
					$(this).val(session['days'][i]);
				}
				if($(this).attr('name') == 'weeks'){
					$(this).val(session['weeks'][i]);
				}
				if($(this).attr('name') == 'gender_'+i){

					<?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'][$k] == "boy"){?>
						$("#gender"+i).val("boy");
						$("#gender_boy"+i).attr("checked","checked");

					<?php } elseif(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'][$k] == "girl"){ ?>
						$("#gender"+i).val("girl");
						$("#gender_girl"+i).attr("checked","checked");
						
					<?php } elseif(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'][$k] == "other"){ ?>
						$("#gender"+i).val("other");
						$("#gender_other"+i).attr("checked","checked");
						
				<?php }	$k++;?>
				}
			}				
			$('#'+date_id).next().next().remove();
		});
		i++;
		j++;
   		$('.modal-body').jScrollPane();
	}
	
	$(".datepicker").datepicker({
			changeMonth: true,
			changeYear: true
		});
}	

// Serialize the data and return its object
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

// Set the radio button value in the text box to be stored in the db.
function set(radio){
	var val_ = $(radio).val();
	var td = $(radio).attr("name");
	td = td.substr(-1);
	if(td == '_'){td = ''};
	$("#gender_"+val_+td).closest("td").parent().children().next().next().children().eq(0).val(val_);
}

var result;
var move;

// Function to populate the second page of the registration pop-up if first is completely filled.
function next(){
	var re = 0;

	if(validation()){
		re =1;

		var json_string = JSON.stringify($('#email').serializeObject());
		$.ajax({
			'type': 'POST',
			'url': 'user.php',
			async: false,
			'data': {
			    'experiment_id' : "users",
			    'json_data': json_string,
			    'function' : 'check',
			    'table' : 'users'  
			},
			'success': function(resp) {
				result = resp;

				if((!result) || (temp > 0) ){
					$(".registor").css("display","none");
					$("#registration").css("display","block");
					move = 1;
				}
				else{
					$("#error").children().css("display","none");
					$("#error1").html($("#error").html());

					move = 0;
				}	
			},
			'failure': function(resp) {

			}
		    });
		$("#error").children().css("display","none");
		return move;
	}
	else{

		$("#error1").html($("#error").html());
		$("#error1").find("label").css({"font-weight": "700"});
		$(".error").focus();
	}

	return re;
};

// Validations for the first page of the registration pop-up,
// Validations for Name, email, password and confirm password.
function validation(){
	var valii = 1;
	var pass = 1;

	$("#error").html("");
	if($("#name")){// validations for name

		if($("#name").val() == ""){
			$("#error").append('<label id="name_error" class="error">Please enter your name.<br></label>');
			valii = 0;
		}
	}
	if($("#email")){// Validations for email
		var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
		if($("#email").val() == ""){
			$("#error").append('<label id="email_error" class="error">Please enter your email address.<br></label>');
			valii = 0;
		}
		else if(!pattern.test($("#email").val())){
			$("#error").append('<label id="email_error" class="error">Please enter a valid email address.<br></label>');
			valii = 0;
		}
		else{// Check if email already exists.
			var json_string = JSON.stringify($('#email').serializeObject());

			$.ajax({
				'type': 'POST',
				'url': 'user.php',
				async: false,
				'data': {
				    'experiment_id' : "users",
				    'json_data': json_string,
				    'function' : 'check',
				    'table' : 'users'  
				},
				'success': function(resp) {


					if(resp && temp == 0){
						$("#error").append('<label id="email_error" class="error">Email address already exists.</br></label>');
						valii = 0;
					}	
				},
				'failure': function(resp) {}
		    });
		}
	}
	if($("#password")){// validations for password.
		if($("#password").val() == ""){
			$("#error").append('<label id="password_error" class="error">Please enter a password.<br></label>');
			valii = 0;
		}
		else if($("#password").val().length < 5){
			$("#error").append('<label id="password_error" class="error">Your password must be at least 5 characters long.<br></label>');
			pass = 0;
			valii = 0;
		}
	}
	if($("#confirm_password")){// validations for confirm password.
		if($("#confirm_password").val() == ""){
			$("#error").append('<label id="password_error" class="error">Please re-enter your password to confirm it.<br></label>');
			valii = 0;
		}
		else if(pass == 1 && (($("#confirm_password").val().length < 5) || ($("#confirm_password").val() != $("#password").val()) )){
			$("#error").append('<label id="password_error" class="error">Your password confirmation does not match. Please re-enter your password to confirm it.<br></label>');
			valii = 0;
		}
	}
	return valii;
}

// Remove the child on click , if added by mistake
function remove1(closed){

	var z = 1;
	$(closed).closest("table").remove();
	$(".count").closest("table").each(function(){
		$(this).find("tr").parent().children().next().find("td").first().html("Child " + z);
   		z = z+1;
	});
	i -= 1;
}

// Validations for child details page of the registration pop-up
function validation_2(){
	var valii = 1;
	var s = []; 
	$("#error").html("");
	if($("input[name = child_name]")){// validation for Child's name
		var i = 1;
		$(".chile_name").each(function(){
			s[i] = "";
			if(($(this).attr("id") != 'child_name') && ($(this).val() == "")){
				s[i] += '<label id="child_name_error" class="error">Please enter the name of Child '+ i +'.<br></label>';
				valii = 0;
			}
			i++;
		});
	}
	if($("input[name = dob]")){// Validations for date of birth
		var i = 1;
		$(".datepicker").each(function(){
			if($(this).attr("id") != 'dp'){
		        if($(this).val() == "" || $(this).val() == "MM/DD/YYYY"){
		            s[i] += '<label id="dob_error" class="error">Please enter the date of birth of Child '+ i +'.<br></label>';
	    	        valii = 0;
	        	}
		        else if(isValidDate($(this).val()) == "format"){
		            s[i] += '<label id="dob_error" class="error">Please enter the date of birth of Child '+ i +' in correct format.<br></label>';
	    	        valii = 0;
	        	}
	        	else if(isValidDate($(this).val()) == "date"){
		            s[i] += '<label id="dob_error" class="error">Please enter a valid date of birth of Child '+ i +' .<br></label>';
	    	        valii = 0;
	        	}
	        }
	        i++;
	    });
	}
	if($("input[name = gender]")){ // Validations for Gender
		var i = 1;
	    $(".gender").each(function(){
	        if(($(this).attr("id") != 'gender') && ($(this).val() == "")){
	            s[i] += "<label id='gender_error' class='error'>Plese select the gender of Child "+ i +".<br></label>";
	            valii = 0;
	        }
	        i++;
	    });
	}
	for(var x=0;x<$('.chile_name').length;x++){
		if($('.chile_name').length == 1){
			$("#error").append("<label id='child_error' class='error'>Please enter at least one child's details.<br></label>");
			valii = 0;
		}
		$("#error").append(s[x]);
	}
	
	return valii;
}


</script>
<div id="error" style="display:none;">
	<label id="dob_error" class="error" for="dob" style="display:none"></label>
	<label id="gender_error" class="error" for="gender" style="display:none">Please select a gender.</label>
</div>
<div id ="position" style=" /*width:700px; margin-left:auto;margin-right:auto;*/">
	<h1 id="registrationTitle" style="text-align: center;">Registration</h1>
	<form id="register_form" method="POST" action="">

		<div class ="registor">
			<p style="text-align: center;" id='regPromptText'>	Please enter login details	</p>
		    <div id="error1" ></div>

			<p>Name <input type="text" name="name" id="name" style="margin-left: 118px;" value="<?php set_value('name','',$k); ?>"/> </p>			
			<p>Email Address<input type="text" name="email" id="email" style="margin-left: 68px;" value="<?php set_value('email','',$k) ?>"/>  </p>		
			<p>Password <input type="password" name="password" id="password" style="margin-left: 94px;" value="<?php set_value('password','',$k) ?>"/> </p>		
			<p>Confirm Password <input type="password" name="confirm_password" id="confirm_password" style="margin-left: 41px;"/> </p>	
			<p><input type= "hidden" name="id" value="<?php echo $_SESSION['user']['id'] ?>"></p>
		</div>
		<div id = "registration" style="display:none">
			<div id = "regis">

			    <div id="error2">
					<label id="dob_error" class="error" for="dob" style="display:none">Please enter the Date of Birth.</br></label>
					<label id="gender_error" class="error" for="gender" style="display:none">Please select a gender.</label>
			    </div>
				<p>1.Please enter information for your child</p>
				<div>
					<div id = "test">
						<TABLE id = "child0" name="child0" BORDER='0' CELLPADDING='5' CELLSPACING='5'  style="border: 1px solid #d8d8d8;padding: 10px; margin-bottom:10px;">	
						<tr>
							<td colspan="3"><input type="hidden" id="name" name="child" value = "child0"/></td>	
						</tr>
						<tr>
							<td colspan="3"> Child 1</td>
						</tr>
						<tr>		
							<td width="30%" >Child's Name </td>		
							<td width="30%" style="padding-top:10px"><input  type="text" value="<?php set_value('child_name','',0) ?>" id="child_name0" class="chile_name" name="child_name"/></td>
							<td width="30%"></td>	
						</tr>
						<tr>		
							<td>Child's Birthdate </td>		
							<td><input  type="text" placeholder='MM/DD/YYYY' value="<?php set_value('dob','',0) ?>" id="dp0" class="datepicker" name="dob"/></td>
							<td><label class = "mdy"> MM/DD/YYYY</label></td>	
						</tr>
						<tr>		
							<td>Gender</td> 		
							<td><input id="gender_boy" type="radio" name="gender_" value="boy" onclick="set(this);" style="width: 13px;" <?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'] == "boy"){print " checked=\"checked\"";} elseif(count($_SESSION['user']['gender']) >1 && $_SESSION['user']['gender'][0] == "boy" ){print " checked=\"checked\"";}?>> Male</td>
							<td style="display:none"><input type="hidden" class="gender" id="gender0" name="gender" value="<?php set_value('gender','',0) ?>"/></td>	
							<td><input id="gender_girl" type="radio" name="gender_" value="girl" onclick="set(this);" style="width: 13px; margin-left:-70px;" <?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'] == "girl"){print " checked=\"checked\"";} elseif((count($_SESSION['user']['gender']) >1) && ($_SESSION['user']['gender'][0] == "girl") ){print " checked=\"checked\"";}?>> Female</td>
							
							<td><input id="gender_other" type="radio" name="gender_" value="other" onclick="set(this);" style="width: 13px; margin-left:-70px;" <?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'] == "other"){print " checked=\"checked\"";} elseif((count($_SESSION['user']['gender']) >1) && ($_SESSION['user']['gender'][0] == "other") ){print " checked=\"checked\"";}?>> Other/prefer not to answer</td>
							
						</tr>	
						<tr>		
							<td>Gestational age at birth </td>	

							<td>
								<select name="weeks" id=" weeks0" class="weeks" value = "<?php set_value('weeks',0,0) ?>">
									<option value="na">Not sure or prefer not to answer</option>
									<option value="43">Over 42</option>
									<option value="42">42</option>
									<option value="41">41</option>
									<option value="40" selected>40 (around due date)</option>
									<option value="39">39</option>
									<option value="38">38</option>
									<option value="37">37</option>
									<option value="36">36</option>
									<option value="35">35</option>
									<option value="34">34</option>
									<option value="33">33</option>
									<option value="32">32</option>
									<option value="31">31</option>
									<option value="30">30</option>
									<option value="29">29</option>
									<option value="28">28</option>
									<option value="27">27</option>
									<option value="26">26</option>
									<option value="25">25</option>
									<option value="24">24</option>
									<option value="23">Under 24</option>
								</select>
								<label for="weeks">Weeks</label>
							</td>							
						</tr>
						<tr>
							<td colspan="3" ><div class ="cancel count" style="display:none;"></div></td>
						</tr>
						</TABLE>
					</div>
				</div>
				<input type="button" class="btn-success" id = "add" onclick="clone('');" value = "Add another child's information" style="font-size: large;font-weight: bold;"/>
				<table>
				<tr><td></br></td></tr>
				<tr><td colspan="2">2. Select communication preferences: I would like to be contacted when...</td></tr>

				<tr>	<td>	<input class="checkbox" type="checkbox" name="preference" value="researchers" <?php if(isset($_SESSION['user']['preference']) && in_array("researchers",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/></td><td>Researchers have questions about my responses.</td></tr>
				<tr>	<td>	<input class="checkbox" type="checkbox" name="preference" value="updates" <?php if(isset($_SESSION['user']['preference']) && in_array("updates",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/></td><td>New studies are available for my child(ren).</td></tr>
				<tr>	<td>	<input class="checkbox" type="checkbox" name="preference" value="results" <?php if(isset($_SESSION['user']['preference']) && in_array("results",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/></td><td>Results of a study we participated in are published.</td></tr>
								<input class="checkbox" type="hidden" name="preference" value="no_mails" <?php if(isset($_SESSION['user']['preference']) && in_array("no_mails",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/><br>
				</table>

			</div>
		</div>
	</form>
</div>
<TABLE id = "child" name="child" BORDER='0' CELLPADDING='5' CELLSPACING='5'  style="border: 1px solid #d8d8d8;padding: 10px; margin-bottom:10px; display:none">	
	<tr>
		<td colspan="3"><input type="hidden" id="name" name="child" value = "child"/></td>	
	</tr>
	<tr>
		<td colspan="3"> Child 1</td>
	</tr>
	<tr>		
		<td width="30%" >Child's Name </td>		
		<td width="30%" style="padding-top:10px"><input  type="text" value="" id="child_name" class="chile_name" name="child_name"/></td>
		<td width="30%"></td>	
	</tr>
	<tr>		
		<td>Child's Birthdate </td>		
		<td><input  type="text" placeholder='MM/DD/YYYY' value="" id="dp" class="datepicker" name="dob"/></td>
		<td><label class = "mdy"> MM/DD/YYYY</label></td>	
	</tr>
	<tr>		
		<td>Gender</td> 		
		<td><input id="gender_boy" type="radio" name="gender_" value="boy" onclick="set(this);" style="width: 13px;" > Male</td>
		<td style="display:none"><input type="hidden" class="gender" id="gender" name="gender" value=""/></td>	
		<td><input id="gender_girl" type="radio" name="gender_" value="girl" onclick="set(this);" style="width: 13px; margin-left:-70px;" > Female</td>
		<td><input id="gender_other" type="radio" name="gender_" value="other" onclick="set(this);" style="width: 13px; margin-left:-70px;" > Other/prefer not to answer</td>
	</tr>	
	<tr>		
		<td>Gestational age of birth (approximate) </td>		
		<td>
		<select name="weeks" id=" weeks" class="weeks" value="">
			<option value="na">Not sure or prefer not to answer</option>
			<option value="43">Over 42</option>
			<option value="42">42</option>
			<option value="41">41</option>
			<option value="40" selected>40 (around due date)</option>
			<option value="39">39</option>
			<option value="38">38</option>
			<option value="37">37</option>
			<option value="36">36</option>
			<option value="35">35</option>
			<option value="34">34</option>
			<option value="33">33</option>
			<option value="32">32</option>
			<option value="31">31</option>
			<option value="30">30</option>
			<option value="29">29</option>
			<option value="28">28</option>
			<option value="27">27</option>
			<option value="26">26</option>
			<option value="25">25</option>
			<option value="24">24</option>
			<option value="23">Under 24</option>
		</select>
		<label for="weeks">Weeks</label>
		</td>
	</tr>
	<tr>
		<td colspan="3"><img src="./img/cancel.png" class = "cancel count" id = "cancel" onclick="remove1(this);" value="Cancel" align="right" style="margin-top: -235px;margin-right: -11px; display:none;              "/></td>
	</tr>
</TABLE>

