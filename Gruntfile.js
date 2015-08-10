module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
                    '<%= pkg.name %>.min.js': ['<%= pkg.name %>.js']
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);
};
