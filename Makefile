build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -rf build components

serve:
	@serve --exec make

.PHONY: clean