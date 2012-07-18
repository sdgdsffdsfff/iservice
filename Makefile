JSCOVERAGE = ./node_modules/visionmedia-jscoverage/jscoverage

test:
	@npm install
	@./node_modules/mocha/bin/mocha --reporter spec --timeout 2000 test/*.js

cov:
	@npm install
	-mv lib lib.bak && $(JSCOVERAGE) lib.bak lib 
	-./node_modules/mocha/bin/mocha --reporter html-cov --timeout 2000 --ignore-leaks test/*.js > ./coverage.html
	-rm -rf lib && mv lib.bak lib

.PHONY: test
