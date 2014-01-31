test:
	./node_modules/.bin/browserify test/index.js > test_bundle.js
	./node_modules/.bin/mocha test_bundle.js
	rm test_bundle.js

.PHONY: test