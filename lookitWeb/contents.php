<?php
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
//requires ZipArchive Extension

$dir = dirname(__FILE__);
$base = $dir . '/lib/';
$map = array(
	     'dll_archive_64' => 'windows-x86_64.jar',
	     'dll_archive_32' => 'windows-x86.jar',
	     'so_archive_64' => 'linux-x86_64.jar',
	     'so_archive_32' => 'linux-x86.jar',
	     'dylib_archive_64' => 'osx-x86_64.jar'
);

function format_resp($resp) {
  return json_encode($resp, true);
}

function get_contents($key) {
  global $map, $base;
  $resp = array(
		'status' => 'failure',
		'result' => ''
		);
  if(!array_key_exists($key, $map)) {
    $resp['result'] = "Error Code: TODO... System $key not supported";
    return format_resp($resp);
  }

  $path = $base . $map[$key];
  //echo $path;

  $zip = new ZipArchive;
  if(!$zip->open($path)) {
    $resp['result'] = "Error Code: TODO... Could not open jar file, $path";
    return format_resp($resp);
  }
  
  $names = array();
  for($i = 0; $i < $zip->numFiles; $i++) {
    array_push($names, $zip->getNameIndex($i));
  }
  

  $resp['status'] = 'success';
  $resp['result'] = $names;
  return format_resp($resp);
}

$key = $_GET['system'];
echo get_contents($key);

?>
