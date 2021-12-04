WASM_BIND := faas-app/pkg/faas_app.js
default: run

.PHONY: default run install test test-js test-rs check check-rs check-js

run: faas-app/pkg/faas_app.js
	yarn run start

install: package.json
	cargo install wasm-pack
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