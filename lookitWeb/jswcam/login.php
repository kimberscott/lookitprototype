<?php 

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
 
require_once('config.php'); 
session_start();
$dbString = $CONFIG['dbstring'];

// Check if email needs to be sent for reset password.
if($_POST['email']){
  $json = json_encode($_POST);

  //Email Address
  $email = $_POST['email'] . " ";

  // subject
  $subject = 'Reset password';
  DEFINE('WEBSITE_URL', $_SERVER['HTTP_HOST'] );

  $string = time();
//  $activation = mt_rand();
  $activation = md5($string);
  
  //Message
  $message = "Hi,\n\n";
  $message .= " To reset your password, please click on this link:\n\n";
  $message .= WEBSITE_URL.$CONFIG['server']."/index.php?email=" . urlencode($email) . "&key=".urlencode($activation) . "\n\n";
  $message .= "Thanks,\n Support Team";
  // In case any of our lines are larger than 70 characters, we should use wordwrap()
  $message = wordwrap($message, 70, "\n");

  //Headers
  $headers = "From: support@lookit.mit.edu\r\n";
  
  // Send
  if(mail($email, $subject, $message, $headers)){
    echo "<html><p>We sent you an email with a link to reset your password. If you do not receive this email within a minute or so, please check your spam folder. </p></html>";
    save_key($activation, urlencode(trim($email)), $dbString);
  }
}

// Check if seesion need to be ended
if(!empty($_POST['sure'])){ 
  $sure = $_POST['sure'];
  if($sure == 1){
    session_unset($_SESSION['user']);
    session_destroy();
    $_SESSION = array();
    echo 'Session Destroyed!';
  }
}

// Add the activation key and email into the database.
function save_key($key, $email, $dbString){

  $m = new Mongo($dbString);
  $db = $m->users;
  $reset_coll = $db->user_reset_password;
  $cursor = $reset_coll->find(array("email_label" => $email, "is_active" => '1'));
  if($cursor->count() == 0){
    $reset_coll->insert(array("email_label" => $email, "key" => $key, "key_generated_on" => time(), "is_active" => '1'));
  }
  else{
    $reset_coll->update(array("email_label" => $email, "is_active" => '1'), array('$set' => array("is_active" => '0')));
    $reset_coll->insert(array("email_label" => $email, "key" => $key, "key_generated_on" => time(), "is_active" => '1'));
  }
}

?>