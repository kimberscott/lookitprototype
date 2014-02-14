
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
			_mic.soundTransform = new SoundTransform(0);
			_mic.setLoopBack(true);
			_mic.useEchoSuppression;
			_mic.noiseSuppressionLevel = 60;
			_mic.addEventListener(ActivityEvent.ACTIVITY, startMicCheckTimer);
		}
		
		
		private function startMicCheckTimer(event:ActivityEvent):void
		{
			_mic.removeEventListener(ActivityEvent.ACTIVITY, startMicCheckTimer);
			_activityLvlChangeArray = new Array ();
			_oldActivityLvl = -2;
			_micChkTimer = new Timer(100,20);
			_micChkTimer.addEventListener( TimerEvent.TIMER, _micTimerEventHandler );
			_micChkTimer.addEventListener( TimerEvent.TIMER_COMPLETE, _micTimerCompleteEventHandler);
			_micChkTimer.start();
		}	
		
		private function _micTimerEventHandler(e : TimerEvent ):void
		{
			if(_oldActivityLvl == -2)
			{
				_oldActivityLvl = _mic.activityLevel;
			}
			else
			{	
				var _activityLvlChange : int = Math.abs( _oldActivityLvl  - _mic.activityLevel);
				_activityLvlChangeArray.push(_activityLvlChange);
			}
		}
		
		private function _micTimerCompleteEventHandler(e : TimerEvent ):void
		{
			//Stop Timer
			_micChkTimer.stop();
			_micChkTimer.reset();
			calculateActivityLvlChange();
			var _numMic : int = Microphone.names.length;
			if(_numMic > 1)
			{	
				if(_currentMicIndex < _numMic)
				{	
					if((_highActivityLvlChange == -2) || ( _highActivityLvlChange < _currentActivityLvlChange ))
					{
						_highActivityLvlChange = _currentActivityLvlChange;
						_highActivityLvlMicIndex = _currentMicIndex; 
					}
					_currentMicIndex++;
					if(_currentMicIndex == _numMic)
					{
						addBestMicrophone(_highActivityLvlMicIndex); 
					}
					else
					{
						getMicrophone(_currentMicIndex);
					}
				}
			}
			else
			{
				addMicList(_currentMicIndex);
			}
		}

		private function calculateActivityLvlChange():void
		{
			var _miclen : int = _activityLvlChangeArray.length;
			var _micSumTotal:int = 0;
			for(var i : int = 0; i < _miclen; i++)
			{	
				_micSumTotal = _micSumTotal + (_activityLvlChangeArray[i]*_activityLvlChangeArray[i])
			}
			_currentActivityLvlChange = Math.sqrt(_micSumTotal/_miclen);
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
			//Setting the best Mic
			FlexGlobals.topLevelApplication._micList.selectedIndex = _selMicIndex;
			
			setupMicLevelIndicator();
			
		}

		public function addBestMicrophone( _micIndex :int ):void
		{	
			_mic = Microphone.getMicrophone(_micIndex);
			_mic.setUseEchoSuppression(true);
			_mic.noiseSuppressionLevel = 60;
			_mic.soundTransform = new SoundTransform(0);
			_mic.setLoopBack(true);
			_mic.setSilenceLevel(20, int.MAX_VALUE);
			_mic.gain = 60;
			_mic.rate = 44;
			addMicList(_micIndex);
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
				_mic.setSilenceLevel(60, int.MAX_VALUE);
				_mic.gain = 60;
				_mic.rate = 44;
				_mic.setUseEchoSuppression(true);
				_mic.soundTransform = new SoundTransform(0);
				_mic.setLoopBack(true);
			}
		}
		
		/*
		*Geting the Microphone with highest activity level
		*/
		public function compareMicrophones(event:ActivityEvent):void{
			
			var _micActivityLvl : Number=  _mic.activityLevel;
			_mic.removeEventListener(ActivityEvent.ACTIVITY, compareMicrophones);
			
			
			if(_micCheckCount < Microphone.names.length)
			{
				if((_highActivityLvl == -2) || (_micActivityLvl  > _highActivityLvl ))
				{
					_highActivityLvl = _micActivityLvl;
					_selectedMicIndex = _micCheckCount;
				}  
				_micCheckCount++;
				if(_micCheckCount == Microphone.names.length)
				{
					addBestMicrophone(_selectedMicIndex);
				}
				else
				{
					getMicrophone(_micCheckCount);	
				}
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
			//h = (480-(h*4.8));
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
				FlexGlobals.topLevelApplication.throbber.visible=false;
				FlexGlobals.topLevelApplication.theCam.attachCamera(Constants.camobject._camera);
				Constants.selected_cam = Constants.camobject._camera;
				ExternalInterface.call("record_active","1");
				Constants._cameraSet = 0;
				Constants._micSet = 0;
				Constants._camListPopulateComplete = true;
				ExternalInterface.call("connected_mic_cam");
			}
		}
	}
}