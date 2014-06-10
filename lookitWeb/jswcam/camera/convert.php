<?php
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */


session_start();
include('../config.php');

/** 
 * Check if user wishes to withdraw from the participated studies
 * If Withdrawn recordings are marked --WITHDRAWN and sent to S3.
 */
$dbString = $CONFIG['dbstring'];
if($_POST['withdraw']) {
error_log("withdraw");
   // $sess_obj = $_SESSION['user']['filename'];
    $sess_obj = fetch_recording($dbString);
    error_log(print_r($sess_obj,true));
   $str = '{\"filename\":"'.addslashes(json_encode($sess_obj)).'",\"withdraw\":\"true\",\"server\":\"'.substr($CONFIG["server"],1).'\"}';
   
    $command = 'curl -X POST --data "result='.$str.'" "https://lookit-streaming.mit.edu:8080/compress_video/convert.php"';
    /*if(count($_SESSION['user']['filename']) > 1){
        $_SESSION['user']['filename'] = "";
    }*/
    $_SESSION['user']['rec_uid'] = "";
    shell_exec($command);

}

/**
 * Check if user deceides to continue with the experiment recordings
 *  If yes the recordings are sent to S3.
 */
else if($_POST['continue']){
error_log("continue");
   //    $sess_obj = $_SESSION['user']['filename'];
    $sess_obj = fetch_recording($dbString);
    error_log(print_r($sess_obj,true));
    $privacy = $_POST['privacy'];
    $str = '{\"filename\":"'.addslashes(json_encode($sess_obj)).'",\"withdraw\":\"false\",\"server\":\"'.substr($CONFIG["server"],1).'\",\"privacy\":\"'.$privacy.'\"}';

    $command = 'curl -X POST --data "result='.$str.'" "https://lookit-streaming.mit.edu:8080/compress_video/convert.php"';
	/*if(count($_SESSION['user']['filename']) > 1){
             $_SESSION['user']['filename'] = "";
        }*/
    $_SESSION['user']['rec_uid'] = "";
    shell_exec($command);


}

/**
 * If the final recording is not yet recorded,
 * Store the filename in the session array.
 */

else if($_POST['filename']){
	$filename = $_POST['filename'];
error_log($filename);
    preg_match('/_(\d+)$/', $filename,$matches);
	//$_SESSION['user']['filename'][substr($matches[0],1)] = $filename;
$record_count = substr($matches[0],1);
$file_split = explode("_", $filename);
error_log($dbString);
$_SESSION['user']['rec_uid']=$file_split[3];
save_recording($record_count,$filename,$dbString,$file_split[3]);

}

function save_recording($record_count,$filename,$dbString,$user_uid){

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
}

function fetch_recording($dbString){
 $m = new Mongo($dbString);
  $db = $m->users;
  $record_coll = $db->user_recording;
  $record_id = $_SESSION['user']['user_id'].'_'.$_SESSION['user']['rec_uid'].'_'.$_SESSION['user']['experiment_id'].'_'.$_SESSION['user']['participant'];
  error_log("record_id ".$record_id);
  $cursor = $record_coll->find(array('id' => $record_id));
  foreach ($cursor as $obj) {
     return $obj['filename'];
  }
}

?>
