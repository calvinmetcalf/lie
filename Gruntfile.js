var banner = '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n/*! (c)2013 Ruben Verborgh & Calvin Metcalf @license MIT https://github.com/calvinmetcalf/lie*/';

module.exports = function(grunt) {
  grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat:{
			all:{
				options:{
				banner:banner
			},
				src:['./build/banner.js','./src/<%= pkg.name %>.js','./src/all.js','./build/footer.js'],
				dest:'./dist/<%= pkg.name %>.all.js'
			},
			bundle:{
				src:['./node_modules/setimmediate/setImmediate.js','./dist/<%= pkg.name %>.js'],
				dest:'./dist/<%= pkg.name %>.setImmediate.js'
			},
			notall:{
			options:{
				banner:banner
			},
				src:['./build/banner.js','./src/<%= pkg.name %>.js','./build/footer.js'],
				dest:'./dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
    		options:{
				banner:banner,
				mangle: {
					except: ['Promise','Deferred']
				}
			},
			all: {
				src: 'dist/<%= pkg.name %>.all.js',
				dest: 'dist/<%= pkg.name %>.all.min.js'
			},
			notall: {
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			},
			bundle:{
				src: 'dist/<%= pkg.name %>.setImmediate.js',
				dest: 'dist/<%= pkg.name %>.setImmediate.min.js'
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
    grunt.registerTask('default', ['concat:notall','jshint','uglify:notall','concat:bundle','uglify:bundle']);
	grunt.registerTask('nobundle', ['concat:notall','uglify:all','jshint']);
};
