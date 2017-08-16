module.exports = function(grunt) {
  "use strict";

  grunt.option("filename", "jsmart.js");

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    build: {
      all: {
        dest: "dist/<%= grunt.option('filename') %>",
        minimum: [
          "core",
          "selector"
        ]
      }
    },
    karma: {
        unit: {
            configFile: "karma.conf.js"
        }
    },
    uglify: {
      all : {
        options: {
          preserveComments: false,
          sourceMap: true,
          sourceMapName: "dist/<%= grunt.option('filename').replace('.js', '.min.map') %>",
          report: "min",
          banner: "/*!\n" +
          " * jSmart JavaScript template engine (v<%= pkg.version %>)\n" +
          " * https://github.com/umakantp/jsmart\n" +
          " * https://opensource.org/licenses/MIT\n" +
          " *\n" +
          " * Copyright 2011-2017, Umakant Patil <me @ umakantpatil dot com>\n" +
          " *                      Max Miroshnikov <miroshnikov at gmail dot com>\n" +
          " */\n"
        },
        files: {
          "dist/<%= grunt.option('filename').replace('.js', '.min.js') %>": ["dist/<%= grunt.option('filename') %>"]
        }
      }
    },
    copy: {
      main: {
        files: [
          {
            src: "dist/<%= grunt.option('filename').replace('.js', '.min.js') %>",
            dest: "examples/simple/<%= pkg.name %>.min.js"
          },
          {
            src: "dist/<%= grunt.option('filename').replace('.js', '.min.js') %>",
            dest: "examples/requirejs/js/<%= pkg.name %>.min.js"
          },
          {
            src: "dist/<%= grunt.option('filename').replace('.js', '.min.js') %>",
            dest: "examples/node/<%= pkg.name %>.min.js"
          }
        ]
      }
    }
  });

  // Load grunt tasks from NPM packages
	require("load-grunt-tasks")(grunt);

  // Integrate jQuery specific tasks
	grunt.loadTasks("build/tasks");

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['build']);
  //grunt.registerTask('default', ['karma', 'uglify', 'copy']);
};
