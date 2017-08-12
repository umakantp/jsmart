module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        uglify: {
            all : {
                options: {
                    preserveComments: false,
                    report: "min",
                    banner: "/*!\n" +
                        " * jSmart Javascript template engine (v<%= pkg.version %>)\n" +
                        " * https://github.com/umakantp/jsmart\n" +
                        " * http://opensource.org/licenses/LGPL-3.0\n" +
                        " *\n" +
                        " * Copyright 2011-2015, Max Miroshnikov <miroshnikov at gmail dot com>\n" +
                        " *                      Umakant Patil <me @ umakantpatil dot com>\n" +
                        " */\n"
                },
                files: {
                    'dist/<%= pkg.name %>.min.js': ['src/<%= pkg.name %>.js']
                }
            }
        },
        copy: {
          main: {
			files: [
				{
					src: 'dist/<%= pkg.name %>.min.js',
					dest: 'examples/simple/<%= pkg.name %>.min.js'
				},
				{
					src: 'dist/<%= pkg.name %>.min.js',
					dest: 'examples/requirejs/js/<%= pkg.name %>.min.js'
				},
				{
					src: 'dist/<%= pkg.name %>.min.js',
					dest: 'examples/node/<%= pkg.name %>.min.js'
				},
			],
            
          }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['karma', 'uglify', 'copy']);
};
