<?php 

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

require_once('config_kim.php'); 

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

?>

<!DOCTYPE html>
<html>
  <head>
	<META http-equiv="Content-Type" content="text/html;  charset=ISO-8859-1">
    <title> Lookit study test page </title>
	
    <link rel="shortcut icon" type="image/x-icon" href="img/remy4.ico">
	
	<link rel="stylesheet/less" type="text/css" href="fragments/styles.less"></link>
	<link rel="stylesheet" type="text/css" href="static/datepicker/css/datepicker.css"></link>
	

    <script src="static/js/jquery-1.8.1.min.js"></script> 
    <script src="static/js/bootstrap.min.js" type="text/javascript"></script>
    <script src="bootbox/bootbox.min.js" type="text/javascript"></script>
    
    <script src="less.js" type="text/javascript"></script>
    <script src="camera/swfobject.js" type="text/javascript"></script>
    <script src="login/validate.js" type="text/javascript"></script>
    <script src="login/json.js" type="text/javascript"></script>
    <script src="index.js" type="text/javascript"></script>	   
    <script src="test_experiments.js" type="text/javascript"></script> 
    <script src="login/myfunc.js" type="text/javascript"></script>   

    

    <?php 
  	$experiments = load_experiments($CONFIG['experiment_order']);
    ?>
    

	
    </head>
    
    <body style="padding-top:40px;" ondragstart="return false;" ondrop="return false;">
    
    <form>
    <label for="choose_exp"> Choose an experiment... </label>
    <br>
    <select name="choose_exp" id="choose_exp">
    </select>
    </form>
    
    <button id="start_exp"> Start! </button>
    
    <script type="text/javascript"> var exp = <?php echo json_encode($experiments); ?>; </script>
      
      
  	</body>
</html>
