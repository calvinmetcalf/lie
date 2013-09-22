var banner = '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n/*! (c)2013 Ruben Verborgh & Calvin Metcalf @license MIT https://github.com/calvinmetcalf/lie*/';
//"component build -o dist -n lie -s deferred"
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        component: {
            build:{
            options: {
                args: {
                    out: 'dist',
                    name: '<%= pkg.name %>',
                    //"no-require":true,
                    standalone:'deferred'
                }
            }},
            noConflict:{options: {
                args: {
                    out: 'dist',
                    name: '<%= pkg.name %>.noConflict',
                    //"no-require":true,
                    standalone:'lie'
                }
            }}
        },
        uglify: {
            options: {
                banner: banner,
                mangle: {
                    except: ['Promise', 'Deferred']
                }
            },
            all: {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            options: {
                jshintrc: "./.jshintrc"
            },
            all: ['./<%= pkg.name %>.js']
        }

    });
    grunt.loadNpmTasks('grunt-component');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['jshint','component:build','component:noConflict','uglify']);
};
