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
function put_data($experiment_id, $user_id, $json) {
  $data = json_decode($json, true);

  $m = new Mongo('mongodb://localhost:27018');
  $db = $m->{$experiment_id};

  $collection = $db->trials;

  $data['_id'] = $user_id;
  $collection->insert($data);
  
}

function getValue($ref, $default) {
  $value = $default;
  if(isset($_POST[$ref])) {
    $value = $_POST[$ref];
  }
  return $value;
}

$experiment_id = getValue('experiment_id', 'unknown_exp');
$user_id = getValue('user_id', uniqid('null_user_'));
$data = getValue('json_data', '{}');
put_data($experiment_id, $user_id, $data);

?>
