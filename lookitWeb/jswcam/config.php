<?php
/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

// Configuration file for using user specific values
$CONFIG = array();

// Setting up the experiment order parameter, to display the experiment in a user defiend sequence
$CONFIG['experiment_order'] = array("ex03","ex07","ex06","ex09","ex04");
$CONFIG['server'] = "/dev";
$CONFIG['port'] = "27018";
$CONFIG['host'] = 'localhost';
$CONFIG['dbname'] = 'mongodb';

$CONFIG['dbstring'] = $CONFIG['dbname']."://".$CONFIG['host'].":".$CONFIG['port'];
?>