<?php 

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

session_start();

if(isset($_SESSION['user']['submitted_form_values'])){extract($_SESSION['user']['submitted_form_values']);}
$k = 0;

// Set the  parameter value if there or set the default value.
function set_value($name,$default,$k){
	if(isset($_SESSION['user'][$name])){
		if(count($_SESSION['user'][$name]) > 1){
			print stripslashes($_SESSION['user'][$name][$k]);
		}
		else
		{
			print stripslashes($_SESSION['user'][$name]);
		}
	}
	else{
		print $default;
	}
}

?>   


<script src="static/js/jquery-1.8.1.min.js"></script>
<script src="static/js/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.min.js"></script>

<style type="text/css">
	input[type="radio"] {
		margin-top: 3px;
		vertical-align: top;
		margin-right: 3px;
	}
	input[type="checkbox"] {
		margin-top: 2px;
		vertical-align: top;
		margin-right: 3px;
	}
	.cancel:hover{
		cursor: pointer;
	}
	.radio, .checkbox {
		padding-left: 0px;
	}
	div#test input#gender_ {width: 13px;}
	div#test input {width: 100px;}
	label.mdy {margin-left: -60px;}
.ui-helper-hidden{display:none}.ui-helper-hidden-accessible{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.ui-helper-reset{margin:0;padding:0;border:0;outline:0;line-height:1.3;text-decoration:none;font-size:100%;list-style:none}.ui-helper-clearfix:before,.ui-helper-clearfix:after{content:"";display:table;border-collapse:collapse}.ui-helper-clearfix:after{clear:both}.ui-helper-clearfix{min-height:0}.ui-helper-zfix{width:100%;height:100%;top:0;left:0;position:absolute;opacity:0;filter:Alpha(Opacity=0)}.ui-front{z-index:100}.ui-state-disabled{cursor:default!important}.ui-icon{display:block;text-indent:-99999px;overflow:hidden;background-repeat:no-repeat}.ui-widget-overlay{position:fixed;top:0;left:0;width:100%;height:100%}.ui-resizable{position:relative}.ui-resizable-handle{position:absolute;font-size:0.1px;display:block}.ui-resizable-disabled .ui-resizable-handle,.ui-resizable-autohide .ui-resizable-handle{display:none}.ui-resizable-n{cursor:n-resize;height:7px;width:100%;top:-5px;left:0}.ui-resizable-s{cursor:s-resize;height:7px;width:100%;bottom:-5px;left:0}.ui-resizable-e{cursor:e-resize;width:7px;right:-5px;top:0;height:100%}.ui-resizable-w{cursor:w-resize;width:7px;left:-5px;top:0;height:100%}.ui-resizable-se{cursor:se-resize;width:12px;height:12px;right:1px;bottom:1px}.ui-resizable-sw{cursor:sw-resize;width:9px;height:9px;left:-5px;bottom:-5px}.ui-resizable-nw{cursor:nw-resize;width:9px;height:9px;left:-5px;top:-5px}.ui-resizable-ne{cursor:ne-resize;width:9px;height:9px;right:-5px;top:-5px}.ui-selectable-helper{position:absolute;z-index:100;border:1px dotted black}.ui-datepicker{width:17em;padding:.2em .2em 0;display:none}.ui-datepicker .ui-datepicker-header{position:relative;padding:.2em 0}.ui-datepicker .ui-datepicker-prev,.ui-datepicker .ui-datepicker-next{position:absolute;top:2px;width:1.8em;height:1.8em}.ui-datepicker .ui-datepicker-prev-hover,.ui-datepicker .ui-datepicker-next-hover{top:1px}.ui-datepicker .ui-datepicker-prev{left:2px}.ui-datepicker .ui-datepicker-next{right:2px}.ui-datepicker .ui-datepicker-prev-hover{left:1px}.ui-datepicker .ui-datepicker-next-hover{right:1px}.ui-datepicker .ui-datepicker-prev span,.ui-datepicker .ui-datepicker-next span{display:block;position:absolute;left:50%;margin-left:-8px;top:50%;margin-top:-8px}.ui-datepicker .ui-datepicker-title{margin:0 2.3em;line-height:1.8em;text-align:center}.ui-datepicker .ui-datepicker-title select{font-size:1em;margin:1px 0}.ui-datepicker select.ui-datepicker-month,.ui-datepicker select.ui-datepicker-year{width:49%}.ui-datepicker table{width:100%;font-size:.9em;border-collapse:collapse;margin:0 0 .4em}.ui-datepicker th{padding:.7em .3em;text-align:center;font-weight:bold;border:0}.ui-datepicker td{border:0;padding:1px}.ui-datepicker td span,.ui-datepicker td a{display:block;padding:.2em;text-align:right;text-decoration:none}.ui-datepicker .ui-datepicker-buttonpane{background-image:none;margin:.7em 0 0 0;padding:0 .2em;border-left:0;border-right:0;border-bottom:0}.ui-datepicker .ui-datepicker-buttonpane button{float:right;margin:.5em .2em .4em;cursor:pointer;padding:.2em .6em .3em .6em;width:auto;overflow:visible}.ui-datepicker .ui-datepicker-buttonpane button.ui-datepicker-current{float:left}.ui-datepicker.ui-datepicker-multi{width:auto}.ui-datepicker-multi .ui-datepicker-group{float:left}.ui-datepicker-multi .ui-datepicker-group table{width:95%;margin:0 auto .4em}.ui-datepicker-multi-2 .ui-datepicker-group{width:50%}.ui-datepicker-multi-3 .ui-datepicker-group{width:33.3%}.ui-datepicker-multi-4 .ui-datepicker-group{width:25%}.ui-datepicker-multi .ui-datepicker-group-last .ui-datepicker-header,.ui-datepicker-multi .ui-datepicker-group-middle .ui-datepicker-header{border-left-width:0}.ui-datepicker-multi .ui-datepicker-buttonpane{clear:left}.ui-datepicker-row-break{clear:both;width:100%;font-size:0}.ui-datepicker-rtl{direction:rtl}.ui-datepicker-rtl .ui-datepicker-prev{right:2px;left:auto}.ui-datepicker-rtl .ui-datepicker-next{left:2px;right:auto}.ui-datepicker-rtl .ui-datepicker-prev:hover{right:1px;left:auto}.ui-datepicker-rtl .ui-datepicker-next:hover{left:1px;right:auto}.ui-datepicker-rtl .ui-datepicker-buttonpane{clear:right}.ui-datepicker-rtl .ui-datepicker-buttonpane button{float:left}.ui-datepicker-rtl .ui-datepicker-buttonpane button.ui-datepicker-current,.ui-datepicker-rtl .ui-datepicker-group{float:right}.ui-datepicker-rtl .ui-datepicker-group-last .ui-datepicker-header,.ui-datepicker-rtl .ui-datepicker-group-middle .ui-datepicker-header{border-right-width:0;border-left-width:1px}.ui-progressbar{height:2em;text-align:left;overflow:hidden}.ui-progressbar .ui-progressbar-value{margin:-1px;height:100%}.ui-progressbar .ui-progressbar-overlay{background:url("images/animated-overlay.gif");height:100%;filter:alpha(opacity=25);opacity:0.25}.ui-progressbar-indeterminate .ui-progressbar-value{background-image:none}.ui-widget{font-family:Trebuchet MS,Tahoma,Verdana,Arial,sans-serif;font-size:1.1em}.ui-widget .ui-widget{font-size:1em}.ui-widget input,.ui-widget select,.ui-widget textarea,.ui-widget button{font-family:Trebuchet MS,Tahoma,Verdana,Arial,sans-serif;font-size:1em}.ui-widget-content{border:1px solid #ddd;background:#eee url(images/ui-bg_highlight-soft_100_eeeeee_1x100.png) 50% top repeat-x;color:#333}.ui-widget-content a{color:#333}.ui-widget-header{border:1px solid #e78f08;background:#f6a828 url(images/ui-bg_gloss-wave_35_f6a828_500x100.png) 50% 50% repeat-x;color:#fff;font-weight:bold}.ui-widget-header a{color:#fff}.ui-state-default,.ui-widget-content .ui-state-default,.ui-widget-header .ui-state-default{border:1px solid #ccc;background:#f6f6f6 url(images/ui-bg_glass_100_f6f6f6_1x400.png) 50% 50% repeat-x;font-weight:bold;color:#1c94c4}.ui-state-default a,.ui-state-default a:link,.ui-state-default a:visited{color:#1c94c4;text-decoration:none}.ui-state-hover,.ui-widget-content .ui-state-hover,.ui-widget-header .ui-state-hover,.ui-state-focus,.ui-widget-content .ui-state-focus,.ui-widget-header .ui-state-focus{border:1px solid #fbcb09;background:#fdf5ce url(images/ui-bg_glass_100_fdf5ce_1x400.png) 50% 50% repeat-x;font-weight:bold;color:#c77405}.ui-state-hover a,.ui-state-hover a:hover,.ui-state-hover a:link,.ui-state-hover a:visited,.ui-state-focus a,.ui-state-focus a:hover,.ui-state-focus a:link,.ui-state-focus a:visited{color:#c77405;text-decoration:none}.ui-state-active,.ui-widget-content .ui-state-active,.ui-widget-header .ui-state-active{border:1px solid #fbd850;background:#fff url(images/ui-bg_glass_65_ffffff_1x400.png) 50% 50% repeat-x;font-weight:bold;color:#eb8f00}.ui-state-active a,.ui-state-active a:link,.ui-state-active a:visited{color:#eb8f00;text-decoration:none}.ui-state-highlight,.ui-widget-content .ui-state-highlight,.ui-widget-header .ui-state-highlight{border:1px solid #fed22f;background:#ffe45c url(images/ui-bg_highlight-soft_75_ffe45c_1x100.png) 50% top repeat-x;color:#363636}.ui-state-highlight a,.ui-widget-content .ui-state-highlight a,.ui-widget-header .ui-state-highlight a{color:#363636}.ui-state-error,.ui-widget-content .ui-state-error,.ui-widget-header .ui-state-error{border:1px solid #cd0a0a;background:#b81900 url(images/ui-bg_diagonals-thick_18_b81900_40x40.png) 50% 50% repeat;color:#fff}.ui-state-error a,.ui-widget-content .ui-state-error a,.ui-widget-header .ui-state-error a{color:#fff}.ui-state-error-text,.ui-widget-content .ui-state-error-text,.ui-widget-header .ui-state-error-text{color:#fff}.ui-priority-primary,.ui-widget-content .ui-priority-primary,.ui-widget-header .ui-priority-primary{font-weight:bold}.ui-priority-secondary,.ui-widget-content .ui-priority-secondary,.ui-widget-header .ui-priority-secondary{opacity:.7;filter:Alpha(Opacity=70);font-weight:normal}.ui-state-disabled,.ui-widget-content .ui-state-disabled,.ui-widget-header .ui-state-disabled{opacity:.35;filter:Alpha(Opacity=35);background-image:none}.ui-state-disabled .ui-icon{filter:Alpha(Opacity=35)}.ui-icon{width:16px;height:16px}.ui-icon,.ui-widget-content .ui-icon{background-image:url(images/ui-icons_222222_256x240.png)}.ui-widget-header .ui-icon{background-image:url(images/ui-icons_ffffff_256x240.png)}.ui-state-default .ui-icon{background-image:url(images/ui-icons_ef8c08_256x240.png)}.ui-state-hover .ui-icon,.ui-state-focus .ui-icon{background-image:url(images/ui-icons_ef8c08_256x240.png)}.ui-state-active .ui-icon{background-image:url(images/ui-icons_ef8c08_256x240.png)}.ui-state-highlight .ui-icon{background-image:url(images/ui-icons_228ef1_256x240.png)}.ui-state-error .ui-icon,.ui-state-error-text .ui-icon{background-image:url(images/ui-icons_ffd27a_256x240.png)}.ui-icon-blank{background-position:16px 16px}.ui-icon-carat-1-n{background-position:0 0}.ui-icon-carat-1-ne{background-position:-16px 0}.ui-icon-carat-1-e{background-position:-32px 0}.ui-icon-carat-1-se{background-position:-48px 0}.ui-icon-carat-1-s{background-position:-64px 0}.ui-icon-carat-1-sw{background-position:-80px 0}.ui-icon-carat-1-w{background-position:-96px 0}.ui-icon-carat-1-nw{background-position:-112px 0}.ui-icon-carat-2-n-s{background-position:-128px 0}.ui-icon-carat-2-e-w{background-position:-144px 0}.ui-icon-triangle-1-n{background-position:0 -16px}.ui-icon-triangle-1-ne{background-position:-16px -16px}.ui-icon-triangle-1-e{background-position:-32px -16px}.ui-icon-triangle-1-se{background-position:-48px -16px}.ui-icon-triangle-1-s{background-position:-64px -16px}.ui-icon-triangle-1-sw{background-position:-80px -16px}.ui-icon-triangle-1-w{background-position:-96px -16px}.ui-icon-triangle-1-nw{background-position:-112px -16px}.ui-icon-triangle-2-n-s{background-position:-128px -16px}.ui-icon-triangle-2-e-w{background-position:-144px -16px}.ui-icon-arrow-1-n{background-position:0 -32px}.ui-icon-arrow-1-ne{background-position:-16px -32px}.ui-icon-arrow-1-e{background-position:-32px -32px}.ui-icon-arrow-1-se{background-position:-48px -32px}.ui-icon-arrow-1-s{background-position:-64px -32px}.ui-icon-arrow-1-sw{background-position:-80px -32px}.ui-icon-arrow-1-w{background-position:-96px -32px}.ui-icon-arrow-1-nw{background-position:-112px -32px}.ui-icon-arrow-2-n-s{background-position:-128px -32px}.ui-icon-arrow-2-ne-sw{background-position:-144px -32px}.ui-icon-arrow-2-e-w{background-position:-160px -32px}.ui-icon-arrow-2-se-nw{background-position:-176px -32px}.ui-icon-arrowstop-1-n{background-position:-192px -32px}.ui-icon-arrowstop-1-e{background-position:-208px -32px}.ui-icon-arrowstop-1-s{background-position:-224px -32px}.ui-icon-arrowstop-1-w{background-position:-240px -32px}.ui-icon-arrowthick-1-n{background-position:0 -48px}.ui-icon-arrowthick-1-ne{background-position:-16px -48px}.ui-icon-arrowthick-1-e{background-position:-32px -48px}.ui-icon-arrowthick-1-se{background-position:-48px -48px}.ui-icon-arrowthick-1-s{background-position:-64px -48px}.ui-icon-arrowthick-1-sw{background-position:-80px -48px}.ui-icon-arrowthick-1-w{background-position:-96px -48px}.ui-icon-arrowthick-1-nw{background-position:-112px -48px}.ui-icon-arrowthick-2-n-s{background-position:-128px -48px}.ui-icon-arrowthick-2-ne-sw{background-position:-144px -48px}.ui-icon-arrowthick-2-e-w{background-position:-160px -48px}.ui-icon-arrowthick-2-se-nw{background-position:-176px -48px}.ui-icon-arrowthickstop-1-n{background-position:-192px -48px}.ui-icon-arrowthickstop-1-e{background-position:-208px -48px}.ui-icon-arrowthickstop-1-s{background-position:-224px -48px}.ui-icon-arrowthickstop-1-w{background-position:-240px -48px}.ui-icon-arrowreturnthick-1-w{background-position:0 -64px}.ui-icon-arrowreturnthick-1-n{background-position:-16px -64px}.ui-icon-arrowreturnthick-1-e{background-position:-32px -64px}.ui-icon-arrowreturnthick-1-s{background-position:-48px -64px}.ui-icon-arrowreturn-1-w{background-position:-64px -64px}.ui-icon-arrowreturn-1-n{background-position:-80px -64px}.ui-icon-arrowreturn-1-e{background-position:-96px -64px}.ui-icon-arrowreturn-1-s{background-position:-112px -64px}.ui-icon-arrowrefresh-1-w{background-position:-128px -64px}.ui-icon-arrowrefresh-1-n{background-position:-144px -64px}.ui-icon-arrowrefresh-1-e{background-position:-160px -64px}.ui-icon-arrowrefresh-1-s{background-position:-176px -64px}.ui-icon-arrow-4{background-position:0 -80px}.ui-icon-arrow-4-diag{background-position:-16px -80px}.ui-icon-extlink{background-position:-32px -80px}.ui-icon-newwin{background-position:-48px -80px}.ui-icon-refresh{background-position:-64px -80px}.ui-icon-shuffle{background-position:-80px -80px}.ui-icon-transfer-e-w{background-position:-96px -80px}.ui-icon-transferthick-e-w{background-position:-112px -80px}.ui-icon-folder-collapsed{background-position:0 -96px}.ui-icon-folder-open{background-position:-16px -96px}.ui-icon-document{background-position:-32px -96px}.ui-icon-document-b{background-position:-48px -96px}.ui-icon-note{background-position:-64px -96px}.ui-icon-mail-closed{background-position:-80px -96px}.ui-icon-mail-open{background-position:-96px -96px}.ui-icon-suitcase{background-position:-112px -96px}.ui-icon-comment{background-position:-128px -96px}.ui-icon-person{background-position:-144px -96px}.ui-icon-print{background-position:-160px -96px}.ui-icon-trash{background-position:-176px -96px}.ui-icon-locked{background-position:-192px -96px}.ui-icon-unlocked{background-position:-208px -96px}.ui-icon-bookmark{background-position:-224px -96px}.ui-icon-tag{background-position:-240px -96px}.ui-icon-home{background-position:0 -112px}.ui-icon-flag{background-position:-16px -112px}.ui-icon-calendar{background-position:-32px -112px}.ui-icon-cart{background-position:-48px -112px}.ui-icon-pencil{background-position:-64px -112px}.ui-icon-clock{background-position:-80px -112px}.ui-icon-disk{background-position:-96px -112px}.ui-icon-calculator{background-position:-112px -112px}.ui-icon-zoomin{background-position:-128px -112px}.ui-icon-zoomout{background-position:-144px -112px}.ui-icon-search{background-position:-160px -112px}.ui-icon-wrench{background-position:-176px -112px}.ui-icon-gear{background-position:-192px -112px}.ui-icon-heart{background-position:-208px -112px}.ui-icon-star{background-position:-224px -112px}.ui-icon-link{background-position:-240px -112px}.ui-icon-cancel{background-position:0 -128px}.ui-icon-plus{background-position:-16px -128px}.ui-icon-plusthick{background-position:-32px -128px}.ui-icon-minus{background-position:-48px -128px}.ui-icon-minusthick{background-position:-64px -128px}.ui-icon-close{background-position:-80px -128px}.ui-icon-closethick{background-position:-96px -128px}.ui-icon-key{background-position:-112px -128px}.ui-icon-lightbulb{background-position:-128px -128px}.ui-icon-scissors{background-position:-144px -128px}.ui-icon-clipboard{background-position:-160px -128px}.ui-icon-copy{background-position:-176px -128px}.ui-icon-contact{background-position:-192px -128px}.ui-icon-image{background-position:-208px -128px}.ui-icon-video{background-position:-224px -128px}.ui-icon-script{background-position:-240px -128px}.ui-icon-alert{background-position:0 -144px}.ui-icon-info{background-position:-16px -144px}.ui-icon-notice{background-position:-32px -144px}.ui-icon-help{background-position:-48px -144px}.ui-icon-check{background-position:-64px -144px}.ui-icon-bullet{background-position:-80px -144px}.ui-icon-radio-on{background-position:-96px -144px}.ui-icon-radio-off{background-position:-112px -144px}.ui-icon-pin-w{background-position:-128px -144px}.ui-icon-pin-s{background-position:-144px -144px}.ui-icon-play{background-position:0 -160px}.ui-icon-pause{background-position:-16px -160px}.ui-icon-seek-next{background-position:-32px -160px}.ui-icon-seek-prev{background-position:-48px -160px}.ui-icon-seek-end{background-position:-64px -160px}.ui-icon-seek-start{background-position:-80px -160px}.ui-icon-seek-first{background-position:-80px -160px}.ui-icon-stop{background-position:-96px -160px}.ui-icon-eject{background-position:-112px -160px}.ui-icon-volume-off{background-position:-128px -160px}.ui-icon-volume-on{background-position:-144px -160px}.ui-icon-power{background-position:0 -176px}.ui-icon-signal-diag{background-position:-16px -176px}.ui-icon-signal{background-position:-32px -176px}.ui-icon-battery-0{background-position:-48px -176px}.ui-icon-battery-1{background-position:-64px -176px}.ui-icon-battery-2{background-position:-80px -176px}.ui-icon-battery-3{background-position:-96px -176px}.ui-icon-circle-plus{background-position:0 -192px}.ui-icon-circle-minus{background-position:-16px -192px}.ui-icon-circle-close{background-position:-32px -192px}.ui-icon-circle-triangle-e{background-position:-48px -192px}.ui-icon-circle-triangle-s{background-position:-64px -192px}.ui-icon-circle-triangle-w{background-position:-80px -192px}.ui-icon-circle-triangle-n{background-position:-96px -192px}.ui-icon-circle-arrow-e{background-position:-112px -192px}.ui-icon-circle-arrow-s{background-position:-128px -192px}.ui-icon-circle-arrow-w{background-position:-144px -192px}.ui-icon-circle-arrow-n{background-position:-160px -192px}.ui-icon-circle-zoomin{background-position:-176px -192px}.ui-icon-circle-zoomout{background-position:-192px -192px}.ui-icon-circle-check{background-position:-208px -192px}.ui-icon-circlesmall-plus{background-position:0 -208px}.ui-icon-circlesmall-minus{background-position:-16px -208px}.ui-icon-circlesmall-close{background-position:-32px -208px}.ui-icon-squaresmall-plus{background-position:-48px -208px}.ui-icon-squaresmall-minus{background-position:-64px -208px}.ui-icon-squaresmall-close{background-position:-80px -208px}.ui-icon-grip-dotted-vertical{background-position:0 -224px}.ui-icon-grip-dotted-horizontal{background-position:-16px -224px}.ui-icon-grip-solid-vertical{background-position:-32px -224px}.ui-icon-grip-solid-horizontal{background-position:-48px -224px}.ui-icon-gripsmall-diagonal-se{background-position:-64px -224px}.ui-icon-grip-diagonal-se{background-position:-80px -224px}.ui-corner-all,.ui-corner-top,.ui-corner-left,.ui-corner-tl{border-top-left-radius:4px}.ui-corner-all,.ui-corner-top,.ui-corner-right,.ui-corner-tr{border-top-right-radius:4px}.ui-corner-all,.ui-corner-bottom,.ui-corner-left,.ui-corner-bl{border-bottom-left-radius:4px}.ui-corner-all,.ui-corner-bottom,.ui-corner-right,.ui-corner-br{border-bottom-right-radius:4px}.ui-widget-overlay{background:#666 url(images/ui-bg_diagonals-thick_20_666666_40x40.png) 50% 50% repeat;opacity:.5;filter:Alpha(Opacity=50)}.ui-widget-shadow{margin:-5px 0 0 -5px;padding:5px;background:#000 url(images/ui-bg_flat_10_000000_40x100.png) 50% 50% repeat-x;opacity:.2;filter:Alpha(Opacity=20);border-radius:5px}
</style>
<link rel="stylesheet/css" type="text/css" href="static/js/jquery-ui-1.10.4.custom/css/ui-lightness/jquery-ui-1.10.4.custom.min.css"></link>

<script>
var temp;
$(document).ready(function() {
	$(".cancel").bind("contextmenu",function(e){
        e.preventDefault();
        //alert("Right Click is not allowed");
    });

	var count = <?php echo count($_SESSION['user']['dob']) ?>;
	temp = count;	
	if($("#email").val() != ""){
		$("#email").attr("readonly","readonly");
	}
	
	
	$( ".datepicker" ).datepicker({
		changeMonth: true,
		changeYear: true
	});
	
	i = 1;
	j = 1;
	range = 4;
	<?php 
		$count = count($_SESSION['user']['dob']);
		$k=0;
		for($i = 1; $i < $count; $i++){ ?>
			clone("preset");
	<?php $k++;} ?>

});
var i ;
var j;
var range ;
var s = [""];

// Function to copy the child data table when adding more childs and populate the data into it if user is editting the details.
function clone(chck_str){

	if(i <= range){
		s[i] = "";

		var Clonedtable = jQuery("#child").clone(true);
		console.log(Clonedtable);
		Clonedtable.css("display","block");
		Clonedtable.attr("id","child"+j);
		Clonedtable.attr("name","child"+j);
		var date_id;
		Clonedtable.find("*[id]").andSelf().each(function() {
			$(this).attr("id", $(this).attr("id") + j);
			var name = $(this).attr("name");
			if(name == "gender_" )
			{
				$(this).attr("name", $(this).attr("name") + j);
			}

			$(this).find('input[type=text]').val("");
			$(this).find('input[type=radio]').removeAttr('checked');
		});
		Clonedtable.find("tr:first").html('<td colspan="3"><input type="hidden" id="name" name="child" value="child'+j+'"/></td>');

		Clonedtable.find("tr:first").next().html('<td colspan="3"> Child '+(i+1)+'</td>');
		if(chck_str != ""){
			Clonedtable.find("tr:last").children().children().removeClass("cancel");
		}
		Clonedtable.appendTo('#test');
		if(chck_str == ""){
			$(".cancel").css("display","block");
		}
		Clonedtable.find("*[id]").andSelf().each(function() {
			$(this).find('input[type=radio]').removeAttr('checked');
			$(this).removeClass('hasDatepicker');
			if($(this).hasClass('datepicker')) {
				date_id = this.id;
			}
			if($(this).attr('name') == 'days'){
					$(this).val(0);
				}
				if($(this).attr('name') == 'weeks'){
					$(this).val(0);
				}
			if(chck_str == "preset"){

				if($(this).attr('name') == 'child_name'){

				$(this).val(session['child_name'][i]);
				}

				if($(this).attr('name') == 'dob'){

				$(this).val(session['dob'][i]);
				}
				if($(this).attr('name') == 'days'){
					$(this).val(session['days'][i]);
				}
				if($(this).attr('name') == 'weeks'){
					$(this).val(session['weeks'][i]);
				}
				if($(this).attr('name') == 'gender_'+i){

					<?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'][$k] == "boy"){?>
						$("#gender"+i).val("boy");
						$("#gender_boy"+i).attr("checked","checked");

					<?php } elseif(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'][$k] == "girl"){ ?>
						$("#gender"+i).val("girl");
						$("#gender_girl"+i).attr("checked","checked");
						
					<?php } elseif(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'][$k] == "other"){ ?>
						$("#gender"+i).val("other");
						$("#gender_other"+i).attr("checked","checked");
						
				<?php }	$k++;?>
				}
			}				
			$('#'+date_id).next().next().remove();
		});
		i++;
		j++;
	}
	
	$(".datepicker" ).datepicker({
		changeMonth: true,
		changeYear: true
	});
}	

// Serialize the data and return its object
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Set the radio button value in the text box to be stored in the db.
function set(radio){
	var val_ = $(radio).val();
	var td = $(radio).attr("name");
	td = td.substr(-1);
	if(td == '_'){td = ''};
	$("#gender_"+val_+td).closest("td").parent().children().next().next().children().eq(0).val(val_);
}

var result;
var move;

// Function to populate the second page of the registration pop-up if first is completely filled.
function next(){
	var re = 0;

	if(validation()){
		re =1;

		var json_string = JSON.stringify($('#email').serializeObject());
		$.ajax({
			'type': 'POST',
			'url': 'user.php',
			async: false,
			'data': {
			    'experiment_id' : "users",
			    'json_data': json_string,
			    'function' : 'check',
			    'table' : 'users'  
			},
			'success': function(resp) {
				result = resp;

				if((!result) || (temp > 0) ){
					$(".registor").css("display","none");
					$("#registration").css("display","block");
					move = 1;
				}
				else{
					$("#error").children().css("display","none");
					$("#error1").html($("#error").html());

					move = 0;
				}	
			},
			'failure': function(resp) {

			}
		    });
		$("#error").children().css("display","none");
		return move;
	}
	else{

		$("#error1").html($("#error").html());
		$("#error1").find("label").css({"font-weight": "700"});
		$(".error").focus();
	}

	return re;
};

// Validations for the first page of the registration pop-up,
// Validations for Name, email, password and confirm password.
function validation(){
	var valii = 1;
	var pass = 1;

	$("#error").html("");
	if($("#name")){// validations for name

		if($("#name").val() == ""){
			$("#error").append('<label id="name_error" class="error">Please enter your name.<br></label>');
			valii = 0;
		}
	}
	if($("#email")){// Validations for email
		var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
		if($("#email").val() == ""){
			$("#error").append('<label id="email_error" class="error">Please enter your email address.<br></label>');
			valii = 0;
		}
		else if(!pattern.test($("#email").val())){
			$("#error").append('<label id="email_error" class="error">Please enter a valid email address.<br></label>');
			valii = 0;
		}
		else{// Check if email already exists.
			var json_string = JSON.stringify($('#email').serializeObject());

			$.ajax({
				'type': 'POST',
				'url': 'user.php',
				async: false,
				'data': {
				    'experiment_id' : "users",
				    'json_data': json_string,
				    'function' : 'check',
				    'table' : 'users'  
				},
				'success': function(resp) {


					if(resp && temp == 0){
						$("#error").append('<label id="email_error" class="error">Email address already exists.</br></label>');
						valii = 0;
					}	
				},
				'failure': function(resp) {}
		    });
		}
	}
	if($("#password")){// validations for password.
		if($("#password").val() == ""){
			$("#error").append('<label id="password_error" class="error">Please enter a password.<br></label>');
			valii = 0;
		}
		else if($("#password").val().length < 5){
			$("#error").append('<label id="password_error" class="error">Your password must be at least 5 characters long.<br></label>');
			pass = 0;
			valii = 0;
		}
	}
	if($("#confirm_password")){// validations for confirm password.
		if($("#confirm_password").val() == ""){
			$("#error").append('<label id="password_error" class="error">Please re-enter your password to confirm it.<br></label>');
			valii = 0;
		}
		else if(pass == 1 && (($("#confirm_password").val().length < 5) || ($("#confirm_password").val() != $("#password").val()) )){
			$("#error").append('<label id="password_error" class="error">Your password confirmation does not match. Please re-enter your password to confirm it.<br></label>');
			valii = 0;
		}
	}
	return valii;
}

// Remove the child on click , if added by mistake
function remove1(closed){

	var z = 1;
	$(closed).closest("table").remove();
	$(".count").closest("table").each(function(){
		$(this).find("tr").parent().children().next().find("td").first().html("Child " + z);
   		z = z+1;
	});
	i -= 1;
}

// Validations for child details page of the registration pop-up
function validation_2(){
	var valii = 1;
	var s = []; 
	$("#error").html("");
	if($("input[name = child_name]")){// validation for Child's name
		var i = 1;
		$(".chile_name").each(function(){
			s[i] = "";
			if(($(this).attr("id") != 'child_name') && ($(this).val() == "")){
				s[i] += '<label id="child_name_error" class="error">Please enter the name of Child '+ i +'.<br></label>';
				valii = 0;
			}
			i++;
		});
	}
	if($("input[name = dob]")){// Validations for date of birth
		var i = 1;
		$(".datepicker").each(function(){
			if($(this).attr("id") != 'dp'){
		        if($(this).val() == "" || $(this).val() == "MM/DD/YYYY"){
		            s[i] += '<label id="dob_error" class="error">Please enter the date of birth of Child '+ i +'.<br></label>';
	    	        valii = 0;
	        	}
		        else if(isValidDate($(this).val()) == "format"){
		            s[i] += '<label id="dob_error" class="error">Please enter the date of birth of Child '+ i +' in correct format.<br></label>';
	    	        valii = 0;
	        	}
	        	else if(isValidDate($(this).val()) == "date"){
		            s[i] += '<label id="dob_error" class="error">Please enter a valid date of birth of Child '+ i +' .<br></label>';
	    	        valii = 0;
	        	}
	        }
	        i++;
	    });
	}
	if($("input[name = gender]")){ // Validations for Gender
		var i = 1;
	    $(".gender").each(function(){
	        if(($(this).attr("id") != 'gender') && ($(this).val() == "")){
	            s[i] += "<label id='gender_error' class='error'>Plese select the gender of Child "+ i +".<br></label>";
	            valii = 0;
	        }
	        i++;
	    });
	}
	for(var x=0;x<$('.chile_name').length;x++){
		if($('.chile_name').length == 1){
			$("#error").append("<label id='child_error' class='error'>Please enter at least one child's details.<br></label>");
			valii = 0;
		}
		$("#error").append(s[x]);
	}
	
	return valii;
}


</script>
<div id="error" style="display:none;">
	<label id="dob_error" class="error" for="dob" style="display:none"></label>
	<label id="gender_error" class="error" for="gender" style="display:none">Please select a gender.</label>
</div>
<div id ="position" style=" /*width:700px; margin-left:auto;margin-right:auto;*/">
	<h1 id="registrationTitle" style="text-align: center;">Registration</h1>
	<form id="register_form" method="POST" action="">

		<div class ="registor">
			<p style="text-align: center;" id='regPromptText'>	Please enter login details	</p>
		    <div id="error1" ></div>

			<p>Name <input type="text" name="name" id="name" style="margin-left: 118px;" value="<?php set_value('name','',$k); ?>"/> </p>			
			<p>Email Address<input type="text" name="email" id="email" style="margin-left: 68px;" value="<?php set_value('email','',$k) ?>"/>  </p>		
			<p>Password <input type="password" name="password" id="password" style="margin-left: 94px;" value="<?php set_value('password','',$k) ?>"/> </p>		
			<p>Confirm Password <input type="password" name="confirm_password" id="confirm_password" style="margin-left: 41px;"/> </p>	
			<p><input type= "hidden" name="id" value="<?php echo $_SESSION['user']['id'] ?>"></p>
		</div>
		<div id = "registration" style="display:none">
			<div id = "regis">

			    <div id="error2">
					<label id="dob_error" class="error" for="dob" style="display:none">Please enter the Date of Birth.</br></label>
					<label id="gender_error" class="error" for="gender" style="display:none">Please select a gender.</label>
			    </div>
				<p>1.Please enter information for your child</p>
				<div>
					<div id = "test">
						<TABLE id = "child0" name="child0" BORDER='0' CELLPADDING='5' CELLSPACING='5'  style="border: 1px solid #d8d8d8;padding: 10px; margin-bottom:10px;">	
						<tr>
							<td colspan="3"><input type="hidden" id="name" name="child" value = "child0"/></td>	
						</tr>
						<tr>
							<td colspan="3"> Child 1</td>
						</tr>
						<tr>		
							<td width="30%" >Child's Name </td>		
							<td width="30%" style="padding-top:10px"><input  type="text" value="<?php set_value('child_name','',0) ?>" id="child_name0" class="chile_name" name="child_name"/></td>
							<td width="30%"></td>	
						</tr>
						<tr>		
							<td>Child's Birthdate </td>		
							<td><input  type="text" placeholder='MM/DD/YYYY' value="<?php set_value('dob','',0) ?>" id="dp0" class="datepicker" name="dob"/></td>
							<td><label class = "mdy"> MM/DD/YYYY</label></td>	
						</tr>
						<tr>		
							<td>Gender</td> 		
							<td><input id="gender_boy" type="radio" name="gender_" value="boy" onclick="set(this);" style="width: 13px;" <?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'] == "boy"){print " checked=\"checked\"";} elseif(count($_SESSION['user']['gender']) >1 && $_SESSION['user']['gender'][0] == "boy" ){print " checked=\"checked\"";}?>> Male</td>
							<td style="display:none"><input type="hidden" class="gender" id="gender0" name="gender" value="<?php set_value('gender','',0) ?>"/></td>	
							<td><input id="gender_girl" type="radio" name="gender_" value="girl" onclick="set(this);" style="width: 13px; margin-left:-70px;" <?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'] == "girl"){print " checked=\"checked\"";} elseif((count($_SESSION['user']['gender']) >1) && ($_SESSION['user']['gender'][0] == "girl") ){print " checked=\"checked\"";}?>> Female</td>
							
							<td><input id="gender_other" type="radio" name="gender_" value="other" onclick="set(this);" style="width: 13px; margin-left:-70px;" <?php if(isset($_SESSION['user']['gender']) && $_SESSION['user']['gender'] == "other"){print " checked=\"checked\"";} elseif((count($_SESSION['user']['gender']) >1) && ($_SESSION['user']['gender'][0] == "other") ){print " checked=\"checked\"";}?>> Other/prefer not to answer</td>
							
						</tr>	
						<tr>		
							<td>Gestational age at birth </td>	

							<td>
								<select name="weeks" id=" weeks0" class="weeks" value = "<?php set_value('weeks',0,0) ?>">
									<option value="na">Not sure or prefer not to answer</option>
									<option value="43">Over 42</option>
									<option value="42">42</option>
									<option value="41">41</option>
									<option value="40" selected>40 (around due date)</option>
									<option value="39">39</option>
									<option value="38">38</option>
									<option value="37">37</option>
									<option value="36">36</option>
									<option value="35">35</option>
									<option value="34">34</option>
									<option value="33">33</option>
									<option value="32">32</option>
									<option value="31">31</option>
									<option value="30">30</option>
									<option value="29">29</option>
									<option value="28">28</option>
									<option value="27">27</option>
									<option value="26">26</option>
									<option value="25">25</option>
									<option value="24">24</option>
									<option value="23">Under 24</option>
								</select>
								<label for="weeks">Weeks</label>
							</td>							
						</tr>
						<tr>
							<td colspan="3" ><div class ="cancel count" style="display:none;"></div></td>
						</tr>
						</TABLE>
					</div>
				</div>
				<input type="button" class="btn-success" id = "add" onclick="clone('');" value = "Add another child's information" style="font-size: large;font-weight: bold;"/>
				<table>
				<tr><td></br></td></tr>
				<tr><td colspan="2">2. Select communication preferences: I would like to be contacted when...</td></tr>

				<tr>	<td>	<input class="checkbox" type="checkbox" name="preference" value="researchers" <?php if(isset($_SESSION['user']['preference']) && in_array("researchers",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/></td><td>Researchers have questions about my responses.</td></tr>
				<tr>	<td>	<input class="checkbox" type="checkbox" name="preference" value="updates" <?php if(isset($_SESSION['user']['preference']) && in_array("updates",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/></td><td>New studies are available for my child(ren).</td></tr>
				<tr>	<td>	<input class="checkbox" type="checkbox" name="preference" value="results" <?php if(isset($_SESSION['user']['preference']) && in_array("results",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/></td><td>Results of a study we participated in are published.</td></tr>
								<input class="checkbox" type="hidden" name="preference" value="no_mails" <?php if(isset($_SESSION['user']['preference']) && in_array("no_mails",$_SESSION['user']['preference'])){print " checked=\"checked\"";} ?>/><br>
				</table>

			</div>
		</div>
	</form>
</div>
<TABLE id = "child" name="child" BORDER='0' CELLPADDING='5' CELLSPACING='5'  style="border: 1px solid #d8d8d8;padding: 10px; margin-bottom:10px; display:none">	
	<tr>
		<td colspan="3"><input type="hidden" id="name" name="child" value = "child"/></td>	
	</tr>
	<tr>
		<td colspan="3"> Child 1</td>
	</tr>
	<tr>		
		<td width="30%" >Child's Name </td>		
		<td width="30%" style="padding-top:10px"><input  type="text" value="" id="child_name" class="chile_name" name="child_name"/></td>
		<td width="30%"></td>	
	</tr>
	<tr>		
		<td>Child's Birthdate </td>		
		<td><input  type="text" placeholder='MM/DD/YYYY' value="" id="dp" class="datepicker" name="dob"/></td>
		<td><label class = "mdy"> MM/DD/YYYY</label></td>	
	</tr>
	<tr>		
		<td>Gender</td> 		
		<td><input id="gender_boy" type="radio" name="gender_" value="boy" onclick="set(this);" style="width: 13px;" > Male</td>
		<td style="display:none"><input type="hidden" class="gender" id="gender" name="gender" value=""/></td>	
		<td><input id="gender_girl" type="radio" name="gender_" value="girl" onclick="set(this);" style="width: 13px; margin-left:-70px;" > Female</td>
		<td><input id="gender_other" type="radio" name="gender_" value="other" onclick="set(this);" style="width: 13px; margin-left:-70px;" > Other/prefer not to answer</td>
	</tr>	
	<tr>		
		<td>Gestational age of birth (approximate) </td>		
		<td>
		<select name="weeks" id=" weeks" class="weeks" value="">
			<option value="na">Not sure or prefer not to answer</option>
			<option value="43">Over 42</option>
			<option value="42">42</option>
			<option value="41">41</option>
			<option value="40" selected>40 (around due date)</option>
			<option value="39">39</option>
			<option value="38">38</option>
			<option value="37">37</option>
			<option value="36">36</option>
			<option value="35">35</option>
			<option value="34">34</option>
			<option value="33">33</option>
			<option value="32">32</option>
			<option value="31">31</option>
			<option value="30">30</option>
			<option value="29">29</option>
			<option value="28">28</option>
			<option value="27">27</option>
			<option value="26">26</option>
			<option value="25">25</option>
			<option value="24">24</option>
			<option value="23">Under 24</option>
		</select>
		<label for="weeks">Weeks</label>
		</td>
	</tr>
	<tr>
		<td colspan="3"><img src="./img/cancel.png" class = "cancel count" id = "cancel" onclick="remove1(this);" value="Cancel" align="right" style="margin-top: -235px;margin-right: -11px; display:none;              "/></td>
	</tr>
</TABLE>
