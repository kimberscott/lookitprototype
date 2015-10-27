module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
		
		less: {
			development: {
				options: {
					compress: true,
					yuicompress: true,
					optimization: 2
				},
				files: {
					// target.css file: source.less file
					"public/fragments/styles.css": "public/fragments/styles.less",
					"public/bootstrap/bootstrap.css": "public/bootstrap/less/bootstrap.less"
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
				   'public/bootstrap/bootstrap.css',
				   'pubic/static/datepicker/css/datepicker.css'
			   ],
			   dest: 'public/build/combined.css'
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
					'combined.js' : [ 'public/static/build/combined.js' ]
				}
			}
		},
	
	});
	
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['watch']);
	
	grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-strip');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['less', 'concat:css', 'cssmin:css', 'concat:js', 'strip:js', 'uglify:js' ]);
	
};



