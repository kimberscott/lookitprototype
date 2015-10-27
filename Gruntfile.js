module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //copy: {
        //    main: {
        //        files: [
        //            {expand: true, flatten: true, src: ['bower_components/bootbox.js/bootbox.min.js'], dest: 'public/static/build/'}
        //        ]
        //    }
        //},

		less: {
			development: {
				options: {
					compress: false
                },
				files: {
					// target.css file: source.less file
					"build/styles.css": "public/fragments/styles.less"
				}
			}
		},
		
		watch: {
			files: [
				"public/login/myfunc.js",
				"public/login/validate.js",
				"public/login/json.js",
				"public/fullscreen.js",
				"public/screenfull.js",
				"public/page.js",
				"public/experiment_functions.js",
				"public/camera/swfobject.js",
				"public/fragments/styles.less"
			],
			tasks: ['less', 'concat', 'cssmin', 'strip', 'uglify']
		},
    
	    concat: {
			css: {
			   src: [
                   'bower_components/bootstrap/docs/assets/css/bootstrap.css',
                   'pubic/static/datepicker/css/datepicker.css',
                   'build/styles.css'
			   ],
			   dest: 'public/static/build/combined.css'
			},
			js : {			
				src : [
                    "bower_components/jquery/jquery.js",
                    "bower_components/bootstrap/docs/assets/js/bootstrap.js",
                    "bower_components/bootbox.js/bootbox.js",
					"public/camera/swfobject.js",
					"public/login/myfunc.js",
					"public/login/validate.js",
					"public/login/json.js",
					"public/page.js",
					"public/fullscreen.js",
					"public/screenfull.js",
					"public/experiment_functions.js",
					"public/index.js"
				],
				dest : 'public/static/build/combined.js'
			}
		}, 
		
		cssmin : {
            css:{
                src: 'public/static/build/combined.css',
                dest: 'public/static/build/combined.min.css'
            }
        },
        
        strip : {
  			js: {
    			src : 'public/static/build/combined.js',
    			dest : 'public/static/build/combined.js',
    			nodes : ['console']
  			}
		},
		
		uglify : {
			js: {
				files: {
					'public/static/build/combined.js' : [ 'public/static/build/combined.js' ]
				}
			}
		},
	
	});

    grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-strip');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('default', ['less', 'concat:css', 'cssmin:css', 'concat:js', 'strip:js', 'uglify:js' ]);
	
};



