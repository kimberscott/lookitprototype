<?php

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
 
ini_set('max_execution_time', 60*60);

require_once('php/util.php');
require_once('php/encrypt.php');

function checkErrors() {
  $errors = array();
  foreach($_FILES as $name => $value) {
    if($value["error"] != 0) {
      $errors[$name] = $value["error"];
    }
  }
  return empty($errors) ? false : $errors;
}

function handleUpload() {
  foreach($_FILES as $name => $value) {
    $filename = basename($value["name"]);
    $experiment_id = isset($_POST['experiment_id']) ? $_POST['experiment_id'] : 'null_exp_id';
    $user_id = isset($_POST['user_id']) ? $_POST['user_id'] : 'null_user_id';
    $dest = getUploadSavePath($experiment_id, $user_id, $filename);
    if(move_uploaded_file($value["tmp_name"], $dest)) {
      if(encrypt($experiment_id, $user_id, $filename)) {
	unlink($dest);
      } else {
      }
    } else {
    }
  }
}

$err = checkErrors();
if(!$err) {
  handleUpload();
} else {
}


?>
