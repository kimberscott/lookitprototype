<?php
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

require_once('config.php'); 
session_start();

/** 
 * Check if user wishes to withdraw from the participated studies
 * If Withdrawn recordings are marked --WITHDRAWN and sent to S3.
 */
if($_POST['withdraw']) {
    $sess_obj = $_SESSION['user']['filename'];
	$str = '{\"filename\":"'.addslashes(json_encode($sess_obj)).'",\"withdraw\":\"true\",\"server\":\"'.substr($CONFIG["server"],1).'\"}';
    $command = 'curl -X POST --data "result='.$str.'" "https://lookit-streaming.mit.edu:8080/compress_video/convert.php"';
    if(count($_SESSION['user']['filename']) > 1){
        $_SESSION['user']['filename'] = "";
    }
    shell_exec($command);

}

/**
 * Check if user deceides to continue with the experiment recordings
 *  If yes the recordings are sent to S3.
 */
else if($_POST['continue']){
    $sess_obj = $_SESSION['user']['filename'];
    $privacy = $_POST['privacy'];
    $str = '{\"filename\":"'.addslashes(json_encode($sess_obj)).'",\"withdraw\":\"false\",\"server\":\"'.substr($CONFIG["server"],1).'\",\"privacy\":\"'.$privacy.'\"}';
    $command = 'curl -X POST --data "result='.$str.'" "https://lookit-streaming.mit.edu:8080/compress_video/convert.php"';
	if(count($_SESSION['user']['filename']) > 1){
        $_SESSION['user']['filename'] = "";
    }
    shell_exec($command);

}

/**
 * If the final recording is not yet recorded,
 * Store the filename in the session array.
 */

else if($_POST['filename']){
	$filename = $_POST['filename'];
    preg_match('/_(\d+)$/', $filename,$matches);
	$_SESSION['user']['filename'][substr($matches[0],1)] = $filename;
}
?>
