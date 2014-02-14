
/*
*  Copyright (C) MIT Early Childhood Cognition Lab
*/

package utils{
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	
	public class FlashPHP extends EventDispatcher {
		
		// Public Properties
		public var receivedVars:URLVariables;      
		
		// Private Properties
		private var url:String;    
		private var flashVars:Object;
		private var request:URLRequest;
		private var date:Date						 = new Date();
		private var completeEvent:Event              = new Event("ready");
		private var variables:URLVariables           = new URLVariables();
		private var loader:URLLoader                 = new URLLoader();
		
		public function FlashPHP(url:String, flashVars:Object) {
			
			this.flashVars                      = flashVars;
			this.url                            = url+"?r="+ date.time;
			parseVariables();
		}
		
		// Private Methods
		private function parseVariables():void {
			
			for (var item:* in flashVars) {
				
				variables[item] = flashVars[item];             
			}
			
			sendVariables();
		}
		
		private function sendVariables():void {
			
			request                                 = new URLRequest(url);
			request.method                          = URLRequestMethod.POST;
			request.data                            = variables;
			loader.dataFormat                       = URLLoaderDataFormat.VARIABLES;           
			loader.addEventListener(Event.COMPLETE, variablesAreLoaded);
			loader.load(request);
		}
		
		private function variablesAreLoaded(event:Event):void {
			//receivedVars                            = new URLVariables(loader.data);
			dispatchEvent(completeEvent);          
		}
	}
}// ActionScript file