<?php
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

	include("./dbconfig.php");

	if($_POST){
		$str = json_encode($_POST);

		$m = new Mongo($dbstring);
  		$db = $m->users;
  		$collection = $db->experiment_age;
  		$collection->insert($_POST);
	}
?>
<form id="days" action="insert_range.php" method="post">
	<label>Experiment Name: </label><input type="text" id="expt_id" name = "experiment_id" />	</br></br>
	<label>Minimum Age: </label><input type="text" id="min_age" name = "min_age" />	</br></br>
	<label>Maximum Age: </label><input type="text" id="max_age" name = "max_age" />	</br></br>
	<input type="submit">
</form>