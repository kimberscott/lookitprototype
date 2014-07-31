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
  
  $m = new Mongo($string);
  $experiments = $m->users->experiment_age; // Mongo collection called 'account'; documents in this 
  $thisExp = $experiments->findOne(array('experiment_id' => $experiment_id));
  $nConds = $thisExp.INCLUDED;
  
  $small_pair = min($nConds); // (#subjects, conditionIndex)
  
  return array('condition'=>$small_pair[1]);
}

$experiment_id =  $_GET["experiment_id"];
echo json_encode(check_conditions($experiment_id,$CONFIG['dbstring']));

?>