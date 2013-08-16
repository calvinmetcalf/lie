module.exports = function(grunt) {
  grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat:{
			all:{
				src:['./build/banner.js','./src/pro.js','./src/pro.js','./build/footer.js'],
				dest:['dist/pro.js']
			}
		}
	
	
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('default', ['concat']);
};