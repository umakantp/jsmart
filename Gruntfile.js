module.exports = function (grunt) {
  'use strict'

  if (!grunt.option('filename')) {
    grunt.option('filename', 'jsmart.js')
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    build: {
      all: {
        dest: "dist/<%= grunt.option('filename') %>"
      }
    },
    eslint: {
      src: ['src/**/*.js', 'Gruntfile.js', 'karma.conf.js', 'test/**/*.js', 'build/*.js']
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    uglify: {
      all: {
        options: {
          preserveComments: false,
          sourceMap: false,
          report: 'min',
          banner: '/*!\n' +
          ' * jSmart JavaScript template engine (v<%= pkg.version %>)\n' +
          ' * https://github.com/umakantp/jsmart\n' +
          ' * https://opensource.org/licenses/MIT\n' +
          ' *\n' +
          ' * Copyright 2011-2021, Umakant Patil <me at umakantpatil dot com>\n' +
          ' *                      Max Miroshnikov <miroshnikov at gmail dot com>\n' +
          ' */\n'
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
            dest: 'examples/simple/<%= pkg.name %>.min.js'
          },
          {
            src: "dist/<%= grunt.option('filename').replace('.js', '.min.js') %>",
            dest: 'examples/requirejs/js/<%= pkg.name %>.min.js'
          }
        ]
      }
    }
  })

  // Load grunt tasks from NPM packages
  require('load-grunt-tasks')(grunt)

  // Integrate jSmart specific tasks
  grunt.loadTasks('build/tasks')

  // Register tasks from karma, uglify and copy.
  grunt.loadNpmTasks('grunt-karma')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-copy')

  // Order goes as test, compile, compress and distribute.
  grunt.registerTask('default', ['eslint', 'karma', 'build', 'uglify', 'copy'])
}
