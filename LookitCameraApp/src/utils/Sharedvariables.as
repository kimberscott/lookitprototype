
/*
*  Copyright (C) MIT Early Childhood Cognition Lab
*/

package utils
{
	import flash.net.SharedObject;
	import flash.media.Microphone;
	import flash.media.Camera;
	
	public class Sharedvariables
	{
		
		//*************************************************************************************************************************
		//Maintaing the sharedObject
		//*************************************************************************************************************************
		
		private var mySharedObject:SharedObject = SharedObject.getLocal("lookitWebcamSettings");
		private function saveWebcamSettings():void
		{	
			mySharedObject.data.cameraID = Camera.getCamera().index;
			mySharedObject.data.micID = Microphone.getMicrophone().index;
			//mySharedObject.flush();
		}
		
		private function getWebcamSettings():void
		{
			//Alert.show(mySharedObject.data.micName.toString());
			Constants.micobject.getMicrophone(mySharedObject.data.micID);
			Constants.camobject.getCam(mySharedObject.data.cameraID);
			//Alert.show("Camera Name : "+ mySharedObject.data.cameraName);
		}
		
		private function updateWebcamSettings():void{
			mySharedObject.clear();
			mySharedObject.data.cameraID = Camera.getCamera().index;
			mySharedObject.data.micID = Microphone.getMicrophone().index;
			mySharedObject.flush();
		}
		
		//*************************************************************************************************************************
		// sharedObject setup ends
		//*************************************************************************************************************************

	}
}