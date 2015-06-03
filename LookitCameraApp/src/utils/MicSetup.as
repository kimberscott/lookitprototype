
/*
*  Copyright (C) MIT Early Childhood Cognition Lab
*/
package utils
{
	import flash.events.ActivityEvent;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.media.Microphone;
	import flash.media.SoundTransform;
	import flash.utils.Timer;
	import flash.text.TextField;
	
	import mx.controls.Alert;
	import mx.core.ClassFactory;
	import mx.core.FlexGlobals;
	import mx.events.ListEvent;
	
	import flash.geom.Matrix;
	import flash.display.InterpolationMethod;
	import flash.display.SpreadMethod;
	import flash.display.GradientType;

	import utils.Constants;
	
	public class MicSetup
	{
			
		
		//Mic
		public var _mic : Microphone;
		//Microphone List
		private var _microphones : Array;
		//Microphone timer
		private var _micTimer:Timer;
		private var _highActivityLvl : Number = -2 ;
		private var _selectedMicIndex : Number;
		private var _activityLvlChangeArray:Array;
		private var _micCheckCount : int = 0;
		private var _micChkTimer : Timer;
		private var _oldActivityLvl :int = -2;
		private var _currentActivityLvlChange:int ;
		private var _currentMicIndex:int = 0 ;
		private var _highActivityLvlChange:int=-2;
		private var _highActivityLvlMicIndex : Number = -2 ;
		private var matrix:Matrix;

		public function getMicrophone(index : Number):void
		{
			// Get default mic
			_mic = Microphone.getMicrophone(index);
			_mic.setSilenceLevel(0, int.MAX_VALUE);
			_mic.setUseEchoSuppression(true);
			// Do we really want this on loopback???
			_mic.soundTransform = new SoundTransform(0);
			_mic.setLoopBack(true);
			_mic.noiseSuppressionLevel = 60;
			//_mic.addEventListener(ActivityEvent.ACTIVITY, startMicCheckTimer);
			
			// Skip all of this figuring out which is the best microphone. 
			// How many do most people have?! Just give folks the darn list.
			addMicList(index);
		}
		

		private function addMicList(_selMicIndex:Number):void
		{
			//Getting the list of microphones
			_microphones = Microphone.names;
			//If no Microphone is connected , then return
			if(_microphones.length <= 0)
			{
				return;
			}
			//Creating the list of microphones connected to the system to be added to the combo box
			var _micComboList : Array = new Array();
			for(var i : int = 0; i < _microphones.length; i++)
			{
				var obj : Object = new Object();
				var tf:TextField = new TextField();
				tf.text =_microphones[i];
				if(tf.textWidth > (FlexGlobals.topLevelApplication._micList.width-50)){
					tf.width = (FlexGlobals.topLevelApplication._micList.width-50);
					Constants.truncate(tf);
				}
				obj.label = tf.text; 
				_micComboList.push(obj);
				Constants.mic.appendChild(<item label={obj.label} icon="icon2"></item>);
			}

			FlexGlobals.topLevelApplication._micList.addEventListener(ListEvent.CHANGE, _microphoneChanged );

			FlexGlobals.topLevelApplication._micList.itemRenderer = new ClassFactory(mx.controls.Label);

			FlexGlobals.topLevelApplication._micList.toolTip = FlexGlobals.topLevelApplication._micList.selectedLabel.toString();
			FlexGlobals.topLevelApplication._micList.selectedIndex = _selMicIndex;
			
			setupMicLevelIndicator();
			
		}
		
		private function _microphoneChanged ( event : ListEvent ) : void 
		{	

			var _newMicrophoneName : String = _microphones [event.currentTarget.selectedIndex];	
			
			//Update Tooltip on the camera list with the current selected value
			FlexGlobals.topLevelApplication._micList.toolTip = event.currentTarget.selectedLabel.toString();
			if ( FlexGlobals.topLevelApplication._micList.name != _newMicrophoneName ) 
			{
				var tf:TextField = new TextField();
				tf.text = _newMicrophoneName;
				if(tf.textWidth > (FlexGlobals.topLevelApplication._micList.width-50)){
					tf.width = (FlexGlobals.topLevelApplication._micList.width-50);
					Constants.truncate(tf);
				}

				_mic = Microphone.getMicrophone( event.currentTarget.selectedIndex);
				// What on earth, web intensive. Why would the silence level be 60 when you change mics.
				_mic.setSilenceLevel(0, int.MAX_VALUE);
				_mic.setUseEchoSuppression(true);
				_mic.noiseSuppressionLevel = 60;
				_mic.soundTransform = new SoundTransform(0);
				_mic.setLoopBack(true);
			}
		}
		
		private function setupMicLevelIndicator():void
		{
			if (_mic != null) 
			{
				_micTimer = new Timer(100, 0);
				_micTimer.addEventListener(TimerEvent.TIMER, showMicLevelIndicator);
				_micTimer.start();
			}
		}
		
		private function showMicLevelIndicator(event:TimerEvent):void
		{ 
			var h:int;
			var y:int;
			if (_mic.activityLevel > 0) 
			{
				h = _mic.activityLevel;
			} 
			else 
			{
				h = 5;
			}
			h *=(FlexGlobals.topLevelApplication.theCam.height/100);
			matrix = new Matrix();
			matrix.createGradientBox(FlexGlobals.topLevelApplication.micLevelCanvas.width,FlexGlobals.topLevelApplication.micLevelCanvas.height,(3*Math.PI)/2);
			FlexGlobals.topLevelApplication.micLevelCanvas.graphics.clear();
			FlexGlobals.topLevelApplication.micLevelCanvas.graphics.beginGradientFill(GradientType.LINEAR, [0xFFFF00,0x00ff00,0xff0000], [1, 1, 1], [0, 100, 240], matrix, SpreadMethod.PAD, InterpolationMethod.LINEAR_RGB);
			FlexGlobals.topLevelApplication.micLevelCanvas.graphics.drawRect(0, FlexGlobals.topLevelApplication.theCam.height, 10, -h );
			FlexGlobals.topLevelApplication.micLevelCanvas.graphics.endFill();
			Constants._micSet = 1;
			
			if(Constants._cameraSet == 1 && Constants._micSet == 1)
			{
				//FlexGlobals.topLevelApplication.throbber.visible=false;
				FlexGlobals.topLevelApplication.theCam.attachCamera(Constants.camobject._camera);
				Constants.selected_cam = Constants.camobject._camera;
				ExternalInterface.call("record_active","1");
				Constants._cameraSet = 0;
				Constants._micSet = 0;
				Constants._camListPopulateComplete = true;
				//Constants.snapshot.getBrightness();
				ExternalInterface.call("connected_mic_cam");
			}
		}
	}
}