<?php

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

session_start();
include("./php/config.php");
include("./php/password.php");

// Add data to the database for a new registered user
function put_data($experiment_id, $json, $string) {
  $data = json_decode($json, true);

//Database conections
  $m = new Mongo($string);
  $db = $m->users;

  $data['pid'] = $data['name'].$data['email_label'];
  $data['user_id'] = 1;

  // Converting email of user to lowercase irrespective of the case entered by user, 
  // for login and storage purposes.
  $find['email_code'] = strtolower($data['email_label']);
  $data['email_code'] = strtolower($data['email_label']);

  $collection = $db->details;
  // Get the highest id that exists in the database, increase it by 1 and set it as the user_id
  $val =$collection->find()->sort( array('user_id' => -1 ) )->limit(1);
  foreach($val as $vali){
    if($vali['user_id']){
      $data['user_id'] = $vali['user_id'] + 1;
    }
  }

  $count = $collection->count($find); // Check if there is any entry for the user
  if($count){ // If entry exists update the data
    $data['user_id'] = $_SESSION['user']['user_id'];
    $collection->update($find,array('$set' => $data));
  }
  else{ // If not exists, insert the data into database.
    $data['password'] = generate_password_hash($data['password']);
    $data['confirm_password'] = $data['password'];
    $collection->insert($data);
  }

  $child_details = array();

//Store all the childs data in a separate table.
  foreach ($data as $k=>$v) {
    if($k == 'child' || $k == 'child_name' || $k == 'gender' || $k == 'days' || $k == 'weeks'){
      $child_details[$k] = $v;
      continue;
    }
    elseif($k == 'email_label'){
      $child_details['parent_id'] = $v;
      continue;
    }
  }
  //Clear and store the childs data in the childs collection
  $new_clear['parent_id'] =  $child_details['parent_id'];
  $new_collection = $db->childs;
  $new_collection->remove($new_clear);
  $new_collection->insert($child_details);

  //Clear and Save data to session
  $_SESSION['user'] = "";
  $data['password'] = "";
  $data['confirm_password'] = "";
  $_SESSION['user'] = $data;

  echo $data['name'];

}

//Function to generate password hash
function generate_password_hash($password){
$hash = password_hash($password, PASSWORD_BCRYPT);
return $hash;
}

// Function to fetch the experiment age requirement to the session array
Function get_experiment_age_range($string){

  $package = array();

  $m = new Mongo($string);
  $db = $m->users;
  $collection = $db->experiment_age;
  $cursor = $collection->find();

  // Set the data in the session array.
  foreach($cursor as $obj){
    foreach($obj as $k=>$v){
      if($k != '_id'){ // Not considering the _id field
        $arr[$k] = $v;
      }
    }
    $package[$arr['experiment_id']] = $arr;
  }
  $_SESSION['user']['age_range'] = $package;
}

// Function to check the logging users authentication and authorizing him to participate in the studies
function login($table, $json, $string){
  $data = json_decode($json, true);

  // Create database connection
  $m = new Mongo($string);
  $db = $m->{$table};
  $collection = $db->details;

  $package = array();

  //Search if the email and password match in the database
  $cursor = $collection->find(array('email_code' => strtolower($data['email_label'])));
  foreach ($cursor as $obj) {
 $password_hash = $obj['password'];
    if(password_verify($data['password'],$password_hash)){
    $obj['password'] = "";
    $obj['confirm_password'] = "";
      // Set user data in the session variable
      $_SESSION['user'] = $obj;
      echo json_encode($obj);
      break;
    }
  }
}

// Function to check if the queried data exists in the database or not
function check($table,$json,$string){

  $data = json_decode($json, true);

  // Database connection to the details collection
  $m = new Mongo($string);
  $db = $m->{$table};
  $collection = $db->details;

  // Check if the data array has a flag key.
  if(array_key_exists('flag',$data)){

    // Unset the flag and check if the requested data exists in the account collection
    $collection = $db->account;
    unset($data['flag']);
    $cursor = $collection->find($data);
    foreach ($cursor as $obj) {
      echo 1;
      return;
    }
  }
  $find['email_code'] = strtolower($data['email_label']);
  // Count the number of entries for the given data
  $count = $collection->count($find);
  //if data does exists i.e. count > 0
  if($count)
  {
    $cursor = $collection->find($find);
    foreach ($cursor as $obj) {
      if($data['action'] == "update_password"){
        if(password_verify($data['password'],$obj['password'])){
          echo "updated ".$obj['name'];
          return;
        }
        return;
      }
      echo $obj['name'];
    }
  }
}

//Function to check the number of user accounts in the database.
function checknumber($string,$table){

  $LIMIT =1000;

  // Create Database connection.
  $m = new Mongo($string);
  $db = $m->{$table};
  $collection = $db->details;
  // Count the total number of accounts in the database.
  $count_all_accounts = $collection->count();

  // If number of accounts is less than the specified limit
  if($count_all_accounts > $LIMIT) {
  echo 'true';
  return;
  }

}

// Function to reset the users password in the database
function reset_pass($table,$json, $string){
  $data = json_decode($json, true);
  $find['email_code'] = $data['email_label'];

  //Creating a database connection string
  $m = new Mongo($string);
  $db = $m->{$table};
  $collection = $db->details;
  $data['password'] = generate_password_hash($data['password']);
  $data['confirm_password'] = $data['password'];
  // Updating the password and confirmpassword field for the given email.
  $collection->update($find,array('$set' => array('password' => $data['password'],'confirm_password' => $data['confirm_password'])));

  $cursor = $collection->find($find);
  foreach ($cursor as $obj) {

    $obj['password'] = "";
    $obj['confirm_password'] = "";

    // Set user data in the session variable
    $_SESSION['user'] = $obj;
    echo json_encode($obj);
    break;
  }
}

//Function to fetch the participated study information of the user from the database once logged in.
function accounts($table,$email,$data,$string){

  $find['email_label'] = $_SESSION['user']['email_label'];

  // Create a database connection and fetch the account details of the particular user
  $m = new Mongo($string);
  $db = $m->{$table};
  $collection = $db->account;
  $cursor = $collection->find($find);

  $packages = array();

  // For each entry of the user
  foreach ($cursor as $obj) {
    foreach($obj as $key => $value) {

      // Check if the key from the retrieved data is experiment_id
      if($key == 'experiment_id'){
        foreach ($data as $test) {
          if($value == $test['id']){ // If value equals the id the paticipating experiment

            $index = 0;
            if(is_array($_SESSION['user']['child'])){ // If more than one childs

              // Fetch the index of the child from the session data
              foreach ($_SESSION['user']['child'] as $key => $value) {
                if($value == $obj['child_id']){
                  break;
                }
                $index++;
              }

              // Retrieve the name of the child from session.
              $child_name = $_SESSION['user']['child_name'][$index];

              // Replace the description of the experiment with the name of participant and the participation date
              $temp = $test['desc'];
              $rep = "</p><p>Participant: ".$child_name."</br>".$obj['date']."</p>";
              $test['desc'] = preg_replace("/<\/p>\s*<p>(.*?)<\/p>/", $rep, $temp);
            }

            else{// if single child, no need to loop just replace the description from the details in session.
              $child_name = $_SESSION['user']['child_name'];

              $temp = $test['desc'];
              $rep = "</p><p>Participant: ".$child_name."</br>".$obj['date']."</p>";
              $test['desc'] = preg_replace("/<\/p>\s*<p>(.*?)<\/p>/", $rep, $temp);
            }
            $packages[] = $test;
          }
        }
      }
    }
  }
  echo json_encode($packages);
}

// Get the child data with all childs information
function child_data($table,$string,$str=''){

  $m = new Mongo($string);
  $db = $m->{$table};

  $pid = $_SESSION['user']['email_label'];
  $find['parent_id'] = $pid;

  $collection = $db->childs;
  $cursor = $collection->find($find);
  foreach ($cursor as $obj){
    
    if(!$str){
      echo json_encode($obj);
    }
    return $obj;
  }

}

// Function to check the age of the participating child with the minimum and maximum
// age requirement of the experiment.
function check_age($table, $json, $string){

  $data = json_decode($json, true);

  $age_flag = 0;
  $participated_flag = 0;
  $index = 0;
  get_experiment_age_range($string); // Fetching the experiment data from the db.

  // Setting participant's data in session.
  $_SESSION['user']['experiment_id'] = $data['experiment_id'];
  $_SESSION['user']['participant'] = $data['participant'];
  $_SESSION['user']['participant_privacy'] = "INCOMPLETE";

  if(is_array($_SESSION['user']['child'])){ // If more than one childs

    // Get the index of the participating child from the session.
    foreach ($_SESSION['user']['child'] as $key => $value) {
      if($value == $data['participant']){
        break;
      }
      $index++;
    }

    // Retrieve the date of birth of the child from session.
    $participant_dob = $_SESSION['user']['dob'][$index];
  }
  else{
    $participant_dob = $_SESSION['user']['dob'];
  }
  $current_date = DATE("m/d/y");
  $age_in_days = ceil(abs(strtotime($current_date) - strtotime($participant_dob))/86400);

  // Fetch the age range of the participating experiment from the session.
  $experiment_age_range = $_SESSION['user']['age_range'][$data['experiment_id']];

  // Check if the child falls in the accepted age range.
  if($age_in_days >= $experiment_age_range['min_age'] &&  $age_in_days <= $experiment_age_range['max_age']){
    $age_flag = 1;
  }

  $new_find['endedEarly'] = 'false'; // Only 'count' participation if they didn't end early
  $new_find['email_label'] = $_SESSION['user']['email_label'];
  $new_find['child_id'] =  $data['participant'];

  if($data['experiment_id']){
    $new_find['experiment_id'] = $data['experiment_id'];
  }

  // Creating connection string to check if the child has already participated in the experiment
  $m = new Mongo($string);
  $db = $m->{$table};
  $new_collection = $db->account;
  $new_cursor = $new_collection->find($new_find);

  foreach ($new_cursor as $obj){

    if($obj){ // Checking if the child has already participated.
      $participated_flag = 1;
    }
  }
  echo $age_flag.$participated_flag;
}

// Get the session array
function get_params(){
  echo json_encode($_SESSION['user']);
}

// Store the user filled demographic form data into the database.
function demographic($table, $json, $string){
  $data = json_decode($json, true);

  $m = new Mongo($string);
  $db = $m->users;
  $data['email_label'] = $_SESSION['user']['email_label'];
  $clear['email_label'] = $_SESSION['user']['email_label'];
  $collection = $db->demographic;

  $collection->remove($clear);
  $_SESSION['user'] += $data;
  $collection->insert($data);

  echo "done";
}

// Add the participated experiment information into the database.
function account_add($table,$data,$string){
  $m = new Mongo($string);
  $db = $m->users;
  $data['email_label']= $_SESSION['user']['email_label'];
  $data['child_id']= $_SESSION['user']['participant'];
  $data['experiment_id']= $_SESSION['user']['experiment_id'];
  $data['date']= date("m/d/y");

  $collection = $db->account;
  $collection->update(array('dbid' => $data['dbid']), $data, array("upsert" => true));

  echo $data['dbid'];
}

// Fetch the demographic form data from the database.
function get_demographic($string){
  $m = new Mongo($string);
  $find['email_label'] = $_SESSION['user']['email_label'];
  $db = $m->users;
  $collection = $db->demographic;
  $cursor = $collection->find($find);
  foreach ($cursor as $obj){
    echo json_encode($obj);
  }
}

// Assigns a value to the variables from post data
function getValue($ref, $default) {
  $value = $default;
  if(isset($_POST[$ref])) {

    $value = $_POST[$ref];
  }
  else if(isset($_GET[$ref])){

    $value = $_GET[$ref];
  }
  return $value;
}
$experiment_id = getValue('experiment_id', 'unknown_exp');
$user_id = getValue('user_id', uniqid('null_user_'));
$data = getValue('json_data', '{}');
$function = getvalue('function','');
$table = getValue('table','');
$email = getvalue('email','');

$log = "Form Post Data for user: " . $user_id . PHP_EOL .
        "For function: " . $function . PHP_EOL .
        "For Experiment ID: " . $experiment_id . PHP_EOL .
        "Data: " . $data . PHP_EOL .
        "On Date: " . date("F j, Y, g:i a") . PHP_EOL .
        "------------------------" . PHP_EOL;
file_put_contents('./logs/log_'.date("jnY").'.txt', $log, FILE_APPEND);

switch($function){
  case 'login' :
    login($table, $data, $CONFIG['dbstring']);
    break;
  case "check" :
    $x = check($table,$data,$CONFIG['dbstring']);
    break;
  case 'reset_pass' :
    reset_pass($table,$data,$CONFIG['dbstring']);
    break;
  case 'account' :
    accounts($table,$email,$data,$CONFIG['dbstring']);
    break;
  case 'child' :
    $my_datas = child_data($table,$CONFIG['dbstring']);
    break;
  case 'experiment_age' :
    check_age($table, $data, $CONFIG['dbstring']);
    break;
  case 'params' :
    get_params();
    break;
   case 'refresh':
    echo $_SESSION['user']['name'];
    break;
  case 'demogra':
    demographic($table, $data, $CONFIG['dbstring']);
    break;
  case 'set_account':
    account_add($table, $data, $CONFIG['dbstring']);
    break;
  case 'get_demogra':
    get_demographic($CONFIG['dbstring']);
    break;
  case 'checknumber':
    $x = checknumber($CONFIG['dbstring'], $table);
    break;
  default :
    put_data($experiment_id, $data, $CONFIG['dbstring']);
    break;
}
?>
