<?php
/**
 * Copyright (C) MIT Early Childhood Cognition Lab
 *
 * Parse JSON String into PHP Assoc array,
 * Fetch or create a mongo database for a given
 * experimental id, and record the provided data
 * as a record in the trials collection with primary
 * id based upon the trial subject (user_id).
 *
 */
 
function check_conditions($experiment_id) {

	// Look up the experiment ID to see how many conditions there are.
	// When adding a new experiment with basic counterbalancing, add a single
	// row to this array using the same syntax and the experiment id from 
	// package.json.
	
	// Note: that comma on the last line is crucial.
	$experiment_counts = array(
		"speech_match"  => 64,
		"causaldomains" => 8,
		"novelverbs" => 32,
		"syllables" => 4,
		"backwards" => 4,
	);
	
  $m = new Mongo('mongodb://localhost:27018');
  $db = $m->{$experiment_id};

  $collection = $db->trials;
  
  $condition_counts = array();
  
  // with a lot of data, what we should really do is loop over trials.
  for ($i = 0; $i < $experiment_counts[$experiment_id]; $i++) {
	$condition_counts[$i] = array($collection->count(array('condition' => $i)), $i);
  }

  $small_pair = min($condition_counts); // (#timesSeen, conditionIndex)
  
  return array('condition'=>$small_pair[1]);
}

$experiment_id =  $_GET["experiment_id"];
echo json_encode(check_conditions($experiment_id));

?>
