<?php
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
require_once('../php/config.php');
$dbString = $CONFIG['dbstring'];


if(isset($_GET['email']) && isset($_GET['key'])){
  $email = (string)$_GET['email'];
  $key = (string)substr($_GET['key'],0,-1);
  $exists = match_key($key, urlencode(trim($email)), $dbString);
  if($exists){

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
				$("#error").append('<label id="password_error" class="error">Your password must be at least 5 characters long.<br></label>');
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
		<p>Email:<input type="text" name="email_label" id = "email" style="margin-left: 88px;" value="<?php echo $_GET['email'] ?>" readonly></p>	
	<p>		Please enter your new password	</p>
			Password:<input type="password" name="password" id="password" style="margin-left: 64px;" value=""/> </br>		
			Confirm Password:<input type="password" name="Confirm_Password" style="margin-left: 12px;" id="confirm_password" />
			</br><div id="error"></div>
</form>

<?php
  }
  else{
    echo "The link seems to be no longer working, it is either expired or broken.<br />Please try the Reset Password option in the login page once again.";
  }
}

// Function to check if the key and the email exists in the database.
function match_key($key, $email, $dbString){
  $m = new Mongo($dbString);
  $db = $m->users;
  $reset_coll = $db->user_reset_password;
  $cursor = $reset_coll->find(array('email_label' => $email, 'key' => $key, "is_active" => '1'));
  if($cursor->count() == 0 || $cursor->count() > 1) return false;
  foreach ($cursor as $obj) {
    if($obj['key_generated_on'] >= (time() - 86400)){
      $reset_coll->update(array('email_label' => $email, "is_active" => '1'),array('$set' => array('is_active' => '0')));
      return true;
    }
  }
}
?>
