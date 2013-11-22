build: components index.js
	@component build

components: component.json
	@component install

clean:
	rm -rf build components

.PHONY: clean