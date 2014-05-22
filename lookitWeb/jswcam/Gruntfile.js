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
					'fragments/styles.less'],
			tasks: ['less', 'concat', 'cssmin', 'uglify']
		},
    
	    concat: {
			css: {
			   src: ['fragments/styles.css',
					 'bootstrap/bootstrap.css',
					 'static/css/styles.css', 
					 'static/datepicker/css/datepicker.css'],
			   dest: 'combined.css'
			},
			js : {
				src : ['static/js/less-1.3.0.min.js',
					"static/js/jquery-1.8.1.min.js",
					"static/js/bootstrap.js",
					"bootbox/bootbox.js",
					"camera/swfobject.js",
					"login/myfunc.js",
					"login/validate.js",
					"login/json.js", 
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



