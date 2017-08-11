default:
	@echo "A dream you dream alone is only a dream. A dream you dream together is reality."


test: test-main test-defaultModifiers test-filtered test-escapeParsing test-javascript


test-main:
	node test/js/test-main.js


test-defaultModifiers:
	node test/js/test-defaultModifiers.js


test-filtered:
	node test/js/test-filtered.js


test-escapeParsing:
	node test/js/test-escapeParsing.js

test-javascript:
	node test/js/test-javascript.js


.PHONY: test
