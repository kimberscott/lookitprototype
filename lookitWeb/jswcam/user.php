<?php
 
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

session_start();
include("./login/dbconfig.php");

// Add data to the database for a new registered user
function put_data($experiment_id, $json, $string) {
  $data = json_decode($json, true);

//Database conections
  $m = new Mongo($string);
  $db = $m->users;

  $data['pid'] = $data['name'].$data['email'];
  $clear['email'] = $data['email'];

//Remove the existing entry and add new entry in details collection.
  $collection = $db->details;
  $collection->remove($clear);
  $collection->insert($data);

  $child_details = array();

//Store all the childs data in a separate table.
  foreach ($data as $k=>$v) {
    if($k == 'child' || $k == 'child_name' || $k == 'gender' || $k == 'days' || $k == 'weeks'){
      $child_details[$k] = $v;
      continue;
    }
    elseif($k == 'email'){
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

  // Also send a welcome email at this point:
  $to = $data['email'];

  // subject
  $subject = 'Welcome to Lookit!';

  // message
  $message = '<html><body>';
  $message .= "<p>We're delighted to have you join us in learning more about how your child learns and experiences the world.  Welcome to the online branch of MIT's Early Childhood Cognition Lab, <a href='https://lookit.mit.edu'>Lookit</a>! </p>";
  $message .= '<p> Our online studies are just getting started, so check back as we add new material and feel free to contact us with any questions or feedback by emailing lookit@mit.edu.  We currently have studies available for children ages 4 months through 5 years old.</p>';
  $message .= '<p> Note: this will be the only email we send you unless you opt in to receive updates about new studies, published results, or questions about your responses.  Your email address is kept strictly confidential. </p>';
  $message .= "</body></html>";

  // To send HTML mail, the Content-type header must be set
  $headers  = 'MIME-Version: 1.0' . "\r\n";
  $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

  // Additional headers
  $headers .= 'From: Lookit <lookit@mit.edu>' . "\r\n";
  $headers .= 'mailed-by: blicketadmin@lookit.mit.edu' . "\r\n";
  $headers .= 'signed-by: blicketadmin@lookit.mit.edu' . "\r\n";
  $headers .= 'Reply-To: lookit@mit.edu' . "\r\n" ;

  // Mail it
  $sent_mail = mail($to, $subject, $message, $headers);

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
  $cursor = $collection->find(array('email' => $data['email'],'password' => $data['password']));
  
  foreach ($cursor as $obj) {
    $obj['password'] = "";
    $obj['confirm_password'] = "";
      // Set user data in the session variable
      $_SESSION['user'] = $obj;
      echo json_encode($obj);
      break;
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

  // Count the number of entries for the given data
  $count = $collection->count($data);

  //if data does exists i.e. count > 0
  if($count)
  {
    $cursor = $collection->find($data);
    foreach ($cursor as $obj) {
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
  $find['email'] = $data['email'];

  //Creating a database connection string
  $m = new Mongo($string);
  $db = $m->{$table};
  $collection = $db->details;
  
  // Updating the password and confirmpassword field for the given email.
  $collection->update(array('email' => $data['email']),array('$set' => array('password' => $data['password'],'confirm_password' => $data['confirm_password'])));

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

  $find['email'] = $_SESSION['user']['email'];
  
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
              $test['desc'] = preg_replace("/<\/p>\s+<p>(.*?)<\/p>/", $rep, $temp);
            }

            else{// if single child, no need to loop just replace the description from the details in session.
              $child_name = $_SESSION['user']['child_name'];

              $temp = $test['desc'];
              $rep = "</p><p>Participant: ".$child_name."</br>".$obj['date']."</p>";
              $test['desc'] = preg_replace("/<\/p>\s+<p>(.*?)<\/p>/", $rep, $temp);
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

  $pid = $_SESSION['user']['email'];
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
  $_SESSION['user']['experiment_id'] = $data['expriment_id'];
  $_SESSION['user']['participant'] = $data['participant'];
  $_SESSION['user']['participant_privacy'] = $data['participant_privacy']; 
 
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

  // Retrieve the date of birth of the child from session.
  $participant_dob = $_SESSION['user']['dob'][$index];
  $current_date = DATE("m/d/y");
  $age_in_days = ceil(abs(strtotime($current_date) - strtotime($participant_dob))/86400);

  // Fetch the age range of the participating experiment from the session.
  $experiment_age_range = $_SESSION['user']['age_range'][$data['expriment_id']];

  // Check if the child falls in the accepted age range.
  if($age_in_days >= $experiment_age_range['min_age'] &&  $age_in_days <= $experiment_age_range['max_age']){
    $age_flag = 1;
  }


  $new_find['email'] = $_SESSION['user']['email'];
  $new_find['child_id'] =  $data['participant'];

  if($data['expriment_id']){
    $new_find['experiment_id'] = $data['expriment_id'];
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
  $data['email'] = $_SESSION['user']['email'];
  $clear['email'] = $_SESSION['user']['email'];
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
  $data['email']= $_SESSION['user']['email'];
  $data['child_id']= $_SESSION['user']['participant'];
  $data['experiment_id']= $_SESSION['user']['experiment_id'];
  $data['date']= date("m/d/y");

  $collection = $db->account;
  $collection->insert($data);
  echo "done";
}

// Fetch the demographic form data from the database.
function get_demographic($string){
  $m = new Mongo($string);
  $find['email'] = $_SESSION['user']['email'];
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


switch($function){
  case 'login' :
    login($table, $data, $dbstring);
    break;
  case "check" :
    $x = check($table,$data,$dbstring);
    break;
  case 'reset_pass' :
    reset_pass($table,$data,$dbstring);
    break;
  case 'account' :
    accounts($table,$email,$data,$dbstring);
    break;
  case 'child' :
    $my_datas = child_data($table,$dbstring);
    break;
  case 'experiment_age' :
    check_age($table, $data, $dbstring);
    break;
  case 'params' :
    get_params();
    break;
  case 'demogra':
    demographic($table, $data, $dbstring);
    break;
  case 'set_account':
    account_add($table, $data, $dbstring);
    break;
  case 'get_demogra':
    get_demographic($dbstring);
    break;
  case 'checknumber':
    $x = checknumber($dbstring, $table);
    break;
  default :
    put_data($experiment_id, $data,$dbstring);
    break;
}
?>
