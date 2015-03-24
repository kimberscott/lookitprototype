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
					"fragments/styles.css": "fragments/styles.less",
					"bootstrap/bootstrap.css": "bootstrap/less/bootstrap.less"
				}
			}
		},
		
		watch: {
			files: ["login/myfunc.js",
					"login/validate.js",
					"login/json.js",
					"fullscreen.js",
					"page.js",
					"experiment_functions.js",
					"camera/swfobject.js",
					'fragments/styles.less'],
			tasks: ['less', 'concat', 'cssmin', 'uglify']
		},
    
	    concat: {
			css: {
			   src: ['fragments/styles.css',
					 'bootstrap/bootstrap.css',
					 'static/datepicker/css/datepicker.css'],
			   dest: 'combined.css'
			},
			js : {			
				src : ["camera/swfobject.js",
					"login/myfunc.js",
					"login/validate.js",
					"login/json.js", 
					"page.js",
					"fullscreen.js",
					"experiment_functions.js",
					"index.js"],
				dest : 'combined.js'
			}
		}, 
		
		cssmin : {
            css:{
                src: 'combined.css',
                dest: 'combined.min.css'
            }
        },
		
		uglify : {
			js: {
				files: {
					'combined.js' : [ 'combined.js' ]
				}
			}
		},
	
	});
	

 
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['watch']);
	
	grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['less', 'concat:css', 'cssmin:css', 'concat:js', 'uglify:js' ]);
	
};



