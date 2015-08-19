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

include("./php/config.php");
function check_conditions($experiment_id,$string) {  
  
  	if (strcmp($experiment_id, "testimony") == 0) { // Manual CB for 3-year-olds in Testimony
  		$needed = array(0,14,2,20);
    	$c = $needed[rand(0, count($needed)-1)];
	} elseif (strcmp($experiment_id, "novelverbs") == 0) { // Manual CB for novelverbs
	  	$needed = array(1,9,12,16,17,22,27,28,29);
    	$c = $needed[rand(0, count($needed)-1)];
	} elseif (strcmp($experiment_id, "oneshot") == 0) { // Manual CB for oneshot, 5/1/15
	  	$needed = array(1,2,2,5,7,7,7,7);
    	$c = $needed[rand(0, count($needed)-1)];
	}
	else {
	  $m = new Mongo($string);
	  $experiments = $m->users->experiment_age; // Mongo collection called 'account'; documents in this 
	  $thisExp = $experiments->findOne(array('experiment_id' => $experiment_id));
	  $nConds = $thisExp['INCLUDED'];

	  $min_part = min($nConds); 
	  $needy_conds = array_keys($nConds, $min_part);

	  $c = $needy_conds[rand(0, count($needy_conds)-1)];
  	}

  return array('condition'=>$c);
  
}

$experiment_id =  $_GET["experiment_id"];
echo json_encode(check_conditions($experiment_id,$CONFIG['dbstring']));

?>