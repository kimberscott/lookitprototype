go to link like https://lookit.mit.edu/shared.php?title=Twoknower&description=DescriptionofTwoknower&link=https://lookit.mit.edu&image=img/annie.jpg

<html> 
  <head>
  <meta property="og:title" content="<?php echo $_GET['title'] ?>" >
  <meta property="og:description" content="<?php echo $_GET['description'] ?>" >
  <meta property="og:image" content="<?php echo $_GET['image'] ?>">
  <script type='text/javascript'>
     setTimeout(function() { 
        document.location = "<?php echo $_GET['link'] ?>"; }, 500
     );
  </script>
</head></html>