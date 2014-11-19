
/*
*  Copyright (C) MIT Early Childhood Cognition Lab
*/

package utils
{
	import flash.events.StatusEvent;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.media.Camera;
	import flash.system.Security;
	import flash.system.SecurityPanel;
	import flash.text.TextField;
	import flash.utils.Timer;
	
	import mx.controls.Alert;
	import mx.core.ClassFactory;
	import mx.core.FlexGlobals;
	import mx.events.ListEvent;
	
	public class CamSetup
	{
		private var _cameras : Array;
		//Camera
		public var _camera : Camera;
		private var _currentCamIndex : int = 0;
		private var _highFPSCameraIndex : int;
		private var _frameRateChangeArray : Array;
		private var _oldFrameRate:int = -1;
		private var _lowFrameRateChange:int = -1;
		private var _currentFrameRateChange:int ;
		private var _camListPopulated:Boolean=false;

		//Camera Timer 
		private var _camTimer : Timer;
		
		public function getCam(camIndex:int):void
		{	
			if ( Camera.names.length <= 0 ) 
			{
				FlexGlobals.topLevelApplication.throbber.visible=false;
				FlexGlobals.topLevelApplication.noCam.visible = true;
				FlexGlobals.topLevelApplication.theCam.visible = false;
				FlexGlobals.topLevelApplication.theCam.includeInLayout = false;
				FlexGlobals.topLevelApplication.micContainer.visible = false;
				FlexGlobals.topLevelApplication.dropdowns.visible = true;
				FlexGlobals.topLevelApplication.nocamimage.visible = true;
				FlexGlobals.topLevelApplication.noCam.text =  "No Camera Found \nPlease attach a camera or close any other applications currently accessing your webcam.";
				ExternalInterface.call("nocamera");
				return;
			}
			else
			{
				// assign the user's default camera to a variable
				_camera = Camera.getCamera(camIndex.toString());
				//check camera permission
				if(_camera.muted){
					FlexGlobals.topLevelApplication.throbber.visible=false;
					FlexGlobals.topLevelApplication.noCam.visible = true;
					FlexGlobals.topLevelApplication.theCam.visible = false;
					FlexGlobals.topLevelApplication.theCam.includeInLayout = false;
					FlexGlobals.topLevelApplication.micContainer.visible = false;
					FlexGlobals.topLevelApplication.dropdowns.visible = true;
					FlexGlobals.topLevelApplication.nocamimage.visible = true;
					FlexGlobals.topLevelApplication.noCam.text =  "No Permission to Access Webcam \nPlease check your browser or Flash settings and allow webcam access for Lookit.";
					_camera.addEventListener(StatusEvent.STATUS, checkCameraPermission);
					Security.showSettings(SecurityPanel.PRIVACY);
					
				}
				else{
					FlexGlobals.topLevelApplication.noCam.visible = false;
					FlexGlobals.topLevelApplication.noCam.includeInLayout = false;
					FlexGlobals.topLevelApplication.nocamimage.visible = false;
					FlexGlobals.topLevelApplication.micContainer.visible = true;
					FlexGlobals.topLevelApplication.dropdowns.visible = true;
					FlexGlobals.topLevelApplication.theCam.visible = true;
					_camera.addEventListener(StatusEvent.STATUS, checkCameraPermission);
					postCameraPermissionCheck();
				}
			}
			
		}
		
		private function postCameraPermissionCheck():void{
			// set the camera quality to be the highest as possible
			_camera.setQuality(0, 100); 
			// set the width, height, frames per second
			_camera.setMode(640,480,30);
			FlexGlobals.topLevelApplication.theCam.y = FlexGlobals.topLevelApplication.theCam.width;
			FlexGlobals.topLevelApplication.theCam.scaleX *= -1;
			_camListPopulated = true;
			//Calculating the camera FPS
			calculateCameraFPS();
			
		}
		private function checkCameraPermission(event:StatusEvent):void{
			if(event.code == "Camera.Unmuted"){
				FlexGlobals.topLevelApplication.nocamimage.visible = false;
				FlexGlobals.topLevelApplication.noCam.visible = false;
				FlexGlobals.topLevelApplication.noCam.includeInLayout = false;
				FlexGlobals.topLevelApplication.throbber.visible = true;
				FlexGlobals.topLevelApplication.theCam.includeInLayout = true;
				FlexGlobals.topLevelApplication.theCam.visible = true;
				FlexGlobals.topLevelApplication.micContainer.visible = true;
				FlexGlobals.topLevelApplication.dropdowns.visible = true;
				if(!_camListPopulated){
					FlexGlobals.topLevelApplication.throbber.visible = true;
					postCameraPermissionCheck();
				}
				if(Constants._camListPopulateComplete){
					FlexGlobals.topLevelApplication.throbber.visible = false;
				}
				if(Constants.is_consent){
					FlexGlobals.topLevelApplication.dropdowns.visible = false;
				}
			}else{
				FlexGlobals.topLevelApplication.theCam.visible = false;
				FlexGlobals.topLevelApplication.theCam.includeInLayout = false;
				FlexGlobals.topLevelApplication.noCam.includeInLayout = true;
				FlexGlobals.topLevelApplication.noCam.visible = true;
				FlexGlobals.topLevelApplication.nocamimage.visible = true;
				FlexGlobals.topLevelApplication.micContainer.visible = false;
				FlexGlobals.topLevelApplication.throbber.visible = false;
				FlexGlobals.topLevelApplication.noCam.text =  "No Permission to Access Webcam \nPlease check your browser or Flash settings and allow webcam access for Lookit.";
			}	
		}
		
		private function calculateCameraFPS():void
		{
			//Initiate Timer
			_frameRateChangeArray = new Array();
			_currentFrameRateChange = -1;
			_camTimer = new Timer (100,20 );
			_camTimer.addEventListener( TimerEvent.TIMER, camTimerEventHandler );
			_camTimer.addEventListener( TimerEvent.TIMER_COMPLETE, timerCompleteEventHandler);
			_camTimer.start();
		}
		
		private function camTimerEventHandler (e : TimerEvent ) : void 
		{	
			if(_oldFrameRate == -1)
			{
				_oldFrameRate = _camera.currentFPS;
			}
			else
			{	
				var frameRateChange : int = Math.abs( _oldFrameRate - _camera.currentFPS);
				_frameRateChangeArray.push(frameRateChange);
			}
		}
		
		private function timerCompleteEventHandler ( event : TimerEvent ) : void 
		{	
			//Stop Timer
			_camTimer.stop();
			_camTimer.reset();	
			calculateFrameRateChange();
			var _numCamera : int = Camera.names.length;
			if(_numCamera > 1)
			{	
				if(_currentCamIndex < _numCamera)
				{	
					if((_lowFrameRateChange == -1) || ( _lowFrameRateChange > _currentFrameRateChange ))
					{
						_lowFrameRateChange = _currentFrameRateChange;
						_highFPSCameraIndex = _currentCamIndex; 
					}
					FlexGlobals.topLevelApplication.theCam.attachCamera(null);
					Constants.selected_cam = null;
					_currentCamIndex++;
					if(_currentCamIndex == _numCamera)
					{
						addBestCam(_highFPSCameraIndex); 
					}
					else
					{
						getCam(_currentCamIndex);
					}	
				}		
			}
			else
			{
				getCameraList(0);
			}
		}
		
		private function calculateFrameRateChange():void
		{
			var len : int = _frameRateChangeArray.length;
			var sumTotal:int = 0;
			for(var i : int = 0; i < len; i++)
			{	
				sumTotal = sumTotal + (_frameRateChangeArray[i]*_frameRateChangeArray[i])
			}
			_currentFrameRateChange = Math.sqrt(sumTotal/len);
		}
		
		private function addBestCam(finalCamIndex:int):void{
			FlexGlobals.topLevelApplication.theCam.attachCamera(null);
			Constants.selected_cam = null;
			_camera = Camera.getCamera(finalCamIndex.toString());
			
			// set the camera quality to be the highest as possible
			_camera.setQuality(0, 100); 
			
			// set the width, height, frames per second
			_camera.setMode(640,480, 30);
			Constants.selected_cam = _camera;
			// attach the camera to our "theCam" VideoDisplay
			getCameraList(finalCamIndex);
			// Mirroring the video feed
			FlexGlobals.topLevelApplication.theCam.y = FlexGlobals.topLevelApplication.theCam.width;
			FlexGlobals.topLevelApplication.theCam.scaleX *= -1;
		}
		
		private function cameraChanged ( event : ListEvent ) : void 
		{
			//Detach current camera
			FlexGlobals.topLevelApplication.theCam.attachCamera(null);
			Constants.selected_cam = null;
			var _newCameraName : String = _cameras[event.currentTarget.selectedIndex];
			//Update Tooltip on the camera list with the current selected value
			FlexGlobals.topLevelApplication._cameraList.toolTip = event.currentTarget.selectedLabel.toString();
			if ( FlexGlobals.topLevelApplication._cameraList.name != _newCameraName ) 
			{
				
				var tf:TextField = new TextField();
				tf.text = _newCameraName;
				if(tf.textWidth > (FlexGlobals.topLevelApplication._micList.width-70)){
					tf.width = FlexGlobals.topLevelApplication._micList.width-70;
					Constants.truncate(tf);
				}
				_camera = Camera.getCamera( event.currentTarget.selectedIndex + "" );
				//Set Camera Quality
				_camera.setQuality( 0, 100 );
				_camera.setMode(640, 480, 30);	
				//Attach camera
				FlexGlobals.topLevelApplication.theCam.attachCamera(_camera);
				Constants.selected_cam = _camera;
			}
		}
		
		private function getCameraList(_selCamIndex:int):void
		{	
			//Getting the list of cameras
			_cameras = Camera.names;	
			//If no camera is connected , return
			if ( _cameras.length <= 0 ) 
			{
				FlexGlobals.topLevelApplication.throbber.visible=false;
				FlexGlobals.topLevelApplication.theCam.visible = false;
				FlexGlobals.topLevelApplication.noCam.visible = true;
				FlexGlobals.topLevelApplication.noCam.text =  "No Camera Found \nPlease attach a camera or close any other applications currently accessing your webcam.";
				return;
			}
			else
			{
				//FlexGlobals.topLevelApplication.theCam.visible = true;
				//FlexGlobals.topLevelApplication.theCam.x = 710;
				//FlexGlobals.topLevelApplication.theCam.y = 10;
			}
			//Creating the list of camreas
			var comboList : Array = new Array();
			for(var i : int = 0; i < _cameras.length; i++)
			{
				var obj : Object = new Object();
				
				var tf:TextField = new TextField();
				tf.text =_cameras[i];
				if(tf.textWidth > (FlexGlobals.topLevelApplication._micList.width-70)){
					tf.width = FlexGlobals.topLevelApplication._micList.width-70;
					Constants.truncate(tf);
				}
				obj.label = tf.text; 
				
				comboList.push(obj);
				Constants.cam.appendChild(<item label={obj.label} icon="icon1"></item>);
			}
			FlexGlobals.topLevelApplication._cameraList.addEventListener(ListEvent.CHANGE, cameraChanged );
			FlexGlobals.topLevelApplication._cameraList.itemRenderer = new ClassFactory(mx.controls.Label);
			FlexGlobals.topLevelApplication._cameraList.toolTip = FlexGlobals.topLevelApplication._cameraList.selectedLabel.toString();
			//Setting the best cam
			FlexGlobals.topLevelApplication._cameraList.selectedIndex = _selCamIndex;
			Constants._cameraSet = 1;
			if(Constants._cameraSet == 1 && Constants._micSet == 1)
			{
				FlexGlobals.topLevelApplication.throbber.visible=false;
				FlexGlobals.topLevelApplication.theCam.attachCamera(_camera);
				Constants.selected_cam = _camera;
				ExternalInterface.call("record_active","1");
				Constants._cameraSet = 0;
				Constants._micSet = 0;
				Constants._camListPopulateComplete = true;
				Constants.snapshot.getBrightness();
				ExternalInterface.call("connected_mic_cam");
			}
		}
		
	}
}