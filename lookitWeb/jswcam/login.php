<?php 

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
 
session_start();

// Check if email needs to be sent for reset password.
if($_POST['email']){
  $json = json_encode($_POST);

  //Email Address
  $email = $_POST['email'] . " ";

  // subject
  $subject = 'Reset password';
  DEFINE('WEBSITE_URL', $_SERVER['HTTP_HOST'] );

  $string = DATE('y-m-d');
  $activation = mt_rand();
  
  //Message
  $message = "Hi,\n\n";
  $message .= " To reset your password, please click on this link:\n\n";
  $message .= WEBSITE_URL."/dev/index.php?email=" . urlencode($email) . "&key=".urlencode($activation) . "\n\n";
  $message .= "Thanks,\n Support Team";
  // In case any of our lines are larger than 70 characters, we should use wordwrap()
  $message = wordwrap($message, 70, "\n");

  //Headers
  $headers = "From: support@lookit.mit.edu\r\n";
  
  // Send
  if(mail($email, $subject, $message, $headers)){
    echo "<html><p>Check your email - we sent you an email with a link to reset your password. If you do not receive this email within a minute or so, please check your spam folder. </p></html>";
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

?>
<html><p>Check your email - we sent you an email with a link to reset your password. If you do not receive this email within a minute or so, please check your spam folder. </p></html>