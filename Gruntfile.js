var banner = '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n/*! (c)2013 Ruben Verborgh & Calvin Metcalf @license MIT https://github.com/calvinmetcalf/lie*/';

module.exports = function(grunt) {
  grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat:{
			options:{
				banner:banner
			},
			all:{
				src:['./build/banner.js','./src/<%= pkg.name %>.js','./src/all.js','./build/footer.js'],
				dest:'./dist/<%= pkg.name %>.js'
			},
			notall:{
				src:['./build/banner.js','./src/<%= pkg.name %>.js','./build/footer.js'],
				dest:'./dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			all: {
    			options:{
					banner:banner,
					mangle: {
						except: ['Promise','Deferred']
					}
				},
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
        jshint:{
            options:{
                jshintrc:"./.jshintrc"
            },
            all:['./dist/<%= pkg.name %>.js']
        }
	
	
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['concat:notall','uglify','jshint']);
};