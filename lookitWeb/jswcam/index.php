<?php 

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

require_once('php/util.php'); 
require_once('config.php'); 
if(!isset($_SESSION['user']['id'])){ 
    session_start();
	 $_SESSION['user']['id'] = uuid();
     //$_SESSION['user']['id'] = '1254-1458-5268-5157';
}
?>
<!DOCTYPE html>
<html>
  <head>
    <title> Lookit: Online experiments from the Early Childhood Cognition Lab </title>
    <link rel="shortcut icon" type="image/x-icon" href="img/remy4.ico">    
	
    <link rel="stylesheet/less" type="text/css" href="fragments/styles.less"></link>
    <link rel="stylesheet/less" type="text/css" href="bootstrap/less/bootstrap.less"></link>
    <link rel="stylesheet/css" type="text/css" href="static/css/styles.css"></link>
	<link rel="stylesheet/css" type="text/css" href="static/datepicker/css/datepicker.css"></link>
	
	
    <script src="static/js/less-1.3.0.min.js" type="text/javascript"></script>
	
    <script src="static/js/jquery-1.8.1.min.js"></script> 
    <script src="static/js/bootstrap.min.js" type="text/javascript"></script>
    <script src="bootbox/bootbox.min.js" type="text/javascript"></script>
    <script src="index.js" type="text/javascript"></script>
    <script type="text/javascript" src="./camera/swfobject.js"></script>
    <script src="./login/myfunc.js" type="text/javascript"></script>
    <script src="./login/validate.js" type="text/javascript"></script> 
    <script src="./login/json.js" type="text/javascript"></script> 
	
    
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-44819337-1', 'mit.edu');
  ga('send', 'pageview');

</script>
    <?php
    if(isset($_GET['name'])){ 
      $_SESSION['user']['name'] = $_GET['name'];
    ?>
    <script type="text/javascript">
      $().ready(function(){
        $("#reg1,#log1").css("display", "block");
        $("#reg,#log,.login_form").css("display", "none");
      });
    </script>
    <?php 
	} 

 	if (isset($_SESSION['user']['name'])) { 
 		$_SESSION['user']['filename'] = "";
 	?>
	<script>
		$('document').ready(function(){
			$('#reg,#log').css('display', 'none');
 			$('#reg1,#log1').css('display', 'block');
    	});
    </script>
	<?php  }   
    if(isset($_GET['email'])){    
    ?>
    <input type="hidden" id="reset" value=<?php echo $_GET['email']?>/>
    <?php } ?>


    <script type="text/javascript">
    <?php 
    printf("var userId = '%s';",$_SESSION['user']['id']);
  	$experiments = load_experiments($CONFIG['experiment_order']);
  	printf("var experiments = %s;", json_encode($experiments));
  	load_fragments(get_default_fragments());
    ?>
    </script>
    <script type="text/javascript">
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-44819337-1']);
      _gaq.push(['_trackPageview']);
      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();
    </script>
    <style>
    .row-fluid .span12 {width: 80%;}
    ul.nav_log{list-style:none;}
    ul.nav_log > li > a {cursor:pointer;float: right; list-style:none;padding: 10px 15px 10px;color: #777;text-decoration: none;text-shadow: 0 1px 0 #FFF;}
    //a:focus{outline: medium none;}
    .btn:focus{outline: medium none;}
    </style>
    </head>
    <body style="padding-top:40px;" ondragstart="return false;" ondrop="return false;">
      <!-- Top Navbar -->
	  <div style='margin-bottom:25px;'>
		<div id="topbar" class="navbar navbar-fixed-top">
			<div class="navbar-inner">
		        <div class="container-fluid">
		          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
		          <span class="icon-bar"></span>
		          <span class="icon-bar"></span>
		          <span class="icon-bar"></span>
		          </a>
		          <a class="brand"><img src='img/remy4.ico' style='height:24px; margin-right: 8px;'/>Lookit</a>
		          <div class="nav-collapse collapse" style="*height:40px;">
		            <ul class="nav">
		              <ul class="nav">
		            		<li class="about active"><a href="#" onclick="page.show('about')">Home</a></li>
		            		<li class="home"><a href="#" onclick="page.show('home')">Participate in a study!</a></li>
		            		<li class="faq"><a href="#" onclick="page.show('faq')">FAQ</a></li>		
		            		<li class="thescientists"><a href="#" onclick="page.show('thescientists')">The Scientists</a></li>
					<li class="resources"><a href="#" onclick="page.show('resources')">Resources</a></li>
		            		<li class="contact"><a href="#" onclick="page.show('contact')">Contact Us</a></li>
		         	    </ul>
		      	    </ul>
		            <ul class="nav_log" style="*width:auto; *float:right; *display:inline;">
		              <li class="register" id="reg" style="*width:90px;*float:right;"><a href="#" > Register</a></li>
		              <li class="login_hide" id = "log" style="*width:auto;*float:left;"><a href"#"> Login</a></li>
		              <li class="login_hide"  ><a id="log1" href="#" style="display:none"> Logout</a></li>
		              <li class="register" id="reg1" style="display:none;*width:auto;*float:left;" ><a href="#" > Hi <?php echo $_SESSION['user']['name']?></a></li>
		            </ul>
		          </div>
		      	</div><!--./container-fluid-->
	      	</div><!--./navbar-inner-->
    	</div><!--./navbar-->
		</div>

	    <!-- <div class = "login_form loginDiv"></div> -->
	    <div id="page-container" class="container-fluid skip-fixed-sidebar">
	      <div class="row-fluid">
	        <div class="span12 content_pane" id="contentPane">
	  	    </div>	
	      </div><!--/ .row-fluid-->
	    </div><!--/ #page-container .container-fluid .skip-fixed-sidebar-->

      
	   <!--Adding the widget holder to the page body-->
	    <div id = "widget_holder" style = "height:0px;">
	      <div id = "widget">
	      <!--For used only when js is not enabled.-->
	      <noscript> 
	        <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%" id="flashplayer">
	          <param name="movie" value="./camera/Flashms.swf" />
	          <param name="quality" value="high" />
	          <param name="bgcolor" value="#ffffff" />
	          <param name="allowScriptAccess" value="always" />
	          <param name="allowFullScreen" value="true" />
	          <param name="wmode" value="opaque" />
		  	  <param name="scale" value="noscale" />
	          <!--Maintain a proper ratio of height and width to avoid distortion-->
	          <param name="flashVars" value="width=450&height=300" />
	          <!--[if !IE]>-->
	          <object type="application/x-shockwave-flash" data="./camera/Flashms.swf" width="100%" height="100%">
	            <param name="quality" value="high" />
	            <param name="bgcolor" value="#ffffff" />
	            <param name="allowScriptAccess" value="always" />
	            <param name="allowFullScreen" value="true" />
	            <param name="wmode" value="opaque" />
		        <param name="scale" value="noscale" />
		        <!--Maintain a proper ratio of height and width to avoid distortion-->
		        <param name="flashVars" value="width=450&height=300" />
	            <!--<![endif]-->
	            <!--[if gte IE 6]>-->
	            <p> 
	                Either scripts and active content are not permitted to run or Adobe Flash Player version
	                10.2.0 or greater is not installed.
	            </p>
	            <!--<![endif]-->
	                
	            <!--[if !IE]>-->
	          </object>
	                  <!--<![endif]-->
	        </object>     
	      </noscript>    
	      </div>
	    </div>
	    <div id = "message" style="display:none;">
	        <p>Your video and microphone should be automatically detected and visible above. If your microphone levels are too low, try adjusting them in your Flash settings by right-clicking on the video, selecting Settings, and updating the volume in the microphone tab. </p>
	    </div>
  	</body>
</html>
