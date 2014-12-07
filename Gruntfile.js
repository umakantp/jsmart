module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            all : {
                options: {
                    preserveComments: false,
                    report: "min",
                    banner: "/*!" +
                        " * jSmart Javascript template engine (v<%= pkg.version %>)" +
                        " *" +
                        " * Copyright 2011-2013, Max Miroshnikov <miroshnikov at gmail dot com>" +
                        " * https://github.com/umakantp/jsmart" +
                        " * http://opensource.org/licenses/LGPL-3.0" +
                        " */"
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
