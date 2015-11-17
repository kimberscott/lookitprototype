<?php

/**
 *  Copyright (C) MIT Early Childhood Cognition Lab
 */

header('Content-Type: text/html; charset=utf-8');
require_once('./php/util.php');
?>


<!DOCTYPE html>
<html>
<head>

    <META http-equiv="Content-Type" content="text/html;  charset=UTF-8">
    <title>Lookit: Online experiments from the Early Childhood Cognition Lab </title>
    <link rel="shortcut icon" type="image/x-icon" href="img/remy4.ico">
    <link rel="stylesheet" type="text/css" href="static/build/combined.min.css">
    <script src="static/build/combined.js" type="text/javascript"></script>
    <script>
    <?php load_fragments(get_default_fragments()); ?>
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
                <a class="brand" style="margin-top:10px;" href="#about" onclick="page.show('about')"><img src='img/remy4.ico' alt='Lookit logo' style='height:24px; margin-right: 8px;'/>Lookit</a>
                <div class="nav-collapse collapse" style="*height:40px;">
                    <ul class="nav">

                        <li class="about active"><a href="#about" onclick="page.show('about')">Home</a></li>
                        <li class="home"><a href="#home" onclick="page.show('home')">Participate in a study!</a></li>
                        <li class="faq"><a href="#faq" onclick="page.show('faq')">FAQ</a></li>
                        <li class="thescientists"><a href="#thescientists" onclick="page.show('thescientists')">The Scientists</a></li>
                        <li class="resources"><a href="#resources" onclick="page.show('resources')">Resources</a></li>
                        <li class="contact"><a href="#contact" onclick="page.show('contact')">Contact Us</a></li>
                    </ul>
                    <ul class="nav_log" style="*width:auto; *float:right; *display:inline;">

                        <li class="register" id="reg" style="*width:90px;*float:right;"><a href="#" > Register</a></li>
                        <li class="login_hide" id = "log" style="*width:auto;*float:left;"><a href="#"> Login</a></li>
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

                <img class='logoimg' alt='Lookit image, child with computer' id='logoimg' src='./img/logo.jpg' style="*margin-top:15px;">
                <div class='blurb' id='aboutblurb'>
                    <div class='text'>

                        <div class="title">
                            <h2>Bringing science home</h2>
                        </div>

                        <p>Here at MIT's Early Childhood Cognition Lab, we're trying a new approach in developmental psychology: bringing the experiments to you.</p>

                        <div class="title">
                            <h2>Help us understand how your child thinks</h2>
                        </div>
                        <p>Our online studies are quick and fun, and let you as a parent contribute to our collective understanding of the fascinating phenomenon of children's learning. In some experiments you'll step into the role of a researcher, asking your child questions or controlling the experiment based on what he or she does.</p>


                        <div class="title">
                            <h2>Participate whenever and wherever</h2>
                        </div>
                        <p>Log in or create an account at the top right to get started!  You can participate in studies from home by doing an online activity with your child that is videotaped via your webcam.</p>

                    </div>

                </div>


                <img class='logoimg' alt='Lookit logo' src='./img/lookitlogo_small.png' style='height:100px; width: 100px'>
                <div class='blurb' id='newsblurb'>
                    <div class="title">
                        <h2>News</h2>
                    </div>
                    <p>
                    <table>
                        <tr> <td> November 17, 2015 </td> <td> Lookit will be taking a brief hiatus while our partners at 
                        the <a href="https://cos.io/">Center for Open Science</a> work on re-engineering the site so it's 
                        easier for both parents and researchers to use. We're looking forward to re-opening the login system
                        and starting up some new studies in early March!
                        <tr> <td> October 1, 2015 </td> <td> We've finished collecting data for replications of three classic studies, looking at infants' and children's understanding of probability, language, and reliability. Kim is writing up the results now and they'll be featured here soon! </td></tr>
                        <tr> <td> June 30, 2014 </td> <td> An MIT News press release discusses Lookit <a href="https://newsoffice.mit.edu/2014/mit-launches-online-lab-early-childhood-learning-lookit">here</a>.  The project was also featured in
                                <a href="http://www.bostonmagazine.com/health/blog/2014/06/19/new-mit-lab/">Boston Magazine</a> and on the
                                <a href="https://www.sciencenews.org/blog/growth-curve/your-baby-can-watch-movies-science">Science News blog</a>.
                                Stay up-to-date and connect with other science-minded parents through our
                                <a href="https://www.facebook.com/lookit.mit.edu">Facebook page!</a>

                            </td></tr>
                        <tr> <td> June 6, 2014 </td> <td> Walk through a study with some of our first participants <a href="#examples" onclick="page.show('examples')"> here! </a></td></tr>
                        <tr><td> Feb. 5, 2014 </td> <td> Beta testing of Lookit within the MIT community begins!  Many thanks to our first volunteers. </td></tr>
                    </table>
                </div>


                <div style='text-align:center; margin-top:100px;'>

                    This material is based upon work supported by the National Science Foundation (NSF) under Grant No. 1429216,
                    NSF Graduate Research Fellowship under Grant No. 1122374, and by the Center for Brains, Minds and Machines (CBMM),
                    funded by NSF STC award CCF-1231216. Any opinions, findings, and conclusions or recommendations expressed
                    in this material are those of the authors(s) and do not necessarily reflect the views
                    of the National Science Foundation.<img alt='NSF logo' id='nsflogo' src='./img/nsf.gif'>
                </div>

            </div>

        </div>

    </div><!--/ .row-fluid-->
</div><!--/ #page-container .container-fluid .skip-fixed-sidebar-->


<!--Adding the widget holder to the page body-->
<div id = "widget_holder" style = "height:0px;">
    <div id = "widget">
    </div>
</div>
<div id = "message" style="display:none;">
    <p>Your video and microphone should be automatically detected and visible above. If the yellow bar at the side doesn't go at least about a third of the way up when you talk, try adjusting your microphone volume in your Flash settings by right-clicking on the video, selecting Settings, and updating the volume in the microphone tab. </p>
</div>
</body>
</html>