.PHONY: optimize compile lint

# Closure Compiler http://code.google.com/closure/compiler
# ADVANCED_OPTIMIZATIONS is not working for jSmart
# see also http://docs.jquery.com/Frequently_Asked_Questions#How_do_I_compress_my_code.3F

optimize:
	"C:/Program Files/Java/jre6/bin/java.exe" -jar ../compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js smart.js --js_output_file smart.min.js

compile:
	"C:/Program Files/Java/jre6/bin/java.exe" -jar ../compiler.jar --compilation_level WHITESPACE_ONLY --js smart.js --js_output_file smart.min.js
	
# http://www.JavaScriptLint.com
lint:
	../jsl-0.3.0/jsl conf ../jsl-0.3.0/jsl.default.conf -process smart.js
