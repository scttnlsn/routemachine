build: components index.js lib/matcher.js lib/router.js lib/segment.js lib/state.js
	@component build

components: component.json
	@component install

clean:
	rm -rf build components

.PHONY: clean