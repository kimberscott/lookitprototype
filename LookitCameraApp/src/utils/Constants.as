
/*
*  Copyright (C) MIT Early Childhood Cognition Lab
*/
package utils
{
	import flash.media.Camera;
	import flash.text.TextField;
	
	import mx.formatters.DateFormatter;

	public class Constants
	{
			public static const conversionserver:String = "./camera/convert.php";
			public static const FMSserver_RTMP:String = "rtmp://lookit-streaming.mit.edu/publishlive";
			public static const FMSserver_RTMPS:String = "rtmps://lookit-streaming.mit.edu/publishlive";
			public static var _micSet:Number = 0;
			public static var _cameraSet:Number = 0;
			public static var _camListPopulateComplete:Boolean=false;
			public static var is_consent:Boolean = false; 
			public static var camobject:CamSetup  = new CamSetup();
			public static var micobject:MicSetup = new MicSetup();
			public static var snapshot:Snapshot = new Snapshot();
			public static var cam:XML = <items/>;
			public static var mic:XML = <items/>;
			public static var selected_cam:Camera = null;
			public static var setup_completed:Number = 0;
			
			
			public static function getDate():String{
				var dateFormatter:DateFormatter = new DateFormatter(); 
				dateFormatter.formatString = 'YYMMDDHNNSS'; 
				var formattedDate:String = dateFormatter.format(new Date().toString());
				return formattedDate;
			}
			
			public static function getYYMMDD():String
			{
				var dateObj:Date = new Date();
				var year:String = String(dateObj.getFullYear());
				var month:String = String(dateObj.getMonth() + 1);
				if (month.length == 1) {
					month = "0"+month;
				}
				var date:String = String(dateObj.getDate());
				if (date.length == 1) {
					date = "0"+date;
				}
				return year.substring(2, 4)+month+date;
			}
			
			public static function truncate( textField : TextField, addElipsis : Boolean = true, ellipsis : String = "\u2026" ) : void
			{
				var tempTextField : TextField;
				if ( ! textOverflowing( textField ) ) return;
				tempTextField = copyTextField( textField );
				while( textOverflowing( tempTextField, ellipsis ) )
					tempTextField.text = tempTextField.text.substr( 0, tempTextField.text.length - 1 );
				tempTextField.appendText( ellipsis );
				textField.text = tempTextField.text;
			}
			
			public static function textOverflowing( textField : TextField, suffix : String = null ) : Boolean
			{
				var margin : Number = 4; //Flash adds this to all textfields;
				var tempTextField : TextField = copyTextField( textField );
				if ( suffix ) tempTextField.appendText( suffix );
				
				if ( tempTextField.textWidth > tempTextField.width - margin 
					|| tempTextField.textHeight > tempTextField.height - margin ) return true;
				return false;
			}
			
			public static function copyTextField( original : TextField ) : TextField
			{
				var copy : TextField = new TextField();
				copy.width = original.width;
				copy.height = original.height;
				copy.multiline = original.multiline;
				copy.wordWrap = original.wordWrap;
				copy.embedFonts = original.embedFonts;
				copy.antiAliasType = original.antiAliasType;
				copy.autoSize = original.autoSize;
				copy.defaultTextFormat = original.getTextFormat();
				copy.text = original.text;
				return copy;
			}
	}
}