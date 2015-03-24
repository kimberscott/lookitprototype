<?php 

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

require_once('php/util.php'); 
require_once('config.php'); 
if(!isset($_SESSION['user']['id'])){ 
    session_start();
	 $_SESSION['user']['id'] = uuid();
}
?>
<!DOCTYPE html>
<html>
  <head>
	<META http-equiv="Content-Type" content="text/html;  charset=ISO-8859-1">
    <title> CLEAN UP CODE Lookit: Online experiments from the Early Childhood Cognition Lab </title>
	
    <link rel="shortcut icon" type="image/x-icon" href="img/remy4.ico">
	
	<link rel="stylesheet" type="text/css" href="combined.min.css"></link>
	
    <script src="static/js/jquery-1.8.1.min.js"></script> 
    <script src="static/js/bootstrap.min.js" type="text/javascript"></script>
    <script src="bootbox/bootbox.min.js" type="text/javascript"></script>
	<script src="combined.js" type="text/javascript"></script>
	

	
    
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
    <input type="hidden" id="reset_key" value=<?php echo $_GET['key']?>/>
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
		          <a class="brand" href="#about" onclick="page.show('about')"><img src='img/remy4.ico' style='height:24px; margin-right: 8px;'/>Lookit</a>
		          <div class="nav-collapse collapse" style="*height:40px;">
		            <ul class="nav">
		              <ul class="nav">
		            		<li class="about active"><a href="#about" onclick="page.show('about')">Home</a></li>
		            		<li class="home"><a href="#home" onclick="page.show('home')">Participate in a study!</a></li>
		            		<li class="faq"><a href="#faq" onclick="page.show('faq')">FAQ</a></li>		
		            		<li class="thescientists"><a href="#thescientists" onclick="page.show('thescientists')">The Scientists</a></li>
					<li class="resources"><a href="#resources" onclick="page.show('resources')">Resources</a></li>
		            		<li class="contact"><a href="#contact" onclick="page.show('contact')">Contact Us</a></li>
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
			<div class="about_frag instructions">

<img class='logoimg' id='logoimg' src='./img/logo.jpg' style="*margin-top:15px;">
<div class='blurb' id='aboutblurb'>
<div class='text'>
<div class="title">
<h2><p>Bringing science home</h2>
</div>
	
    <p>Here at MIT's Early Childhood Cognition Lab, we're trying a new approach in developmental psychology: bringing the experiments to you.</p>
	
<div class="title">
    <h2><p>Help us understand how your child thinks</h2>
	</div>	
	<p>Our online studies are quick and fun, and let you as a parent contribute to our collective understanding of the fascinating phenomenon of children's learning. In some experiments you'll step into the role of a researcher, asking your child questions or controlling the experiment based on what he or she does.</p>
	
	<div class="title">
    <h2><p>Participate whenever and wherever</h2>
	</div>	
	    <p>Log in or create an account at the top right to get started!  You can participate in studies from home by doing an online activity with your child that is videotaped via your webcam.</p>
	
</div>

</div>

<img class='logoimg' src='./img/lookitlogo_small.png' style='height:100px; width: 100px'>
<div class='blurb' id='newsblurb'>
<div class="title">
    <h2><p>News</h2>
</div>	
<p>
<table>
<tr> <td> June 30, 2014 </td> <td> An MIT News press release discusses Lookit <a href="https://newsoffice.mit.edu/2014/mit-launches-online-lab-early-childhood-learning-lookit">here</a>.  The project was also featured in 
<a href="http://www.bostonmagazine.com/health/blog/2014/06/19/new-mit-lab/">Boston Magazine</a> and on the  
<a href="https://www.sciencenews.org/blog/growth-curve/your-baby-can-watch-movies-science">Science News blog</a>.  Stay up-to-date and connect with other science-minded parents through our 
<a href="https://www.facebook.com/lookit.mit.edu">Facebook page!</a>

</td></tr>
<tr> <td> June 6, 2014 </td> <td> Walk through a study with some of our first participants <a href="#examples" onclick="page.show('examples')"> here! </a></td></tr>
<tr><td> Feb. 5, 2014 </td> <td> Beta testing of Lookit within the MIT community begins!  Many thanks to our first volunteers. </td></tr>
</table>
</div>


<div style='text-align:center; margin-top:100px;'>
This material is based upon work supported by the National Science Foundation (NSF) under Grant No. 1429216 
and by an NSF Graduate Research Fellowship under Grant No. 1122374. Any opinion, findings, and conclusions 
or recommendations expressed in this material are those of the authors(s) and do not necessarily reflect the 
views of the National Science Foundation. <img id='nsflogo' src='./img/nsf.gif'>
</div>

</div>
			
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
