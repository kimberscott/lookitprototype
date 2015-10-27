module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            main: {
                files: [
                    {expand: true, flatten: true, src: ['bower_components/bootbox.js/bootbox.min.js'], dest: 'public/static/build/'}
                ]
            }
        },

		recess: {
			development: {
				options: {
					compress: true
                },
				files: {
					// target.css file: source.less file
					"public/fragments/styles.css": "public/fragments/styles.less",
					"build/bootstrap.css": "bower_components/bootstrap/less/bootstrap.less"
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
				   'public/fragments/styles.css',
				   'build/bootstrap.css',
				   'pubic/static/datepicker/css/datepicker.css'
			   ],
			   dest: 'public/static/build/combined.css'
			},
			js : {			
				src : [
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
	grunt.loadNpmTasks('grunt-recess');
	grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-strip');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('default', ['copy', 'recess', 'concat:css', 'cssmin:css', 'concat:js', 'strip:js', 'uglify:js' ]);
	
};



