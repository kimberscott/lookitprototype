<?php
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
session_start();

/** 
 * Check if user wishes to withdraw from the participated studies
 * If Withdrawn recordings are marked --WITHDRAWN and sent to S3.
 */
if($_POST['withdraw']) {
    $sess_obj = $_SESSION['user']['filename'];
    $datatopost = array (
	'filename' => json_encode($sess_obj),
	'withdraw' => 'true'
    );
	$str = '{\"filename\":"'.addslashes(json_encode($sess_obj)).'",\"withdraw\":"true",\"server\":\"dev\"}';
    $command = 'curl -X POST --data "result='.$str.'" "https://lookit-streaming.mit.edu:8080/compress_video/convert.php"';
    print_r($command);
	$_SESSION['user']['filename'] = array();
    shell_exec($command);

}

/**
 * Check if user deceides to continue with the experiment recordings
 *  If yes the recordings are sent to S3.
 */
else if($_POST['continue']){
    $sess_obj = $_SESSION['user']['filename'];
    $datatopost = array (
        "filename" => json_encode($_SESSION['user']['filename']),
        "withdraw" => "false",
    );
     $str = '{\"filename\":"'.addslashes(json_encode($sess_obj)).'",\"withdraw\":"false",\"server\":\"dev\"}';
    $command = 'curl -X POST --data "result='.$str.'" "https://lookit-streaming.mit.edu:8080/compress_video/convert.php"';
	print_r($command);
    $_SESSION['user']['filename'] = array();
	shell_exec($command);

}

/**
 * If the final recording is not yet recorded,
 * Store the filename in the session array.
 */

else if($_POST['filename']){
	$filename = $_POST['filename'];
	$i = substr($filename,-1);
	$_SESSION['user']['filename'][$i] = $filename;
}
?>
