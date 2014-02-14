<?php
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
?>

 <script type="text/javascript">

	function validation(){
		var valii = 1;
		var pass = 1;

		$("#error").html("");
		if($("#password")){
			if($("#password").val() == ""){
				$("#error").append('<label id="password_error" class="error">Please enter your password.<br></label>');
				valii = 0;
			}
			else if($("#password").val().length < 5){
				$("#error").append('<label id="password_error" class="error">Your password must be atleast 5 characters long.<br></label>');
				pass = 0;
				valii = 0;
			}
		}
		if($("#confirm_password")){
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
</script>
<form id = "forgot" method="POST" action="">	
	<p><h1 style="text-align:center;">			Reset Password		</h1>	</p> 
		<p>Email:<input type="text" name="email" id = "email" style="margin-left: 88px;" value="<?php echo $_GET['email'] ?>" readonly></p>	
	<p>		Please enter your new password	</p>
			Password:<input type="password" name="password" id="password" style="margin-left: 64px;" value=""/> </br>		
			Confirm Password:<input type="password" name="Confirm_Password" style="margin-left: 12px;" id="confirm_password" />
			</br><div id="error"></div>
</form>