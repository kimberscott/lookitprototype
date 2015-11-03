<?php

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

//function uuid() {
//  uuid_create(&$context);
//  uuid_make($context, UUID_MAKE_V4);
//  uuid_export($context, UUID_FMT_STR, &$uuid);
//  return trim($uuid);
//}

//double quote escape string
function dq_escape($str) {
  if($str !== null) {
    $str = str_replace(array('\\','\'', '"'), array('\\\\','\\\'','\\"'), $str);
  } else {
    $str = "";

  }
  return $str;
}

//function joinPath($path1, $path2) {
//  $path = join('/', array(rtrim($path1, '/'), trim($path2, '/')));
//  return $path;
//}

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
//
//function load_experiments($directory="ex") {
//
//  if($directory == "ex"){
//    $files = scandir(getcwd() . '/' . $directory);
//    $files = array_filter($files, function($item) { return !is_dir($item); });
//  }
//  else{
//    $files = $directory;
//  }
//  $packages = array();
//  foreach($files as $dir) {
//    $path = sprintf("%s/%s/%s/%s", getcwd(), "ex", $dir, "package.json");
//    if(!file_exists($path)) {
//      continue;
//    }
//    $details = file_get_contents($path);
//    $packages[] = json_decode($details, true);
//
//  }
//  return $packages;
//}


?>
