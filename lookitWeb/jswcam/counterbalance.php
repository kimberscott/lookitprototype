<?php

/**
 * Parse JSON String into PHP Assoc array,
 * Fetch or create a mongo database for a given
 * experimental id, and record the provided data
 * as a record in the trials collection with primary
 * id based upon the trial subject (user_id).
 *
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

include("./config.php");
function check_conditions($experiment_id,$string) {

	// Look up the experiment ID to see how many conditions there are.
	// When adding a new experiment with basic counterbalancing, add a single
	// row to this array using the same syntax and the experiment id from 
	// package.json.
	
	// Note: that comma on the last line is crucial.
	$experiment_counts = array(
		"speech_match"  => 6,
		"causaldomains" => 8,
		"novelverbs" => 32,
		"syllables" => 4,
		"backwards" => 4,
		"oneshot" => 8,
		"testimony" => 32,
	);
	
  $m = new Mongo($string);
  //$db = $m->{$experiment_id};
  //$collection = $db->trials;
  $db = $m->users;
  $collection = $db->account;
  
  $condition_counts = array();
  
  for ($i = 0; $i < $experiment_counts[$experiment_id]; $i++) {
	$condition_counts[$i] = array($collection->count(array('condition' => strval($i), 'experiment_id' => $experiment_id)), $i);
  }

  $small_pair = min($condition_counts); // (#timesSeen, conditionIndex)
  
  return array('condition'=>$small_pair[1]);
}

$experiment_id =  $_GET["experiment_id"];
echo json_encode(check_conditions($experiment_id,$CONFIG['dbstring']));

?>