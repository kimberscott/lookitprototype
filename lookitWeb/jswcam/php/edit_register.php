<?php 

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

session_start();

if(isset($_SESSION['user']['submitted_form_values'])){extract($_SESSION['user']['submitted_form_values']);}

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

<script src="static/js/jquery-1.8.1.min.js"></script>
<script src="static/datepicker/js/bootstrap-datepicker.js"></script>
<link type="text/css" href="./login/edit_register.css" rel="stylesheet" media="all" />
<script src="./login/json.js" type="text/javascript"></script>
<script src="./login/edit_register.js" type="text/javascript"></script>
<script>
var temp;
var i ;
var j;
var range ;
var s = [""];
var genders;

$(document).ready(function() {
	$(".cancel").bind("contextmenu",function(e){
		e.preventDefault();
		//alert("Right Click is not allowed");
	});

	var count = <?php echo count($_SESSION['user']['child_name']) ?>;
	temp = count;	

	$("#child0 .date_picker" ).datepicker({
		format: 'mm/dd/yyyy', 
		viewMode: 2
	});

	$('#child0 .date_picker').addClass('hasDatepicker');	
	i = 1;
	j = 1;
	range = 4;
	genders = <?php echo json_encode($_SESSION['user']['gender']); ?>;

	<?php 
	$count = count($_SESSION['user']['child_name']);

	for($i = 1; $i < $count; $i++){ 
	?>
		clone("preset");
	<?php } ?>
	$('.jspPane').css({'margin-left':'0px','width':'590px'});
	$("form").submit(function(event){
		if(!validation())
		{
			$("#error").css("display","block");
			event.preventDefault();
		}
		else{
			call('','./user.php');
	//                show_edit_page();

		}
	});
	$("#reset").click(function(){
		show_edit_page();
		return false;    
	});
});


// Function to copy the child data table when adding more childs and populate the data into it if user is editting the details.
function clone(chck_str){
	if(i <= range){
		s[i] = "";

		var Clonedtable = jQuery("#child").clone(true);
		Clonedtable.css("display","block");
		Clonedtable.attr("id","child"+j);
		Clonedtable.attr("name","child"+j);
		var date_id;
		Clonedtable.find("*[id]").each(function() {
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
			console.log(Clonedtable);
			Clonedtable.find("tr:last").children().children().removeClass("cancel");
		}
		Clonedtable.appendTo('#child_list');
		if(chck_str == ""){
			$(".cancel").css("display","block");
		}
		Clonedtable.find("*[id]").andSelf().each(function() {
			$(this).find('input[type=radio]').removeAttr('checked');
			$(this).removeClass('hasDatepicker');
			if($(this).hasClass('datepickerinput')) {
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
					if(genders[i] == "boy"){
                        $("#gender"+i).val("boy");
                        $("#gender_boy"+i).attr("checked","checked");
                    }
                    else if(genders[i] == "girl"){
                        $("#gender"+i).val("girl");
                        $("#gender_girl"+i).attr("checked","checked");
                    }
                    else if(genders[i] == "other"){
                        $("#gender"+i).val("other");
                        $("#gender_other"+i).attr("checked","checked");
                    }

				}
			}				
			$('#'+date_id).next().next().remove();
		});
		$("#label_boy").attr({'id':"label_boy"+i});
		$("#label_girl").attr({'id':"label_girl"+i});
		$("#label_other").attr({'id':"label_other"+i});
		$("#label_boy"+i).attr({'for':"gender_boy"+i});
		$("#label_girl"+i).attr({'for':"gender_girl"+i});
		$("#label_other"+i).attr({'for':"gender_other"+i});

		$("#child"+i+" .date_picker" ).datepicker({
			format: 'mm/dd/yyyy', 
			viewMode: 2
		}); 
		$('#child'+i+' .date_picker').addClass('hasDatepicker');
		i++;
		j++;
	}
	$('input[type="radio"]').css('margin-left', '0px');
}	

function update_password(){
	var req = new XMLHttpRequest();
        req.open("POST", "update_password.html", false);
        req.send(null);
        var update_page = req.responseText;
	bootbox.dialog(update_page,[
		{
			'label': 'Cancel',
			'class': 'btn-danger regis-close',
			'callback': function() {
				return true;
			}
		},
		{
			'label': 'Update',
                        'class': 'btn-success btn-send btn-ok',
                        'callback': function() {
				if(update_validation() == 1){
					$("#email_update_pass").attr("name","email");
            				var response = call('reset_pass','./user.php');
			                console.log(response);
			                if(response){
				                return true;
		                	}
		        	}
                                return false;
                        }
                }
	]);
	$("#email_update_pass").val($("#email").val());
}
</script>

<div id="error">
    <label id="dob_error" class="error" for="dob" style="display:none"></label>
    <label id="gender_error" class="error" for="gender" style="display:none">Please select a gender.</label>
</div>
<div id ="position">
    <h1 id="registrationTitle" style="text-align: center;">Edit Registration</h1>
    <form id="edit_form" method="POST" action="">
        <div class ="register">
            <p>Name <input type="text" name="name" id="name" style="margin-left: 118px;" value="<?php set_value('name','',0); ?>"/> </p>
            <p>Email Address<input type="text" name="email_label" id="email" style="margin-left: 68px;" value="<?php set_value('email_label','',0) ?>" readonly/>  </p>
            <p><a href="#" onclick="update_password();">Reset Password</a> </p>
            <p><input type= "hidden" name="id" value="<?php echo $_SESSION['user']['id'] ?>"></p>
            <p>1.Please enter information for your child</p>
            <div id = "child_list">
                <TABLE id = "child0" class="childs" name="child0" BORDER='0' CELLPADDING='5' CELLSPACING='5'  style="border: 1px solid #d8d8d8;padding: 10px; margin-bottom:10px;display:block;">
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
                        <td>

                            <div class="input-append date_picker" data-date-format="mm/dd/yyy" data-date="">
                                <input id='dp0' class="span2 datepickerinput" type="text" value="<?php set_value('dob','',0) ?>" size="16" name="dob" readonly="true">
                                <span class="add-on">
                                    <i class="icon-calendar"></i>
                                </span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Gender</td>

                        <td>
                            <table>
                                <tr>
                                    <td><input id="gender_boy" type="radio" name="gender_" value="boy" onclick="set(this);" style="width: 13px;" <?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'] == "boy"){print " checked=\"checked\"";} elseif(count($_SESSION['user']['gender']) >1 && $_SESSION['user']['gender'][0] == "boy" ){print " checked=\"checked\"";}?>></td>
                                    <td><label for='gender_boy' id='label_boy0'>Male</label></td>
                                </tr>
                                <tr>
                                    <td><input id="gender_girl" type="radio" name="gender_" value="girl" onclick="set(this);" style="width: 13px;" <?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'] == "girl"){print " checked=\"checked\"";} elseif((count($_SESSION['user']['gender']) >1) && ($_SESSION['user']['gender'][0] == "girl") ){print " checked=\"checked\"";}?>> </td>
                                    <td><label for='gender_girl' id='label_girl0'>Female</label></td>
                                </tr>
                                <tr>
                                    <td><input id="gender_other" type="radio" name="gender_" value="other" onclick="set(this);" style="width: 13px;" <?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'] == "other"){print " checked=\"checked\"";} elseif((count($_SESSION['user']['gender']) >1) && ($_SESSION['user']['gender'][0] == "other") ){print " checked=\"checked\"";}?>> </td>
                                    <td><label for='gender_other' id='label_other0'>Other or prefer not to answer</label></td>
                                </tr>
                            </table>
                            <input style="display:none" type="hidden" class="gender" id="gender0" name="gender" value="<?php set_value('gender','',0) ?>"/>
                        </td>



                    </tr>
                    <tr>
                        <td>Gestational age at birth </td>

                        <td>
                            <select name="weeks" id=" weeks0" class="weeks">
                                <option value="na" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "na" ) || $_SESSION['user']['weeks'] == "na") {print "selected";} ?>>Not sure or prefer not to answer</option>
                                <option value="43" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "43" ) || $_SESSION['user']['weeks'] == "43") {print "selected";} ?>>Over 42 weeks</option>
                                <option value="42" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "42" ) || $_SESSION['user']['weeks'] == "42") {print "selected";} ?>>42 weeks</option>
                                <option value="41" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "41" ) || $_SESSION['user']['weeks'] == "41") {print "selected";} ?>>41 weeks</option>
                                <option value="40" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "40" ) || $_SESSION['user']['weeks'] == "40") {print "selected";} ?>>40 weeks(around due date)</option>
                                <option value="39" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "39" ) || $_SESSION['user']['weeks'] == "39") {print "selected";} ?>>39 weeks</option>
                                <option value="38" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "38" ) || $_SESSION['user']['weeks'] == "38") {print "selected";} ?>>38 weeks</option>
                                <option value="37" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "37" ) || $_SESSION['user']['weeks'] == "37") {print "selected";} ?>>37 weeks</option>
                                <option value="36" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "36" ) || $_SESSION['user']['weeks'] == "36") {print "selected";} ?>>36 weeks</option>
                                <option value="35" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "35" ) || $_SESSION['user']['weeks'] == "35") {print "selected";} ?>>35 weeks</option>
                                <option value="34" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "34" ) || $_SESSION['user']['weeks'] == "34") {print "selected";} ?>>34 weeks</option>
                                <option value="33" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "33" ) || $_SESSION['user']['weeks'] == "33") {print "selected";} ?>>33 weeks</option>
                                <option value="32" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "32" ) || $_SESSION['user']['weeks'] == "32") {print "selected";} ?>>32 weeks</option>
                                <option value="31" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "31" ) || $_SESSION['user']['weeks'] == "31") {print "selected";} ?>>31 weeks</option>
                                <option value="30" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "30" ) || $_SESSION['user']['weeks'] == "30") {print "selected";} ?>>30 weeks</option>
                                <option value="29" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "29" ) || $_SESSION['user']['weeks'] == "29") {print "selected";} ?>>29 weeks</option>
                                <option value="28" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "28" ) || $_SESSION['user']['weeks'] == "28") {print "selected";} ?>>28 weeks</option>
                                <option value="27" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "27" ) || $_SESSION['user']['weeks'] == "27") {print "selected";} ?>>27 weeks</option>
                                <option value="26" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "26" ) || $_SESSION['user']['weeks'] == "26") {print "selected";} ?>>26 weeks</option>
                                <option value="25" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "25" ) || $_SESSION['user']['weeks'] == "25") {print "selected";} ?>>25 weeks</option>
                                <option value="24" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "24" ) || $_SESSION['user']['weeks'] == "24") {print "selected";} ?>>24 weeks</option>
                                <option value="23" <?php if((count($_SESSION['user']['weeks']) > 1 && $_SESSION['user']['weeks'][0] == "23" ) || $_SESSION['user']['weeks'] == "23") {print "selected";} ?>>Under 24 weeks</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" ><div class ="cancel count" style="display:none;"></div></td>
                    </tr>
                </TABLE>
            </div>
        </div>
        <input type="button" class="btn-success form-field" id = "add" onclick="clone('');" value = "Add another child's information"/>
        <table>
            <tr><td></br></td></tr>
            <tr><td colspan="2">2. Select communication preferences: I would like to be contacted when...</td></tr>

            <tr>    <td>    <input class="checkbox" type="checkbox" name="preference" value="researchers" <?php if(isset($_SESSION['user']['preference']) && in_array("researchers",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/></td><td>Researchers have questions about my responses.</td></tr>
            <tr>    <td>    <input class="checkbox" type="checkbox" name="preference" value="updates" <?php if(isset($_SESSION['user']['preference']) && in_array("updates",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/></td><td>New studies are available for my child(ren).</td></tr>
            <tr>    <td>    <input class="checkbox" type="checkbox" name="preference" value="results" <?php if(isset($_SESSION['user']['preference']) && in_array("results",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/></td><td>Results of a study we participated in are published.</td></tr>
            <input class="checkbox" type="hidden" name="preference" value="no_mails" <?php if(isset($_SESSION['user']['preference']) && in_array("no_mails",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/><br>
        </table><br /> <br />
	<input class="btn-success form-field" type="submit" value="Submit Updates"/>
	&nbsp; &nbsp; &nbsp;
	<button class="btn-success form-field" id='reset' value="reset">Reset</button>
    </form>
</div>
<TABLE id = "child" class="childs" name="child" BORDER='0' CELLPADDING='5' CELLSPACING='5'  style="border: 1px solid #d8d8d8;padding: 10px; margin-bottom:10px; display:none">
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

        <td>

            <div class="input-append date_picker" data-date-format="mm/dd/yyy" data-date="">
                <input id='dp' class="span2 datepickerinput" type="text"  value="" size="16" name="dob" readonly="true">
                <span class="add-on">
                    <i class="icon-calendar"></i>
                </span>
            </div>

        </td>

    </tr>
    <tr>
        <td>Gender</td>

        <td>
            <table>
                <tr>
                    <td><input id="gender_boy" type="radio" name="gender_" value="boy" onclick="set(this);" style="width: 13px;" ></td>
                    <td><label id='label_boy' for=''>Male</label></td>
                </tr>
                <tr>
                    <td><input id="gender_girl" type="radio" name="gender_" value="girl" onclick="set(this);" style="width: 13px;" > </td>
                    <td><label id='label_girl' for=''>Female</label></td>
                </tr>
                <tr>
                    <td><input id="gender_other" type="radio" name="gender_" value="other" onclick="set(this);" style="width: 13px;" > </td>
                    <td><label id='label_other' for=''>Other or prefer not to answer</label></td>
                </tr>
            </table>
            <input style="display:none" type="hidden" class="gender" id="gender" name="gender" value=""/>
        </td>


    </tr>
    <tr>
        <td>Gestational age at birth</td>
        <td>
            <select name="weeks" id=" weeks" class="weeks" value = "<?php set_value('weeks',0,0) ?>">
                <option value="na" selected>Not sure or prefer not to answer</option>
                <option value="43">Over 42 weeks</option>
                <option value="42">42 weeks</option>
                <option value="41">41 weeks</option>
                <option value="40">40 weeks(around due date)</option>
                <option value="39">39 weeks</option>
                <option value="38">38 weeks</option>
                <option value="37">37 weeks</option>
                <option value="36">36 weeks</option>
                <option value="35">35 weeks</option>
                <option value="34">34 weeks</option>
                <option value="33">33 weeks</option>
                <option value="32">32 weeks</option>
                <option value="31">31 weeks</option>
                <option value="30">30 weeks</option>
                <option value="29">29 weeks</option>
                <option value="28">28 weeks</option>
                <option value="27">27 weeks</option>
                <option value="26">26 weeks</option>
                <option value="25">25 weeks</option>
                <option value="24">24 weeks</option>
                <option value="23">Under 24 weeks</option>
            </select>
        </td>
    </tr>
    <tr>
        <td colspan="3"><img src="./img/cancel.png" class = "cancel count" id = "cancel" onclick="remove1(this);" value="Cancel" align="right" style="margin-top: -294px;margin-right: -11px; display:none;              "/></td>
    </tr>
</TABLE>

