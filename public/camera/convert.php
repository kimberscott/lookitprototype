<?php
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */


session_start();
include('../php/config.php');

/** 
 * Check if user wishes to withdraw from the participated studies
 * If Withdrawn recordings are marked --WITHDRAWN and sent to S3.
 */
$dbString = $CONFIG['dbstring'];
if($_POST['withdraw']) {
    error_log("entering withdraw in camera/convert.php");

    $sess_obj = fetch_recording($dbString);
    $str = '{\"filename\":"'.addslashes(json_encode($sess_obj)).'",\"withdraw\":\"true\",\"server\":\"'.substr($CONFIG["server"],1).'\"}'; 
    $command = 'curl -X POST --data "result='.$str.'" "https://lookit-streaming.mit.edu:8080/compress_video/convert.php"';
    $_SESSION['user']['rec_uid'] = "";

    // Closing session write to free the session array
    // for non blocking ajax calls
    session_write_close();   
    shell_exec($command);
    
    error_log("exiting withdraw in camera/convert.php");
}

/**
 * Check if user deceides to continue with the experiment recordings
 *  If yes the recordings are sent to S3.
 */
else if($_POST['continue']){
    error_log("entering continue in camera/convert.php");

    $sess_obj = fetch_recording($dbString);
    $privacy = $_POST['privacy'];
    $str = '{\"filename\":"'.addslashes(json_encode($sess_obj)).'",\"withdraw\":\"false\",\"server\":\"'.substr($CONFIG["server"],1).'\",\"privacy\":\"'.$privacy.'\"}';
    $command = 'curl -X POST --data "result='.$str.'" "https://lookit-streaming.mit.edu:8080/compress_video/convert.php"';
    $_SESSION['user']['rec_uid'] = "";

    // Closing session write to free the session array
    // for non blocking ajax calls
    session_write_close();
    shell_exec($command);

    error_log("exiting continue in camera/convert.php");
}

/**
 * If the final recording is not yet recorded,
 * Store the filename in the database.
 */

else if($_POST['filename']){

  error_log("entering post filename in camera/convert.php with filename: " . $_POST['filename']);
	$filename = $_POST['filename'];

  preg_match('/_(\d+)$/', $filename,$matches);

  $record_count = substr($matches[0],1);
  $file_split = explode("_", $filename);
  $reverse_file_split = array_reverse($file_split);
  $_SESSION['user']['rec_uid']=$reverse_file_split[3];
  save_recording($record_count,$filename,$dbString,$reverse_file_split[3]);

  error_log("exiting post filename in camera/convert.php with filename: " . $_POST['filename']);
}

// Function to insert the filename into the database corresponding to the logged in user.
function save_recording($record_count,$filename,$dbString,$user_uid){

  error_log("entering save_recording in camera/convert.php with filename: " . $filename);
  $m = new Mongo($dbString);
  $db = $m->users;
  $record_coll = $db->user_recording;
  $record_id = $_SESSION['user']['user_id'].'_'.$user_uid.'_'.$_SESSION['user']['experiment_id'].'_'.$_SESSION['user']['participant'];
  
  error_log("record_id ".$record_id);
  if($record_count == '0'){
      $record_coll->insert(array('id'=>$record_id,'filename'=>array($filename),'datetime' => new MongoDate()));
  }else{
       $record_coll->update(array('id' => $record_id),array('$push' => array('filename' => $filename)));
  }
  
  error_log("exiting save_recording in camera/convert.php with filename: " . $filename);
}

// Function to fetch the recording names from the database.
function fetch_recording($dbString){

  error_log("entering fetch_recording in camera/convert.php ");
  $m = new Mongo($dbString);
  $db = $m->users;
  $record_coll = $db->user_recording;
  $record_id = $_SESSION['user']['user_id'].'_'.$_SESSION['user']['rec_uid'].'_'.$_SESSION['user']['experiment_id'].'_'.$_SESSION['user']['participant'];
  
  error_log("record_id ".$record_id);
  $cursor = $record_coll->find(array('id' => $record_id));
  foreach ($cursor as $obj) {
     return $obj['filename'];
  }

  error_log("exiting fetch_recording in camera/convert.php ");
}

?>
