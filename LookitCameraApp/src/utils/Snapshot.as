
/*
*  Copyright (C) MIT Early Childhood Cognition Lab
*/
package utils
{
	//import flash.display.Bitmap;
	import flash.display.BitmapData;
	import mx.core.FlexGlobals;
	import mx.graphics.codec.JPEGEncoder;
	//import mx.utils.Base64Encoder;
	import flash.external.ExternalInterface;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	import flash.utils.ByteArray;
	import flash.events.Event;
	
	public class Snapshot
	{
		private var bm:BitmapData;
		private var ba:ByteArray;
		private var urlObject:Object = new Object;
		private var vLoader: URLLoader = new URLLoader();
		public var receivedVars:URLVariables; 
		
		
		//*****************************************************************************************************************************************************
		//Take snapshot portion starts
		//*****************************************************************************************************************************************************
		
		public function takePicture():void 
		{
			//create a BitmapData variable called picture that has theCam's size
			var picture:BitmapData = new BitmapData(FlexGlobals.topLevelApplication.theCam.width, FlexGlobals.topLevelApplication.theCam.height);
			//the BitmapData draws our theCam
			picture.draw(FlexGlobals.topLevelApplication.theCam);      
			//stores this BitmapData into another BitmapData (outside this function)       
			bm = picture;          
			sendPicture();    
		}
		
		//*****************************************************************************************************************************************************
		//Method - 1 For sending snapshot back to javascript
		//*****************************************************************************************************************************************************
		
		public function sendPicture():void 
		{           
			//creates a new JPEGEncoder called "je"
			//sets the quality to 100 (maximum)
			var je:JPEGEncoder = new JPEGEncoder(100);    
			//creates a new ByteArray called "ba"
			//JPEGEnconder encodes our "bm" Bitmap data: our "picture" 
			ba = je.encode(bm);
			var vRequest:URLRequest = new URLRequest('./Experiment/shot.php');
			vRequest.contentType = 'application/octet-stream';
			vRequest.method = URLRequestMethod.POST;
			vRequest.data = ba;
			vLoader.addEventListener(Event.COMPLETE, variablesAreLoaded);
			vLoader.load(vRequest);
			FlexGlobals.topLevelApplication.theCam.alpha=1.0;
		}
		
		private function variablesAreLoaded(event:Event):void {
			receivedVars = new URLVariables(vLoader.data);
			ExternalInterface.call("image",receivedVars["op_fname"]);  
		}
		
		//*****************************************************************************************************************************************************
		//Method -2 For sending snapshot back to javascript
		//*****************************************************************************************************************************************************
		
		/*
		public function sendPicture():void 
		{     
		//creates a new JPEGEncoder called "je"
		//sets the quality to 100 (maximum)
		var je:JPEGEncoder = new JPEGEncoder(100);    
		//creates a new ByteArray called "ba"
		//JPEGEnconder encodes our "bm" Bitmap data: our "picture" 
		ba = je.encode(bm);
		//this ByteArray is now an encoded JPEG
		var enc:Base64Encoder = new Base64Encoder();   
		enc.encodeBytes(ba);
		ExternalInterface.call("bytearray", enc.drain().split("\n").join(""));
		
		/*var vRequest:URLRequest = new URLRequest('./index.php');
		var vLoader: URLLoader = new URLLoader();
		vRequest.contentType = 'application/octet-stream';
		vRequest.method = URLRequestMethod.POST;
		vRequest.data = ba;
		navigateToURL(vRequest, "_self");
		theCam.alpha=1.0;
		}*/
		
		//**************************************************************************************************************************************
		//Take Snapshot portion ends
		//**************************************************************************************************************************************

	}
}