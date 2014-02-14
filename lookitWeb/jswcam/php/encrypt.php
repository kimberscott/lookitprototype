<?php

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
 
require_once('util.php');

function encrypt($experiment_id, $user_id, $file) {
  //$path = joinPath(getUploadPath(), $file);
  $path = getUploadSavePath($experiment_id, $user_id, $file);
  if($handle = fopen($path, 'r')) {
    $fsize = filesize($path);
    $buffersize = 4096; //cannot be over 8k (8192) or for-loop breaks
    $contents = '';
    for($i = 0; $i < $fsize; $i += $buffersize) {
      $contents .= fread($handle, $buffersize);
    }
    fclose($handle);
    
    try {
      $gpg = gnupg_init();  
      $pubkey = getPublicKey();
      $info = gnupg_import($gpg, $pubkey);
      $fingerprint = getFingerprint();
      $info = gnupg_addencryptkey($gpg, $fingerprint);
      gnupg_setarmor($gpg, 0);
      
      $error = gnupg_geterror($gpg);
      if(!$error) {
	$enc = gnupg_encrypt($gpg, $contents);
	echo "Writing {$path}.gpg";
	if($handle = fopen($path . '.gpg', 'w')) {
	  fwrite($handle, $enc);
	  fclose($handle);
	  return true;
	}
      } else {
	//return $error;
	throw new Exception($error);
      }
    } catch(Exception $e) {
      echo $e; //FOR NOW! TODO: REMOVE
    }
  }
  return false;
}

?>