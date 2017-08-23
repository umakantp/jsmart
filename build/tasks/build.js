/**
 * Special concat/build task to handle various jSmart build requirements
 * Concats AMD modules, removes their definitions,
 * and includes/excludes specified modules
 *
 * Shamelesly copied from https://github.com/jquery/jquery/blob/master/build/tasks/build.js
 */

module.exports = function(grunt) {
  "use strict";

  var fs = require("fs"),
      requirejs = require("requirejs"),

      pkg = require("../../package.json"),

      srcFolder = __dirname + "/../../src/",

      rdefineEnd = /\}\s*?\);[^}\w]*$/,

      read = function( fileName ) {
      	return grunt.file.read( srcFolder + fileName );
      },

      // Catch `// @CODE` and subsequent comment lines event if they don't start
      // in the first column.
      wrapper = read( "wrapper.js" ).split( /\/\/ @CODE/ ),

      config = {
        baseUrl: "src",
        
        name: "jsmart",

        // Allow strict mode
        useStrict: true,

        // We have multiple minify steps
        optimize: "none",

        // Include dependencies loaded with require
        findNestedDependencies: true,

        // Avoid inserting define() placeholder
        skipModuleInsertion: true,

        // Avoid breaking semicolons inserted by r.js
        skipSemiColonInsertion: true,

        wrap: {
          start: wrapper[ 0 ],
          end: wrapper[ 1 ]
        },

        rawText: {},

        onBuildWrite: convert
		};

  function convert(name, path, contents) {
    var amdName;

    contents = contents
				.replace( /\s*return\s+[^\}]+(\}\s*?\);[^\w\}]*)$/, "$1" )
        // Multiple exports
        .replace( /\s*exports\.\w+\s*=\s*\w+;/g, "" );

    // Remove define wrappers, closure ends, and empty declarations
    contents = contents
        .replace( /define\([^{]*?{\s*(?:("|')use strict\1(?:;|))?/, "" )
        .replace( rdefineEnd, "" );

    // Remove anything wrapped with
    // /* ExcludeStart */ /* ExcludeEnd */
    // or a single line directly after a // BuildExclude comment
    contents = contents
      .replace( /\/\*\s*ExcludeStart\s*\*\/[\w\W]*?\/\*\s*ExcludeEnd\s*\*\//ig, "" )
      .replace( /\/\/\s*BuildExclude\n\r?[\w\W]*?\n\r?/ig, "" );

      // Remove empty definitions
  			contents = contents
  				.replace( /define\(\[[^\]]*\]\)[\W\n]+$/, "" );

    return contents;
  }

  grunt.registerMultiTask(
    "build",
    "Concatenate source, remove sub AMD definitions, " +
      "(include/exclude modules with +/- flags), embed date/version",
    function() {
      var flag, index,
          done = this.async(),
          name = grunt.option("filename"),
          included = [],
          version = grunt.config("pkg.version");

      config.include = included;

      config.out = function(compiled) {
        compiled = compiled
            // Embed Version
            .replace( /@VERSION/g, version )

            // Embed Date
            // yyyy-mm-ddThh:mmZ
            .replace( /@DATE/g, ( new Date() ).toISOString().replace( /:\d+\.\d+Z$/, "Z" ) );

        // Write concatenated source to file
        grunt.file.write('dist/'+name, compiled);
      };

      // Trace dependencies and concatenate files
      requirejs.optimize(config, function(response) {
        grunt.verbose.writeln(response);
        grunt.log.ok("File '" + name + "' created.");
        done();
      }, function(err) {
        done(err);
      });
    }
  );
};
