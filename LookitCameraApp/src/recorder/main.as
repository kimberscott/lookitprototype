/*
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */
import flash.display.BitmapData;
import flash.events.TimerEvent;
import flash.external.ExternalInterface;
import flash.net.NetConnection;
import flash.net.NetStream;
import flash.net.NetStreamInfo;
import flash.net.URLVariables;
import flash.utils.Timer;

import mx.controls.Alert;
import mx.core.FlexGlobals;

import utils.Constants;
import utils.FlashPHP;
import utils.States;

private const OUTPUT_WIDTH:Number = 640;
private const OUTPUT_HEIGHT:Number = 480;
private const FLV_FRAMERATE:int = 50;

private var _state:String;

private var nc:NetConnection;
private var ns:NetStream;
private var nsi:NetStreamInfo;
private var _h264Settings:H264VideoStreamSettings = new H264VideoStreamSettings(); 

private var flag:Boolean = false;
private var urlObject:Object = new Object;
private var str_concat:String;
private var date:String;
public var receivedVars:URLVariables;
//Parameters for dynamic resizing
public var width1:Number = 230;
public var height1:Number = 210;
public var width2:Number;
public var height2:Number;

[Embed(source="/assets/i_cam.png")]
public const icon1:Class;
[Bindable]
public var cam:XML = Constants.cam;
[Embed(source="/assets/i_mic.png")]
public const icon2:Class;
[Bindable]
public var mic:XML = Constants.mic;

private var Framerate: Number = 0;
private var countFramerate:Number = 0;

//This flag is used for reconnection using RTMP when RTMPS fails 
public var reconnect_tried:Boolean = false;
private function geticon(item:Object):Class
{
	
	if (this[item.@icon]){
		return this[item.@icon];
	}
	
	return null;
	
}

//*****************************************************************************************************************************************************
//Initalising the widget
//*****************************************************************************************************************************************************

public function loading():void
{
	try
	{
		ExternalInterface.addCallback("load", setsize);
	}
	catch(e:Error){
		Alert.show(e.toString() + e.message.show());
	}
}
public function setsize(width:Number,height:Number):void
{
	width1 = width;
	height1 = height;
}
public function init():void
{
	width1 = FlexGlobals.topLevelApplication.parameters.width;
	height1 = FlexGlobals.topLevelApplication.parameters.height;
	Security.showSettings("default"); 
	//throbber.visible=true;
	nc_Connect();
	try{
		loading();
		//ExternalInterface.addCallback("takeScreenshot", callsnapshot);
		ExternalInterface.addCallback("recordToCamera", callpublishcam);
		ExternalInterface.addCallback("stop_record", callstop);
		ExternalInterface.addCallback("connect", reconnect);
		ExternalInterface.addCallback("consent", consent_page);
		ExternalInterface.addCallback("setup", setup_page);
	}
	catch(e:Error){
		Alert.show(e.toString() + e.message.show());
	}
}

public function consent_page():void{
	Constants.is_consent = true;
	theCam.attachCamera(Constants.selected_cam);
	FlexGlobals.topLevelApplication.dropdowns.visible = false;
}
public function setup_page():void{
	Constants.is_consent = false;
	theCam.attachCamera(Constants.selected_cam);
	FlexGlobals.topLevelApplication.dropdowns.visible = true;
}

public function nc_Connect():void{
    reconnect_tried = false;
	nc = new NetConnection(); 
	nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus); 
	nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatusFailure); 
	try{
		nc.connect(Constants.FMSserver_RTMPS);
	}
	catch(e:Error){
		Alert.show(e.toString() + e.message.show());
	}
}

public function nc_reConnect():void{
    reconnect_tried = true;
	nc = new NetConnection(); 
	nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus); 
	nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatusFailure); 
	try{
		nc.connect(Constants.FMSserver_RTMP);
	}
	catch(e:Error){
		Alert.show(e.toString() + e.message.show());
	}
}

public function callpublishcam(expr_id11:String,parent_id11:String, child_id11:String,privacy11:String,caller:String,count:String):void{
	if(caller != ""){
		theCam.attachCamera(Constants.selected_cam);
	}
	date = Constants.getDate();
	str_concat = date + "_" + expr_id11 + "_" + parent_id11 + "_" + child_id11 + "_" + privacy11 + "_" + count;
	urlObject.filename = str_concat;
	setState(States.RECORDING);	
}
/*
public function callsnapshot():void{
	Constants.snapshot.takePicture();
}
*/
public function callstop(caller:String):int{
	if(caller != ""){
		theCam.attachCamera(null);
	}
	setState(States.STOPPING);
	var frameRate:Number = 0;
	if(countFramerate == 0){
		frameRate = 0;
	}
	else{
		frameRate = Framerate/countFramerate; 
	}
	return frameRate;
}

public function onNetStatusFailure(event:NetStatusEvent):void{
	if(event.info.code == "NetConnection.Connect.Failed"){
	    if(!reconnect_tried){
	      nc_reConnect();
		  return;
	    }
		//throbber.visible=false;
		reconnectBtn.x = width1/2;
		reconnectBtn.y = height1/2 + 20;
		theCam.visible = false;
		theCam.includeInLayout = false;
		noConnection.includeInLayout = true;
		noConnection.visible = true;
		reconnectBtn.includeInLayout = true;
		reconnectBtn.visible=true;
		reconnectBtn.enabled=true;
		micContainer.visible = false;
		noConnection.text =  "Connection Lost \nPlease click on Reconnect to establish a new connection to Lookit.";
		return;
	}
	
	if(event.info.code == "NetConnection.Connect.Closed" || event.info.code == "NetConnection.Connect.NetworkChange"){
		//throbber.visible=false;
		reconnectBtn.x = width1/2;
		reconnectBtn.y = height1/2 + 20;
		theCam.visible = false;
		theCam.includeInLayout = false;
		noConnection.includeInLayout = true;
		noConnection.visible = true;
		reconnectBtn.includeInLayout = true;
		reconnectBtn.visible=true;
		reconnectBtn.enabled=true;
		micContainer.visible = false;
		noConnection.text =  "Connection Lost \nPlease click on Reconnect to establish a new connection to Lookit.";
		ExternalInterface.call("disconnect");
		return;
	}
	else if(event.info.code != "NetConnection.Connect.Success"){
		width1 = this.root.loaderInfo.parameters.width;
		height1 = this.root.loaderInfo.parameters.height;
		reconnectBtn.visible=false;
		reconnectBtn.enabled=false;
		noConnection.visible = false;
		noConnection.includeInLayout = false;
		reconnectBtn.includeInLayout = false;
		micContainer.visible = true;
		theCam.includeInLayout = true;
		theCam.visible = true;
		Constants.camobject.getCam(0);
		Constants.micobject.getMicrophone(0);
		ExternalInterface.call("reconnected");
	}
}

public function onNetStatus(event:NetStatusEvent):void{ 
	if(event.info.code == "NetConnection.Connect.Success"){ 
		width1 = this.root.loaderInfo.parameters.width;
		height1 = this.root.loaderInfo.parameters.height;
		//Resizing the  app based on the flashvars
		reconnectBtn.includeInLayout = false;
		noConnection.includeInLayout = false;
		noCam.includeInLayout = false;
		theCam.includeInLayout = true;
		theCam.width = width1;
		theCam.height = height1;
		theCam.x = width1;
		theCam.y = 0;
		noCam.width = width1;
		noCam.height = height1;
		nocamimage.x = width1/2;
		nocamimage.y = height1/2 + 20;
		noConnection.width = width1;
		noConnection.height = height1;
		micContainer.x = width1+1;
		micContainer.height = theCam.height;
		micLevelCanvas.height = theCam.height;
		dropdowns.x = 0;
		dropdowns.y = height1+5;
		//throbber.x = width1/2;
		//throbber.y = height1/2;
		micLevelCanvas.y = bcntnr.y;
		_cameraList.width = width1/2;
		_micList.width = width1/2;
		Constants.camobject.getCam(0);
		Constants.micobject.getMicrophone(0);
	} 
}


public function reconnect():void{
    reconnect_tried = false;
	reconnectBtn.visible=false;
	reconnectBtn.enabled=false;
	noConnection.visible = false;
	reconnectBtn.includeInLayout = false;
	noConnection.includeInLayout = false;
	//throbber.x = width1/2;
	//throbber.y = height1/2;
	//throbber.visible=true;
	/*nc = new NetConnection(); 
	nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatusFailure); 
	nc.connect(Constants.FMSserver_RTMP);*/
	nc_Connect();
	//throbber.visible=false;
}

//*****************************************************************************************************************************************************
//Initialising Ends
//*****************************************************************************************************************************************************

//*****************************************************************************************************************************************************
//Starting the Recording
//*****************************************************************************************************************************************************

public function publishCamera():void { 
	if(flag){
		stop();
	}
	//count++;
	ns = new NetStream(nc); 
	ns.attachCamera(Constants.camobject._camera); 
	ns.attachAudio(Constants.micobject._mic); 
	_h264Settings.setQuality(0,50);
	_h264Settings.setKeyFrameInterval(50);
	_h264Settings.setMode(OUTPUT_WIDTH,OUTPUT_HEIGHT,FLV_FRAMERATE);
	_h264Settings.setProfileLevel(H264Profile.BASELINE, H264Level.LEVEL_1_2);
	ns.videoStreamSettings = _h264Settings;
	//nsi = new NetStreamInfo
	ns.publish("flv:"+str_concat, "record");
	Framerate = 0;
	countFramerate = 0;
	var _timer:Timer = new Timer(500, 0);
	_timer.addEventListener(TimerEvent.TIMER, calculateFramerate);
	_timer.start();
	flag = true;
}
private function calculateFramerate( event : TimerEvent ):void{
	if(ns.currentFPS > 0){
		Framerate += ns.currentFPS;
		countFramerate++;
	}
}

//*****************************************************************************************************************************************************
//Ending the Recording
//*****************************************************************************************************************************************************

public function stop():void {
	ns.close();
	flag = false;
	var flashPHP:FlashPHP = new FlashPHP(Constants.conversionserver, urlObject);
	flashPHP.addEventListener("ready", processPHPVars);	
}

private function processPHPVars(event:Event):void{
	//Alert.show("Thanks for Uploading");
}

private var ns_playback:NetStream;
private function getAudioVideoData():void{
	
	ns_playback = new NetStream(nc);
	var nsst:SoundTransform=new SoundTransform(1);
	nsst.volume=0;
	ns_playback.play(str_concat + ".flv");
	ns_playback.soundTransform = nsst;
	
	var _timer:Timer = new Timer(100, 50);
	_timer.addEventListener(TimerEvent.TIMER, checkInfo);
	_timer.addEventListener( TimerEvent.TIMER_COMPLETE, sendInfo);
	_timer.start();
}

private var audioData:Number = 0;
private var videoData:Number = 0;
private var countAudio:Number = 0;
private var countVideo:Number = 0;

private function checkInfo( event : TimerEvent ):void{
	if(ns_playback.info.audioBufferByteLength > 0){
		audioData += ns_playback.info.audioBufferByteLength;
		countAudio++;
	}
	if(ns_playback.info.videoBufferByteLength > 0){
		videoData += ns_playback.info.videoBufferByteLength;
		countVideo++;
	}
}

private function sendInfo( event : TimerEvent ) : void{
	if(countAudio > 0){
		audioData = (audioData/countAudio);
	}
	else{
		audioData = 0;
	}
	if(countVideo > 0){
		videoData = (videoData/countVideo);
	}
	else{
		videoData = 0;
	}	
	ExternalInterface.call("audioVideoData",audioData,videoData);
}

private function setState(state:String):void
{
	_state = state;
	switch (_state)
	{		
		case States.RECORDING:
			publishCamera();
			break;
		
		case States.STOPPING:
			stop();
			break;
	}
}