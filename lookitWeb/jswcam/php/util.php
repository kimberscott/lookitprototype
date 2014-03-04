<?php

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

function uuid() {
  uuid_create(&$context);
  uuid_make($context, UUID_MAKE_V4);
  uuid_export($context, UUID_FMT_STR, &$uuid);
  return trim($uuid);
}

//double quote escape string
function dq_escape($str) {
  if($str !== null) {
    $str = str_replace(array('\\','\'', '"'), array('\\\\','\\\'','\\"'), $str);
  } else {
    $str = "";
    
  }
  return $str;
}

function joinPath($path1, $path2) {
  $path = join('/', array(rtrim($path1, '/'), trim($path2, '/')));
  return $path;
}

///
///
///

function get_default_fragments() {
  $files = scandir("fragments");
  $fragments = array_filter($files, function($item) {
      return preg_match('#.html$#', $item);
    });
  return $fragments;
};

function load_fragments($fragments) {
  foreach($fragments as $x) {
    if($x) {
      $file = sprintf("fragments/%s", $x);
      $html = str_replace("\n", "", file_get_contents($file));
      printf("page.html(\"%s\".split('.')[0], \"%s\");", $x, dq_escape($html));
    }
  }
}

function load_experiments($directory="ex") {

  if($directory == "ex"){
    $files = scandir(getcwd() . '/' . $directory);
    $files = array_filter($files, function($item) { return !is_dir($item); });
  }
  else{
    $files = $directory;
  }
  $packages = array();
  foreach($files as $dir) {
    $path = sprintf("%s/%s/%s/%s", getcwd(), "ex", $dir, "package.json");
    if(!file_exists($path)) { 
      continue;
    }
    $details = file_get_contents($path);
    $packages[] = json_decode($details, true);
    
  }
  return $packages;
}

///
///
///

function getUploadPath() {
  $path = getenv('UPLOAD_DIRECTORY');
  if(!$path) {
    $path = dirname(__FILE__) . '/upload/';
  }
  return $path;
}

function getUploadSavePath($experiment_id, $user_id, $filename) {
    $updir = getUploadPath();

    $exdir = joinPath($updir, $experiment_id);
    if(!file_exists($exdir) || !is_dir($exdir)) {
      mkdir($exdir);
    }

    $userdir = joinPath($exdir, $user_id);
    if(!file_exists($userdir) || !is_dir($userdir)) {
      mkdir($userdir);
    }
    
    $dest = joinPath($userdir, $filename);
    return $dest;
}

function getFingerprint() {
  $path = getenv('GPG_FINGERPRINT');
  if(!$path) { 
    throw "Warning: No key fingerprint specified. Uploads will not be encrypted";
  } else {
    $fingerprint = file_get_contents($path);
    if(!$fingerprint) {
      throw "Warning: Could not read fingerprint in $path. Uploads will not be encrypted";
    }
  }
  return $fingerprint;
}

function getPublicKey() {
  $path = getenv('GPG_PUBLIC_KEY');
  if(!$path) {
    throw "Warning: No public key specified. Uploads will not be encrypted";
  } else {
    $key = file_get_contents($path);
    if(!$key) {
      throw "Warning: Could not read public key in $path. Uploads will not be encrypted";
    }
  }
  return $key;
}

?>
