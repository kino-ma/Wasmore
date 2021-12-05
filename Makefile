WASM_BIND := faas-app/pkg/faas_app.js
default: run

.PHONY: default run install test test-js test-rs check check-rs check-js

run: faas-app/pkg/faas_app.js
	yarn run start

install: package.json
	[[ $$(uname) != "Darwin" ]] \
		&& cargo install \
		|| PATH=/usr/bin:$$PATH cargo install wasm-pack --git https://github.com/rustwasm/wasm-pack --rev c9ea9aebbccf5029846a24a6a823b18bb41736c7
	$(MAKE) $(WASM_BIND)
	yarn

$(WASM_BIND): faas-app/src/lib.rs
	cd faas-app && wasm-pack build --target nodejs

test: test-js test-rs
	@echo OK

test-js:
	yarn test

test-rs:
	cd faas-app && cargo test

check: check-rs check-js
	@echo OK

check-rs:
	cd faas-app && cargo check

check-js:
	find . \
		-iname '*.js' \
		-type f \
		-not -path './node_modules/*' \
		-not -path './faas-app/pkg/*' \
		-exec node --check {} \;